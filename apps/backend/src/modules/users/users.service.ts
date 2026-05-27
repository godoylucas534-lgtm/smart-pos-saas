import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../core/guards/roles.guard';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findByStore(storeId: string): Promise<User[]> {
    const users = await this.userRepo.find({
      where: { storeId },
      order: { createdAt: 'ASC' },
    });
    return users.map((u) => u.toJSON() as User);
  }

  async createEmployee(storeId: string, dto: CreateUserDto): Promise<User> {
    if (dto.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('No puedes crear super_admin desde este endpoint.');
    }

    const exists = await this.userRepo.findOne({
      where: { email: dto.email, storeId },
    });
    if (exists) throw new ConflictException('Este email ya existe en la tienda.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: dto.role,
      storeId,
      isActive: true,
    });
    const saved = await this.userRepo.save(user);
    return saved.toJSON() as User;
  }

  async findOne(storeId: string, id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id, storeId } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return user;
  }

  async update(storeId: string, id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(storeId, id);
    const patch: any = { ...dto };

    if (patch.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('No puedes asignar super_admin desde este endpoint.');
    }

    if (patch.email && patch.email !== user.email) {
      const exists = await this.userRepo.findOne({ where: { storeId, email: patch.email } });
      if (exists) throw new ConflictException('Este email ya existe en la tienda.');
    }

    if (patch.password) {
      patch.passwordHash = await bcrypt.hash(patch.password, 12);
      delete patch.password;
    }

    Object.assign(user, patch);
    const saved = await this.userRepo.save(user);
    return saved.toJSON() as User;
  }
}
