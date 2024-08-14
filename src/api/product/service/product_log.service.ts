import { Injectable } from "@nestjs/common";
import { CreateProductLogDto } from "../../product_logs/dto/create-product_log.dto";
import { UpdateProductLogDto } from "../../product_logs/dto/update-product_log.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { ProductLogEntity } from "src/core/entity/product-log.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductLogRepository } from "src/core/repository/product-log.repository";
import { ICurrentExecuter } from "src/common/interface/current-executer.interface";
import { responseByLang } from "src/infrastructure/lib/prompts/successResponsePrompt";
import { ExecuterEntity } from "src/core/entity";
import { ProductLogItemEntity } from "src/core/entity/product-log-item.entity";
import { ProductLogItemRepository } from "src/core/repository/product-log-item.repository";

@Injectable()
export class ProductLogService extends BaseService<
	CreateProductLogDto,
	UpdateProductLogDto,
	ProductLogEntity
> {
	constructor(
		@InjectRepository(ProductLogEntity) repository: ProductLogRepository,
		@InjectRepository(ProductLogItemEntity)
		private productLogItemRepository: ProductLogItemRepository,
	) {
		super(repository, "product_logs");
	}

	async createProductLog(dto: CreateProductLogDto, lang: string, executer: ExecuterEntity) {
		// const product_log = await this.create(dto, lang, executer);
		// const product_log = new ProductLogEntity();
		// product_log.store = dto.store;
		// product_log.total_origin_price = dto.origin_price;
		// product_log.total_sale_price = dto.sale_price;
		// await this.getRepository.save(product_log);

		// const product_log_item = new ProductLogItemEntity();
		// product_log_item.product_name = dto.product_name;
		// product_log_item.description = dto.description;
		// product_log_item.product_type = dto.product_type;
		// product_log_item.quantity = dto.quantity;
		// product_log_item.bar_code = dto.bar_code;
		// product_log_item.plu = dto.plu;
		// product_log_item.two_pu = dto.two_pu;
		// product_log_item.origin_price = dto.origin_price;
		// product_log_item.sale_price = dto.sale_price;
		// product_log_item.product_category_name = dto.product_category_name;
		// product_log_item.product_log = product_log;
		// await this.productLogItemRepository.save(product_log_item);
		// const message = responseByLang("create", lang);
		// return { status_code: 201, data: product_log, message };
	}

	async createProductLogItem(dto: CreateProductLogDto, lang: string, executer: ExecuterEntity) {
		const product_log = await this.create(dto, lang, executer);
		const message = responseByLang("create", lang);
		return { status_code: 201, data: product_log, message };
	}
}
