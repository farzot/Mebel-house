import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class SalePriceLowThanOrigin extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "sale_price_low_than_origin")), 400);
	}
}
