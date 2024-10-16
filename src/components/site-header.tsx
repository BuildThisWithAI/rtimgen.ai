import { Github } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="bg-background border-b h-[64px]">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">;;</span>
          </div>
          <span className="text-xl font-semibold">Image Generator</span>
        </div>
        <nav>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
