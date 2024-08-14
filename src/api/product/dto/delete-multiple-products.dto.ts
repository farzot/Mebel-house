import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, ValidateNested } from "class-validator";
import { ObjDto } from "src/common/type";

export class DeleteMultipleProductsDto {
	@IsNotEmpty()
	@Type(() => ObjDto)
	@ValidateNested({ each: true })
	ids!: ObjDto[];
}
