import { BaseEntity } from "src/common/database/BaseEntity";
import { ProductType } from "src/common/database/Enums";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { FileEntity } from "./file.entity";

@Entity("products")
export class ProductEntity extends BaseEntity {
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
	qqs!: boolean; // vat , ндс

	@Column({ name: "is_sale", type: "boolean", default: true })
	is_sale!: boolean;

	@Column({ name: "discount", type: "boolean", default: false })
	discount!: boolean;

	@Column({ name: "discount_price", type: "decimal", scale: 2,  default: 0 })
	discount_price!: number;

	@Column({ name: "discount_quantity", type: "bigint", default: 0 })
	discount_quantity!: number;

	// @ManyToOne(() => StoreProductCategoryEntity, (store) => store.products)
	// @JoinColumn({ name: "product_category_id" })
	// product_category!: StoreProductCategoryEntity;

	// @ManyToOne(() => StoreEntity, (store) => store.products)
	// @JoinColumn({ name: "store_id" })
	// store!: StoreEntity;

	@ManyToOne(() => FileEntity, (file) => file.id)
	@JoinColumn({ name: "image_id" })
	image!: FileEntity;

	// @OneToMany(() => ReturnOrderItemEntity, (return_order) => return_order.product)
	// return_order_items!: ReturnOrderItemEntity[];

	// @OneToMany(() => OrderItemEntity, (order_item) => order_item.product)
	// order_items!: OrderItemEntity[];
}
