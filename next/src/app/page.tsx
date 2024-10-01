import FeaturesSectionDemo2 from "@/components/blocks/features-section-demo-2";
import FeaturesSectionDemo3 from "@/components/blocks/features-section-demo-3";
import { HeroParallaxDemo } from "./landing";
import { FloatingNavDemo } from "@/components/blocks/floating-navbar";
import Pricing from "@/components/blocks/pricing";

export default function Home() {
  return (
    <div className="landing dark">
      <FloatingNavDemo />
      <HeroParallaxDemo />
      <FeaturesSectionDemo3 />
      <FeaturesSectionDemo2 />
      {/* <Pricing /> */}
    </div>
  );
}
