import {
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Query,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { ProductService } from "../service/product.service";
import { CurrentExecuter } from "src/common/decorator/current-executer";
import { CurrentLanguage } from "src/common/decorator/current-language";
import { ICurrentExecuter } from "src/common/interface/current-executer.interface";
import { JwtAuthGuard } from "../../auth/user/AuthGuard";
import { RolesGuard } from "../../auth/roles/RoleGuard";
import { RolesDecorator } from "../../auth/roles/RolesDecorator";
import { Roles } from "src/common/database/Enums";
import { ProductQueryDto } from "../dto/product-query.dto";

@Controller("/cash-register/product")
export class CashRegisterProductController {
	constructor(private readonly productService: ProductService) {}

	// @UseGuards(JwtAuthGuard, RolesGuard)
	// @RolesDecorator(Roles.CASHIER)
	// @Get("")
	// getAllProductsByCashier(
	// 	@CurrentLanguage() lang: string,
	// 	@Query() query: ProductQueryDto,
	// 	@CurrentExecuter() executerPayload: ICurrentExecuter,
	// ) {
	// 	// const store_id = executerPayload.store_id || "";
	// 	// if (!store_id) {
	// 	// 	throw new UnauthorizedException();
	// 	// }
	// 	return this.productService.getAllProductsByCashier(lang,query);
	// 	return {}
	// }

	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
	@Get(":id")
	findOne(@Param("id", ParseUUIDPipe) id: string, @CurrentLanguage() lang: string) {
		return this.productService.findOneById(id, lang, {
			where: { is_deleted: false },
			relations: { image: true },
		});
	}
}
