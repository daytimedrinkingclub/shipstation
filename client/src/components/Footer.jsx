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
            href="https://discord.gg/zKJ8WKwFzm"
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
          <Star height={16} width={16} /> us on GitHub
        </a>
        <a href="https://theresanaiforthat.com/ai/shipstation/?ref=featured&v=1864496" target="_blank" rel="nofollow"><img width="300" src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600" /></a> 
      </div>
    </footer>
  );
};

export default Footer;
