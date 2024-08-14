import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import fs from "fs";
import { diskStorage } from "multer";
import path, { extname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import { config } from "src/config/index";

const storage = diskStorage({
	destination: (req: any, file: any, cb: any) => {
		// ../../../uploads from app.service.ts file but in the .env file it is ../uploads
		const uploadPath = config.PATH_FOR_FILE_UPLOAD;

		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath);
		}
		cb(null, uploadPath);
	},
	filename: (req: any, file: any, cb: any): void => {
		cb(null, `${file.mimetype.split("/")[0]}__${uuidv4()}.${file.mimetype.split("/")[1]}`);
	},
});

export const fileFilters = {
	image: (req: any, file: any, cb: any) => {
		if (file.mimetype.split("/")[0] === "image") {
			cb(null, true);
		} else {
			cb(
				new HttpException(
					`Unsupported file type ${extname(
						file.originalname,
					)}, there should only be a image`,
					HttpStatus.BAD_REQUEST,
				),
				false,
			);
		}
	},
	excel: (req: any, file: any, cb: any) => {
		if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
			cb(null, true);
		} else {
			cb(
				new HttpException(
					`Unsupported file type ${extname(
						file.originalname,
					)}, there should only be a excel`,
					HttpStatus.BAD_REQUEST,
				),
				false,
			);
		}
	},
	all: (req: any, file: any, cb: any) => {
		cb(null, true);
	},
};

export const multerImageUpload = {
	fileFilter: fileFilters.image,
	storage: storage,
	limits: { fileSize: Number(config.FILE_SIZE) * 1024 * 1024 },
};

export const multerOptionAll = {
	fileFilter: fileFilters.all,
	storage: storage,
	limits: { fileSize: Number(config.FILE_SIZE) * 1024 * 1024 },
};

export async function deleteFile(filePath: string) {
	try {
		const pathToDelete = path.join(
			__dirname,
			`../../../../${config.PATH_FOR_FILE_UPLOAD}/`,
			filePath,
		);
		if (fs.existsSync(pathToDelete)) {
			fs.unlinkSync(pathToDelete);
		}
	} catch (err) {
		console.error("Error deleting file:", err);
	}
}
