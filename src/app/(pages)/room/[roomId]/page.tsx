import ImageGenerator from "@/app/(pages)/generator";
import { db } from "@/db";

export default async function Page() {
  const images = await db.query.generatedImage.findMany();
  return <ImageGenerator images={images} />;
}
