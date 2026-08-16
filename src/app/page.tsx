import Hero from "@/components/home/Hero";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import WhyBuildWithAcorn from "@/components/home/WhyBuildWithAcorn";
import IntroBlurb from "@/components/home/IntroBlurb";
import HowWeWork from "@/components/home/HowWeWork";
import GalleryPreview from "@/components/home/GalleryPreview";
import CoreValues from "@/components/shared/CoreValues";
import Testimonials from "@/components/home/Testimonials";
import PhotoCtaBanner from "@/components/home/PhotoCtaBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <WhyBuildWithAcorn />
      <IntroBlurb />
      <HowWeWork />
      <GalleryPreview />
      <CoreValues />
      <Testimonials />
      <PhotoCtaBanner />
    </>
  );
}
