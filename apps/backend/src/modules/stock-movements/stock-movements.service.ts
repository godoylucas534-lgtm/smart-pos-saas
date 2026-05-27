import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, StockMovementType } from './entities/stock-movement.entity';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly repo: Repository<StockMovement>,
  ) {}

  async createMovement(
    data: {
      productId: string;
      storeId: string;
      type: StockMovementType;
      quantity: number;
      previousStock: number;
      newStock: number;
      reference?: string;
    },
    manager?: any,
  ) {
    const targetRepo = manager ? manager.getRepository(StockMovement) : this.repo;
    const movement = targetRepo.create(data);
    return targetRepo.save(movement);
  }

  async findByProduct(storeId: string, productId: string) {
    return this.repo.find({
      where: { storeId, productId },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
