import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService, CreateCustomerDto } from './customers.service';
import { RolesGuard, Roles, UserRole } from '../../core/guards/roles.guard';

@Controller('customers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get('search')
  search(@Request() req: any, @Query('q') q: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.customersService.search(storeId, q || '');
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.customersService.findAll(storeId, page, limit);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.customersService.findOne(storeId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: any, @Body() dto: CreateCustomerDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.customersService.create(storeId, dto);
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCustomerDto>,
  ) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.customersService.update(storeId, id, dto);
  }
}
