import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class ForbiddenException extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "forbidden_exception")), 403);
	}
}
