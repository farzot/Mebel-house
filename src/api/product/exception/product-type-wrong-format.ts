import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class ProductTypeWrongFormat extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "product_type_wrong_format")), 400);
	}
}