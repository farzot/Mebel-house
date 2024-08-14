import { BaseEntity } from "src/common/database/BaseEntity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { ProductLogItemEntity } from "./product-log-item.entity";

@Entity("product_logs")
export class ProductLogEntity extends BaseEntity {
	@Column({ name: "total_origin_price", type: "decimal", scale: 2 })
	total_origin_price!: number;

	@Column({ name: "total_sale_price", type: "decimal", scale: 2 })
	total_sale_price!: number;

	// @Column({type: "decimal", name: "marga", scale: 2, precision: 8, default: 0.0})
	// marga!: number

	// @ManyToOne(() => StoreEntity, (store) => store.product_logs)
	// @JoinColumn({ name: "store_id" })
	// store!: StoreEntity;

	@OneToMany(() => ProductLogItemEntity, (item) => item.product_log)
	products!: ProductLogItemEntity[];
}
