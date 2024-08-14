import { ProductType } from "src/common/database/Enums";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductLogEntity } from "./product-log.entity";

@Entity("product_log_items")
export class ProductLogItemEntity {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ name: "product_name", type: "varchar" })
	product_name!: string;

	@Column({ name: "description", type: "varchar", nullable: true })
	description!: string;

	@Column({ name: "product_type", type: "enum", enum: ProductType })
	product_type!: ProductType;


	@Column({ name: "quantity", type: "decimal", scale: 2 })
	quantity!: number;

	@Column({ name: "bar_code", type: "varchar", nullable: true })
	bar_code!: string;

	@Column({ name: "plu", type: "int", nullable: true })
	plu!: number;

	@Column({ name: "two_pu", type: "varchar", nullable: true })
	two_pu!: string; // mxik

	@Column({ name: "package_code", type: "varchar", nullable: true })
	package_code!: string;

	@Column({ name: "label", type: "varchar", nullable: true })
	label!: string;

	@Column({ name: "units", type: "int", nullable: true })
	units!: number;

	@Column({ name: "origin_price", type: "decimal", scale: 2 })
	origin_price!: number;

	@Column({ name: "sale_price", type: "decimal", scale: 2 })
	sale_price!: number;

	@Column({ type: "decimal", name: "marga", scale: 2 })
	marga!: number;

	@Column({ type: "boolean", name: "qqs", default: true })
	qqs!: boolean;

	@Column({ name: "product_category_name", type: "varchar" })
	product_category_name!: string;

	@ManyToOne(() => ProductLogEntity, (log) => log.products)
	@JoinColumn({ name: "product_log_id" })
	product_log!: ProductLogEntity;
}
