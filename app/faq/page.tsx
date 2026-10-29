import { faqs } from "@/src/data";
import CtaPanel from "@/components/CtaPanel";
import FaqList from "@/components/FaqList";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { narrow } from "@/lib/styles";

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <article className="bg-white text-[#1d1d1f]">
      <PageHero
        compact
        eyebrow="FAQ"
        title="Need some help?"
        intro="The office, the control room, and the services. Short answers to the questions we hear most."
      />
      <Reveal className={`${narrow} pb-8`}>
        <FaqList items={faqs} />
      </Reveal>
      <CtaPanel title="Still have a question?" />
    </article>
  );
}
