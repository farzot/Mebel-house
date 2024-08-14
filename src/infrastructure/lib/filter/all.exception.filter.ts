import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

import { logger } from "../logger";
import * as J from "fp-ts/Json";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import {
	CustomHttpExceptionResponse,
	HttpExceptionResponse,
} from "../../../common/interface/HttpExceptionResponse";
import { ErrorStackParserFunction } from "src/common/error/ErrorStackParser";
import { ErrorPrompt } from "../prompts/types";
import { TypeORMError } from "typeorm/error/TypeORMError";
import { getErrorMessage, getPromptByCode } from "../prompts/errorPrompt";
import { CannotDoAction } from "src/common/exception/CannotGet";

export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		let status: HttpStatus;
		let error_type: string;
		let error_message_for_log: string | string[]; // this message for developers
		let response_message_for_client: string | string[]; // this message for clients: web, app, .. | someone who is using our application

		let stack: string[] = [];
		// :TODO ? remove console.log()
		const lang = req.headers["lang"];

		console.log("+--", exception, "---+");
		if (
			String(exception).includes("Cannot GET") ||
			String(exception).includes("Cannot POST") ||
			String(exception).includes("Cannot PUT") ||
			String(exception).includes("Cannot PATCH") ||
			String(exception).includes("Cannot DELETE")
		) {
			status = HttpStatus.NOT_FOUND;
			error_type = "Not Found!";
			const foundErrorPrompt = getErrorMessage("application", "cannot_do_action");

			response_message_for_client =
				foundErrorPrompt === null
					? "Internal Server Error"
					: JSON.stringify(foundErrorPrompt);

			// console.log(response_message_for_client, "for client++0");

			const parsedErrorPrompt = this.parseErrorPrompt(response_message_for_client);

			const message = this.customiseErrorMsgByLang(
				E.isLeft(parsedErrorPrompt) ? ({} as ErrorPrompt) : parsedErrorPrompt.right,
				response_message_for_client,
				lang as string,
			);
			// console.log(message, "custom message +++0");

			const error_response = this.getError_response(status, error_type, message, req);

			return res.status(status).json(error_response);
		}

		stack = ErrorStackParserFunction(exception);
		// console.log(stack, "stack");

		if (exception instanceof HttpException) {
			status = exception.getStatus();

			const error_response: string | string[] | object = exception.getResponse();

			// console.log(status);
			switch (status) {
				case HttpStatus.BAD_REQUEST:
					error_type = "Bad Request";
					break;
				case HttpStatus.NOT_FOUND:
					error_type = "Not Found!";
					break;
				case HttpStatus.UNAUTHORIZED:
					error_type = "UnAuthorized!";
					break;
				case HttpStatus.CONFLICT:
					error_type = "Conflict";
					break;
				case HttpStatus.UNPROCESSABLE_ENTITY:
					error_type = "Not Valididate";
					// TODO extract method
					return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
						statusCode: (error_response as any).statusCode,
						error: error_type,
						path: req.path,
						method: req.method,
						timeStamp: new Date(),
						correlationId: req.headers["x-correlation-id"] as unknown as string,
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
						message: error_response,
					});
				default:
					error_type = (error_response as HttpExceptionResponse).error;
			}

			error_message_for_log = error_response as string;
			response_message_for_client = error_message_for_log;
			// console.log(response_message_for_client, "for client++0");
		} else if (exception instanceof TypeORMError) {
			// console.log("typeorm---");

			const foundErrorPrompt: any = getPromptByCode(
				"postgres",
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				(exception as any).driverError?.code as string,
			);
			// console.log(exception, String(exception), "mes");

			if (foundErrorPrompt?.value?.code === "23505") status = HttpStatus.CONFLICT;
			else status = HttpStatus.INTERNAL_SERVER_ERROR;
			error_type = "Server Error";
			error_message_for_log = String(exception);
			// console.log(error_message_for_log,'0000');

			response_message_for_client =
				foundErrorPrompt === null
					? "Internal Server Error"
					: JSON.stringify(foundErrorPrompt.value);
			// console.log(response_message_for_client,'111');
		} else {
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			error_type = "Server Error";
			error_message_for_log = String(exception);
			response_message_for_client = "Internal Server Error";
		}

		const parsedErrorPrompt = this.parseErrorPrompt(response_message_for_client);
		// console.log(parsedErrorPrompt);

		logger.error({
			error: error_type,
			message: error_message_for_log,
			ErrorPrompt: E.isLeft(parsedErrorPrompt) ? {} : parsedErrorPrompt.right,
			stack: stack,
		});

		// custom exception data
		const message = this.customiseErrorMsgByLang(
			E.isLeft(parsedErrorPrompt) ? ({} as ErrorPrompt) : parsedErrorPrompt.right,
			error_message_for_log,
			lang as string,
		);
		// console.log(message, "message++0");

		const error_response = this.getError_response(status, error_type, message, req);
		// console.log(error_response,'error_response');

		res.status(status).json(error_response);
	}

	getError_response(
		status: HttpStatus,
		error_type: string,
		message: string,
		req: Request,
	): CustomHttpExceptionResponse {
		return {
			status_code: status,
			error: error_type,
			path: req.path,
			method: req.method,
			message, // TODO send message depends on language
			timestamp: new Date(),
			correlation_id: req.headers["x-correlation-id"] as unknown as string,
		};
	}

	parseErrorPrompt(message: string | string[]): E.Left<string[]> | E.Right<ErrorPrompt> {
		if (Array.isArray(message)) {
			return E.left(message);
		}

		return pipe(
			message,
			J.parse,
			E.mapLeft((e: any) => e),
		) as E.Right<ErrorPrompt>;
	}
	customiseErrorMsgByLang(ErrorPrompt: ErrorPrompt, errorMsg: string, lang: string = "en") {
		console.log(ErrorPrompt, "promt in byLang++0", errorMsg);

		let message = "";
		if (ErrorPrompt && ErrorPrompt.labels && ErrorPrompt.labels.length >= 3) {
			console.log("enterpromt++0");

			switch (lang) {
				case "en":
					message = ErrorPrompt.labels[0];
					break;
				case "ru":
					message = ErrorPrompt.labels[1];
					break;
				case "uz":
					message = ErrorPrompt.labels[2];
					break;
				default:
					message = "Internal Server error";
			}
		} else {
			console.log(errorMsg, "enternotprompt++0");

			switch (lang) {
				case "en":
					message = errorMsg[0];
					break;
				case "ru":
					message = errorMsg[1];
					break;
				case "uz":
					message = errorMsg[2];
					break;
				default:
					message = "Internal Server error";
			}
			// message = "Internal Server error";
		}
		return message;
	}
}
