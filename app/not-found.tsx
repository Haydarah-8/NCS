import Link from "next/link";
import PageHero from "@/components/PageHero";
import { btnPrimary, btnSecondary } from "@/lib/styles";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <article className="bg-white pb-24 text-[#1d1d1f]">
      <PageHero
        eyebrow="404"
        title="That page is not here."
        intro="The address may have changed. The services and the office have not."
      >
        <Link href="/" className={btnPrimary}>
          Back to home
        </Link>
        <Link href="/#services" className={btnSecondary}>
          Our services
        </Link>
      </PageHero>
    </article>
  );
}
