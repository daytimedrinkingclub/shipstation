import FeaturesSection from "@/components/blocks/features-section";
import { HeroParallaxDemo } from "./landing";
import { FloatingNavDemo } from "@/components/blocks/floating-navbar";
import { BottomHero } from "@/components/blocks/bottom-hero";
import { LinkPreviewSection } from "@/components/blocks/link-previews";
import { Footer } from "@/components/blocks/footer";
import { EditorScroll } from "@/components/blocks/editor-scroll";
export default function Home() {
  return (
    <div className="landing dark">
      <FloatingNavDemo />
      <HeroParallaxDemo />
      <FeaturesSection />
      <EditorScroll />
      <LinkPreviewSection />
      <BottomHero />
      <Footer />
    </div>
  );
}
