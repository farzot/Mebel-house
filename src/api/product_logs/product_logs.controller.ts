import { Controller, Get, Param, ParseUUIDPipe, UseGuards, Query } from "@nestjs/common";
import { ProductLogService } from "../product/service/product_log.service";
import { CurrentLanguage } from "src/common/decorator/current-language";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { Roles } from "src/common/database/Enums";

@Controller("product-logs")
export class ProductLogsController {
	constructor(private readonly productLogService: ProductLogService) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
	@Get()
	findAll(@CurrentLanguage() lang: string, @Query() dto: PaginationDto) {
		return this.productLogService.findAllWithPagination(lang, {
			take: dto.page_size,
			skip: dto.page,
		});
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesDecorator(Roles.COMPANY_ADMIN, Roles.COMPANY_MANAGER, Roles.MERCHANDISER)
	@Get(":id")
	findOne(@Param("id", ParseUUIDPipe) id: string, @CurrentLanguage() lang: string) {
		return this.productLogService.findOneById(id, lang);
	}
}
