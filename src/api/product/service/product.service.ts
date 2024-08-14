import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ExecuterEntity, ProductEntity } from "src/core/entity";
import { ProductRepository } from "src/core/repository";

import { BaseService } from "src/infrastructure/lib/baseService";
import { responseByLang } from "src/infrastructure/lib/prompts/successResponsePrompt";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ProductLogEntity } from "src/core/entity/product-log.entity";
import { ProductLogRepository } from "src/core/repository/product-log.repository";
import { ProductLogItemEntity } from "src/core/entity/product-log-item.entity";
import { ProductLogItemRepository } from "src/core/repository/product-log-item.repository";
import { FileService } from "src/api/file/file.service";
import { GenerateCodeDto } from "../dto/generate-code.dto";
import { generateProductCode } from "src/infrastructure/lib/code-generater";
import { ProductCodeType, ProductType } from "src/common/database/Enums";
import { ProductUploadFromExcelDto } from "../dto/excel-upload.dto";
import { SomeFieldsMissing } from "../exception/some-field-missing";
import { PriceWrongFormat } from "../exception/price-wrong-format";
import { ProductTypeWrongFormat } from "../exception/product-type-wrong-format";
import { AlreadyExistProduct } from "../exception/already-exist-product";
import { DiscountProductDto } from "../dto/discount-product.dto";
import { ProductQueryDto } from "../dto/product-query.dto";
import { SaveUploadedProductDto } from "../dto/save-uploaded-product.dto";
import { DataSource } from "typeorm";
import { NoUploadedProductsToSave } from "../exception/no-uploaded-products";
import { DeleteUploadedProductsDto } from "../dto/delete-uploaded-products.dto";
import { AtLeastBarCodeOrPluShouldExist } from "../exception/at-least-bar_code-or-plu-should-exist";
import { ProductDoesntHaveBarCode } from "../exception/product-no-bar-code";
import { PluShouldnotAllowed } from "../exception/plu-shouldnot-allowed";
import { OnlyBarCodeOrPluAllowed } from "../exception/only-bar-code-or-plu-allowed";
import { NoBarCodeOrPlu } from "../exception/no-barcode-plu";
import { SalePriceLowThanOrigin } from "../exception/sale-price-low-than-origin";
import { DeleteMultipleProductsDto } from "../dto/delete-multiple-products.dto";
import { CreateProductMultipleDto } from "../dto/create-product-multiple.dto";

