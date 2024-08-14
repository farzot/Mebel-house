import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsBoolean,
	IsEnum,
	IsNumber,
	IsNumberString,
	IsOptional,
	IsString,
} from "class-validator";
import { ObjDto } from "src/common/type";
import { ProductType } from "src/common/database/Enums";

 class CreateProductsDto {
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

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ObjDto)
	image!: ObjDto;
}


export class CreateProductMultipleDto {
//   @IsNotEmpty()
//   @ValidateNested({ each: true })
//   @Type(() => ObjDto)
//   store!: ObjDto;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductsDto)
  products!: CreateProductsDto[];
}
