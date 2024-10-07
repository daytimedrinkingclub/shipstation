import { HelpCircle, Code, Ship } from "lucide-react";

const Footer = () => {
  return (
    <footer className="p-4 flex justify-center container">
      <div className="flex items-center gap-4 flex-wrap justify-end">
        <a
          href="mailto:anuj@daytimedrinkingclub.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <HelpCircle height={16} width={16} />
          Help
        </a>
        <a
          href="https://github.com/daytimedrinkingclub/shipstation"
          target="_blank"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <Code height={16} width={16} />
          GitHub
        </a>
        <a
          href="https://discord.gg/wMNmcmq3SX"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <Ship height={16} width={16} />
          Discord
        </a>
      </div>
    </footer>
  );
};

export default Footer;
