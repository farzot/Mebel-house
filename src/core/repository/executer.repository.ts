import { Repository } from "typeorm";
import { ExecuterEntity } from "../entity/executer.entity";

export type ExecuterRepository = Repository<ExecuterEntity>;
