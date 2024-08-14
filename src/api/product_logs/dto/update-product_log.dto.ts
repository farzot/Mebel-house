import { PartialType } from "@nestjs/mapped-types";
import { CreateProductLogDto } from "./create-product_log.dto";

export class UpdateProductLogDto extends PartialType(CreateProductLogDto) {}
