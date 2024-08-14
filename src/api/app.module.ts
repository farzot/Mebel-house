import { TypeOrmModule } from "@nestjs/typeorm";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ScheduleModule as NestScheduleModule } from "@nestjs/schedule";
import { CorrelatorMiddleware } from "../infrastructure/middleware/correlator";
import { config } from "src/config";
import { AuthModule } from "./auth/AuthModule";
import { ExecuterModule } from "./executer/executer.module";
import { FileModule } from "./file/file.module";
import { ProductModule } from "./product/product.module";
// import { ProductLogsModule } from "./product_logs/product_logs.module";


@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forRoot({
			type: "postgres",
			url: config.DB_URL,
			entities: ["dist/core/entity/*.entity{.ts,.js}"],
			synchronize: true, // TODO: set to false in production
		}),
		NestScheduleModule.forRoot(),
		ExecuterModule,
		FileModule,
		ProductModule,
		// ProductLogsModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CorrelatorMiddleware).forRoutes("*");
	}
}
