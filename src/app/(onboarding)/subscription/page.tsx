"use client"

import React, { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"

interface ScanItem {
  code: string
  time: Date
}

export default function POSBarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const lastScanRef = useRef<string | null>(null)

  const [scanning, setScanning] = useState(false)
  const [items, setItems] = useState<ScanItem[]>([])

  // START SCANNER
  const startScanner = async () => {
    if (scanning) return

    const reader = new BrowserMultiFormatReader()
    codeReaderRef.current = reader

    setScanning(true)

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices()
      const deviceId = devices[0]?.deviceId

      await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const text = result.getText()

            // prevent duplicate spam
            if (lastScanRef.current === text) return

            lastScanRef.current = text

            const newItem = {
              code: text,
              time: new Date(),
            }

            setItems((prev) => [newItem, ...prev].slice(0, 50))

            // vibration feedback (POS feel)
            navigator.vibrate?.(50)

            // reset after 1.5s
            setTimeout(() => {
              lastScanRef.current = null
            }, 1500)
          }
        }
      )
    } catch (err) {
      console.error("Camera error:", err)
      setScanning(false)
    }
  }

  // STOP SCANNER
  const stopScanner = () => {
    codeReaderRef.current = null
    setScanning(false)
  }

  useEffect(() => {
    return () => stopScanner()
  }, [])

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-center text-3xl font-bold">
          POS Barcode Scanner
        </h1>

        {/* CAMERA */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gray-900">
          <video ref={videoRef} className="aspect-video w-full object-cover" />

          {scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[120px] w-[85%] rounded-lg border border-green-400">
                <div className="animate-scan absolute right-0 left-0 h-[2px] bg-green-400" />
              </div>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="mb-6 flex gap-3">
          {!scanning ? (
            <button
              onClick={startScanner}
              className="flex-1 rounded-xl bg-green-600 py-3"
            >
              Start
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="flex-1 rounded-xl bg-red-600 py-3"
            >
              Stop
            </button>
          )}
        </div>

        {/* LIST */}
        <div className="max-h-[300px] overflow-y-auto rounded-2xl bg-gray-900 p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">No scans yet</p>
          ) : (
            items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-gray-800 py-2"
              >
                <span className="font-mono">{item.code}</span>
                <span className="text-xs text-gray-400">
                  {item.time.toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 10%;
          }
          100% {
            top: 90%;
          }
        }
        .animate-scan {
          position: absolute;
          animation: scan 1.5s linear infinite;
        }
      `}</style>
    </div>
  )
}
