import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { IsString, IsOptional, IsEmail, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  alternativePhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  taxDocument?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(Customer) private customerRepo: Repository<Customer>) {}

  async search(storeId: string, q: string) {
    return this.customerRepo
      .createQueryBuilder('c')
      .where('c.storeId = :storeId AND c.isActive = true', { storeId })
      .andWhere(
        '(c.firstName ILIKE :q OR c.lastName ILIKE :q OR c.phone ILIKE :q OR c.document ILIKE :q OR c.email ILIKE :q OR c.businessName ILIKE :q OR c.taxDocument ILIKE :q)',
        { q: `%${q}%` },
      )
      .orderBy('c.totalOrders', 'DESC')
      .take(20)
      .getMany();
  }

  async findAll(storeId: string, page: any = 1, limit: any = 20) {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 20;
    const [items, total] = await this.customerRepo.findAndCount({
      where: { storeId, isActive: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(storeId: string, id: string): Promise<Customer> {
    const c = await this.customerRepo.findOne({ where: { id, storeId } });
    if (!c) throw new NotFoundException('Cliente no encontrado.');
    return c;
  }

  async create(storeId: string, dto: CreateCustomerDto): Promise<Customer> {
    if (dto.document) {
      const exists = await this.customerRepo.findOne({ where: { storeId, document: dto.document } });
      if (exists) throw new ConflictException(`El documento "${dto.document}" ya está registrado.`);
    }

    const customer = this.customerRepo.create({
      ...dto,
      storeId,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      creditLimit: Number(dto.creditLimit || 0),
    });

    return this.customerRepo.save(customer);
  }

  async update(storeId: string, id: string, dto: Partial<CreateCustomerDto>): Promise<Customer> {
    const customer = await this.findOne(storeId, id);
    Object.assign(customer, {
      ...dto,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : customer.birthDate,
      creditLimit: dto.creditLimit !== undefined ? Number(dto.creditLimit) : customer.creditLimit,
    });
    return this.customerRepo.save(customer);
  }

  async updateStats(storeId: string, customerId: string, amount: number, queryRunner?: any) {
    const repo = queryRunner ? queryRunner.manager.getRepository(Customer) : this.customerRepo;
    await repo.increment({ id: customerId, storeId }, 'totalPurchases', amount);
    await repo.increment({ id: customerId, storeId }, 'totalOrders', 1);
  }
}
