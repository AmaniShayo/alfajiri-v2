"use client"
import React, { useEffect, useState } from "react"
import { SidebarTrigger } from "./ui/sidebar"
import { ModeToggle } from "./themeToggle"
import { HugeiconsIcon } from "@hugeicons/react"
import { Expand, Minimize } from "@hugeicons/core-free-icons"
import { Button } from "./ui/button"
import useUserProfile from "@/context/userContext"
import { Separator } from "./ui/separator"

const Header = () => {
  const { business } = useUserProfile()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullScreen = () => {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>
      mozCancelFullScreen?: () => Promise<void>
      msExitFullscreen?: () => Promise<void>
      webkitFullscreenElement?: Element
      mozFullScreenElement?: Element
      msFullscreenElement?: Element
    }

    const elem = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>
      mozRequestFullScreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }

    const isCurrentlyFullscreen = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    )

    if (isCurrentlyFullscreen) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen()
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen()
      }
    } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element
        mozFullScreenElement?: Element
        msFullscreenElement?: Element
      }

      const isNowFullscreen = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      )
      setIsFullscreen(isNowFullscreen)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      )
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      )
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  return (
    <div className="z-50 flex h-12 items-center border-b p-2">
      <div className="flex min-w-0 flex-1 items-center">
        <SidebarTrigger />
        <Separator className="mx-2" orientation="vertical" />
        <div className="ml-2">
          <div className="truncate text-sm font-semibold">
            {business?.businessName}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          onClick={toggleFullScreen}
          className="rounded-full border-none shadow-none"
          variant="outline"
        >
          <HugeiconsIcon
            icon={isFullscreen ? Minimize : Expand}
            className="h-4 w-4"
          />
        </Button>
        <ModeToggle />
      </div>
    </div>
  )
}

export default Header
