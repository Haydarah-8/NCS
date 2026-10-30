import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Service } from "@/src/data";

export default function ServiceCard({ service, className = "", duplicate = false, large = false }: { service: Service; className?: string; duplicate?: boolean; large?: boolean }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      tabIndex={duplicate ? -1 : undefined}
      className={`group flex h-full flex-col overflow-hidden rounded-none bg-transparent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#a01010] ${className}`}
    >
      <div className={large ? "px-1 pt-7 sm:px-3 xl:px-5" : "px-7 pt-7"}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#a01010]">{service.kicker}</p>
        <h3 className={`mt-1.5 break-words font-semibold leading-tight tracking-[-0.015em] text-[#1d1d1f] ${large ? "text-[clamp(16px,2.1vw,34px)]" : "text-[24px]"}`}>
          {service.title}
        </h3>
        <p className={`mt-3 break-words leading-relaxed text-[#6e6e73] ${large ? "text-[clamp(12px,1.15vw,18px)]" : "text-[15px]"}`}>{service.summary}</p>
        <span className="mt-3 inline-flex items-center text-[15px] text-[#a01010] group-hover:underline">
          Learn more <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-auto px-3 pt-2">
        <img
          loading="lazy"
          src={service.image}
          alt=""
          className="aspect-[16/10] w-full object-contain transition duration-700 group-hover:scale-[1.03]"
        />
      </div>
    </Link>
  );
}
