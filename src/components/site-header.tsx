"use client";
import { AlignJustifyIcon, ArrowLeftToLine, DownloadIcon, Github } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";

export function SiteHeader() {
  const { open } = useSidebar();
  return (
    <header className="bg-background/40 backdrop-blur-lg border-b min-h-[50px] sticky top-0 z-10">
      <nav className="flex justify-between items-center min-h-full">
        {!open ? (
          <SidebarTrigger className="ml-4">
            <AlignJustifyIcon className="size-4" />
          </SidebarTrigger>
        ) : (
          <div />
        )}
        <Button variant="ghost" size="icon" asChild>
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
        </Button>
      </nav>
    </header>
  );
}
