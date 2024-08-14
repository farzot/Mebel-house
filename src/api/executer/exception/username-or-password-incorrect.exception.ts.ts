import { HttpException } from "@nestjs/common";
import { getErrorMessage } from "src/infrastructure/lib/prompts/errorPrompt";

export class UsernameOrPasswordIncorrect extends HttpException {
	constructor() {
		super(
			JSON.stringify(getErrorMessage("application", "username_or_password_incorrect")),
			400,
		);
	}
}
