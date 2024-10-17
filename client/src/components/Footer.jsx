import { HelpCircle, Ship, Star } from "lucide-react";

const Footer = () => {
  return (
    <footer className="flex justify-center p-4">
      <div className="flex items-center gap-4 flex-col sm:flex-row">
        <a
          href="https://github.com/daytimedrinkingclub/shipstation"
          target="_blank"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <Star height={16} width={16} />
          Star us on GitHub
        </a>
        <a
          href="https://discord.gg/wMNmcmq3SX"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <Ship height={16} width={16} />
          Join our Discord
        </a>
        <a
          href="mailto:anuj@daytimedrinkingclub.com"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <HelpCircle height={16} width={16} />
          Contact us
        </a>
      </div>
    </footer>
  );
};

export default Footer;
