import Hero from "@/components/home/Hero";
import IntroBlurb from "@/components/home/IntroBlurb";
import ServicesOverview from "@/components/home/ServicesOverview";
import CoreValues from "@/components/shared/CoreValues";
import LeadershipTeaser from "@/components/home/LeadershipTeaser";
import Testimonials from "@/components/home/Testimonials";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <IntroBlurb />
      <ServicesOverview />
      <CoreValues />
      <LeadershipTeaser />
      <Testimonials />
      <FinalCta />
    </>
  );
}
