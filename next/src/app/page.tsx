import FeaturesSectionDemo2 from "@/components/blocks/features-section-demo-2";
import FeaturesSectionDemo3 from "@/components/blocks/features-section-demo-3";
import { HeroParallaxDemo } from "./landing";
import { NavbarDemo } from "@/components/blocks/floating-navbar";

export default function Home() {
  return (
    <div className="landing dark">
      {/* <NavbarDemo /> */}
      <HeroParallaxDemo />
      <FeaturesSectionDemo3 />
      <FeaturesSectionDemo2 />
    </div>
  );
}
