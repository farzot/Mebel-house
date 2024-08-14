import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class AlreadyExistProduct extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "already_exist_product")), 400);
	}
}
