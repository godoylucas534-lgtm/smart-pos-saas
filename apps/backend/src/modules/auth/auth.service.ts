import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '@modules/users/user.entity';
import { Store } from '@modules/stores/entities/store.entity';
import { LoginDto, RegisterStoreDto } from './dto/login.dto';
import { UserRole } from '@core/guards/roles.guard';
import { SaasService } from '@modules/saas/saas.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    private jwtService: JwtService,
    private saasService: SaasService,
  ) {}

  // ─── Validación para LocalStrategy ───────────────────────────────────────
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.isActive) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return user;
  }

  // ─── Login: devuelve el JWT con el storeId en el payload ──────────────────
  async login(user: User): Promise<{ accessToken: string; user: Partial<User>; subscription?: any }> {
    // Actualizar última sesión
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId, // 🔑 clave del multi-tenancy
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

  // ─── Registro de nueva tienda con su admin ───────────────────────────────
  async registerStore(
    dto: RegisterStoreDto,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    // Verificar que el slug no esté tomado
    const existingStore = await this.storeRepo.findOne({
      where: { slug: dto.storeSlug },
    });
    if (existingStore) {
      throw new ConflictException(
        `El slug "${dto.storeSlug}" ya está en uso. Elige otro.`,
      );
    }

    // Verificar que el email no exista en esa tienda
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    // Un email puede existir en varias tiendas, pero no dos veces en la misma
    if (existingUser && existingUser.storeId) {
      throw new ConflictException('Este email ya tiene una cuenta.');
    }

    // Crear la tienda
    const store = this.storeRepo.create({
      name: dto.storeName,
      slug: dto.storeSlug,
      currency: dto.currency || 'PYG',
    });
    const savedStore = await this.storeRepo.save(store);

    // Crear el usuario admin
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: UserRole.STORE_ADMIN,
      storeId: savedStore.id,
    });
    const savedUser = await this.userRepo.save(user);
    await this.saasService.ensureTrialForStore(savedStore.id);

    return this.login(savedUser);
  }

  // ─── Crear empleado (cajero) dentro de una tienda ────────────────────────
  async createEmployee(
    dto: { email: string; password: string; firstName: string; lastName: string },
    storeId: string,
  ): Promise<User> {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Tienda no encontrada.');

    const exists = await this.userRepo.findOne({
      where: { email: dto.email, storeId },
    });
    if (exists) throw new ConflictException('Este email ya existe en la tienda.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      ...dto,
      passwordHash,
      role: UserRole.CASHIER,
      storeId,
    });

    return this.userRepo.save(user);
  }

  // ─── Validar token (usado por JwtStrategy) ───────────────────────────────
  async validateJwtPayload(payload: any): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: payload.sub, isActive: true } });
  }
}
