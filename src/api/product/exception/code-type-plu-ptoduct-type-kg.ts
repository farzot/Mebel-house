import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class CodeTypePluPtoductTypeKg extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "code_type_plu_ptoduct_type_kg")), 400);
	}
}
