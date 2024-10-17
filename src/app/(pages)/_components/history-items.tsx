"use client";

import { NavMain } from "@/components/nav-main";
import { db } from "@/db";
import { HistoryIcon } from "lucide-react";

export function HistoryItems() {
  const { data, isLoading } = db.useQuery({
    rooms: {},
  });
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
