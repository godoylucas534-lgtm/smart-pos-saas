import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, UserRole } from '../../core/guards/roles.guard';
import { StoresService } from './stores.service';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StoresController {
  constructor(private storesService: StoresService) {}

  /**
   * GET /api/v1/stores/mine
   * Devuelve la tienda del usuario autenticado
   * Accesible por cualquier rol (para mostrar nombre en sidebar, etc.)
   */
  @Get('mine')
  findMine(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.storesService.findOne(storeId);
  }

  /**
   * GET /api/v1/stores/:id
   * Multi-tenancy: solo puede ver su propia tienda
   */
  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    if (id !== storeId) {
      throw new ForbiddenException('No tienes acceso a esta tienda.');
    }
    return this.storesService.findOne(id);
  }

  /**
   * PUT /api/v1/stores/:id
   * Solo STORE_ADMIN puede modificar configuración de la tienda
   * Multi-tenancy: solo puede actualizar su propia tienda
   */
  @Put(':id')
  @Roles(UserRole.STORE_ADMIN)
  update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDto,
  ) {
    const storeId = req.user?.storeId ?? req.storeId;
    if (id !== storeId) {
      throw new ForbiddenException('No tienes acceso a esta tienda.');
    }
    return this.storesService.update(id, dto);
  }
}
