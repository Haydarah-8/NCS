import { Plus } from "lucide-react";

export default function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-[#d2d2d7]">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-[#d2d2d7]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[19px] font-semibold tracking-[-0.01em] text-[#1d1d1f] md:text-[24px] [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus
              className="size-6 shrink-0 text-[#6e6e73] transition-transform duration-300 group-open:rotate-45"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-[46rem] pb-7 pr-10 text-[17px] leading-relaxed text-[#6e6e73] md:text-[19px]">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
