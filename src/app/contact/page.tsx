import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/contact/ContactForm";
import MapPlaceholder from "@/components/contact/MapPlaceholder";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Contact | Acorn Constructions",
  description:
    "Get in touch with Acorn Constructions for a quote on your next residential, commercial, or specialty construction project.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get In Touch"
        title="Let's talk about your project"
        description="Tell us a bit about what you're building and we'll follow up with next steps, usually within one business day."
      />

      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-semibold text-stone-900">Send us a message</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-2">
            <div className="flex flex-col gap-5">
              <h2 className="text-2xl font-semibold text-stone-900">Contact Information</h2>
              <div className="flex items-start gap-3 text-sm text-stone-600">
                <MapPin size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  {company.address.line1}, {company.address.line2}
                  <br />
                  {company.address.cityStateZip}
                </span>
              </div>
              <a
                href={company.phoneHref}
                className="flex items-center gap-3 text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                <Phone size={18} className="shrink-0 text-amber-600" />
                {company.phoneDisplay}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-3 text-sm text-stone-600 transition-colors hover:text-amber-600"
              >
                <Mail size={18} className="shrink-0 text-amber-600" />
                {company.email}
              </a>
              <div className="flex items-start gap-3 text-sm text-stone-600">
                <Clock size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  Monday &ndash; Friday: 7:00am &ndash; 5:00pm
                  <br />
                  Saturday: By appointment
                </span>
              </div>
            </div>

            <MapPlaceholder />
          </div>
        </div>
      </Section>
    </>
  );
}
