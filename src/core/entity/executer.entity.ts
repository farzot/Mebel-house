import { BaseEntity } from "src/common/database/BaseEntity";
import { Roles } from "src/common/database/Enums";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { FileEntity } from "./file.entity";
import { ProductEntity } from "./product.entity";

@Entity("executers")
export class ExecuterEntity extends BaseEntity {
	@Column({ type: "varchar", name: "first_name" })
	first_name!: string;

	@Column({ type: "varchar", name: "last_name" })
	last_name!: string;

	@Column({ type: "varchar", name: "gender" })
	gender!: string;

	@Column({ type: "bigint", name: "birth_date", nullable: true })
	birth_date!: number;

	@Column({ type: "varchar", name: "phone_number" })
	phone_number!: string;

	@Column({ type: "varchar", name: "role" })
	role!: Roles;

	@Column({ type: "varchar", name: "username", unique: true })
	username!: string;

	@Column({ type: "varchar", name: "password" })
	password!: string;

	@ManyToOne(() => FileEntity, (file) => file.executers, { onDelete: "CASCADE" })
	@JoinColumn({ name: "image_id" })
	image!: FileEntity;

	// @OneToMany(() => CompanyEntity, (company) => company.owner)
	// companies!: CompanyEntity[];

	// @ManyToMany(() => StoreEntity, (store) => store.executers)
	// store!: StoreEntity[];

	// @OneToMany(() => ProductEntity, (product) => product.product_category)
	// products!: ProductEntity[];

	// @OneToMany(() => OrderEntity, (order) => order.cashier)
	// orders!: OrderEntity[]

	// @OneToMany(() => ReturnOrderEntity, (return_order) => return_order.cashier)
	// return_orders!: ReturnOrderEntity[]
}
