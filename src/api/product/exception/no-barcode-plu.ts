import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class NoBarCodeOrPlu extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "no_barcode_or_plu")), 400);
	}
}
