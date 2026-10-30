import Link from "next/link";

/** Sticky page-level bar under the global nav, as on Apple product pages. */
export default function LocalNav({
  title,
  href,
  links = [],
  cta,
}: {
  title: string;
  href: string;
  links?: { href: string; label: string }[];
  cta: { href: string; label: string };
}) {
  return (
    <div className="sticky top-[var(--header-h)] z-30 border-b border-black/10 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[52px] w-full max-w-[1024px] items-center justify-between gap-6 px-5 sm:px-6">
        <Link href={href} className="truncate text-[19px] font-semibold tracking-[-0.01em] text-[#1d1d1f] md:text-[21px]">
          {title}
        </Link>
        <div className="flex shrink-0 items-center gap-6">
          {links.length > 0 && (
            <ul className="hidden items-center gap-6 text-[12px] text-[#1d1d1f]/80 md:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-[#a01010]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={cta.href}
            className="ncs-button rounded-none bg-[#a01010] px-3.5 py-[5px] text-[12px] text-white transition-colors hover:bg-[#c41616]"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
