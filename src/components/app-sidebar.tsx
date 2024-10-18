import { ImageIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

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
      <SidebarContent className="pb-0">
        <SidebarItem>{children}</SidebarItem>
        <SidebarFooter className="mt-auto">
          <NavUser />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
