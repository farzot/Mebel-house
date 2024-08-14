import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, ValidateNested } from "class-validator";
import { ObjDto } from "src/common/type";

export class DiscountProductDto {
	// @IsOptional()
	// @ValidateNested({ each: true })
	// @Type(() => ObjDto)
	// product_category!: ObjDto;

	@IsNotEmpty()
	@IsNumberString()
	discount_price!: number;
}
