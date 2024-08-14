import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class SomeFieldsMissing extends HttpException {
	constructor() {
		super(JSON.stringify(getErrorMessage("application", "some_fields_missing")), 400);
	}
}
