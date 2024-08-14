import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class OnlyBarCodeOrPluAllowed extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "only_plu_or_barcode_allowed")), 400);
	}
}
