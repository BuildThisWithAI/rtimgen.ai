import { z } from "zod";

// define a schema for the notifications
export const notificationSchema = z.object({
  images: z.array(
    z.object({
      b64: z.string().describe("B64 format image"),
    }),
  ),
});
