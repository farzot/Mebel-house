import * as dotenv from "dotenv";
import { Logger } from "@nestjs/common";

dotenv.config();

export type ConfigType = {
	PORT: number;
	DB_URL: string;
	JWT_SECRET_KEY: string;
	JWT_SECRET_TIME: string;
	NODE_ENV: string;
	APP_LOGS_PATH: string;
	OPERATION_LOGS_PATH: string;
	FILE_SIZE: number;
	PATH_FOR_FILE_UPLOAD: string;
	EMAIL_HOST: string;
	EMAIL_PORT: number;
	EMAIL_USER: string;
	EMAIL_PASS: string;
	QQS_PERCENTAGE: number;
};

const requiredVariables = [
	"PORT",
	"DEV_DB_URL",
	"PROD_DB_URL",
	"JWT_SECRET_KEY",
	"JWT_SECRET_TIME",
	"NODE_ENV",
	"APP_LOGS_PATH",
	"OPERATION_LOGS_PATH",
	"FILE_SIZE",
	"PATH_FOR_FILE_UPLOAD",
	"QQS_PERCENTAGE",
];

const missingVariables = requiredVariables.filter((variable) => {
	const value = process.env[variable];
	return !value || value.trim() === "";
});

if (missingVariables.length > 0) {
	Logger.error(`Missing or empty required environment variables: ${missingVariables.join(", ")}`);
	process.exit(1);
}

export const config: ConfigType = {
	PORT: parseInt(process.env.PORT as string, 10),
	DB_URL:
		process.env.NODE_ENV === "dev"
			? (process.env.DEV_DB_URL as string)
			: (process.env.PROD_DB_URL as string),
	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY as string,
	JWT_SECRET_TIME: process.env.JWT_SECRET_TIME as string,
	NODE_ENV: process.env.NODE_ENV as string,
	APP_LOGS_PATH: process.env.APP_LOGS_PATH as string,
	OPERATION_LOGS_PATH: process.env.OPERATION_LOGS_PATH as string,
	FILE_SIZE: parseInt(process.env.FILE_SIZE as string, 10),
	PATH_FOR_FILE_UPLOAD: process.env.PATH_FOR_FILE_UPLOAD as string,
	EMAIL_HOST: process.env.EMAIL_HOST as string,
	EMAIL_PORT: parseInt(process.env.EMAIL_PORT as string, 10),
	EMAIL_USER: process.env.EMAIL_USER as string,
	EMAIL_PASS: process.env.EMAIL_PASS as string,
	QQS_PERCENTAGE: parseInt(process.env.QQS_PERCENTAGE as string),
};
