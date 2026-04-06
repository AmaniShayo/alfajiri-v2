"use client";

import { BadgeCheck, LockIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/authContext";
import useUserProfile from "@/context/userContext";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user } = useUserProfile();
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <div>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="active:bg-transparent hover:bg-transparent"
            asChild>
            <div className="flex items-center">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="rounded-full border font-bold text-xl bg-yellow-600 text-white">
                  {`${(user?.firstName?.[0] ?? "").toUpperCase()}`}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm bg-background"
            side={"bottom"}
            align="end"
            sideOffset={8}>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarFallback className="rounded-full border font-bold text-xl">
                  {`${(user?.firstName?.[0] ?? "").toUpperCase()}`}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{`${user.firstName} ${user.lastName}`}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  router.push("/change-password");
                }}>
                <LockIcon className="text-primary" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BadgeCheck className="text-primary" />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => logout()}>
              <LogOut className="text-primary" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
