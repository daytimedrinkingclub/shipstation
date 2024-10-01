import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconShip,
  IconBrandDiscord,
  IconBrandGithub,
} from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="block">
      {/* Container */}
      <div className="py-16 md:py-20 mx-auto w-full max-w-7xl px-5 md:px-10">
        {/* Component */}
        <div className="flex-col flex items-center">
          <div className="inline-flex items-center mb-6">
            <Image
              src="/ship.svg"
              alt=""
              width={32}
              height={32}
              className="mr-2"
            />
            <h1 className="text-2xl font-bold cursor-pointer">ShipStation</h1>
          </div>
          <div className="text-center font-semibold">
            <Link
              href="mailto:anuj@daytimedrinking.club"
              className="inline-block px-6 py-2 font-normal text-white transition hover:text-gray-400"
            >
              Help & Support
            </Link>
            <Link
              href="contact.html"
              className="inline-block px-6 py-2 font-normal text-white transition hover:text-gray-400"
            >
              Contact Us
            </Link>
            <Link
              href="privacy.html"
              className="inline-block px-6 py-2 font-normal text-white transition hover:text-gray-400"
            >
              Privacy Policy
            </Link>
            <Link
              href="terms.html"
              className="inline-block px-6 py-2 font-normal text-white transition hover:text-gray-400"
            >
              Terms of Service
            </Link>
            <Link
              href="refunds.html"
              className="inline-block px-6 py-2 font-normal text-white transition hover:text-gray-400   "
            >
              Refund Policy
            </Link>
          </div>
          <div className="mb-8 mt-8 border-b border-gray-300 w-48"></div>
          <div className="mb-12 grid-cols-2 grid-flow-col grid gap-3">
            <Link
              href="https://github.com/daytimedrinkingclub/shipstation"
              target="_blank"
              className="mx-auto flex-col flex items-center justify-center text-white"
            >
              <IconBrandGithub className="w-6 h-6" /> Star us on Github
            </Link>
            <Link
              href="https://discord.gg/wMNmcmq3SX"
              target="_blank"
              className="mx-auto flex-col flex items-center justify-center text-white"
            >
              <IconBrandDiscord className="w-6 h-6" /> Join our Discord
            </Link>
          </div>
          <p className="text-sm sm:text-base">
            © 2024. Powered by{" "}
            <Link
              href="https://incubatorop.com"
              target="_blank"
              className="text-white hover:underline"
            >
              IncubatorOP
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
