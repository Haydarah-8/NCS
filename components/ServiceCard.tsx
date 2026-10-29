import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Service } from "@/src/data";

export default function ServiceCard({ service, className = "" }: { service: Service; className?: string }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className={`group flex flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015] hover:shadow-[0_14px_44px_rgba(0,0,0,0.13)] ${className}`}
    >
      <div className="px-7 pt-7">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#a01010]">{service.kicker}</p>
        <h3 className="mt-1.5 text-[24px] font-semibold leading-tight tracking-[-0.015em] text-[#1d1d1f]">
          {service.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-[#6e6e73]">{service.summary}</p>
        <span className="mt-3 inline-flex items-center text-[15px] text-[#a01010] group-hover:underline">
          Learn more <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-auto px-3 pt-2">
        <img
          src={service.image}
          alt=""
          className="aspect-[16/10] w-full object-contain transition duration-700 group-hover:scale-[1.03]"
        />
      </div>
    </Link>
  );
}
