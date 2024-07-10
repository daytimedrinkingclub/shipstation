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
      <div>
        <Button variant="link" className="text-gray-400 hover:text-white" asChild>
          <a href="https://discord.gg/zKJ8WKwFzm" target="_blank" rel="noopener noreferrer">
            Need help?
          </a>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" className="text-gray-400 hover:text-white">
              Support & Policies
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-zinc-800 border-zinc-700 ml-8">
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
      </div>

      <div className="flex items-center flex-col sm:flex-row">
        <a href="https://www.producthunt.com/products/shipstation-2/reviews?utm_source=badge-product_review&utm_medium=badge&utm_souce=badge-shipstation-2" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=592630&theme=dark" alt="ShipStation - Create&#0032;landing&#0032;pages&#0044;&#0032;personal&#0032;websites&#0032;and&#0032;AI&#0032;agents&#0040;soon&#0041; | Product Hunt"
          className="inline-block w-[200px] h-[40px] mr-4"
        /></a>
        <a
          href="https://discord.gg/w7JGfsjt99"
          target="_blank"
          className="inline-block w-[120px] h-[40px] bg-no-repeat bg-center mr-4"
          style={{ backgroundImage: `url(/assets/discord.svg)` }}
          aria-label="Join our Discord"
        ></a>
      </div>
    </footer>
  );
};

export default Footer;
