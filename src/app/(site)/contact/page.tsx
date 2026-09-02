import { Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/contact/ContactForm";
import LocationMap from "@/components/contact/LocationMap";
import { company } from "@/data/company";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Our Lloydminster, Alberta Office",
  description:
    "Reach Acorn Construction Ltd. in Blackfoot, Alberta by phone or email, or send a message about a framing, foundation or post frame project anywhere in AB or SK.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get In Touch"
        title="Let's talk about your project"
        description="Tell us a bit about what you're building and we'll follow up with next steps, usually within one business day."
      />

      <Section tone="cream">
        <div className="grid gap-14 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-semibold text-acorn-charcoal">Send us a message</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-2">
            <div className="flex flex-col gap-5">
              <h2 className="text-2xl font-semibold text-acorn-charcoal">Contact Information</h2>
              <div className="flex items-start gap-3 text-sm text-acorn-charcoal/70">
                <MapPin size={18} className="mt-0.5 shrink-0 text-acorn-gold" />
                <span>
                  {company.address.line1}
                  <br />
                  {company.address.cityStateZip}
                </span>
              </div>
              <a
                href={company.phoneHref}
                className="flex items-center gap-3 text-sm text-acorn-charcoal/70 transition-colors hover:text-acorn-gold"
              >
                <Phone size={18} className="shrink-0 text-acorn-gold" />
                {company.phoneDisplay}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-3 text-sm text-acorn-charcoal/70 transition-colors hover:text-acorn-gold"
              >
                <Mail size={18} className="shrink-0 text-acorn-gold" />
                {company.email}
              </a>
            </div>

            <LocationMap />
          </div>
        </div>
      </Section>
    </>
  );
}
