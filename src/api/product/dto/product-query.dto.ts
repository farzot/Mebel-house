
import { IsBooleanString, IsOptional, IsUUID } from "class-validator";
import { FilterDto } from "src/common/dto/filter.dto";

export class ProductQueryDto extends FilterDto {
	// @IsOptional()
	// @IsUUID()
	// store_id!: string;

	// @IsOptional()
	// @IsUUID()
	// category_id!: string;

	@IsOptional()
	@IsBooleanString()
	is_discount!: boolean;
}
