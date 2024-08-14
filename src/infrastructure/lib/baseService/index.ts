import { HttpException, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { IFindOptions, IResponse, IResponsePagination } from "./interface";
import { RepositoryPager } from "../pagination";
import { responseByLang, returnResponseMessage } from "../prompts/successResponsePrompt";
import { ExecuterEntity } from "src/core/entity";

export class BaseService<CreateDto, UpdateDto, Entity> {
	constructor(
		private readonly repository: Repository<any>,
		private readonly entityName: string,
	) {}

	get getRepository() {
		return this.repository;
	}

	async create(
		dto: CreateDto,
		lang: string = "ru",
		executer?: ExecuterEntity,
	): Promise<IResponse<Entity>> {
		let createdData = this.repository.create({
			...dto,
			created_by: executer,
		}) as unknown as Entity;
		createdData = await this.repository.save(createdData);

		const message = responseByLang("create", lang);

		return {
			data: createdData,
			status_code: 201,
			message,
		};
	}

	async findAll(
		lang: string = "ru",
		options?: IFindOptions<Entity>,
	): Promise<IResponse<Entity[]>> {
		const data = (await this.repository.find({
			...options,
		})) as Entity[];

		const message = responseByLang("get_all", lang);
		return {
			data: data,
			status_code: 200,
			message,
		};
	}
	async findAllWithPagination(
		lang: string = "ru",
		options?: IFindOptions<Entity>,
	): Promise<IResponsePagination<Entity>> {
		const message = responseByLang("get_all", lang);

		return await RepositoryPager.findAll(this.getRepository, message, options);
	}

	async findOneBy(
		lang: string = "ru",
		options: IFindOptions<Entity>,
	): Promise<IResponse<Entity>> {
		console.log(options,'auth');
		// console.log(this.getRepository);
		
		const data = (await this.repository.findOne({
			select: options.select || {},
			relations: options.relations || [],
			where: options.where,
		})) as Entity;
		console.log(data,'data');
		

		if (!data) {
			const errorData = {
				message: [
					`${this.entityName} Not found`,
					`${this.entityName} не найден`,
					`${this.entityName} topilmadi`,
				],
				status_code: 404,
			};

			Logger.error({
				message: errorData.message,
				status_code: errorData.status_code,
				user: "none",
				stack: errorData,
				context: `${BaseService.name}  function findOneById `,
			});
			throw new HttpException(errorData.message, errorData.status_code);

		}

		const message = responseByLang("get_one", lang);

		return {
			data: data,
			status_code: 200,
			message,
		};
	}

	async findOneById(
		id: string,
		lang: string = "ru",
		options?: IFindOptions<Entity>,
	): Promise<IResponse<Entity>> {
		console.log(options,'auth');

		const data = (await this.repository.findOne({
			select: options?.select || {},
			relations: options?.relations || [],
			where: { id, ...options?.where },
		})) as unknown as Entity;

		if (!data) {
			const errorData = {
				message: [
					`${this.entityName} Not found`,
					`${this.entityName} не найден`,
					`${this.entityName} topilmadi`,
				],
				status_code: 404,
			};

			Logger.error({
				message: errorData.message,
				status_code: errorData.status_code,
				user: "none",
				stack: errorData,
				context: `${BaseService.name}  function findOneById `,
			});

			throw new HttpException(errorData.message, errorData.status_code);
		}
		const message = responseByLang("get_one", lang);

		return {
			data,
			status_code: 200,
			message,
		};
	}

	async update(
		id: string,
		dto: Partial<CreateDto>,
		lang: string = "ru",
		executer?: ExecuterEntity,
	) {
		await this.findOneById(id, lang);
		await this.repository.update(id, {
			...dto,
			updated_by: executer,
			updated_at: Date.now(),
		});
		const message = responseByLang("get_all", lang);

		return { data: {}, status_code: 200, message };
	}

	async disactive(id: string, lang: string = "ru"): Promise<IResponse<Entity>> {
		await this.findOneById(id, lang);

		const data = (await this.repository.update(
			{ id },
			{ isActive: false },
		)) as unknown as Entity;
		const responseMessages = [
			`${this.entityName} was deactivated`,
			`${this.entityName} был деактивирован`,
			`${this.entityName} faolsizlantirildi`,
		];
		const message = returnResponseMessage(responseMessages, lang);
		return {
			data,
			status_code: 200,
			message,
		};
	}

	async delete(
		id: string,
		lang: string = "ru",
		executer?: ExecuterEntity,
	): Promise<IResponse<Entity>> {
		await this.findOneById(id, lang);
		const data = (await this.repository.update(
			{ id },
			{
				is_deleted: true,
				is_active: false,
				deleted_at: Date.now(),
				deleted_by: executer,
			},
		)) as unknown as Entity;
		const message = responseByLang("delete", lang);

		return {
			data,
			status_code: 200,
			message,
		};
	}

	// async deepDelete(ids: string[]): Promise<IResponse<DeleteResult>> {
	// 	const data = await this.repository.delete(ids);

	// 	return {
	// 		data,
	// 		status_code: 200,
	// 		message: [
	// 			`${this.entityName} was hard deleted`,
	// 			`${this.entityName} был удален`,
	// 			`${this.entityName} o'chirildi`,
	// 		],
	// 	};
	// }
}
