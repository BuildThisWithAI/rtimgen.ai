import { ImageIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      <SidebarHeader className="min-h-[50px] font-semibold flex justify-end">
        <div className="flex-1 px-2.5">
          <ImageIcon className="inline-flex size-5 mr-2" />
          rtimgen.ai
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarItem>{children}</SidebarItem>
      </SidebarContent>
    </Sidebar>
  );
}
