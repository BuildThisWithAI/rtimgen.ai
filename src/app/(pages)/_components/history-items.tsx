"use client";

import { NavMain } from "@/components/nav-main";
import { db } from "@/db";
import { HistoryIcon, InfoIcon } from "lucide-react";

export function HistoryItems() {
  const { user } = db.useAuth();

  const { data, isLoading } = db.useQuery({
    rooms: {
      $: {
        where: {
          createdBy: user?.email,
        },
      },
    },
  });
  if (!user)
    return (
      <NavMain
        items={[
          {
            icon: <InfoIcon className="size-4" />,
            title: "Log in to save your images",
            url: "#",
          },
        ]}
      />
    );
  const items = [
    {
      title: "History",
      url: "#",
      icon: <HistoryIcon className="size-4 shrink-0" />,
      items:
        !isLoading && data
          ? data.rooms.map((item) => ({
              title: item.finalPrompt,
              url: `/room/${item.id}`,
            }))
          : [
              {
                title: "Loading...",
                url: "#",
              },
            ],
    },
  ];
  return <NavMain items={items} />;
}
