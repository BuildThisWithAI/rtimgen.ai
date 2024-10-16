import { db } from "@/db";
import { generatedImage, room } from "@/db/schema";
import { env } from "@/env.mjs";
import { Ratelimit } from "@unkey/ratelimit";
import { eq } from "drizzle-orm";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import Together from "together-ai";
import { z } from "zod";

const unkey = new Ratelimit({
  rootKey: env.UNKEY_ROOT_KEY,
  namespace: "gen.img",
  limit: 10,
  duration: "30s",
});

export async function POST(req: Request) {
  const json = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const ratelimit = await unkey.limit(ip, {
    resources: [
      {
        id: "somebody",
        name: "Generating an image",
        type: "gen.img",
      },
    ],
  });
  if (!ratelimit.success) {
    return Response.json({ error: "Ratelimit exceeded" }, { status: 429 });
  }
  const { prompt, iterativeMode, roomId } = z
    .object({
      prompt: z.string(),
      iterativeMode: z.boolean(),
      roomId: z.string().optional(),
    })
    .parse(json);

  const client = new Together({
    baseURL: "https://together.helicone.ai/v1",
    defaultHeaders: {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-BYOK": "false",
    },
  });

  try {
    const response = await client.images.create({
      prompt,
      model: "black-forest-labs/FLUX.1-schnell",
      width: 160 * 4,
      height: 160 * 4,
      seed: iterativeMode ? 123 : undefined,
      steps: 3,
      // @ts-expect-error - this is not typed in the API
      response_format: "base64",
    });

    if (!roomId) {
      const id = await db
        .insert(room)
        .values({
          finalPrompt: prompt,
        })
        .returning();
      await db.insert(generatedImage).values({
        roomId: id[0].id,
        b64: response.data[0].b64_json,
        prompt,
      });
      redirect(`/room/${id[0].id}`);
    } else {
      await db.insert(generatedImage).values({
        b64: response.data[0].b64_json,
        roomId,
        prompt,
      });
      await db.update(room).set({ finalPrompt: prompt }).where(eq(room.id, roomId));
    }

    return Response.json(response.data[0]);
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }
    if (e instanceof Error) {
      return Response.json(
        { error: e.toString() },
        {
          status: 500,
        },
      );
    }
    return Response.json(
      { error: "An unknown error occurred" },
      {
        status: 500,
      },
    );
  }
}
