import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

export const env = createEnv({
  server: {
    HELICONE_API_KEY: z.string().min(1),
    TOGETHER_API_KEY: z.string().min(1),
    UNKEY_ROOT_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    TURSO_AUTH_TOKEN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_INSTANTDB_APP_ID: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_INSTANTDB_APP_ID: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
  extends: [vercel()],
});
