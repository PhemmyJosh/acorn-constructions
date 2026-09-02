import Hero from "@/components/home/Hero";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import WhyBuildWithAcorn from "@/components/home/WhyBuildWithAcorn";
import IntroBlurb from "@/components/home/IntroBlurb";
import HowWeWork from "@/components/home/HowWeWork";
import GalleryPreview from "@/components/home/GalleryPreview";
import Testimonials from "@/components/home/Testimonials";
import FinalCtaBanner from "@/components/shared/FinalCtaBanner";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Framing & Post Frame Builders in Lloydminster",
  description:
    "Acorn Construction Ltd. builds residential and light commercial wood frame, foundations and post frame projects across Alberta and Saskatchewan since 2011.",
  path: "/",
});

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
