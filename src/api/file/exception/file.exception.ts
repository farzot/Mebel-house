import { HttpException } from "@nestjs/common";

export class FileRequiredException extends HttpException {
	constructor() {
		super("file required", 400);
	}
}
export class FileNotFoundException extends HttpException {
	constructor() {
		super("file not found", 404);
	}
}
