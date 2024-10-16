import Together from "together-ai";
import { z } from "zod";

export async function POST(req: Request) {
  const json = await req.json();
  const { prompt, iterativeMode } = z
    .object({
      prompt: z.string(),
      iterativeMode: z.boolean(),
    })
    .parse(json);

  // Add observability if a Helicone key is specified, otherwise skip
  const options: ConstructorParameters<typeof Together>[0] = {};
  if (process.env.HELICONE_API_KEY) {
    options.baseURL = "https://together.helicone.ai/v1";
    options.defaultHeaders = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-BYOK": "false",
    };
  }

  const client = new Together(options);

  try {
    const response = await client.images.create({
      prompt,
      model: "black-forest-labs/FLUX.1-schnell",
      width: 1024,
      height: 768,
      seed: iterativeMode ? 123 : undefined,
      steps: 3,
      // @ts-expect-error - this is not typed in the API
      response_format: "base64",
    });
    return Response.json(response.data[0]);
  } catch (e: any) {
    return Response.json(
      { error: e.toString() },
      {
        status: 500,
      },
    );
  }
}

export const runtime = "edge";
