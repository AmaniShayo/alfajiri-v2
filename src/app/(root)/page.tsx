"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loading } from "@/components/loading"

const Home = () => {
  const router = useRouter()
  useEffect(() => {
    router.push("/pos")
  }, [router])

  return <Loading />
}

export default Home
