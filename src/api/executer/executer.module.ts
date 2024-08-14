import { Module } from "@nestjs/common";
import { ExecuterService } from "./executer.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExecuterEntity } from "src/core/entity/executer.entity";
import { JwtModule } from "@nestjs/jwt";
import { config } from "src/config";
import { ExecuterController } from "./executer.controller";

@Module({
	imports: [
		TypeOrmModule.forFeature([ExecuterEntity]),
		JwtModule.register({
			global: true,
			secret: config.JWT_SECRET_KEY || "secret",
			signOptions: { expiresIn: config.JWT_SECRET_TIME || "1d" },
		}),
	],
	controllers: [ExecuterController],
	providers: [ExecuterService],
})
export class ExecuterModule { }
