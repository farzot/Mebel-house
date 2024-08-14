import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthorizationError } from "../exception";
import { ExecuterEntity } from "src/core/entity/executer.entity";
import { ExecuterRepository } from "src/core/repository/executer.repository";
import { config } from "src/config";
import { AuthPayload } from "src/common/type";
import { Roles } from "src/common/database/Enums";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(@InjectRepository(ExecuterEntity) private executerRepository: ExecuterRepository) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.JWT_SECRET_KEY,
		});
	}

	async validate(payload: AuthPayload) {
		let executer: ExecuterEntity | null = null;
		console.log(executer,'executer');
		
		// if roles that don't work in some part of the project, check all app roles should be included here
		if (payload.role === Roles.SUPER_ADMIN) {
			executer = await this.executerRepository.findOne({
				where: {
					id: payload.id,
					role: Roles.SUPER_ADMIN,
					is_active: true,
				},
				// relations: { companies: true, store: { company: true } },
			});
		} else if (payload.role === Roles.DILLER) {
			executer = await this.executerRepository.findOne({
				where: {
					id: payload.id,
					role: Roles.DILLER,
					is_active: true,
					is_deleted: false,
				},
				// relations: { companies: true, store: { company: true } },
			});
		} else if (payload.role === Roles.COMPANY_ADMIN) {
			executer = await this.executerRepository.findOne({
				where: {
					id: payload.id,
					role: Roles.COMPANY_ADMIN,
					is_active: true,
					is_deleted: false,
				},
				// relations: { companies: true, store: { company: true } },
			});
		} else if (payload.role === Roles.COMPANY_MANAGER) {
			executer = await this.executerRepository.findOne({
				where: {
					id: payload.id,
					role: Roles.COMPANY_MANAGER,
					is_active: true,
					is_deleted: false,
				},
				// relations: { companies: true, store: { company: true } },
			});
		} else if (payload.role === Roles.MERCHANDISER) {
			executer = await this.executerRepository.findOne({
				where: {
					id: payload.id,
					role: Roles.MERCHANDISER,
					is_active: true,
					is_deleted: false,
				},
				// relations: { companies: true, store: { company: true } },
			});
		} else if (payload.role === Roles.CASHIER) {
			console.log('cashier');
			
			executer = await this.executerRepository.findOne({
				where: {
					id: payload.id,
					role: Roles.CASHIER,
					is_active: true,
					is_deleted: false,
				},
				// relations: { companies: true, store: { company: true } },
			});
		}
		if (!executer) {
			throw new AuthorizationError();
		}

		return {
			executer,
			// company_id: payload.company_id,
			// avaliable_stores: payload.avaliable_stores,
			// store_id: payload.store_id,
		};
	}
}
