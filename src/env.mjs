import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { vercel } from "@t3-oss/env-nextjs/presets";

export const env = createEnv({
  server: {
    HELICONE_API_KEY: z.string().min(1),
    TOGETHER_API_KEY: z.string().min(1),
    UNKEY_ROOT_KEY: z.string().min(1),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
  extends: [vercel()],
});
