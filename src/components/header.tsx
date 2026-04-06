"use client";
import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./themeToggle";
import { Expand, Minimize } from "lucide-react";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";
import useUserProfile from "@/context/userContext";

const Header = () => {
  const { user, business } = useUserProfile();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      mozCancelFullScreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
      webkitFullscreenElement?: Element;
      mozFullScreenElement?: Element;
      msFullscreenElement?: Element;
    };

    const elem = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    const isCurrentlyFullscreen = Boolean(
      doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
    );

    if (isCurrentlyFullscreen) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
      };

      const isNowFullscreen = Boolean(
        doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  return (
    <div className="py-2 px-2 border-b h-12 z-50 flex items-center bg-white dark:bg-black">
      <div className="flex items-center flex-1 min-w-0">
        <SidebarTrigger />
        <div className="ml-2 flex flex-col min-w-0">
          <div className="font-semibold text-sm truncate">
            {business?.businessName}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          onClick={toggleFullScreen}
          className="border-none shadow-none rounded-full"
          variant="outline">
          {isFullscreen ? (
            <Minimize className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Expand className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
  );
};

export default Header;
