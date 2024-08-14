import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class PluShouldnotAllowed extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "plu_shouldnot_allowed")), 400);
	}
}
