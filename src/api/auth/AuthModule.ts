import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExecuterEntity } from "src/core/entity/executer.entity";
import { JwtStrategy } from "./user/AuthStrategy";

@Module({
	imports: [TypeOrmModule.forFeature([ExecuterEntity])],
	providers: [JwtStrategy],
})
export class AuthModule {}
