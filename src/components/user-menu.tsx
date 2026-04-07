"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  LockIcon,
  BadgeCheck,
  Logout01Icon,
  ChevronsUpDown,
} from "@hugeicons/core-free-icons"

import { useAuth } from "@/context/authContext"
import useUserProfile from "@/context/userContext"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useRouter } from "next/navigation"

export function NavUser() {
  const { user } = useUserProfile()
  const { logout } = useAuth()
  const router = useRouter()
  const { isMobile } = useSidebar()

  if (!user) return null

  const fullName = `${user.firstName} ${user.lastName}`.trim()
  const initials = (
    user.firstName?.[0] ??
    user.lastName?.[0] ??
    ""
  ).toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(triggerProps) => (
              <SidebarMenuButton {...triggerProps} size="lg" className="">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarFallback className="rounded-full font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  {user.email && (
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </div>

                <HugeiconsIcon icon={ChevronsUpDown} className="h-4 w-4" />
              </SidebarMenuButton>
            )}
          />

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            side="top"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarFallback className="rounded-full font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullName}</span>
                    {user.email && (
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/change-password")}
                className="cursor-pointer"
              >
                <HugeiconsIcon icon={LockIcon} className="h-4 w-4" />
                Change Password
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <HugeiconsIcon icon={BadgeCheck} className="h-4 w-4" />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer text-destructive focus:bg-destructive/10"
            >
              <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
