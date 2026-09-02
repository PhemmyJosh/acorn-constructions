import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import { company } from "@/data/company";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Acorn Construction Ltd. collects, uses and protects the information you submit through the contact, estimate and careers forms on this website.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />

      <Section tone="cream">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <p className="text-sm text-acorn-charcoal/60">Last updated: {lastUpdated}</p>

          <p className="text-base leading-relaxed text-acorn-charcoal/70">
            Acorn Construction Ltd. (&ldquo;Acorn,&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This
            policy explains what information we collect through this website,
            how we use it, and your rights regarding that information.
          </p>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-acorn-charcoal">Information We Collect</h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              When you use our contact form, we collect the information you
              provide, which may include your name, email address, phone
              number, and message. We do not collect payment or financial
              information through this website.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-acorn-charcoal">How We Use Your Information</h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              We use the information you provide solely to respond to your
              inquiry, provide quotes, and communicate with you about
              potential or ongoing projects. We do not sell, rent, or trade
              your personal information to third parties.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-acorn-charcoal">Cookies and Analytics</h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              This site may use basic analytics tools to understand website
              traffic and improve user experience. Any such tools collect
              anonymized or aggregated data and do not identify you
              personally unless you have submitted information through our
              contact form.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-acorn-charcoal">Data Security</h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              We take reasonable steps to protect the information you share
              with us. However, no method of transmission over the internet
              is completely secure, and we cannot guarantee absolute
              security.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-acorn-charcoal">Your Rights</h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              Under Canada&apos;s Personal Information Protection and
              Electronic Documents Act (PIPEDA), you have the right to
              access, correct, or request deletion of your personal
              information held by us. To make such a request, please contact
              us using the information below.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-acorn-charcoal">Third-Party Links</h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              Our website may contain links to third-party sites, such as our
              social media pages. We are not responsible for the privacy
              practices of those external sites.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-acorn-charcoal">Changes to This Policy</h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              We may update this policy from time to time. Any changes will
              be posted on this page with an updated effective date.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-acorn-bronze/20 pt-8">
            <h2 className="text-xl font-semibold text-acorn-charcoal">Contact Us</h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              If you have questions about this policy or how we handle your
              information, please contact us:
            </p>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              {company.legalName}
              <br />
              {company.email}
              <br />
              {company.phoneDisplay}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
