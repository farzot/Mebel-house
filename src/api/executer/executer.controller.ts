import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	UseGuards,
	Put,
	Query,
	Patch,
} from "@nestjs/common";
import { Roles } from "src/common/database/Enums";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { ExecuterService } from "./executer.service";
import { CreateExecuterDto, CreateExecuterDtoWithRole } from "./dto/create-executer.dto";
import { UpdateExecuterDto } from "./dto/update-executer.dto";
import { CurrentExecuter } from "src/common/decorator/current-executer";
import { ICurrentExecuter } from "src/common/interface/current-executer.interface";
import { LoginDto } from "./dto/login.dto";
import { CurrentLanguage } from "src/common/decorator/current-language";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { FilterDto } from "src/common/dto/filter.dto";

@Controller("")
export class ExecuterController {
	constructor(private readonly executerService: ExecuterService) { }

	@Post("/admin/login")
	async adminLogin(@CurrentLanguage() lang: string, @Body() loginDto: LoginDto) {
		return await this.executerService.adminLogin(loginDto, lang);
	}

	@Post("/client/login")
	async clientLogin(@CurrentLanguage() lang: string, @Body() loginDto: LoginDto) {
		return await this.executerService.clientLogin(loginDto, lang);
	}

	@Post("/cash-register/login")
	async cashRegisterLogin(@CurrentLanguage() lang: string, @Body() loginDto: LoginDto) {
		console.log('go');
		
		return await this.executerService.cashRegisterLogin(loginDto, lang);
	}

	@Post()
	async createExecuter(
		@CurrentLanguage() lang: string,
		@Body() createSuperExecuterDto: CreateExecuterDtoWithRole,
		@CurrentExecuter() executerPayload: ICurrentExecuter,
	) {
		return await this.executerService.createExecuter(
			createSuperExecuterDto,
			lang,
			executerPayload?.executer,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesDecorator(Roles.SUPER_ADMIN)
	@Post('/admin/diller')
	async createDiller(
		@CurrentLanguage() lang: string,
		@Body() createExecuterDto: CreateExecuterDto,
		@CurrentExecuter() executerPayload: ICurrentExecuter,
	) {
		return this.executerService.createDiller(createExecuterDto, lang, executerPayload.executer);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesDecorator(Roles.SUPER_ADMIN)
	@Get('/admin/diller')
	findAll(@CurrentLanguage() lang: string, @Query() dto: FilterDto) {
		return this.executerService.getAll(lang, dto);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesDecorator(Roles.SUPER_ADMIN)
	@Get("/admin/diller/:id")
	async findOne(@CurrentLanguage() lang: string, @Param("id") id: string) {
		return await this.executerService.findOneById(id, lang, {
			where: { is_deleted: false },
		});
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesDecorator(Roles.SUPER_ADMIN)
	@Patch("/admin/diller/:id")
	async update(
		@CurrentLanguage() lang: string,
		@CurrentExecuter() executerPayload: ICurrentExecuter,
		@Param("id") id: string,
		@Body() updateExecuterDto: UpdateExecuterDto,
	) {
		await this.executerService.findOneBy(lang, {
			where: { id },
		});
		return await this.executerService.updateExecuter(
			id,
			updateExecuterDto,
			lang,
			executerPayload.executer,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@RolesDecorator(Roles.SUPER_ADMIN)
	@Delete("/admin/diller/:id")
	async remove(
		@CurrentLanguage() lang: string,
		@CurrentExecuter() executerPayload: ICurrentExecuter,
		@Param("id") id: string,
	) {
		return await this.executerService.delete(id, lang, executerPayload.executer);
	}
}
