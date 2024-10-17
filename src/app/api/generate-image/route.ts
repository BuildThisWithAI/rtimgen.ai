import { env } from "@/env.mjs";
import { Ratelimit } from "@unkey/ratelimit";
import { isRedirectError } from "next/dist/client/components/redirect";
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
  const { prompt, iterativeMode } = z
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
