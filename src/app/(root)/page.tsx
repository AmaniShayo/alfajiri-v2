"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { icons } from "@/constants/icons";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/pos");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen w-screen stroke-yellow-600 relative">
      <div className="absolute w-full h-full flex items-center justify-center">
        <p className="text-xs animate-bounce uppercase font-semibold text-pink-900">
          Alfajiri
        </p>
      </div>
      {icons.loading}
    </div>
  );
};

export default Home;
