"use client";

import {
  BarChart3Icon,
  BriefcaseBusiness,
  CircleQuestionMarkIcon,
  Contact2Icon,
  CreditCardIcon,
  CuboidIcon,
  DollarSign,
  FolderCheckIcon,
  LayoutDashboardIcon,
  MessageCircleHeartIcon,
  Receipt,
  ReceiptText,
  Repeat,
  Scroll,
  ScrollTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  Users2,
} from "lucide-react";

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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

export const adminNavItems = [
  // {
  //   title: "Dashboard",
  //   href: "/dashboard",
  //   icon: LayoutDashboardIcon,
  // },
  {
    title: "Products",
    href: "/products",
    icon: CuboidIcon,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users2,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Contact2Icon,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: Receipt,
  },
  {
    title: "Purchase History",
    href: "/purchases",
    icon: ReceiptText,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: CreditCardIcon,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FolderCheckIcon,
  },
  {
    title: "Quotations",
    href: "/quotations",
    icon: ReceiptText,
  },
  {
    title: "Returnables",
    href: "/returnables",
    icon: Repeat,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3Icon,
  },
];

export function AppSidebar() {
  const path = usePathname();
  const { isMobile, toggleSidebar, open } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={`${!open ? "my-3" : "border-b"} p-0 mb-0 mx-2 border-gray-800`}>
        <SidebarMenuButton
          size="lg"
          className="active:bg-transparent hover:bg-transparent cursor-default">
          <Avatar className="h-8 w-7 rounded-none">
            <AvatarImage src="/logo.png" alt="logo" />
            <AvatarFallback className="rounded-full">AIMS</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-lg font-medium text-white">
              ALFAJIRI
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="">
            <SidebarMenu>
              <SidebarGroupLabel className="text-gray-400">
                PINNED
              </SidebarGroupLabel>
              <SidebarMenuItem>
                <Link href={"/dashboard"}>
                  <SidebarMenuButton
                    asChild
                    tooltip={"Dashboard"}
                    className={`${
                      path === "/dashboard"
                        ? "cursor-default bg-yellow-600 text-white rounded-sm hover:bg-yellow-600/90 hover:text-white"
                        : "cursor-pointer text-white rounded-sm  hover:bg-yellow-600/10 hover:text-white"
                    }`}
                    onClick={() => {
                      if (isMobile) {
                        toggleSidebar();
                      }
                    }}>
                    <div className="flex">
                      <LayoutDashboardIcon />
                      <span className="">Dashboard</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={"/pos"}>
                  <SidebarMenuButton
                    asChild
                    tooltip={"Point of Sale"}
                    className={`${
                      path === "/pos"
                        ? "cursor-default bg-yellow-600 text-white rounded-sm hover:bg-yellow-600/90 hover:text-white"
                        : "cursor-pointer text-white rounded-sm  hover:bg-yellow-600/10 hover:text-white"
                    }`}
                    onClick={() => {
                      if (isMobile) {
                        toggleSidebar();
                      }
                    }}>
                    <div className="flex">
                      <DollarSign />
                      <span className="">Point of Sale</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={"/purchase"}>
                  <SidebarMenuButton
                    asChild
                    tooltip={"Purchase"}
                    className={`${
                      path === "/purchase"
                        ? "cursor-default bg-yellow-600 text-white rounded-sm hover:bg-yellow-600/90 hover:text-white"
                        : "cursor-pointer text-white rounded-sm  hover:bg-yellow-600/10 hover:text-white"
                    }`}
                    onClick={() => {
                      if (isMobile) {
                        toggleSidebar();
                      }
                    }}>
                    <div className="flex">
                      <Scroll />
                      <span className="">Purchase</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem className="mb-3">
                <Link href={"/my-businesses"}>
                  <SidebarMenuButton
                    asChild
                    tooltip={"My Businesses"}
                    className={`${
                      path === "/my-businesses"
                        ? "cursor-default bg-yellow-600 text-white rounded-sm hover:bg-yellow-600/90 hover:text-white"
                        : "cursor-pointer text-white rounded-sm  hover:bg-yellow-600/10 hover:text-white"
                    }`}
                    onClick={() => {
                      if (isMobile) {
                        toggleSidebar();
                      }
                    }}>
                    <div className="flex">
                      <BriefcaseBusiness />
                      <span className="">My Businesses</span>
                    </div>
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
                          ? "cursor-default bg-yellow-600 text-white rounded-sm hover:bg-yellow-600 hover:text-white"
                          : "cursor-pointer hover:bg-yellow-500/10 hover:text-yellow-100 text-white"
                      }`}
                      onClick={() => {
                        if (isMobile) {
                          toggleSidebar();
                        }
                      }}
                      asChild>
                      <div className="flex">
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
              <div className="mb-3"></div>
              <SidebarGroupLabel className="text-gray-400">
                GENERAL
              </SidebarGroupLabel>
              <SidebarMenuItem>
                <Link href={"/settings"}>
                  <SidebarMenuButton
                    tooltip={"Settings"}
                    className={`${
                      (path ?? "").startsWith("/settings")
                        ? "cursor-default bg-blue-900 text-white rounded-sm hover:bg-blue-900 hover:text-white"
                        : "cursor-pointer hover:bg-blue-500/10 hover:text-blue-100 text-white"
                    }`}
                    onClick={() => {
                      if (isMobile) {
                        toggleSidebar();
                      }
                    }}
                    asChild>
                    <div className="flex">
                      <SettingsIcon />
                      <span>Settings</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Feedback"}
                onClick={() => {
                  if (isMobile) {
                    toggleSidebar();
                  }
                }}
                className="active:bg-transparent hover:bg-transparent cursor-pointer bg-transparent text-white hover:text-white shadow-none">
                <MessageCircleHeartIcon size={12} />
                <span>Feedback</span>
              </SidebarMenuButton>
              <Link href={"https://wa.me/255743389117"} className="mb-3">
                <SidebarMenuButton
                  tooltip={"Help center"}
                  onClick={() => {
                    if (isMobile) {
                      toggleSidebar();
                    }
                  }}
                  className="active:bg-transparent hover:bg-transparent cursor-pointer bg-transparent text-white hover:text-white shadow-none">
                  <CircleQuestionMarkIcon />
                  <span>Help center</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="py-2">
        <SidebarGroupLabel className="text-gray-400">LEGAL</SidebarGroupLabel>
        <Link href={"terms-of-service"}>
          <SidebarMenuButton
            tooltip={"Terms of Service"}
            onClick={() => {
              if (isMobile) {
                toggleSidebar();
              }
            }}
            className="active:bg-transparent hover:bg-transparent cursor-pointer bg-transparent text-white hover:text-white shadow-none underline">
            <ScrollTextIcon />
            <span>Terms of Service</span>
          </SidebarMenuButton>
        </Link>
        <Link href={"privacy-policy"}>
          <SidebarMenuButton
            tooltip={"Privacy Policy"}
            onClick={() => {
              if (isMobile) {
                toggleSidebar();
              }
            }}
            className="active:bg-transparent hover:bg-transparent cursor-pointer bg-transparent text-white hover:text-white shadow-none underline">
            <ShieldCheckIcon />
            <span>Privacy Policy</span>
          </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