@Injectable()
export class ProductService extends BaseService<CreateProductDto, UpdateProductDto, ProductEntity> {
	constructor(
		@InjectRepository(ProductEntity) repository: ProductRepository,
		@InjectRepository(ProductLogEntity) private productLogRepository: ProductLogRepository,
		@InjectRepository(ProductLogItemEntity)
		private productLogItemRepository: ProductLogItemRepository,

		private readonly fileService: FileService,
		private readonly dataSource: DataSource,
	) {
		super(repository, "Product");
	}
	async createProduct(dto: CreateProductDto, lang: string, executer: ExecuterEntity) {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// this request consist of bar_code and plu: and this error occure if there is no bar_code or plu:  at least one of them should exist
			if (!dto.bar_code && !dto.plu) {
				throw new AtLeastBarCodeOrPluShouldExist();
			}

			// const { data: store } = await this.storeService.findOneById(dto.store.id);
			// const { data: product_category } = await this.storeProductCategoryService.findOneById(
			// 	dto.product_category.id,
			// 	lang,
			// 	{ where: { is_deleted: false, store: { id: dto.store.id } } },
			// );

			if (dto.product_type === ProductType.PCS) {
				if (!dto.bar_code) {
					throw new ProductDoesntHaveBarCode();
				}
				if (dto.plu) {
					throw new PluShouldnotAllowed();
				}
			}

			// if (dto.product_type === ProductType.KG) {
			// 	if (dto.bar_code && dto.plu) {
			// 		throw new OnlyBarCodeOrPluAllowed();
			// 	}
			// 	if (!dto.bar_code && !dto.plu) {
			// 		throw new NoBarCodeOrPlu();
			// 	}
			// 	// if (plu && plu.toString().length > 3) {
			// 	// 	console.log("pluuuuuuuuu", plu.length);
			// 	// 	console.log("plu should be 3 carecter");
			// 	// 	throw new Error();
			// 	// }
			// }
			let exist_product;
			if (dto.bar_code) {
				exist_product = await this.getRepository.findOneBy({ bar_code: dto.bar_code });
			}
			if (dto.plu) {
				exist_product = await this.getRepository.findOneBy({ plu: dto.plu });
			}
			if (exist_product) {
				throw new AlreadyExistProduct();
			}
			// const { data: product } = await this.create(dto, lang, executer);

			let product = new ProductEntity();
			if (dto.image) {
				product.image = (await this.fileService.findOneById(dto.image.id)).data;
			}
			product.bar_code = dto.bar_code;
			product.product_name = dto.product_name;
			product.product_type = dto.product_type;
			product.origin_price = dto.origin_price;
			product.sale_price = dto.sale_price;
			product.description = dto.description;
			product.label = dto.label;
			product.package_code = dto.package_code;
			product.marga = dto.marga;
			product.plu = dto.plu;
			product.qqs = dto.qqs;
			product.quantity = dto.quantity;
			product.two_pu = dto.two_pu;
			product.units = dto.units;
			// product.store = store;
			await queryRunner.manager.save(product);

			const product_log = new ProductLogEntity();
			// product_log.store = store;
			product_log.total_origin_price = dto.origin_price;
			product_log.total_sale_price = dto.sale_price;
			// product_log.marga = dto.marga;
			product_log.created_by = executer;
			// await this.productLogRepository.save(product_log);
			await queryRunner.manager.save(product_log);

			const product_log_item = new ProductLogItemEntity();
			product_log_item.product_name = dto.product_name;
			product_log_item.description = dto.description;
			product_log_item.product_type = dto.product_type;
			product_log_item.quantity = dto.quantity;
			product_log_item.bar_code = dto.bar_code;
			product_log_item.plu = dto.plu;
			product_log_item.two_pu = dto.two_pu;
			product_log_item.package_code = dto.package_code;
			product_log_item.label = dto.label;
			product_log_item.units = dto.units;
			product_log_item.origin_price = dto.origin_price;
			product_log_item.sale_price = dto.sale_price;
			product_log_item.marga = dto.marga;
			// product_log_item.product_category_name = product_category.name;
			product_log_item.product_log = product_log;
			product_log_item.qqs = dto.qqs;
			// await this.productLogItemRepository.save(product_log_item);
			await queryRunner.manager.save(product_log_item);

			await queryRunner.commitTransaction();
			const message = responseByLang("create", lang);
			return { status_code: 201, data: {}, message };
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async createMultipeProduct(
		dto: CreateProductMultipleDto,
		lang: string,
		executer: ExecuterEntity,
	) {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			// const { data: store } = await this.storeService.findOneById(dto.store.id);
			const { products } = dto;

			const product_log = new ProductLogEntity();
			// product_log.store = store;
			product_log.total_origin_price = 0;
			product_log.total_sale_price = 0;
			await queryRunner.manager.save(product_log);

			let total_origin_price = 0;
			let total_sale_price = 0;

			product_log.created_by = executer;
			for (let i = 0; i < products.length; i++) {
				const product_dto = products[i];

				if (!product_dto.bar_code && !product_dto.plu) {
					throw new AtLeastBarCodeOrPluShouldExist();
				}

				// const { data: product_category } =
				// 	await this.storeProductCategoryService.findOneById(
				// 		product_dto.product_category.id,
				// 		lang,
				// 		{ where: { is_deleted: false, store: { id: dto.store.id } } },
				// 	);
				if (product_dto.product_type === ProductType.PCS) {
					if (!product_dto.bar_code) {
						throw new ProductDoesntHaveBarCode();
					}
					if (product_dto.plu) {
						throw new PluShouldnotAllowed();
					}
				}

				// if (product_dto.product_type === ProductType.KG) {
				// 	if (product_dto.bar_code && product_dto.plu) {
				// 		throw new OnlyBarCodeOrPluAllowed();
				// 	}
				// 	if (!product_dto.bar_code && !product_dto.plu) {
				// 		throw new NoBarCodeOrPlu();
				// 	}
				// }
				let exist_product;
				if (product_dto.bar_code) {
					exist_product = (await this.getRepository.findOneBy({
						bar_code: product_dto.bar_code,
						// store: { id: dto.store.id },
						// product_category: { id: product_dto.product_category.id },
					})) as ProductEntity;
				}
				if (product_dto.plu) {
					exist_product = (await this.getRepository.findOneBy({
						plu: product_dto.plu,
						// store: { id: dto.store.id },
						// product_category: { id: product_dto.product_category.id },
					})) as ProductEntity;
				}
				if (exist_product) {
					if (product_dto.image) {
						exist_product.image = (
							await this.fileService.findOneById(product_dto.image.id)
						).data;
					}

					exist_product.product_name = product_dto.product_name;
					exist_product.product_type = product_dto.product_type;
					exist_product.description = product_dto.description;
					exist_product.origin_price = product_dto.origin_price;
					exist_product.sale_price = product_dto.sale_price;
					exist_product.marga = product_dto.marga;
					exist_product.bar_code = product_dto.bar_code;
					exist_product.plu = product_dto.plu;
					exist_product.label = product_dto.label;
					exist_product.package_code = product_dto.package_code;
					exist_product.qqs = product_dto.qqs;
					exist_product.two_pu = product_dto.two_pu;
					exist_product.units = product_dto.units;
					// exist_product.product_category = product_category;
					exist_product.quantity =
						Number(exist_product.quantity) + Number(product_dto.quantity);

					await queryRunner.manager.save(exist_product);
				} else {
					let product = new ProductEntity();
					if (product_dto.image) {
						product.image = (
							await this.fileService.findOneById(product_dto.image.id)
						).data;
					}
					product.bar_code = product_dto.bar_code;
					product.product_name = product_dto.product_name;
					product.product_type = product_dto.product_type;
					product.origin_price = product_dto.origin_price;
					product.sale_price = product_dto.sale_price;
					product.description = product_dto.description;
					product.label = product_dto.label;
					product.package_code = product_dto.package_code;
					product.marga = product_dto.marga;
					product.plu = product_dto.plu;
					product.qqs = product_dto.qqs;
					product.quantity = product_dto.quantity;
					product.two_pu = product_dto.two_pu;
					product.units = product_dto.units;
					// product.store = store;
					// product.product_category = product_category;
					await queryRunner.manager.save(product);
				}

				total_origin_price +=
					Number(product_dto.origin_price) * Number(product_dto.quantity);
				total_sale_price += Number(product_dto.sale_price) * Number(product_dto.quantity);

				const product_log_item = new ProductLogItemEntity();
				product_log_item.product_name = product_dto.product_name;
				product_log_item.description = product_dto.description;
				product_log_item.product_type = product_dto.product_type;
				product_log_item.quantity = product_dto.quantity;
				product_log_item.bar_code = product_dto.bar_code;
				product_log_item.plu = product_dto.plu;
				product_log_item.two_pu = product_dto.two_pu;
				product_log_item.package_code = product_dto.package_code;
				product_log_item.label = product_dto.label;
				product_log_item.units = product_dto.units;
				product_log_item.origin_price = product_dto.origin_price;
				product_log_item.sale_price = product_dto.sale_price;
				product_log_item.marga = product_dto.marga;
				// product_log_item.product_category_name = product_category.name;
				product_log_item.product_log = product_log;
				product_log_item.qqs = product_dto.qqs;
				await queryRunner.manager.save(product_log_item);
			}

			product_log.total_origin_price = total_origin_price;
			product_log.total_sale_price = total_sale_price;
			await queryRunner.manager.save(product_log);

			await queryRunner.commitTransaction();
			const message = responseByLang("create", lang);
			return { status_code: 201, data: {}, message };
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	// async updateProductByQuantity(
	// 	id: string,
	// 	dto: CreateProductDto,
	// 	lang: string,
	// 	executer: ExecuterEntity,
	// ) {
	// 	const { data: product } = await this.findOneById(id, lang, {
	// 		where: { is_deleted: false },
	// 		relations: { image: true, store: true, product_category: true },
	// 	});

	// 	product.product_name = dto.product_name || product.product_name;
	// 	product.description = dto.description || product.description;
	// 	product.product_type = dto.product_type || product.product_type;
	// 	product.quantity = Number(dto.quantity) + Number(product.quantity);
	// 	product.bar_code = dto.bar_code || product.bar_code;
	// 	product.plu = dto.plu || product.plu;
	// 	product.two_pu = dto.two_pu || product.two_pu;
	// 	product.package_code = dto.package_code || product.package_code;
	// 	product.label = dto.label || product.label;
	// 	product.units = dto.units || product.units;
	// 	product.origin_price = dto.origin_price || product.origin_price;
	// 	product.sale_price = dto.sale_price || product.sale_price;
	// 	product.marga = dto.marga || product.marga;
	// 	product.qqs = dto.qqs || product.qqs;

	// 	product.updated_at = Date.now();
	// 	if (dto.store?.id) {
	// 		const { data: store } = await this.storeService.findOneById(dto.store.id, lang, {
	// 			where: { is_deleted: false },
	// 		});
	// 		product.store = store;
	// 	}
	// 	if (dto.product_category?.id) {
	// 		const { data: product_category } = await this.storeProductCategoryService.findOneById(
	// 			dto.product_category.id,
	// 			lang,
	// 			{
	// 				where: { is_deleted: false, store: { id: dto.store?.id } },
	// 			},
	// 		);
	// 		product.product_category = product_category;
	// 	}
	// 	if (dto.image?.id) {
	// 		const { data: image } = await this.fileService.findOneById(dto.image.id);
	// 		console.log(product.image?.id && product.image?.id !== dto.image.id);

	// 		if (product.image?.id && product.image?.id !== dto.image.id) {
	// 			await this.fileService.deleteFile(product.image.id, lang);
	// 		}

	// 		product.image = image;
	// 	}

	// 	await this.getRepository.save(product);
	// }

	async updateProduct(id: string, dto: UpdateProductDto, lang: string, executer: ExecuterEntity) {
		const { data: product } = await this.findOneById(id, lang, {
			where: { is_deleted: false },
			relations: { image: true },
		});
		product.product_name = dto.product_name || product.product_name;
		product.description = dto.description || product.description;
		product.product_type = dto.product_type || product.product_type;
		product.quantity = dto.quantity || product.quantity;
		product.bar_code = dto.bar_code || product.bar_code;
		product.plu = dto.plu || product.plu;
		product.two_pu = dto.two_pu || product.two_pu;
		product.package_code = dto.package_code || product.package_code;
		product.label = dto.label || product.label;
		product.units = dto.units || product.units;
		product.origin_price = dto.origin_price || product.origin_price;
		product.sale_price = dto.sale_price || product.sale_price;
		product.marga = dto.marga || product.marga;
		product.qqs = dto.qqs || product.qqs;

		product.updated_at = Date.now();
		// if (dto.store?.id) {
		// 	const { data: store } = await this.storeService.findOneById(dto.store.id, lang, {
		// 		where: { is_deleted: false },
		// 	});
		// 	product.store = store;
		// }
		// if (dto.product_category?.id) {
		// 	const { data: product_category } = await this.storeProductCategoryService.findOneById(
		// 		dto.product_category.id,
		// 		lang,
		// 		{
		// 			where: { is_deleted: false, store: { id: dto.store?.id } },
		// 		},
		// 	);
		// 	product.product_category = product_category;
		// }
		if (dto.image?.id) {
			const { data: image } = await this.fileService.findOneById(dto.image.id);
			console.log(product.image?.id && product.image?.id !== dto.image.id);

			if (product.image?.id && product.image?.id !== dto.image.id) {
				await this.fileService.deleteFile(product.image.id, lang);
			}

			product.image = image;
		}

		await this.getRepository.save(product);
		const message = responseByLang("update", lang);
		return { status_code: 200, data: {}, message };
	}

	//get all products by cashier from cash_register app
	// async getAllProductsByCashier(lang: string, store_id: string, query: ProductQueryDto) {
	// 	// const { data: products } = await this.storeProductCategoryService.findAll(lang, {
	// 	// 	where: {
	// 	// 		// store: { id: store_id },
	// 	// 		is_deleted: false,
	// 	// 		products: {
	// 	// 			is_sale: true,
	// 	// 			is_deleted: false,

	// 	// 			discount: query?.is_discount,
	// 	// 		},
	// 	// 	},
	// 	// 	relations: {
	// 	// 		products: { image: true },
	// 	// 	},
	// 	// });

	// 	// return { status_code: 200, data: products, message: responseByLang("get_all", lang) };
	// 	return {};
	// }

	//generate product's bar_code and plu code
	async generateProductCode(dto: GenerateCodeDto, lang: string) {
		let code = 0;
		code = generateProductCode(dto.code_type, dto.product_type);
		//this while loop to avoid repeating the same value that belongs to product, both bar_code or plu field should be unique
		while (true) {
			let product;
			if (dto.code_type === ProductCodeType.BAR_CODE) {
				product = await this.getRepository.findOne({
					where: { bar_code: code, store: { id: dto.store.id } },
				});
			} else if (dto.code_type === ProductCodeType.PLU) {
				product = await this.getRepository.findOne({
					where: { plu: code, store: { id: dto.store.id } },
				});
				console.log(product);
			}

			if (!product) {
				console.log("break");

				break;
			}
			code = generateProductCode(dto.code_type, dto.product_type);
		}

		return {
			data: { code, type: dto.code_type },
			status_code: 200,
			message: "Code generation process",
		};
	}

	//upload product from excel file
	async uploadProductFromExcel(
		dto: ProductUploadFromExcelDto,
		jsonProducts: any[][number],
		lang: string,
	) {
		// const { data: store } = await this.storeService.findOneById(dto.store_id, lang);
		// const { data: product_category } = await this.storeProductCategoryService.findOneById(
			// dto.product_category_id,
			// lang,
		// );

		let products: any = [],
			marga;

		for (const row of jsonProducts) {
			let [
				product_name,
				product_type,
				quantity,
				origin_price,
				sale_price,
				bar_code,
				plu,
				two_pu, //mxik
				units,
				package_code,
				label,
			] = row;

			if (product_name === "наименование товара") {
				continue;
			}

			if (row.length === 0) {
				continue;
			}

			if (
				row.length > 0 &&
				!(product_name && product_type && quantity && origin_price && sale_price)
			) {
				throw new SomeFieldsMissing();
			}

			if (Number(origin_price) % 1 !== 0 || Number(sale_price) % 1 !== 0) {
				throw new PriceWrongFormat();
			}
			marga = (Number(sale_price) / Number(origin_price)) * 100 - 100;

			if (marga < 0) {
				throw new SalePriceLowThanOrigin();
			}

			if (!Object.values(["лт", "шт", "кг", "м"]).includes(product_type as ProductType)) {
				throw new ProductTypeWrongFormat();
			}
			product_type = this.getProductType(product_type) as ProductType;
			if (product_type === ProductType.PCS) {
				if (!bar_code) {
					throw new ProductDoesntHaveBarCode();
				}
				if (plu) {
					throw new PluShouldnotAllowed();
				}
			}

			// if (product_type === ProductType.KG) {
			// 	if (bar_code && plu) {
			// 		throw new OnlyBarCodeOrPluAllowed();
			// 	}
			// 	if (!bar_code && !plu) {
			// 		throw new NoBarCodeOrPlu();
			// 	}
			// 	// if (plu && plu.toString().length > 3) {
			// 	// 	console.log("pluuuuuuuuu", plu.length);
			// 	// 	console.log("plu should be 3 carecter");
			// 	// 	throw new Error();
			// 	// }
			// }

			let same_product: ProductEntity;
			if (bar_code) {
				same_product = await this.getRepository.findOne({
					where: { bar_code,  is_deleted: false },
				});
			} else {
				same_product = await this.getRepository.findOne({
					where: { plu,  is_deleted: false },
				});
			}

			if (same_product) {
				throw new AlreadyExistProduct();

				// console.log(same_product.product_name,'same--');

				// if (same_product.product_name === product_name) {
				// 	same_product.quantity = Number(quantity) + Number(same_product.quantity);
				// 	await this.getRepository.save(same_product);
				// 	continue;
				// } else {
				// 	console.log(product_name,'===');

				// 	throw new AlreadyExistProduct();
				// }
			}

			let product = new ProductEntity();
			product.product_name = product_name;
			product.product_type = product_type as ProductType;
			product.quantity = quantity;
			product.origin_price = origin_price;
			product.sale_price = sale_price;
			product.bar_code = bar_code;
			product.plu = plu ? Number(plu) : plu;
			product.two_pu = two_pu;
			product.package_code = package_code;
			product.label = label;
			product.units = units;
			product.marga = marga;
			product.is_sale = false;
			// product.store = store;
			// product.product_category = product_category;
			product.qqs = false;

			products.push(product);
		}

		products = await this.getRepository.save(products);

		const message = responseByLang("excel_file_uploaded", lang);
		return {
			data: {  },
			message,
			status_code: 201,
		};
	}

	//give discount to the product
	async discountProduct(
		id: string,
		dto: DiscountProductDto,
		lang: string,
		executer: ExecuterEntity,
	) {
		const { data: product } = await this.findOneById(id, lang, {
			where: { is_deleted: false },
			// relations: { product_category: true },
		});

		if (Number(dto.discount_price) === 0) {
			product.discount = false;
		} else {
			product.discount = true;
		}

		product.discount_price = dto.discount_price;

		// if (dto.product_category?.id) {
		// 	const { data: product_category } = await this.storeProductCategoryService.findOneById(
		// 		dto.product_category.id,
		// 		lang,
		// 		{
		// 			where: { is_deleted: false },
		// 		},
		// 	);
		// 	product.product_category = product_category;
		// }
		product.updated_at = Date.now();
		product.updated_by = executer;
		await this.getRepository.save(product);

		const message = responseByLang("update", lang);
		return { status_code: 200, data: {}, message };
	}
	// remove discount
	async removeProductFromDiscount(id: string, lang: string, executer: ExecuterEntity) {
		const { data: product } = await this.findOneById(id, lang, {
			where: { is_deleted: false },
			// relations: { product_category: true },
		});
		product.discount = false;
		product.discount_price = 0;
		product.updated_at = Date.now();
		product.updated_by = executer;
		await this.getRepository.save(product);

		const message = responseByLang("update", lang);
		return { status_code: 200, data: {}, message };
	}

	//save uploaded product: change the is_sale property and save product_logs: products allowed for sale
	async saveUploadedProducts(
		dto: SaveUploadedProductDto,
		lang: string,
		executer: ExecuterEntity,
	) {
		const query = this.dataSource.createQueryRunner();
		await query.connect();
		await query.startTransaction();

		try {
			// const { data: store } = await this.storeService.findOneById(dto.store.id);
			// const { data: product_category } = await this.storeProductCategoryService.findOneById(
			// 	dto.product_category.id,
			// 	lang,
			// 	{ where: { is_deleted: false, store: { id: dto.store.id } } },
			// );

			let { data: products } = await this.findAll(lang, {
				where: {
					is_deleted: false,
					is_sale: false,
					// store: { id: store.id },
					// product_category: { id: product_category.id },
				},
			});

			if (products.length === 0) {
				throw new NoUploadedProductsToSave();
			}

			const product_log = new ProductLogEntity();
			let total_origin_price = 0,
				total_sale_price = 0;

			// product_log.store = store;
			product_log.created_by = executer;
			product_log.total_origin_price = total_origin_price;
			product_log.total_sale_price = total_sale_price;
			await this.productLogRepository.save(product_log);

			for (let product of products) {
				product.is_sale = true;
				product.updated_by = executer;
				product.updated_at = Date.now();
				await this.getRepository.save(product);

				const product_log_item = new ProductLogItemEntity();
				product_log_item.product_name = product.product_name;
				product_log_item.description = product.description;
				product_log_item.product_type = product.product_type;
				product_log_item.quantity = product.quantity;
				product_log_item.bar_code = product.bar_code;
				product_log_item.plu = product.plu;
				product_log_item.two_pu = product.two_pu;
				product_log_item.package_code = product.package_code;
				product_log_item.label = product.label;
				product_log_item.units = product.units;
				product_log_item.origin_price = product.origin_price;
				product_log_item.sale_price = product.sale_price;
				product_log_item.marga = product.marga;
				// product_log_item.product_category_name = product_category.name;
				product_log_item.product_log = product_log;
				await this.productLogItemRepository.save(product_log_item);

				total_origin_price += Number(product.origin_price) * Number(product.quantity);
				total_sale_price += Number(product.sale_price) * Number(product.quantity);
			}
			product_log.total_origin_price = total_origin_price;
			product_log.total_sale_price = total_sale_price;
			await this.productLogRepository.save(product_log);
			await query.commitTransaction();
		} catch (err) {
			await query.rollbackTransaction();
			throw err;
		} finally {
			await query.release();
		}

		const message = responseByLang("create", lang);
		return { status_code: 201, data: [], message };
	}

	//delete all uploaded products by store_id and category_id : those product aren't allowed for sale
	async deleteUploadedProducts(dto: DeleteUploadedProductsDto, lang: string) {
		// const { data: store } = await this.storeService.findOneById(dto.store.id);
		// const { data: product_category } = await this.storeProductCategoryService.findOneById(
		// 	dto.product_category.id,
		// 	lang,
		// 	{ where: { is_deleted: false, store: { id: dto.store.id } } },
		// );

		let { data: products } = await this.findAll(lang, {
			where: {
				is_deleted: false,
				is_sale: false,
				// store: { id: store.id },
				// product_category: { id: product_category.id },
			},
		});
		for (let product of products) {
			await this.getRepository.delete({ id: product.id });
		}

		const message = responseByLang("delete", lang);
		return { status_code: 201, data: [], message };
	}
	// delete a uploaded product : this product is not allowed for sale
	async deleteUploadedProduct(id: string, lang: string) {
		await this.getRepository.delete({ id });

		const message = responseByLang("delete", lang);
		return { status_code: 201, data: [], message };
	}
	// delete multiple products : those product allowed for sale
	async deleteMultipleProducts(
		dto: DeleteMultipleProductsDto,
		lang: string,
		executer: ExecuterEntity,
	) {
		for (let item of dto.ids) {
			await this.getRepository.update(
				{ id: item.id },
				{ is_active: false, is_deleted: true, deleted_by: executer },
			);
		}

		const message = responseByLang("delete", lang);
		return { status_code: 201, data: [], message };
	}
	private getProductType(product_type: string) {
		let result = "";
		switch (product_type) {
			case "лт":
				result = "l";
				break;
			case "шт":
				result = "pcs";
				break;
			// case "кг":
			// 	result = "kg";
			// 	break;
			case "м":
				result = "m";
				break;
		}
		return result;
	}

	public getProductTypeRu(product_type: string) {
		let result = "";
		switch (product_type) {
			case "l":
				result = "лт";
				break;
			case "pcs":
				result = "шт";
				break;
			// case "kg":
			// 	result = "кг";
			// 	break;
			case "m":
				result = "м";
				break;
		}
		return result;
	}

	async updateBarCode() {
		const queries = [
			`ALTER TABLE products ADD COLUMN temp_bar_code varchar;
         UPDATE products SET temp_bar_code = CAST(bar_code AS varchar);
         ALTER TABLE order_items ADD COLUMN temp_product_bar_code varchar;
         UPDATE order_items SET temp_product_bar_code = CAST(product_bar_code AS varchar);
         ALTER TABLE return_order_items ADD COLUMN temp_product_bar_code varchar;
         UPDATE return_order_items SET temp_product_bar_code = CAST(product_bar_code AS varchar);
         ALTER TABLE product_log_items ADD COLUMN temp_bar_code varchar;
         UPDATE product_log_items SET temp_bar_code = CAST(bar_code AS varchar);`,

			`ALTER TABLE products DROP COLUMN bar_code;
         ALTER TABLE order_items DROP COLUMN product_bar_code;
         ALTER TABLE return_order_items DROP COLUMN product_bar_code;
         ALTER TABLE product_log_items DROP COLUMN bar_code;`,

			`ALTER TABLE products ADD COLUMN bar_code varchar;
         ALTER TABLE order_items ADD COLUMN product_bar_code varchar;
         ALTER TABLE return_order_items ADD COLUMN product_bar_code varchar;
         ALTER TABLE product_log_items ADD COLUMN bar_code varchar;`,

			`UPDATE products SET bar_code = temp_bar_code;
         UPDATE order_items SET product_bar_code = temp_product_bar_code;
         UPDATE return_order_items SET product_bar_code = temp_product_bar_code;
         UPDATE product_log_items SET bar_code = temp_bar_code;`,

			`ALTER TABLE products DROP COLUMN temp_bar_code;
         ALTER TABLE order_items DROP COLUMN temp_product_bar_code;
         ALTER TABLE return_order_items DROP COLUMN temp_product_bar_code;
         ALTER TABLE product_log_items DROP COLUMN temp_bar_code;`,
		];

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			for (const query of queries) {
				await queryRunner.query(query);
			}
			await queryRunner.commitTransaction();
			return "Success";
		} catch (error) {
			await queryRunner.rollbackTransaction();
			return "An error occurred during updateBarCode";
		} finally {
			await queryRunner.release();
		}
	}
}
