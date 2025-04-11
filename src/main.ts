import { NestFactory } from "@nestjs/core";
import morgan from "morgan";
import { AppModule } from "./app/app.module";
import "dotenv/config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    morgan.token("date", () => {
        const date = new Date();
        return date.toISOString();
    });

    app.use(morgan(":date :method :url :status :response-time ms"));

    await app.listen(8080);
}

bootstrap();
