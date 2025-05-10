import { NestFactory } from "@nestjs/core";
import morgan from "morgan";
import { AppModule } from "./app/app.module";
import "dotenv/config";
import { ZodValidationPipe, patchNestjsSwagger } from "@anatine/zod-nestjs";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    morgan.token("date", () => {
        const date = new Date();
        return date.toISOString();
    });

    // swagger
    patchNestjsSwagger();
    const config = new DocumentBuilder()
        .setTitle("Gabriel API")
        .setDescription("The Gabriel API description")
        .setVersion("1.0")
        .addTag("Gabriel")
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, documentFactory);

    app.use(morgan(":date :method :url :status :response-time ms"));
    app.useGlobalPipes(new ZodValidationPipe());

    await app.listen(8080);
}

bootstrap();
