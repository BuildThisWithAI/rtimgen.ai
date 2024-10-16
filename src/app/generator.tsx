"use client";

import imagePlaceholder from "@/assets/image-placeholder.png";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { CopyCheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ImageResponse = {
  b64_json: string;
  timings: { inference: number };
};

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [iterativeMode, setIterativeMode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const debouncedPrompt = useDebounce(prompt, 300);
  const [generations, setGenerations] = useState<{ prompt: string; image: ImageResponse }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>();

  const { data: image, isFetching } = useQuery({
    placeholderData: (previousData) => previousData,
    queryKey: [debouncedPrompt],
    queryFn: async () => {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, userAPIKey: undefined, iterativeMode }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      return (await res.json()) as ImageResponse;
    },
    enabled: !!debouncedPrompt.trim(),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const isDebouncing = prompt !== debouncedPrompt;

  useEffect(() => {
    if (image && !generations.map((g) => g.image).includes(image)) {
      setGenerations((images) => [...images, { prompt, image }]);
      setActiveIndex(generations.length);
    }
  }, [generations, image, prompt]);

  const activeImage = activeIndex !== undefined ? generations[activeIndex].image : undefined;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-center">
          Image Generator using{" "}
          <Link
            href="https://huggingface.co/black-forest-labs/FLUX.1-schnell"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono bg-secondary"
          >
            black-forest-labs/FLUX.1-schnell
          </Link>
        </h1>
        <Textarea
          rows={4}
          spellCheck={false}
          required
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-between items-center">
          {isDebouncing ? <Loader2Icon className="animate-spin size-5" /> : <div />}
          <div className="flex gap-2 items-center">
            <span className="font-mono text-sm">Iterative?</span>
            <Switch onCheckedChange={setIterativeMode} checked={iterativeMode} />
          </div>
        </div>
        <div className="flex w-full grow flex-col items-center justify-center pb-8 pt-4 text-center">
          {prompt && activeImage && (
            <div className="mt-4 flex w-full max-w-4xl flex-col justify-center">
              <div className="relative">
                <button
                  type="button"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                >
                  {copiedUrl ? <CopyCheckIcon /> : <CopyIcon />}
                </button>
                <Image
                  placeholder="blur"
                  blurDataURL={imagePlaceholder.blurDataURL}
                  width={1024}
                  height={768}
                  src={`data:image/png;base64,${activeImage.b64_json}`}
                  alt=""
                  className={`${isFetching ? "animate-pulse" : ""} max-w-full rounded-lg object-cover shadow-sm shadow-black`}
                />
              </div>

              <div className="mt-4 flex gap-4 overflow-x-scroll pb-4">
                {generations.map((generatedImage, i) => (
                  <button
                    type="button"
                    key={generatedImage.image.b64_json}
                    className="w-32 shrink-0 opacity-50 hover:opacity-100"
                    onClick={() => setActiveIndex(i)}
                  >
                    <Image
                      placeholder="blur"
                      blurDataURL={imagePlaceholder.blurDataURL}
                      width={1024}
                      height={768}
                      src={`data:image/png;base64,${generatedImage.image.b64_json}`}
                      alt=""
                      className="max-w-full rounded-lg object-cover shadow-sm shadow-black"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
