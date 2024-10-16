import { AppSidebar } from "@/components/app-sidebar";
import { NavMain } from "@/components/nav-main";
import { SiteHeader } from "@/components/site-header";
import { SidebarLayout } from "@/components/ui/sidebar";
import { db } from "@/db";
import { HistoryIcon } from "lucide-react";
import { Suspense } from "react";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { cookies } = await import("next/headers");
  const isOpen = cookies().get("sidebar:state")?.value === "true";
  return (
    <SidebarLayout defaultOpen={isOpen}>
      <AppSidebar>
        <Suspense fallback={<NavMain items={[]} />}>
          <HistoryItems />
        </Suspense>
      </AppSidebar>
      <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
        <SiteHeader />
        <div className="h-full rounded-md p-2">{children}</div>
      </main>
    </SidebarLayout>
  );
}

async function HistoryItems() {
  const items = await db.query.room.findMany({
    limit: 20,
  });
  return (
    <NavMain
      items={[
        {
          title: "History",
          url: "#",
          icon: <HistoryIcon className="size-4 shrink-0" />,
          items: items.map((item) => ({
            title: item.finalPrompt,
            url: `/room/${item.id}`,
          })),
        },
      ]}
    />
  );
}
