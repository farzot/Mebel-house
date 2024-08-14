import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Request } from "express";
import { ExecuterEntity } from "src/core/entity/executer.entity";
import { FindOptionsRelations } from "typeorm";
import { Roles } from "../database/Enums";

export const DefaultRelationObj: FindOptionsRelations<ExecuterEntity> = {
	created_by: true,
	updated_by: true,
	deleted_by: true,
};

export class ObjDto {
	@IsNotEmpty()
	@IsUUID()
	id!: string;
}

export interface RequestWithPayload extends Request {
	user: AuthPayload;
}

export interface AuthPayload {
	id: string;
	role: Roles;
	company_id?: string;
	store_id?: string;
	avaliable_stores?: any[];
}
