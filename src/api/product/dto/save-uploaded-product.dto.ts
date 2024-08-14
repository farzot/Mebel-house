import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, ValidateNested } from "class-validator";
import { ObjDto } from "src/common/type";

export class SaveUploadedProductDto {
	// @IsNotEmpty()
	// @Type(() => ObjDto)
	// @ValidateNested({ each: true })
	// store!: ObjDto;

	// @IsNotEmpty()
	// @Type(() => ObjDto)
	// @ValidateNested({ each: true })
	// product_category!: ObjDto;

	// @IsArray()
	// @IsNotEmpty()
	// @Type(() => ObjDto)
	// @ValidateNested({ each: true })
	// products!: ObjDto[];
}
