import { env } from "@/env.mjs";
import { init } from "@instantdb/react";

type GeneratedImage = {
  b64_json: string;
  roomId: string;
  prompt: string;
  createdAt: string;
};

type Room = {
  id: string;
  finalPrompt: string;
  createdAt: string;
};

export type Schema = {
  rooms: Room;
  images: GeneratedImage;
};

export const db = init<Schema>({ appId: env.NEXT_PUBLIC_INSTANTDB_APP_ID });
