import * as z from "zod";

const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  ORG_API_URL: z.string().url("ORG_API_URL must be a valid URL"),
  USER_API_URL: z.string().url("USER_API_URL must be a valid URL"),
  PORT: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
  NODE_ENV: z.enum(["development", "production", "test"]),
  GATEWAY_SECRET: z
    .string()
    .min(32, "GATEWAY_SECRET must be at least 32 characters"),
});

const env = envSchema.parse(process.env);

const validateEnv = () => env;

export { env };
export default validateEnv;