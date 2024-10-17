"use client";

import imagePlaceholder from "@/assets/image-placeholder.png";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { db } from "@/db";
import { useDebounce } from "@/hooks/use-debounce";
import { id, tx } from "@instantdb/react";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function ImageGenerator() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId?.at(0) ?? undefined;
  const [iterativeMode, setIterativeMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();

  const { data, isLoading } = db.useQuery({
    rooms: {
      $: {
        where: {
          id: roomId ?? "IDK",
        },
      },
    },
    images: {
      $: {
        where: {
          roomId: roomId ?? "IDK",
        },
      },
    },
  });
  const [prompt, setPrompt] = useState(data?.rooms[0]?.finalPrompt ?? "");
  const debouncedPrompt = useDebounce(prompt, 1000);
  const [isPending, startTransition] = useTransition();

  const activeImage =
    data?.images.find((image) => image.id === selectedId) ?? data?.images[data?.images.length - 1];

  const isDebouncing = prompt !== debouncedPrompt;

  function addImage({ prompt, b64_json }: { b64_json: string; prompt: string }) {
    const roomIdNew = roomId ?? id();
    if (roomId) {
      db.transact(
        tx.rooms[roomId].update({
          finalPrompt: prompt,
          createtAt: Date.now().toLocaleString(),
        }),
      );
    } else {
      db.transact(
        tx.rooms[roomIdNew].update({
          finalPrompt: prompt,
          createtAt: Date.now().toLocaleString(),
        }),
      );
    }
    db.transact(
      tx.images[id()].update({
        b64_json,
        roomId: roomIdNew,
        prompt,
        createdAt: Date.now().toLocaleString(),
      }),
    );
    router.replace(`/room/${roomIdNew}`, {
      scroll: false,
    });
  }

  useEffect(() => {
    if (isTyping) {
      startTransition(async () => {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: debouncedPrompt, roomId, iterativeMode }),
        });

        if (!res.ok) {
          throw new Error("Error generating image");
        }
        const { b64_json } = (await res.json()) as {
          b64_json: string;
        };
        addImage({ prompt: debouncedPrompt, b64_json });
        setSelectedId(undefined);
      });
    }
  }, [debouncedPrompt, isTyping]);

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
        {roomId}
        <Textarea
          rows={4}
          spellCheck={false}
          required
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyUp={() => setIsTyping(true)}
          className="min-h-[100px]"
        />
        <div className="flex justify-between items-center">
          {isDebouncing || isPending ? <Loader2Icon className="animate-spin size-5" /> : <div />}
          <div className="flex gap-2 items-center">
            <span className="font-mono text-sm">Iterative?</span>
            <Switch onCheckedChange={setIterativeMode} checked={iterativeMode} />
          </div>
        </div>
        <div className="flex w-full grow flex-col items-center justify-center pb-8 pt-4 text-center">
          {activeImage && (
            <div className="mt-4 flex w-full max-w-4xl flex-col justify-center">
              <div className="relative">
                {/* <button
                  type="button"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                >
                  {copiedUrl ? <CopyCheckIcon /> : <CopyIcon />}
                </button> */}
                <Image
                  placeholder="blur"
                  blurDataURL={imagePlaceholder.blurDataURL}
                  width={1024}
                  height={768}
                  src={`data:image/png;base64,${activeImage?.b64_json}`}
                  alt=""
                  className={`${isLoading ? "animate-pulse" : ""} max-w-full rounded-lg object-cover shadow-sm shadow-black`}
                />
              </div>

              <div className="mt-4 flex gap-4 overflow-x-scroll pb-4">
                {data?.images.map((image) => (
                  <button
                    type="button"
                    key={image.b64_json}
                    className="w-32 shrink-0 opacity-50 hover:opacity-100"
                    onClick={() => setSelectedId(image.id)}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Image
                            placeholder="blur"
                            blurDataURL={imagePlaceholder.blurDataURL}
                            width={1024}
                            height={768}
                            src={`data:image/png;base64,${image.b64_json}`}
                            alt=""
                            className="max-w-full rounded-lg object-cover shadow-sm shadow-black"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{image.prompt}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
