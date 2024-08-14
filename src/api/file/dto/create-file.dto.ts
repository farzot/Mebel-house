import { IsOptional } from "class-validator";

export class CreateFileDto {
	@IsOptional()
	fileName!: string;

	@IsOptional()
	path!: string;

	@IsOptional()
	size!: number;

	@IsOptional()
	mimeType!: string;
}

export class CreateFileApiDto {
	file!: Express.Multer.File;
}
