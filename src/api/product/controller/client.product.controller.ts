import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    UseGuards,
    Query,
    Res,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { ProductService } from "../service/product.service";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { CurrentExecuter } from "src/common/decorator/current-executer";
import { CurrentLanguage } from "src/common/decorator/current-language";
import { ICurrentExecuter } from "src/common/interface/current-executer.interface";
import { JwtAuthGuard } from "../../auth/user/AuthGuard";
import { RolesGuard } from "../../auth/roles/RoleGuard";
import { RolesDecorator } from "../../auth/roles/RolesDecorator";
import { ProductCodeType, ProductType, Roles } from "src/common/database/Enums";
import { ProductQueryDto } from "../dto/product-query.dto";
import { ProductEntity } from "src/core/entity";
import { Between, FindOptionsWhere, FindOptionsWhereProperty, ILike } from "typeorm";
import * as XLSX from "xlsx";
import { Response } from "express";
import { ProductLogService } from "../service/product_log.service";
import { ProductLogQueryDto } from "../dto/product-log-query.dto";
import { ProductLogEntity } from "src/core/entity/product-log.entity";
import { GenerateCodeDto } from "../dto/generate-code.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductUploadFromExcelDto } from "../dto/excel-upload.dto";
import { fileFilters, multerOptionAll } from "src/infrastructure/lib/fileService";
import { FileRequiredException } from "src/api/file/exception/file.exception";
import { Pager } from "src/infrastructure/lib/pagination";
import { DiscountProductDto } from "../dto/discount-product.dto";
import { SaveUploadedProductDto } from "../dto/save-uploaded-product.dto";
import { DeleteUploadedProductsDto } from "../dto/delete-uploaded-products.dto";
import { CodeTypePluPtoductTypeKg } from "../exception/code-type-plu-ptoduct-type-kg";
import { DeleteMultipleProductsDto } from "../dto/delete-multiple-products.dto";
import { responseByLang } from "src/infrastructure/lib/prompts/successResponsePrompt";
import { CreateProductMultipleDto } from "../dto/create-product-multiple.dto";
import { FindOneByCodeDto } from "../dto/findone-bycode.dto";
import { DownloadExelDto } from "../dto/download-exel.dto";
@Controller("/client/product")
export class ClientProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly productLogService: ProductLogService,

		// private readonly storeProductCategoryService: StoreProductCategoryService,
    ) { }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post()
    create(
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
        @Body() createProductDto: CreateProductDto,
    ) {
        return this.productService.createProduct(createProductDto, lang, executerPayload.executer);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post("/multiple")
    createMultiple(
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
        @Body() createProductMultipleDto: CreateProductMultipleDto,
    ) {
        return this.productService.createMultipeProduct(createProductMultipleDto, lang, executerPayload.executer);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post("/excel-upload")
    @UseInterceptors(FileInterceptor("file", { fileFilter: fileFilters.excel }))
    async uploadProductFromExcel(
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: ProductUploadFromExcelDto,
    ) {
        if (!file) {
            throw new FileRequiredException();
        }
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert Excel sheet data to JSON
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        return this.productService.uploadProductFromExcel(body, jsonData, lang);
    }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Get()
    async findAll(
        @CurrentLanguage() lang: string,
        @Query() query: ProductQueryDto,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        let base_condition: FindOptionsWhere<ProductEntity> = {
            is_deleted: false,
            is_sale: true,
            discount: query?.is_discount,
            // product_category: { id: query?.category_id },
            // store: { id: query?.store_id, company: { id: executerPayload.company_id } },
        };

        let where_conditions: FindOptionsWhere<ProductEntity>[] = [];

        if (query?.search) {
            where_conditions.push({
                ...base_condition,
                product_name: ILike(`%${query.search}%`),
            });
            where_conditions.push({
                ...base_condition,
                bar_code: ILike(`%${query.search}%`),
            });
        } else {
            // If there's no search query, use the base condition only
            where_conditions.push(base_condition);
        }

        return this.productService.findAllWithPagination(lang, {
            take: query.page_size,
            skip: query.page,
            order: { created_at: "DESC" },
            where: where_conditions,
            // relations: { store: true, product_category: true, image: true },
        });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Get("/remainder")
    async getStatic(
        @CurrentLanguage() lang: string,
        @Query() query: ProductQueryDto,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        const { data: products } = await this.productService.findAll(lang, {
            where: [
                {
                    is_deleted: false,
                    // store: { id: query?.store_id, company: { id: executerPayload.company_id } },
                    // product_category: { id: query?.category_id },
                },
            ],
            // relations: { store: true },
        });

        let data = {
            total_origin_price: 0,
            total_sale_price: 0,
            total_profit: 0,
            total_product_count: 0,
            total_product_amount: 0,
        };

        for (const product of products) {
            data.total_product_count += 1;
            data.total_product_amount += Number(product.quantity);
            data.total_origin_price += Number(product.origin_price) * Number(product.quantity);
            data.total_sale_price += Number(product.sale_price) * Number(product.quantity);
        }

        data.total_profit = Number((data.total_sale_price - data.total_origin_price).toFixed(2));

        const message = responseByLang("get_all", lang);
        return {
            data,
            message,
            status_code: 200,
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Get("/uploaded")
    findAllUploadedProducts(
        @CurrentLanguage() lang: string,
        @Query() query: ProductQueryDto,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        let where_condition: FindOptionsWhereProperty<ProductEntity> = {};
        if (query?.search) {
            where_condition = { product_name: ILike(`%${query.search}%`) };
        }

        return this.productService.findAllWithPagination(lang, {
            take: query.page_size,
            skip: query.page,
            order: { updated_at: "DESC" },
            where: {
                is_deleted: false,
                is_sale: false,
                // product_category: { id: query?.category_id },
                // store: { id: query?.store_id, company: { id: executerPayload.company_id } },
                ...where_condition,
            },
            relations: {image: true },
        });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Delete("/uploaded")
    remooveUploaded(@CurrentLanguage() lang: string, @Body() body: DeleteUploadedProductsDto) {
        return this.productService.deleteUploadedProducts(body, lang);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Delete("/uploaded/:id")
    delete(
        @CurrentLanguage() lang: string,
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        return this.productService.deleteUploadedProduct(id, lang);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post("/uploaded/save")
    saveUploadedProduct(
        @CurrentLanguage() lang: string,
        @Body() body: SaveUploadedProductDto,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        return this.productService.saveUploadedProducts(body, lang, executerPayload.executer);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Get("/logs")
    findProductLogs(
        @CurrentLanguage() lang: string,
        @Query() query: ProductLogQueryDto,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        let search_condition: FindOptionsWhereProperty<ProductEntity> = {};
        if (query?.search) {
            search_condition = { product_name: ILike(`%${query.search}%`) };
        }
        let between_condition: FindOptionsWhereProperty<ProductLogEntity> = {};

        if (query?.from && query?.to) {
            between_condition = { created_at: Between(query.from, query.to) };
        }
        return this.productLogService.findAllWithPagination(lang, {
            take: query.page_size,
            skip: query.page,
            order: { created_at: "DESC" },
            select: {
                id: true,
                created_at: true,
                // store: { id: true, name: true },
                total_origin_price: true,
                total_sale_price: true,
                products: {
                    id: true,
                    product_name: true,
                    product_category_name: true,
                    bar_code: true,
                    quantity: true,
                    origin_price: true,
                    sale_price: true,
                },
            },
            where: {
                is_deleted: false,
                // store: { id: query?.store_id, company: { id: executerPayload.company_id } },
                products: { ...search_condition },
                ...between_condition,
            },

            relations: { products: true },
        });
    }
    //download inserted products logs - накладной
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Get("/download-inserted-logs")
    async dowloadExcelInsertedProducts(
        @Res() res: Response,
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
        @Query() query: ProductLogQueryDto,
    ) {
        let between_condition: FindOptionsWhereProperty<ProductLogEntity> = {};

        if (query?.from && query?.to) {
            between_condition = { created_at: Between(query.from, query.to) };
        }
        const { data } = await this.productLogService.findAllWithPagination(lang, {
            order: { created_at: "DESC" },
            select: {
                id: true,
                created_at: true,
                // store: { id: true, name: true },
                total_origin_price: true,
                total_sale_price: true,
                products: {
                    id: true,
                    product_name: true,
                    product_category_name: true,
                    bar_code: true,
                    quantity: true,
                    origin_price: true,
                    sale_price: true,
                    product_type: true,
                },
            },
            where: {
                is_deleted: false,
                // store: { id: query?.store_id, company: { id: executerPayload.company_id } },
                ...between_condition,
            },

            relations: { products: true },
        });

        const excel_data: any[] = [];
        data?.map(
            (product_log) =>
                product_log?.products.map((product) => {
                    excel_data.push({
                        id: product_log.id,
                        sana: new Date(Number(product_log.created_at)),
                        // dokon_nomi: product_log.store.name,
                        mahsulot_nomi: product.product_name,
                        // mahsulot_kategoriyasi: product.product_category_name,
                        bar_code: product.bar_code,
                        plu: product.plu,
                        // two_plu:product.two_pu,
                        mahsulot_turi: product.product_type,
                        qqs: product.qqs ? "DA" : "NET",
                        miqdori: product.quantity,
                        tan_narxi: product.origin_price,
                        sotuv_narxi: product.sale_price,
                    });
                }),
        );

        const worksheet = XLSX.utils.json_to_sheet(excel_data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader("Content-Disposition", "attachment; filename=products-nakladnoy.xlsx");

        // Pipe the workbook to the response

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        return res.end(buffer);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Get("/download-excel")
    async dowloadExcel(
        @Res() res: Response,
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
        @Query() query: ProductQueryDto,
    ) {
        let where_condition: FindOptionsWhereProperty<ProductEntity> = {};
        if (query?.search) {
            where_condition = { product_name: ILike(`%${query.search}%`) };
        }
        const { data } = await this.productService.findAll(lang, {
            take: query.page_size,
            skip: query.page,
            where: {
                is_deleted: false,
                // product_category: { id: query?.category_id },
                // store: {
                //     id: query?.store_id,
                //     // company: { id: executerPayload.company_id },
                // },
                ...where_condition,
            },

            // relations: { store: true, product_category: true, image: true },
                        relations: {  image: true },

        });

        const excel_data = data.map((item) => {
            return {
                id: item.id,
                product_name: item.product_name,
                quantity: item.quantity,
                bar_code: item.bar_code,
                plu: item.plu,
                two_pu: item.two_pu,
                origin_price: item.origin_price,
                sale_price: item.sale_price,
                discount: item.discount,
                discount_price: item.discount_price,
                discount_quantity: item.discount_quantity,
                exist: item.is_sale,
                // store: item.store.name,
                // category_name: item.product_category.name,
                status: item.is_active ? "active" : "not_active",
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excel_data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");

        // Pipe the workbook to the response

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        return res.end(buffer);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post("/download-excel")
    async dowloadExcelWithFilter(
        @Res() res: Response,
        @CurrentLanguage() lang: string,
        @Body() dto: DownloadExelDto,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
      ) {      

        // const { data: store } = await this.storeService.findOneById(dto?.store?.id);
        // const { data: product_category } = await this.storeProductCategoryService.findOneById(
        //     dto?.category?.id,
        //     lang,
        //     { where: { is_deleted: false, store: { id: dto?.store?.id } } },
        // );

        const { data } = await this.productService.findAll(lang, {
          where: {
            is_deleted: false,
          },
      
          relations: {  image: true },
        });
        const translations: Record<string, { there_is: string; there_is_not: string }> = {
            uz: { there_is: "bor", there_is_not: "yo'q" },
            en: { there_is: "yes", there_is_not: "not" },
            ru: { there_is: "есть", there_is_not: "нет" },
        };
    
        const { there_is, there_is_not } = translations[lang] || translations['ru'];
        let count:number = 1;
        const excel_data = data.map((item) => {
          const productData: any = {};
          productData["№"] = count++;
          if (dto.product_name) productData["Название продукта"] = item.product_name;
          if (dto.quantity) productData["Kоличество"] = item.quantity;
          if (dto.bar_code) productData["штрих код"] = item.bar_code;
          if (dto.plu) productData["ПЛУ"] = item.plu;
          if (dto.product_type) productData["Тип продукта"] = this.productService.getProductTypeRu(item.product_type);
          if (dto.origin_price) productData["Себестоимость"] = item.origin_price;
          if (dto.sale_price) productData["Цена"] = item.sale_price;
          if (dto.marga) productData["Наценка"] = item.marga;
        //   if (dto.store_name) productData["Магазина"] = item.store.name;
        //   if (dto.category_name) productData["Категории"] = item.product_category.name;
          if (dto.discount) {
            productData["Скидки"] = item.discount? there_is: there_is_not;
            productData["Цена со скидкой"] = item.discount_price;
            }
        if (dto.qqs) {
            productData["НДС"] = item.qqs? there_is: there_is_not;
            productData["Единицы"] = item.units;
            productData["2 ПУ"] = item.two_pu
            productData["Код маркировки"] = item.label;
            productData["Код  упаковке"] = item.package_code;
            }
            
            return productData;
        });        
        console.log(excel_data);
        
        const worksheet = XLSX.utils.json_to_sheet(excel_data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
      
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        return res.end(buffer);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Get(":id")
    findOne(@Param("id", ParseUUIDPipe) id: string, @CurrentLanguage() lang: string) {
        return this.productService.findOneById(id, lang, {
            where: { is_deleted: false },
            relations: { image: true },
        });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post("/code")
    async findOneByBarCode(
        @CurrentLanguage() lang: string, @Body() dto: FindOneByCodeDto
    ) {

        let result = {}

        if (dto.code_type === ProductCodeType.BAR_CODE) {

            result = await this.productService.findOneBy(lang, {
                where: { is_deleted: false, bar_code: dto.code, },
                relations: { image: true, },
            });
        }
        if (dto.code_type === ProductCodeType.PLU) {
            result = await this.productService.findOneBy(lang, {
                where: { is_deleted: false, plu: Number(dto.code), },
                relations: { image: true,  },
            });
        }
        return result
    }

    //give discount to product
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post("/discount/:id")
    giveDiscount(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() discountProductDto: DiscountProductDto,
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        return this.productService.discountProduct(
            id,
            discountProductDto,
            lang,
            executerPayload.executer,
        );
    }

    //remove from discount
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Delete("/discount/:id")
    romoveDiscount(
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        return this.productService.removeProductFromDiscount(id, lang, executerPayload.executer);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Patch(":id")
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() updateProductDto: UpdateProductDto,
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        return this.productService.updateProduct(
            id,
            updateProductDto,
            lang,
            executerPayload.executer,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Delete(":id")
    remove(@Param("id", ParseUUIDPipe) id: string, @CurrentLanguage() lang: string) {
        return this.productService.delete(id, lang);
    }
    //delete multiple prodcuts
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post("/delete-multiple")
    deleteMultipleProducts(
        @Body() dto: DeleteMultipleProductsDto,
        @CurrentLanguage() lang: string,
        @CurrentExecuter() executerPayload: ICurrentExecuter,
    ) {
        return this.productService.deleteMultipleProducts(dto, lang, executerPayload.executer);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
    @Post("/generate-code")
    generateProductCode(@CurrentLanguage() lang: string, @Body() dto: GenerateCodeDto) {
        if (dto.code_type === ProductCodeType.PLU) {
            throw new CodeTypePluPtoductTypeKg();
        }
        return this.productService.generateProductCode(dto, lang);
    }

    // @Get("/update/bar_code")
    // async updateBarCode() {
    //     return this.productService.updateBarCode();
    // }
}
