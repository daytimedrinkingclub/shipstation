import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Footer = () => {
  return (
    <footer className="p-4 flex justify-between items-center container">
      <div>
        <Button
          variant="link"
          className="text-gray-400 hover:text-white"
          asChild
        >
          <a
            href="mailto:anuj@daytimedrinkingclub.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Help and Support
          </a>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" className="text-gray-400 hover:text-white">
              Legal
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-zinc-800 border-zinc-700 ml-8">
            <ul className="space-y-2">
              <li>
                <a
                  href="/contact.html"
                  className="text-gray-300 hover:text-white"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/terms.html"
                  className="text-gray-300 hover:text-white"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy.html"
                  className="text-gray-300 hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/refunds.html"
                  className="text-gray-300 hover:text-white"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center flex-col sm:flex-row gap-4">
        <a
          href="https://github.com/daytimedrinkingclub/shipstation"
          target="_blank"
          className="text-gray-300 inline-flex items-center gap-1 hover:text-white"
        >
          <Star height={16} width={16} />Star us on GitHub
        </a>
        <a
          href="https://discord.gg/zKJ8WKwFzm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 inline-flex items-center gap-1 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-circle"
          >
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          Join us on Discord
        </a>
      </div>
    </footer>
  );
};

export default Footer;
