import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class NoUploadedProductsToSave extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "no_uploaded_products_to_save")), 400);
	}
}
