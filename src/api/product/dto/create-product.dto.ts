import { Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsNumberString,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { ProductType } from "src/common/database/Enums";
import { ObjDto } from "src/common/type";

export class CreateProductDto {
	@IsNotEmpty()
	@IsString()
	product_name!: string;

	@IsOptional()
	@IsString()
	description!: string;

	@IsNotEmpty()
	@IsEnum(ProductType)
	product_type!: ProductType;

	@IsNotEmpty()
	@IsNumber()
	quantity!: number;

	@IsOptional()
	@IsNumberString()
	bar_code!: string;

	@IsOptional()
	@IsNumber()
	plu!: number;

	@IsOptional()
	@IsString()
	two_pu!: string; //mxik

	@IsOptional()
	@IsString()
	package_code!: string;

	@IsOptional()
	@IsString()
	label!: string;

	@IsOptional()
	@IsNumberString()
	units!: number;

	@IsNotEmpty()
	@IsNumberString()
	origin_price!: number;

	@IsNotEmpty()
	@IsNumberString()
	sale_price!: number;

	@IsNotEmpty()
	@IsNumberString()
	marga!: number;

	@IsNotEmpty()
	@IsBoolean()
	qqs!: boolean;

	// @IsNotEmpty()
	// @ValidateNested({ each: true })
	// @Type(() => ObjDto)
	// product_category!: ObjDto;

	// @IsNotEmpty()
	// @ValidateNested({ each: true })
	// @Type(() => ObjDto)
	// store!: ObjDto;

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ObjDto)
	image!: ObjDto;
}
