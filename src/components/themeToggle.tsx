"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Sun02Icon,
  Moon02Icon,
  Laptop,
  Check,
} from "@hugeicons/core-free-icons"

import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  const iconSize = 20

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className=""
          render={(triggerProps) => (
            <Button
              {...triggerProps}
              className="cursor-pointer rounded-full bg-accent"
              size="icon"
              variant="ghost"
            >
              <HugeiconsIcon
                icon={Sun02Icon}
                size={iconSize}
                className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
              />
              <HugeiconsIcon
                icon={Moon02Icon}
                size={iconSize}
                className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
              />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        ></DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {/* Light */}
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="cursor-pointer"
          >
            <HugeiconsIcon icon={Sun02Icon} size={iconSize} className="mr-2" />
            Light
            {theme === "light" && (
              <HugeiconsIcon
                icon={Check}
                size={18}
                className="ml-auto text-primary"
              />
            )}
          </DropdownMenuItem>

          <div className="p-0.5" />

          {/* Dark */}
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="cursor-pointer"
          >
            <HugeiconsIcon icon={Moon02Icon} size={iconSize} className="mr-2" />
            Dark
            {theme === "dark" && (
              <HugeiconsIcon
                icon={Check}
                size={18}
                className="ml-auto text-primary"
              />
            )}
          </DropdownMenuItem>

          <div className="p-0.5" />

          {/* System */}
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="cursor-pointer"
          >
            <HugeiconsIcon icon={Laptop} size={iconSize} className="mr-2" />
            System
            {theme === "system" && (
              <HugeiconsIcon
                icon={Check}
                size={18}
                className="ml-auto text-primary"
              />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
