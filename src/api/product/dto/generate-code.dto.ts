import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { ProductCodeType, ProductType, Roles } from "src/common/database/Enums";
import { ObjDto } from "src/common/type";

export class GenerateCodeDto {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ObjDto)
  store!: ObjDto;

  @IsNotEmpty()
  @IsEnum([ProductCodeType.BAR_CODE, ProductCodeType.PLU])
  code_type!: ProductCodeType.BAR_CODE | ProductCodeType.PLU;

  // @IsOptional()
  // @IsEnum([ProductType.KG, ProductType.PCS])
  // product_type!: ProductType.KG | ProductType.PCS;

  @IsOptional()
  @IsEnum([ ProductType.PCS])
  product_type!:ProductType.PCS;
}
