import { Repository } from "typeorm";
import { FileEntity } from "../entity/file.entity";

export type FileRepository = Repository<FileEntity>;
