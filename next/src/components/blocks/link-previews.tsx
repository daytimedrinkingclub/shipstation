"use client";
import React from "react";
import { LinkPreview } from "@/components/ui/link-preview";

export function LinkPreviewSection() {
  return (
    <div className="flex justify-center items-center h-[20rem] sm:h-[30rem] flex-col px-12">
      <p className="text-neutral-500 dark:text-neutral-400 text-xl md:text-3xl max-w-3xl mx-auto mb-10">
        <LinkPreview
          url="https://shipstation.ai/site/seedhe-maut-HVSdZ58o/"
          className="font-bold"
        >
          Seedhe Maut
        </LinkPreview>{" "}
        and{" "}
        <LinkPreview
          url="https://shipstation.ai/site/kr-na-yHm3qLaE/"
          className="font-bold"
        >
          KR$NA
        </LinkPreview>{" "}
        have already used ShipStation (I guess)
      </p>
      <p className="text-neutral-500 dark:text-neutral-400 text-xl md:text-3xl max-w-3xl mx-auto">
        We create landing pages for our own{" "}
        <LinkPreview
          url="https://shipstation.ai/site/teacherop-_z1WTfKk/"
          className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-pink-500"
        >
          products
        </LinkPreview>{" "}
        on ShipStation (for sure)
      </p>
    </div>
  );
}
