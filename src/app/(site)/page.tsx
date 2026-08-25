import Hero from "@/components/home/Hero";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import WhyBuildWithAcorn from "@/components/home/WhyBuildWithAcorn";
import IntroBlurb from "@/components/home/IntroBlurb";
import HowWeWork from "@/components/home/HowWeWork";
import GalleryPreview from "@/components/home/GalleryPreview";
import Testimonials from "@/components/home/Testimonials";
import FinalCtaBanner from "@/components/shared/FinalCtaBanner";

// The gallery and testimonials sections read client-editable content from the
// database, so this page renders per request instead of being baked in at
// build time (which would freeze the content and make the build need MySQL).
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <WhyBuildWithAcorn />
      <IntroBlurb />
      <HowWeWork />
      <GalleryPreview />
      <Testimonials />
      <FinalCtaBanner />
    </>
  );
}
