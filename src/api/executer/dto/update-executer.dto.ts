import { PartialType } from "@nestjs/mapped-types";
import { CreateExecuterDto } from "./create-executer.dto";

export class UpdateExecuterDto extends PartialType(CreateExecuterDto) {}
