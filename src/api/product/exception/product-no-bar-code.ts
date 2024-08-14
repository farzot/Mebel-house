import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class ProductDoesntHaveBarCode extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "product_doesnt_have_barcode")), 400);
	}
}
