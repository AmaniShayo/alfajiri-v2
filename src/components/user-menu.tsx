"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  LockIcon,
  BadgeCheck,
  Logout01Icon,
  ChevronDoubleCloseFreeIcons,
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
} from "@/components/ui/sidebar"

import { useRouter } from "next/navigation"

export function NavUser() {
  const { user } = useUserProfile()
  const { logout } = useAuth()
  const router = useRouter()

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
              <SidebarMenuButton
                {...triggerProps}
                size="lg"
                className="rounded-4xl"
              >
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

                <HugeiconsIcon
                  icon={ChevronDoubleCloseFreeIcons}
                  className="h-4 w-4 rotate-90"
                />
              </SidebarMenuButton>
            )}
          />

          <DropdownMenuContent
            className="w-[--anchor-width] min-w-56"
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

            <DropdownMenuItem
              onClick={() => router.push("/change-password")}
              className="cursor-pointer"
            >
              <HugeiconsIcon icon={LockIcon} className="h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <HugeiconsIcon icon={BadgeCheck} className="h-4 w-4" />
              Account
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer focus:bg-destructive/5"
            >
              <HugeiconsIcon icon={Logout01Icon} className="hover h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
