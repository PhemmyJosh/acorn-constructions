import Hero from "@/components/home/Hero";
import StatStrip from "@/components/home/StatStrip";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import IntroBlurb from "@/components/home/IntroBlurb";
import CoreValues from "@/components/shared/CoreValues";
import Testimonials from "@/components/home/Testimonials";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <StatStrip />
      <CategoryShowcase />
      <IntroBlurb />
      <CoreValues />
      <Testimonials />
      <FinalCta />
    </>
  );
}
