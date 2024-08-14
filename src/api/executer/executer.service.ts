import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Roles } from "src/common/database/Enums";
import { ExecuterEntity } from "src/core/entity/executer.entity";
import { ExecuterRepository } from "src/core/repository/executer.repository";
import { BaseService } from "src/infrastructure/lib/baseService";
import { BcryptEncryption } from "src/infrastructure/lib/bcrypt";
import { CreateExecuterDto, CreateExecuterDtoWithRole } from "./dto/create-executer.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateExecuterDto } from "./dto/update-executer.dto";
import { UsernameOrPasswordIncorrect } from "./exception/username-or-password-incorrect.exception.ts";
import { ExecuterNotFound } from "./exception/executer-not-found";
import { AuthPayload } from "src/common/type";
import { responseByLang } from "src/infrastructure/lib/prompts/successResponsePrompt";
import { DeepPartial } from "typeorm";
import { FilterDto } from "src/common/dto/filter.dto";
import { Pager } from "src/infrastructure/lib/pagination";
import { LoginResponse } from "./dto/login-response.dto";

@Injectable()
export class ExecuterService extends BaseService<
	CreateExecuterDto,
	DeepPartial<ExecuterEntity>,
	ExecuterEntity
> {
	constructor(
		@InjectRepository(ExecuterEntity) repository: ExecuterRepository,
		private jwtService: JwtService,
	) {
		super(repository, "Executers");
	}

	async adminLogin(dto: LoginDto, lang: string) {
		const { data: executer } = await this.findOneBy(lang, {
			where: { username: dto.username, is_deleted: false },
		});
		if (!executer) throw new UsernameOrPasswordIncorrect();
		if (executer.role !== Roles.SUPER_ADMIN && executer.role !== Roles.DILLER) {
			throw new UsernameOrPasswordIncorrect();
		}
		const compare_password = await BcryptEncryption.compare(dto.password, executer.password);
		if (!compare_password) throw new UsernameOrPasswordIncorrect();
		let payload: AuthPayload = {
			id: executer.id,
			role: executer.role,
		};
		const token = await this.jwtService.signAsync(payload);
		const loginResponse: LoginResponse = {
			id: executer.id,
			role: executer.role,
			first_name: executer.first_name,
			last_name: executer.last_name,
			phone_number: executer.phone_number,
			token: token,
		};
		return { status: 200, data: loginResponse, message: "success" };
	}

	async clientLogin(dto: LoginDto, lang: string) {
		const { data: executer } = await this.findOneBy(lang, {
			where: { username: dto.username, is_deleted: false },
			// relations: { companies: true, store: { company: true } }, // "merchandiser", "cashier"
		});
		if (!executer) throw new UsernameOrPasswordIncorrect();
		if (
			executer.role !== Roles.COMPANY_ADMIN &&
			executer.role !== Roles.COMPANY_MANAGER &&
			executer.role !== Roles.MERCHANDISER
		) {
			throw new UsernameOrPasswordIncorrect();
		}
		const compare_password = await BcryptEncryption.compare(dto.password, executer.password);
		if (!compare_password) throw new UsernameOrPasswordIncorrect();
		let payload: AuthPayload = {
			id: executer.id,
			role: executer.role,
		};
		// if (executer.role === Roles.COMPANY_ADMIN) {
		// 	payload.company_id = executer.companies[0]?.id;
		// }
		// if (executer.role === Roles.MERCHANDISER) {
		// 	payload.avaliable_stores = executer.store?.map((e) => e.id);
		// 	payload.company_id = executer.store[0]?.company.id;
		// }
		const token = await this.jwtService.signAsync(payload);
		const loginResponse: LoginResponse = {
			id: executer.id,
			role: executer.role,

			first_name: executer.first_name,
			last_name: executer.last_name,
			phone_number: executer.phone_number,
			token: token,
		};
		return { status: 200, data: loginResponse, message: "success" };
	}

	async cashRegisterLogin(dto: LoginDto, lang: string) {
		console.log('before find');
		const { data: executer } = await this.findOneBy(lang, {
			where: { username: dto.username, is_deleted: false },
			// relations: { companies: true, store: { company: true } }, // "merchandiser", "cashier"
		});
		console.log(executer);
		
		if (!executer) throw new UsernameOrPasswordIncorrect();
		if (executer.role !== Roles.CASHIER) {
			throw new UsernameOrPasswordIncorrect();
		}
		const compare_password = await BcryptEncryption.compare(dto.password, executer.password);
		if (!compare_password) throw new UsernameOrPasswordIncorrect();
		let payload: AuthPayload = {
			id: executer.id,
			role: executer.role,
		};
		// if (executer.role === Roles.CASHIER) {
		// 	payload.company_id = executer.store[0]?.company.id;
		// 	payload.store_id = executer.store[0]?.id;
		// 	// payload.avaliable_stores = executer.store?.map((e) => e.id);
		// }
		const token = await this.jwtService.signAsync(payload);
		const loginResponse: LoginResponse = {
			id: executer.id,
			role: executer.role,
			first_name: executer.first_name,
			last_name: executer.last_name,
			phone_number: executer.phone_number,
			token: token,
		};
		return { status: 200, data: loginResponse, message: "success" };
	}

	async createExecuter(dto: CreateExecuterDtoWithRole, lang: string, executer: ExecuterEntity) {
		const hashshedPassword = await BcryptEncryption.encrypt(dto.password);
		const newSuperUser = await this.getRepository.save(
			this.getRepository.create({
				first_name: dto.first_name,
				last_name: dto.last_name,
				gender: dto.gender,
				birth_date: dto.birth_date,
				phone_number: dto.phone_number,
				role: dto.role,
				image: dto.image,
				username: dto.username,
				password: hashshedPassword,
				created_by: executer,
			}),
		);
		const message = responseByLang("create", lang);
		return { data: newSuperUser, status_code: 201, message };
	}

	async createDiller(dto: CreateExecuterDto, lang: string, executer: ExecuterEntity) {
		const hashshed_password = await BcryptEncryption.encrypt(dto.password);
		const new_diller = await this.getRepository.save(
			this.getRepository.create({
				first_name: dto.first_name,
				last_name: dto.last_name,
				gender: dto.gender,
				birth_date: dto?.birth_date,
				phone_number: dto.phone_number,
				role: Roles.DILLER,
				image: dto.image,
				username: dto.username,
				password: hashshed_password,
				created_by: executer,
			}),
		);
		const message = responseByLang("create", lang);
		return { data: new_diller, status_code: 201, message };
	}

	async getAll(lang: string, options: FilterDto) {
		const skip = (options.page - 1) * options.page_size;
		const data = await this.getRepository.query(`
		SELECT 
			e.id , e.first_name, e.last_name, e.phone_number, im.path AS image,
			COUNT(DISTINCT s.id) AS store_count,
			COUNT(cr.id) AS cash_register_count
		FROM 
			executers e
		LEFT JOIN 
			stores s ON e.id = s.created_by
		LEFT JOIN 
			cash_registers cr ON s.id = cr.store_id
		LEFT JOIN
			files im ON im.id = e.image_id
		WHERE e.role = 'diller' AND e.is_deleted = false
		${
			options.search
				? `AND (e.first_name ILIKE '%${options.search}%' OR e.last_name ILIKE '%${options.search}%')`
				: ""
		}
		GROUP BY
			e.id, image
			${!options.search ? `LIMIT ${options.page_size} OFFSET ${skip}` : ""};
		`);
		const count = await this.getRepository.count({
			where: { is_deleted: false, role: Roles.DILLER },
		});
		const message = responseByLang("get_all", lang);
		return Pager.of(data, count, options.page_size, options.page, 200, message);
	}

	async updateExecuter(
		id: string,
		dto: UpdateExecuterDto,
		lang: string,
		executer: ExecuterEntity,
	) {
		const { data: foundExecuter } = await this.findOneById(id);
		if (!foundExecuter) {
			throw new ExecuterNotFound();
		}
		if (dto.password) {
			dto.password = await BcryptEncryption.encrypt(dto.password);
		}
		this.getRepository.update(id, {
			...dto,
			updated_by: executer,
			updated_at: Date.now(),
		});
		const message = responseByLang("update", lang);
		return { data: {}, status_code: 200, message };
	}
}
