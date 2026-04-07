"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  LockIcon,
  BadgeCheck,
  Logout01Icon,
} from "@hugeicons/core-free-icons"

import { useAuth } from "@/context/authContext"
import useUserProfile from "@/context/userContext"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRouter } from "next/navigation"

export function UserMenu() {
  const { user } = useUserProfile()
  const { logout } = useAuth()
  const router = useRouter()

  return (
    <div>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="hover:bg-transparent active:bg-transparent"
            
          >
            <div className="flex items-center">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="rounded-full border bg-yellow-600 text-xl font-bold text-white">
                  {(user?.firstName?.[0] ?? "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm bg-background"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarFallback className="rounded-full border text-xl font-bold">
                  {(user?.firstName?.[0] ?? "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {`${user.firstName} ${user.lastName}`}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  router.push("/change-password")
                }}
              >
                <HugeiconsIcon
                  icon={LockIcon}
                  className="mr-2 text-primary"
                />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon
                  icon={BadgeCheck}
                  className="mr-2 text-primary"
                />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => logout()}
            >
              <HugeiconsIcon
                icon={Logout01Icon}
                className="mr-2 text-primary"
              />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
