import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "src/common/database/Enums";
import { ICurrentExecuter } from "src/common/interface/current-executer.interface";
import { AuthPayload } from "src/common/type";
import { IS_PUBLIC_KEY } from "../decorator/public.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.get<Roles[]>("roles", context.getHandler());
		const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

		// if (isPublic) {
		// 	return true; // Allow access to public routes without authentication
		// }

		if (!roles) {
			return true;
		}

		const request: Express.Request = context.switchToHttp().getRequest();
		const user = request.user as ICurrentExecuter;
		return roles.includes(user.executer.role);
	}
}
