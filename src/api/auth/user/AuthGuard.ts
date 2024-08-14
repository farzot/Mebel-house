import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ExecuterEntity } from "src/core/entity/executer.entity";
import { AuthorizationError } from "../exception";
import { ICurrentExecuter } from "src/common/interface/current-executer.interface";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	handleRequest<T = ICurrentExecuter>(error: unknown, user: T): T {
		if (error || !user) {
			throw error || new AuthorizationError();
		}

		return user;
	}
}
