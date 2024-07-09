// src/components/Footer.jsx
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Footer = () => {
  return (
    <footer className="p-4 flex justify-between items-center container">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="link" className="text-gray-400 hover:text-white">
            Support & Policies
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-gray-800 border-gray-700">
          <ul className="space-y-2">
            <li>
              <a href="/contact" className="text-gray-300 hover:text-white">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/terms" className="text-gray-300 hover:text-white">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-gray-300 hover:text-white">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/refunds" className="text-gray-300 hover:text-white">
                Refund Policy
              </a>
            </li>
          </ul>
        </PopoverContent>
      </Popover>
      <a
        href="https://discord.gg/w7JGfsjt99"
        target="_blank"
        className="inline-block w-[120px] h-[40px] bg-no-repeat bg-center mr-4"
        style={{ backgroundImage: `url(/assets/discord.svg)` }}
        aria-label="Join our Discord"
      ></a>
    </footer>
  );
};

export default Footer;
