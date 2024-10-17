import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarLayout } from "@/components/ui/sidebar";
import { HistoryItems } from "./_components/history-items";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { cookies } = await import("next/headers");
  const isOpen = cookies().get("sidebar:state")?.value === "true";
  return (
    <SidebarLayout defaultOpen={isOpen}>
      <AppSidebar>
        <HistoryItems />
      </AppSidebar>
      <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
        <SiteHeader />
        <div className="h-full rounded-md p-2">{children}</div>
      </main>
    </SidebarLayout>
  );
}
