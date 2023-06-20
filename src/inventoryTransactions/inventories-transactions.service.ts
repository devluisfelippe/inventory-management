import { Injectable } from '@nestjs/common';
import { InventoryTransaction } from './inventory-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryService } from '../inventories/inventories.service';
import { LotService } from '../lots/lots.service';

@Injectable()
export class InventoryTransactionService {

    constructor(
        @InjectRepository(InventoryTransaction) private readonly inventoryTransactionRepository: Repository<InventoryTransaction>,
        private lotService: LotService,
        private inventoryService: InventoryService,
    ) { };

    async createTransaction(product_id: string, quantity: number, lot_id: string, company_id: string): Promise<any> {
        try {
            await this.lotService.findLot(lot_id, product_id, company_id);
            const inventory = await this.inventoryService.findInventory(lot_id, product_id, company_id);
            const inventory_transaction_data = { product_id, quantity, inventory, lot_id, company_id };      

            let new_quantity = Number(quantity) + Number(inventory.quantity);
            if(new_quantity < 0) {
                new_quantity = 0
            };

            const transaction = await this.inventoryTransactionRepository.save(inventory_transaction_data);
            
            await this.inventoryService.updateInventory(lot_id, product_id, company_id, new_quantity)

            return transaction
        } catch (error) {
            throw new Error(error.message)
        };
    };
}
