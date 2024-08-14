import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class AtLeastBarCodeOrPluShouldExist extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "at_least_bar_code_or_plu_should_exist")), 400);
	}
}
