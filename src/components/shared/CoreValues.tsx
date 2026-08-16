import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { coreValues } from "@/data/coreValues";
import { photos } from "@/data/photos";

interface CoreValuesProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

export default function CoreValues({
  eyebrow = "Our Core Values",
  title = "Live the values, build the company",
  description,
}: CoreValuesProps) {
  return (
    <section className="relative overflow-hidden bg-acorn-charcoal py-16 text-acorn-cream sm:py-20 lg:py-28">
      <Image
        src={photos.bwPrairie}
        alt=""
        fill
        className="object-cover opacity-[0.08]"
      />
      <Container className="relative z-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          tone="dark"
          align="center"
          className="mx-auto"
        />
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="flex flex-col items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acorn-gold text-acorn-charcoal">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-acorn-cream">{value.title}</h3>
                <p className="text-sm leading-relaxed text-acorn-cream/60">{value.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
