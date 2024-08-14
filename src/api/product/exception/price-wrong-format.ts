import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class PriceWrongFormat extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "price_wrong_format")), 400);
	}
}