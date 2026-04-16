/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"

export default function BarcodeScannerPOS() {
  const [scannedItems, setScannedItems] = useState<string[]>([])
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader
    let controls: any

    if (scanning) {
      codeReader = new BrowserMultiFormatReader()

      controls = codeReader
        .decodeFromVideoDevice(undefined, "video", (result, err) => {
          if (result) {
            const text = result.getText()

            setScannedItems((prev) => {
              // avoid duplicates back-to-back
              if (prev[0] === text) return prev
              return [text, ...prev]
            })
          }
        })
        .catch(console.error)
    }

    return () => {
      if (controls) {
        controls.stop()
      }
    }
  }, [scanning])

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">POS Barcode Scanner</h1>

      <button
        onClick={() => setScanning(!scanning)}
        className="mb-4 rounded bg-black px-4 py-2 text-white"
      >
        {scanning ? "Stop Scanning" : "Start Scanning"}
      </button>

      {scanning && <video id="video" className="mb-4 w-full rounded border" />}

      <div>
        <h2 className="mb-2 font-semibold">Scanned Items</h2>
        <ul className="space-y-2">
          {scannedItems.map((item, index) => (
            <li key={index} className="flex justify-between rounded border p-2">
              <span>{item}</span>
              <span className="text-sm text-gray-500">#{index + 1}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
