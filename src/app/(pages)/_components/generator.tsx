"use client";

import imagePlaceholder from "@/assets/image-placeholder.png";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { db } from "@/db";
import { useDebounce } from "@/hooks/use-debounce";
import { id, tx } from "@instantdb/react";
import { InfoIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export default function ImageGenerator() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId?.at(0) ?? undefined;
  const [iterativeMode, setIterativeMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();

  const { data } = db.useQuery({
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
  const [prompt, setPrompt] = useState<string>("");
  const debouncedPrompt = useDebounce(prompt, 1000);
  const [isPending, startTransition] = useTransition();

  const activeImage =
    data?.images.find((image) => image.id === selectedId) ?? data?.images[data?.images.length - 1];

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

  const generateImage = async (promptToUse: string) => {
    if (!promptToUse.trim()) return;

    startTransition(async () => {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptToUse, roomId, iterativeMode }),
      });

      if (!res.ok) {
        toast.error(`Error: ${res.status}`);
        return;
      }

      const { b64_json } = (await res.json()) as {
        b64_json: string;
      };
      addImage({ prompt: promptToUse, b64_json });
      setSelectedId(undefined);
    });
  };

  useEffect(() => {
    if (debouncedPrompt) {
      generateImage(debouncedPrompt);
    }
  }, [debouncedPrompt, iterativeMode]);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-center">
          Real-time Image Generator using
          <br />
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
          defaultValue={data?.rooms[0]?.finalPrompt}
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-between items-center">
          {isPending ? (
            <div className="flex items-center text-sm">
              <Loader2Icon className="animate-spin mr-2 size-4" />
              <span>Generating...</span>
            </div>
          ) : (
            <div className="flex items-center text-sm gap-2">
              <InfoIcon className="size-4" /> Type to generate
            </div>
          )}
          <div className="flex gap-2 items-center">
            <span className="font-mono text-sm">Iterative?</span>
            <Switch onCheckedChange={setIterativeMode} checked={iterativeMode} />
          </div>
        </div>
        <div className="flex w-full grow flex-col items-center justify-center pb-8 pt-4 text-center">
          {activeImage && (
            <div className="mt-4 flex w-full max-w-4xl flex-col justify-center">
              <div className="relative">
                <Image
                  placeholder="blur"
                  blurDataURL={imagePlaceholder.blurDataURL}
                  width={1024}
                  height={768}
                  src={`data:image/png;base64,${activeImage?.b64_json}`}
                  alt="Generated image"
                  className={`${isPending ? "animate-pulse" : ""} max-w-full rounded-lg object-cover shadow-sm shadow-black`}
                />
              </div>

              <div className="mt-4 flex gap-4 overflow-x-scroll pb-4">
                {data?.images.map((image) => (
                  <button
                    type="button"
                    key={image.b64_json}
                    className="w-32 shrink-0 opacity-50 hover:opacity-100"
                    onClick={() => {
                      setSelectedId(image.id);
                    }}
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
                            alt="Thumbnail of generated image"
                            className="max-w-full rounded-lg object-cover shadow-sm shadow-black"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-40 text-left space-y-4">
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
