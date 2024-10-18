"use client";

import { db } from "@/db";
import ImageGeneratorStateOnly from "./without-db";
import ImageGeneratorWithDB from "./with-db";

export function ImageGenerator() {
  const { user } = db.useAuth();
  if (!user) {
    return <ImageGeneratorStateOnly />;
  }
  return <ImageGeneratorWithDB />;
}
