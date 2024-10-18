"use client";
import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/db";
import Link from "next/link";
import { useTransition } from "react";
import { GoogleIcon } from "./icons";
import { Button, buttonVariants } from "./ui/button";
import { env } from "@/env.mjs";

const url = db.auth.createAuthorizationURL({
  // Use the google client name in the Instant dashboard auth tab
  clientName: "rtimgen",
  redirectURL: env.NEXT_PUBLIC_APP_URL,
});

export function NavUser() {
  const { user } = db.useAuth();
  const [isPending, startTransition] = useTransition();
  const logOut = () => {
    startTransition(async () => {
      await db.auth.signOut();
    });
  };
  if (!user)
    return (
      <Link href={url} className="w-full">
        <Button
          className="text-xs flex gap-4 items-center w-full text-left justify-start"
          variant="ghost"
        >
          <GoogleIcon className="size-5" /> Log in with Google
        </Button>
      </Link>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full rounded-md outline-none ring-ring hover:bg-accent focus-visible:ring-2 data-[state=open]:bg-accent">
        <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm transition-all">
          <Avatar className="h-7 w-7 rounded-md border">
            <AvatarFallback className="rounded-md">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 leading-none">
            {/* <div className="font-medium">{user.id}</div> */}
            <div className="overflow-hidden text-xs text-muted-foreground">
              <div className="line-clamp-1">{user.email}</div>
            </div>
          </div>
          <ChevronsUpDown className="ml-auto mr-0.5 h-4 w-4 text-muted-foreground/50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm transition-all">
            <Avatar className="h-7 w-7 rounded-md">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1">
              <div className="overflow-hidden text-xs text-muted-foreground">
                <div className="line-clamp-1">{user.email}</div>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onClick={logOut}>
          <LogOut className="h-4 w-4 text-muted-foreground" />
          {isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
