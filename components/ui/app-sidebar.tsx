"use client";
import { menuItems } from "@/lib/data";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import AccountSelector from "../custom/account-selector";
import { Separator } from "./separator";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const isMobile = useIsMobile();
  const pathName = usePathname();
  return (
    <>
      {!isMobile && (
        <Sidebar>
          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="font-medium text-sm text-muted-foreground px-2">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <AccountSelector />
              </SidebarGroupContent>
            </SidebarGroup>
            <Separator />
            <SidebarGroup>
              <SidebarGroupLabel className="font-medium text-sm text-muted-foreground px-2">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const isActive = pathName === item.route;
                    return(
                      <SidebarMenuItem key={item.label} className="mb-1">
                        <SidebarMenuButton 
                          asChild 
                          className={cn(
                            'px-2 py-2 hover:bg-muted-foreground/20 transition-colors rounded-md',
                            isActive && 'bg-muted-foreground/20'
                          )}
                        >
                          <Link
                            href={item.route} 
                            className='flex items-center gap-2 text-sm text-foreground hover:text-foreground'
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label[0].toUpperCase() + item.label.slice(1)}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>                      
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>         
      )}
    </>
  )
}