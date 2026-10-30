"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Service } from "@/src/data";
import ServiceCard from "@/components/ServiceCard";

export default function ServiceMarquee({ services }: { services: Service[] }) {
  const [paused, setPaused] = useState(false);
  const repetitions = services.length ? Math.ceil(12 / services.length) : 0;
  const loopServices = Array.from({ length: repetitions }, () => services).flat();
  return (
    <div className="service-marquee mt-10 md:mt-14" data-paused={paused}>
      <div className="mx-auto mb-4 flex max-w-[1136px] justify-end px-6">
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Resume automatic service scrolling" : "Pause automatic service scrolling"}
          className="service-marquee-control inline-flex items-center gap-2 px-3 py-2 text-[13px] text-[#6e6e73] transition hover:text-[#a01010] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a01010]"
        >
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? "Resume scrolling" : "Pause scrolling"}
        </button>
      </div>
      <div className="service-marquee-window overflow-x-auto" role="region" aria-label="Our security services">
        <div className="service-marquee-track flex w-max" style={{ animationDuration: `${loopServices.length * 7.5}s` }}>
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className={`service-marquee-copy flex items-stretch gap-6 pr-6 ${copy === 1 ? "service-marquee-duplicate" : ""}`}>
              {loopServices.map((service, index) => (
                <li key={`${service.slug}-${index}`} aria-hidden={copy === 1 || index >= services.length ? true : undefined} className={`w-[280px] shrink-0 sm:w-[320px] ${index >= services.length ? "service-marquee-filler" : ""}`}>
                  <ServiceCard service={service} duplicate={copy === 1 || index >= services.length} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
