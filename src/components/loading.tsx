import { icons } from "@/constants/icons"

export const Loading = () => {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center stroke-primary">
      <div className="absolute flex h-full w-full items-center justify-center">
        <p className="animate-bounce text-xs font-semibold text-yellow-500 uppercase">
          Alfajiri
        </p>
      </div>
      {icons.loading}
    </div>
  )
}
