import {
  IsBoolean,
	IsOptional,
    ValidateNested,
} from "class-validator";
import { ObjDto } from "../../../common/type";
import { Type } from "class-transformer";

export class DownloadExelDto {

    // @IsOptional()
	// @ValidateNested({ each: true })
	// @Type(() => ObjDto)
	// store!: ObjDto;

    // @IsOptional()
	// @ValidateNested({ each: true })
	// @Type(() => ObjDto)
	// category!: ObjDto;

    @IsOptional()
    @IsBoolean()
    product_name?: boolean;

    @IsOptional()
    @IsBoolean()
	quantity!: boolean;
    
    @IsOptional()
    @IsBoolean()
    bar_code?: boolean;

    @IsOptional()
    @IsBoolean()
    plu?: boolean;
    
    @IsOptional()
    @IsBoolean()
    origin_price?: boolean;
    
    @IsOptional()
    @IsBoolean()
    sale_price?: boolean;
    
    @IsOptional()
    @IsBoolean()
    discount?: boolean;
    
    @IsOptional()
    @IsBoolean()
    store_name?: boolean;
    
    // @IsOptional()
    // @IsBoolean()
    // category_name?: boolean;
    
    @IsOptional()
    @IsBoolean()
    qqs?:boolean;

    @IsOptional()
    @IsBoolean()
    marga?:boolean;

    @IsOptional()
    @IsBoolean()
    product_type?:boolean;

}