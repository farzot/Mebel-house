import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { ProductType } from "src/common/database/Enums";
import { ObjDto } from "src/common/type";

export class CreateProductLogDto {
	@IsNotEmpty()
	@IsString()
	product_name!: string;

	@IsNotEmpty()
	@IsString()
	description!: string;

	@IsNotEmpty()
	@IsEnum(ProductType)
	product_type!: ProductType;

	@IsNotEmpty()
	@IsNumber()
	quantity!: number;

	@IsNotEmpty()
	@IsNumber()
	bar_code!: number;

	@IsNotEmpty()
	@IsString()
	plu!: string;

	@IsNotEmpty()
	@IsString()
	two_pu!: string; // mxik

	@IsNotEmpty()
	@IsNumber()
	origin_price!: number;

	@IsNotEmpty()
	@IsNumber()
	sale_price!: number;

	@IsNotEmpty()
	@IsString()
	product_category_name!: string;

	// @IsNotEmpty()
	// @ValidateNested({ each: true })
	// @Type(() => ObjDto)
	// store!: ObjDto;
}
