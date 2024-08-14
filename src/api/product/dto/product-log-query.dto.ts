import { IsBooleanString, IsEnum, IsNumber, IsNumberString, IsOptional, IsUUID } from "class-validator";
import { ProductType } from "src/common/database/Enums";
import { FilterDto } from "src/common/dto/filter.dto";

export class ProductLogQueryDto extends FilterDto {
	// @IsOptional()
	// @IsUUID()
	// store_id!: string;

	// @IsOptional()
	// @IsUUID()
	// category_id!: string;

	@IsOptional()
	@IsNumberString()
	from!: number;

	@IsOptional()
	@IsNumberString()
	to!: number;
}
