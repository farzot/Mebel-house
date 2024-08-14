import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, ValidateNested } from "class-validator";
import { ProductCodeType, ProductType, Roles } from "src/common/database/Enums";
import { ObjDto } from "src/common/type";

export class FindOneByCodeDto {
  // @IsNotEmpty()
  // @ValidateNested({ each: true })
  // @Type(() => ObjDto)
  // store!: ObjDto;

  @IsNotEmpty()
  @IsEnum([ProductCodeType.BAR_CODE, ProductCodeType.PLU])
  code_type!: ProductCodeType.BAR_CODE | ProductCodeType.PLU;

  @IsNotEmpty()
  @IsNumberString()
  code!: string;
}
