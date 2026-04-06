"use client"
import Image from "next/image"
import { CreateBusinessDialog } from "@/components/createBusiness"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useUserProfile } from "@/context/userContext"
import { useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChevronRight } from "@hugeicons/core-free-icons"

const Onboarding = () => {
  const router = useRouter()
  const { business } = useUserProfile()

  useEffect(() => {
    if (business) {
      router.push("/dashboard")
    }
  }, [business, router])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 lg:grid lg:grid-cols-2 lg:gap-12">
      <div className="order-1 flex items-center justify-center lg:order-0">
        <Image
          src="/onboarding.svg"
          alt="Onboarding Illustration"
          width={600}
          height={400}
          className="h-auto w-full max-w-md object-contain lg:max-w-lg xl:max-w-xl"
          priority
        />
      </div>

      <div className="order-2 flex flex-col items-start justify-center px-4 text-center lg:order-0 lg:px-8 lg:text-left">
        <h1 className="mb-4 font-heading text-3xl font-bold text-primary">
          Welcome to <span className="text-yellow-500">Alfajiri!</span>
        </h1>
        <p className="mx-auto mb-2 max-w-2xl text-gray-700 max-md:hidden lg:mx-0">
          Alfajiri is your all-in-one inventory management and point-of-sale
          system designed to simplify running your business.
        </p>
        <p className="mx-auto mb-6 max-w-2xl text-gray-700 lg:mx-0">
          Get started in minutes — create your first business and begin tracking
          stock, managing sales, and growing with ease.
        </p>
        <CreateBusinessDialog
          trigger={
            <Button type="button" className="w-fit cursor-pointer">
              Continue
              <HugeiconsIcon
                icon={ChevronRight}
                size={16}
                className="transition-transform group-data-[state=open]:rotate-90"
              />
            </Button>
          }
          onSuccess={(business) => {
            console.log(business)
            router.push("/dashboard")
          }}
        />
      </div>
    </div>
  )
}

export default Onboarding
