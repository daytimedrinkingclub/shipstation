"use client";
import React from "react";
import { BackgroundBeams } from "../ui/background-beams";
import Link from "next/link";
import { IconSquareRoundedCheck } from "@tabler/icons-react";

export function BottomHero() {
  return (
    <div className="h-[50rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased z-1000" id="pricing">
      <div className="p-4">
        <section>
          <div className="mx-auto w-full max-w-7xl">
            <h1 className="relative text-3xl md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
              Pay once, enjoy forever
            </h1>
            <p className="text-neutral-500 max-w-lg mx-auto my-2 text-xl text-center relative">
              Monthly fees? We don't think so!
            </p>
            <div className="rounded-xl  px-6">
              <div className="mx-auto grid h-auto w-full gap-4 rounded-md px-0 py-12 lg:grid-cols-2">
                <div className="grid grid-cols-1 gap-4 rounded-md border border-gray-700/10 bg-gray-700/10 px-10 py-14 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <IconSquareRoundedCheck />
                    <p className="text-sm sm:text-base">
                      Unlimited refinements with AI
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconSquareRoundedCheck />
                    <p className="text-sm sm:text-base">
                      Upload images and assets
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconSquareRoundedCheck />
                    <p className="text-sm sm:text-base">
                      Connect custom domain
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconSquareRoundedCheck />
                    <p className="text-sm sm:text-base">
                      Lifetime access to all features
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconSquareRoundedCheck />
                    <p className="text-sm sm:text-base">Early bird price</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconSquareRoundedCheck />
                    <p className="text-sm sm:text-base">Premium Support</p>
                  </div>
                </div>
                <div className="flex flex-col rounded-md bg-black px-10 py-12 text-white">
                  <div className="flex w-full flex-col items-center justify-between sm:flex-row sm:items-center">
                    <h2 className="text-3xl font-bold md:text-5xl">
                      $4
                      <span className="pl-2 text-sm font-light sm:text-lg">
                        per site
                      </span>
                    </h2>
                    <Link
                      href="/app"
                      className="mt-4 z-1 cursor-pointer rounded-md bg-white px-6 py-3 text-center font-semibold text-black md:mt-0 hover:bg-gray-200 transition-colors duration-200"
                    >
                      Get started
                    </Link>
                  </div>
                  <div className="mb-6 mt-6 border border-gray-100"></div>
                  <p className="text-white text-sm sm:text-base">
                    7 days money back guarantee. If you don't get what you paid
                    for, our CTO will personally code a solution for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <BackgroundBeams />
    </div>
  );
}
