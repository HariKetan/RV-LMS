"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { menu } from "./menu"

export function SidebarMainNavMenu({
  
}) {
  const items = menu.navMain
  return (
<SidebarGroup>
    {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
    <SidebarMenu>
  

      {items.map((item) => (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={false}
          className="group/collapsible"
        >
          <SidebarGroupContent>
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </Collapsible>
      ))}
    </SidebarMenu>
  </SidebarGroup>
  )
}