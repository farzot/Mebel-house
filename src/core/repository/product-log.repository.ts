import { Repository } from "typeorm";
import { ProductLogEntity } from "../entity/product-log.entity";

export type ProductLogRepository = Repository<ProductLogEntity>;
