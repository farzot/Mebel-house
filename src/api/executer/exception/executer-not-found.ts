import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class ExecuterNotFound extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "admin_not_found")), 404);
	}
}
