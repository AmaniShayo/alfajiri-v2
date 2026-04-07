"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  BarChart,
  Briefcase01Icon,
  HelpCircleIcon,
  UserGroupIcon,
  CreditCard,
  CubeIcon,
  DollarCircleIcon,
  FolderCheckIcon,
  DashboardSquare01Icon,
  MessageFavourite01Icon,
  Receipt,
  File02Icon,
  Refresh,
  ScrollIcon,
  Settings01Icon,
  Shield01Icon,
  Users,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSidebar } from "@/components/ui/sidebar"
import { NavUser } from "./user-menu"

export const adminNavItems = [
  {
    title: "Products",
    href: "/products",
    icon: CubeIcon,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: UserGroupIcon,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: Receipt,
  },
  {
    title: "Purchase History",
    href: "/purchases",
    icon: File02Icon,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: CreditCard,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FolderCheckIcon,
  },
  {
    title: "Quotations",
    href: "/quotations",
    icon: File02Icon,
  },
  {
    title: "Returnables",
    href: "/returnables",
    icon: Refresh,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart,
  },
]

export function AppSidebar() {
  const path = usePathname()
  const { isMobile, toggleSidebar } = useSidebar()

  // Hugeicons are naturally bigger and more premium-looking
  const iconSize = 28

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="py-0">
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent active:bg-transparent"
        >
          <Avatar className="h-8 w-8 rounded-none">
            <AvatarImage src="/logo.png" alt="logo" />
            <AvatarFallback className="rounded-full">AIMS</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-lg font-bold">ALFAJIRI</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroupLabel className="text-gray-400">
                PINNED
              </SidebarGroupLabel>

              <SidebarMenuItem>
                <Link href="/dashboard">
                  <SidebarMenuButton
                    tooltip="Dashboard"
                    className={`${
                      path === "/dashboard"
                        ? "cursor-default bg-accent text-primary"
                        : "cursor-pointer"
                    }`}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <HugeiconsIcon
                      icon={DashboardSquare01Icon}
                      size={iconSize}
                    />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/pos">
                  <SidebarMenuButton
                    tooltip="Point of Sale"
                    className={`${
                      path === "/pos"
                        ? "cursor-default bg-accent text-primary"
                        : "cursor-pointer"
                    }`}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <HugeiconsIcon icon={DollarCircleIcon} size={iconSize} />
                    <span>Point of Sale</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/purchase">
                  <SidebarMenuButton
                    tooltip="Purchase"
                    className={`${
                      path === "/purchase"
                        ? "cursor-default bg-accent text-primary"
                        : "cursor-pointer"
                    }`}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <HugeiconsIcon icon={ScrollIcon} size={iconSize} />
                    <span>Purchase</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem className="mb-3">
                <Link href="/my-businesses">
                  <SidebarMenuButton
                    tooltip="My Businesses"
                    className={`${
                      path === "/my-businesses"
                        ? "cursor-default bg-accent text-primary"
                        : "cursor-pointer"
                    }`}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <HugeiconsIcon icon={Briefcase01Icon} size={iconSize} />
                    <span>My Businesses</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarGroupLabel className="text-gray-400">
                MAIN MENU
              </SidebarGroupLabel>

              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`${
                        (path ?? "").startsWith(item.href)
                          ? "cursor-default bg-accent text-primary"
                          : "cursor-pointer"
                      }`}
                      onClick={() => isMobile && toggleSidebar()}
                    >
                      <HugeiconsIcon icon={item.icon} size={iconSize} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}

              <div className="mb-3" />

              <SidebarGroupLabel className="text-gray-400">
                GENERAL
              </SidebarGroupLabel>

              <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton
                    tooltip="Settings"
                    className={`${
                      (path ?? "").startsWith("/settings")
                        ? "cursor-default bg-accent text-primary"
                        : "cursor-pointer"
                    }`}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    <HugeiconsIcon icon={Settings01Icon} size={iconSize} />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuButton
                tooltip="Feedback"
                onClick={() => isMobile && toggleSidebar()}
                className="cursor-pointer"
              >
                <HugeiconsIcon icon={MessageFavourite01Icon} size={iconSize} />
                <span>Feedback</span>
              </SidebarMenuButton>

              <Link href="https://wa.me/255743389117" className="mb-3">
                <SidebarMenuButton
                  tooltip="Help center"
                  onClick={() => isMobile && toggleSidebar()}
                  className="cursor-pointer"
                >
                  <HugeiconsIcon icon={HelpCircleIcon} size={iconSize} />
                  <span>Help center</span>
                </SidebarMenuButton>
              </Link>

              <SidebarGroupLabel className="text-gray-400">
                LEGAL
              </SidebarGroupLabel>

              <Link href="terms-of-service">
                <SidebarMenuButton
                  tooltip="Terms of Service"
                  onClick={() => isMobile && toggleSidebar()}
                  className="cursor-pointer"
                >
                  <HugeiconsIcon icon={ScrollIcon} size={iconSize} />
                  <span>Terms of Service</span>
                </SidebarMenuButton>
              </Link>

              <Link href="privacy-policy">
                <SidebarMenuButton
                  tooltip="Privacy Policy"
                  onClick={() => isMobile && toggleSidebar()}
                  className="cursor-pointer"
                >
                  <HugeiconsIcon icon={Shield01Icon} size={iconSize} />
                  <span>Privacy Policy</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
        </SidebarFooter>
    </Sidebar>
  )
}
