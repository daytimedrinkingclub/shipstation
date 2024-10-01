import FeaturesSection from "@/components/blocks/features-section";
import { HeroParallaxDemo } from "./landing";
import { FloatingNavDemo } from "@/components/blocks/floating-navbar";
import Pricing from "@/components/blocks/pricing";
import { BottomHero } from "@/components/blocks/bottom-hero";
import { LinkPreviewSection } from "@/components/blocks/link-previews";

export default function Home() {
  return (
    <div className="landing dark">
      <FloatingNavDemo />
      <HeroParallaxDemo />
      <FeaturesSection />
      <LinkPreviewSection />  
      <BottomHero />
      {/* <Pricing /> */}
    </div>
  );
}
