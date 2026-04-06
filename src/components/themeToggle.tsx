"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="border-none shadow-none rounded-full">
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className={`${
              theme === "light"
                ? "bg-yellow-600 text-white focus:bg-yellow-600 focus:text-white"
                : "cursor-pointer"
            }`}>
            <Sun
              className={`${theme === "light" ? "text-primary-foreground" : "text-primary"} mr-2 h-4 w-4`}
            />
            Light
          </DropdownMenuItem>
          <div className="p-0.5"></div>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className={`${
              theme === "dark"
                ? "bg-yellow-600 text-white focus:bg-yellow-600 focus:text-white"
                : "cursor-pointer"
            }`}>
            <Moon
              className={`${theme === "dark" ? "text-white" : "text-primary"} mr-2 h-4 w-4`}
            />
            Dark
          </DropdownMenuItem>
          <div className="p-0.5"></div>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className={`${
              theme === "system"
                ? "bg-yellow-600 text-white focus:bg-yellow-600 focus:text-white"
                : "cursor-pointer"
            }`}>
            <Laptop
              className={`${theme === "system" ? "text-white" : "text-primary"} mr-2 h-4 w-4`}
            />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
