import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private readonly auditLogsService: AuditLogsService,
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  private serializeProduct(product: Product): Product {
    return {
      ...product,
      stock: Math.round(Number(product.stock || 0)),
      stockMin: Math.round(Number(product.stockMin || 0)),
    };
  }

  async findAll(storeId: string, query: QueryProductsDto) {
    const { search, categoryId, isActive, lowStock, page = 1, limit = 20 } = query;
    const qb = this.productRepo.createQueryBuilder('p').leftJoinAndSelect('p.category', 'cat').where('p.storeId = :storeId', { storeId });
    if (search) qb.andWhere('(p.name ILIKE :search OR p.sku ILIKE :search OR p.barcode ILIKE :search)', { search: `%${search}%` });
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (isActive !== undefined) qb.andWhere('p.isActive = :isActive', { isActive });
    if (lowStock) qb.andWhere('p.trackStock = true AND p.stock <= p.stockMin');
    const total = await qb.getCount();
    const items = await qb.orderBy('p.name', 'ASC').skip((page - 1) * limit).take(limit).getMany();
    return { items: items.map((item) => this.serializeProduct(item)), pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByBarcode(storeId: string, barcode: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { storeId, barcode, isActive: true }, relations: ['category'] });
    if (!product) throw new NotFoundException(`Producto con barcode "${barcode}" no encontrado.`);
    return this.serializeProduct(product);
  }

  async findOne(storeId: string, id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id, storeId }, relations: ['category'] });
    if (!product) throw new NotFoundException('Producto no encontrado.');
    return this.serializeProduct(product);
  }

  async findMovements(storeId: string, productId: string) {
    await this.findOne(storeId, productId);
    return this.stockMovementsService.findByProduct(storeId, productId);
  }

  async create(storeId: string, dto: CreateProductDto): Promise<Product> {
    if (dto.sku) {
      const exists = await this.productRepo.findOne({ where: { storeId, sku: dto.sku } });
      if (exists) throw new ConflictException(`El SKU "${dto.sku}" ya existe.`);
    }
    if (dto.categoryId) {
      const cat = await this.categoryRepo.findOne({ where: { id: dto.categoryId, storeId } });
      if (!cat) throw new NotFoundException('Categoría no encontrada.');
    }
    const product = this.productRepo.create({ ...dto, storeId });
    return this.serializeProduct(await this.productRepo.save(product));
  }

  async update(storeId: string, id: string, dto: UpdateProductDto, userId?: string, ip?: string): Promise<Product> {
    const product = await this.findOne(storeId, id);
    if (dto.sku && dto.sku !== product.sku) {
      const exists = await this.productRepo.findOne({ where: { storeId, sku: dto.sku } });
      if (exists) throw new ConflictException(`El SKU "${dto.sku}" ya existe.`);
    }
    if (dto.stock !== undefined && Number(dto.stock) < 0) throw new BadRequestException('El stock no puede ser negativo.');

    if (dto.salePrice !== undefined && Number(dto.salePrice) !== Number(product.salePrice)) {
      await this.auditLogsService.recordAudit(storeId, userId, 'price_change', 'Product', product.id, { salePrice: Number(product.salePrice) }, { salePrice: Number(dto.salePrice) }, ip);
    }
    if (dto.stock !== undefined && Number(dto.stock) !== Number(product.stock)) {
      await this.auditLogsService.recordAudit(storeId, userId, 'manual_stock_adjustment', 'Product', product.id, { stock: Number(product.stock) }, { stock: Number(dto.stock) }, ip);
    }

    Object.assign(product, dto);
    return this.serializeProduct(await this.productRepo.save(product));
  }

  async remove(storeId: string, id: string): Promise<void> {
    const product = await this.findOne(storeId, id);
    product.isActive = false;
    await this.productRepo.save(product);
  }

  async findAllCategories(storeId: string) {
    return this.categoryRepo.find({ where: { storeId, isActive: true }, order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async createCategory(storeId: string, dto: { name: string; description?: string; color?: string }) {
    return this.categoryRepo.save(this.categoryRepo.create({ ...dto, storeId }));
  }

  async updateCategory(storeId: string, id: string, dto: Partial<Category>) {
    const cat = await this.categoryRepo.findOne({ where: { id, storeId } });
    if (!cat) throw new NotFoundException('Categoría no encontrada.');
    Object.assign(cat, dto);
    return this.categoryRepo.save(cat);
  }
}
