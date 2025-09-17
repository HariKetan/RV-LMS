import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarFooterNavMenu } from "./sidebarNavigation/SidebarFooterNavMenu";
import { SidebarMainNavMenu } from "./sidebarNavigation/sidebarMainNavMenu";

// This is sample data.

export function UserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarTrigger className="justify-end mx-auto mr-3.5 mt-3 " />
      <SidebarContent>
        <SidebarMainNavMenu />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterNavMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
