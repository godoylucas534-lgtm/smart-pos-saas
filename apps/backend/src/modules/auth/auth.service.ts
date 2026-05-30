import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '@modules/users/user.entity';
import { Store } from '@modules/stores/entities/store.entity';
import { RegisterStoreDto } from './dto/login.dto';
import { UserRole } from '@core/guards/roles.guard';
import { SaasService } from '@modules/saas/saas.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    private jwtService: JwtService,
    private saasService: SaasService,
  ) {}

  private normalizeEmail(email: string): string {
    return String(email || '').trim().toLowerCase();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const normalizedEmail = this.normalizeEmail(email);
    this.logger.debug(`[auth.login] email_normalized=${normalizedEmail}`);

    const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      this.logger.warn(`[auth.login] user_not_found email=${normalizedEmail}`);
      return null;
    }
    if (!user.isActive) {
      this.logger.warn(`[auth.login] user_inactive userId=${user.id} email=${normalizedEmail}`);
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      this.logger.warn(`[auth.login] password_mismatch userId=${user.id} email=${normalizedEmail}`);
      return null;
    }

    this.logger.debug(`[auth.login] user_validated userId=${user.id} email=${normalizedEmail}`);
    return user;
  }

  async login(user: User): Promise<{ accessToken: string; user: Partial<User>; subscription?: any }> {
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };

    const subscription = user.storeId
      ? await this.saasService.ensureTrialForStore(user.storeId)
      : null;

    return {
      accessToken: this.jwtService.sign(payload),
      user: user.toJSON(),
      subscription,
    };
  }

  async registerStore(
    dto: RegisterStoreDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const normalizedEmail = this.normalizeEmail(dto.email);

    const existingStore = await this.storeRepo.findOne({
      where: { slug: dto.storeSlug },
    });
    if (existingStore) {
      throw new ConflictException(
        `El slug "${dto.storeSlug}" ya está en uso. Elige otro.`,
      );
    }

    const existingUser = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUser && existingUser.storeId) {
      throw new ConflictException('Este email ya tiene una cuenta.');
    }

    const store = this.storeRepo.create({
      name: dto.storeName,
      slug: dto.storeSlug,
      currency: dto.currency || 'PYG',
    });
    const savedStore = await this.storeRepo.save(store);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: normalizedEmail,
      passwordHash,
      role: UserRole.STORE_ADMIN,
      storeId: savedStore.id,
    });
    const savedUser = await this.userRepo.save(user);
    await this.saasService.ensureTrialForStore(savedStore.id);

    return this.login(savedUser);
  }

  async createEmployee(
    dto: { email: string; password: string; firstName: string; lastName: string },
    storeId: string,
  ): Promise<User> {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Tienda no encontrada.');

    const exists = await this.userRepo.findOne({
      where: { email: normalizedEmail, storeId },
    });
    if (exists) throw new ConflictException('Este email ya existe en la tienda.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      ...dto,
      email: normalizedEmail,
      passwordHash,
      role: UserRole.CASHIER,
      storeId,
    });

    return this.userRepo.save(user);
  }

  async validateJwtPayload(payload: any): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: payload.sub, isActive: true } });
  }
}
