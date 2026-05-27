import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { RolesGuard, Roles, UserRole } from '../../core/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { SaasWriteOperation } from '../saas/saas.decorators';

@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@SaasWriteOperation()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Request() req: any, @Query() query: QueryProductsDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.findAll(storeId, query);
  }

  @Get('barcode/:barcode')
  findByBarcode(@Request() req: any, @Param('barcode') barcode: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.findByBarcode(storeId, barcode);
  }

  @Get(':id/movements')
  findMovements(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.findMovements(storeId, id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.findOne(storeId, id);
  }

  @Post()
  @Roles(UserRole.STORE_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.create(storeId, dto);
  }

  @Put(':id')
  @Roles(UserRole.STORE_ADMIN)
  update(@Request() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    const userId = req.user?.id ?? req.userId;
    return this.productsService.update(storeId, id, dto, userId, req.ip);
  }

  @Delete(':id')
  @Roles(UserRole.STORE_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.remove(storeId, id);
  }

  @Get('categories/all')
  findCategories(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.findAllCategories(storeId);
  }

  @Post('categories')
  @Roles(UserRole.STORE_ADMIN)
  createCategory(@Request() req: any, @Body() dto: { name: string; description?: string; color?: string }) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.createCategory(storeId, dto);
  }

  @Put('categories/:id')
  @Roles(UserRole.STORE_ADMIN)
  updateCategory(@Request() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.productsService.updateCategory(storeId, id, dto);
  }
}
