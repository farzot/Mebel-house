import { Module } from "@nestjs/common";
import { ProductService } from "./service/product.service";
import { ClientProductController } from "./controller/client.product.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity, ProductEntity } from "src/core/entity";
// import { ProductLogsModule } from "../product_logs/product_logs.module";
import { CashRegisterProductController } from "./controller/cashregister.product.controller";
import { ProductLogEntity } from "src/core/entity/product-log.entity";
import { ProductLogItemEntity } from "src/core/entity/product-log-item.entity";
import { ProductLogService } from "./service/product_log.service";
import { FileService } from "../file/file.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([ProductEntity, ProductLogEntity, ProductLogItemEntity,FileEntity]),
		// ProductLogsModule,
	],
	controllers: [ClientProductController, CashRegisterProductController],
	providers: [ProductService, ProductLogService, FileService],
	exports: [ProductService]
})
export class ProductModule {}
