import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCreditCardRefund,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconMessageChatbot,
  IconMoodSmileBeam,
  IconPencil,
  IconPencilHeart,
  IconRouteAltLeft,
  IconSparkles,
  IconTerminal2,
  IconWorldUpload,
} from "@tabler/icons-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Built for everyone",
      description: "Anyone can use it, no coding/design skills required.",
      icon: <IconMoodSmileBeam />,
    },
    {
      title: "AI powered Copywriting",
      description: "Bye Bye Lorem Ipsum, Hello intelligent copywriting.",
      icon: <IconPencilHeart />,
    },
    {
      title: "Chat with your project",
      description:
        "Update your website design by chatting with our project editor.",
      icon: <IconMessageChatbot />,
    },
    {
      title: "Connect your domain",
      description: "Connect with your domain. Free SSL included.",
      icon: <IconWorldUpload />,
    },
    {
      title: "Pricing like no other",
      description: "Try finding a cheaper alternative and then come back here!",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Powered by Sonnet 3.5",
      description:
        "We use only the best AI to help you create your landing page.",
      icon: <IconSparkles />,
    },
    {
      title: "24/7 Customer Support",
      description:
        "We are available a 100% of the time. Atleast our AI Agents are.",
      icon: <IconHelp />,
    },
    {
      title: "Money back guarantee",
      description:
        "If you do not get a 5 star experience, we will give you a full refund.",
      icon: <IconCreditCardRefund />,
    },
  ];
  return (
    <>
      <div className="relative z-20 py-10 max-w-7xl mx-auto" id="features">
        <div className="px-8">
          <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
            ShipStation is all you need to go live 🚀
            <br />
          </h4>

          <p className="text-xl  max-w-4xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
            You can spend hours digging the right template, hiring a developer,
            paying for hosting! <br /> Or just use ShipStation 😍
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
