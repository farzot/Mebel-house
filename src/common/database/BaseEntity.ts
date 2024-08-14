import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";

import { ExecuterEntity } from "src/core/entity/executer.entity";

@Entity()
export class BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({
		name: "is_active",
		type: "boolean",
		default: true,
	})
	is_active!: boolean;

	@Column({
		name: "is_deleted",
		type: "boolean",
		default: false,
	})
	is_deleted!: boolean;

	@Column({
		name: "created_at",
		type: "bigint",
		default: () => "EXTRACT(epoch FROM NOW()) * 1000",
		// transformer: {
		// 	from: (value) => parseInt(value), // Parse string to number
		// 	to: (value) => value, // No transformation needed when inserting/updating
		// },
	})
	created_at!: number;

	@Column({
		name: "updated_at",
		type: "bigint",
		default: Date.now(),
	})
	updated_at!: number;

	@Column({ name: "deleted_at", type: "bigint", nullable: true })
	deleted_at!: number;

	@ManyToOne(() => ExecuterEntity, (executer) => executer.id, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "created_by" })
	created_by!: ExecuterEntity;

	@ManyToOne(() => ExecuterEntity, (executer) => executer.id, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "updated_by" })
	updated_by!: ExecuterEntity;

	@ManyToOne(() => ExecuterEntity, (executer) => executer.id, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "deleted_by" })
	deleted_by!: ExecuterEntity;
}
