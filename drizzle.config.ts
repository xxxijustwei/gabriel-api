import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const config = defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url:
            process.env.DATABASE_URL ??
            "postgres://postgres:postgres@localhost:5432/gabriel",
    },
});

export default config;
