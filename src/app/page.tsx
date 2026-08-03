import Hero from "@/components/home/Hero";
import IntroBlurb from "@/components/home/IntroBlurb";
import ServicesOverview from "@/components/home/ServicesOverview";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <IntroBlurb />
      <ServicesOverview />
      <WhyChooseUs />
      <Testimonials />
      <FinalCta />
    </>
  );
}
