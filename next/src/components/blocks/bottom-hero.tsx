"use client";
import React from "react";
import { BackgroundBeams } from "../ui/background-beams";
import { IconArrowRight } from "@tabler/icons-react";

export function BottomHero() {
  return (
    <div className="h-[50rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-3xl md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          Try ShipStation
        </h1>
        <p></p>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-xl text-center relative z-10">
          Ship your next landing page or portfolio with ShipStation
        </p>
        <div className="flex justify-center items-center mt-10">
          <button className="shadow-[0_0_0_3px_#000000_inset] cursor-pointer px-6 py-2 bg-transparent border border-black dark:border-white dark:text-white text-black rounded-lg font-bold transform hover:-translate-y-1 transition duration-400">
            Get Started <IconArrowRight className="w-4 h-4 ml-2 inline-block" />
          </button>
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}
