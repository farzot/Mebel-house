import { Repository } from "typeorm";
import { ProductLogItemEntity } from "../entity/product-log-item.entity";

export type ProductLogItemRepository = Repository<ProductLogItemEntity>;
