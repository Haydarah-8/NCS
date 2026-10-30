"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";

export type HighlightSlide = {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  links: { href: string; title: string }[];
};

const DURATION = 6000;

export default function HighlightReel({ slides }: { slides: HighlightSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(media.matches);
      if (media.matches) setPaused(true);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % slides.length);
    }, DURATION);
    return () => window.clearTimeout(timer);
  }, [active, paused, slides.length]);

  return (
    <div className="bg-[#1d1d1f] pb-16 text-white md:pb-24">
      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            paddingLeft: "max(1.5rem, calc((100vw - 1120px) / 2))",
            transform: `translateX(calc(${-active} * (min(86vw, 1080px) + 1rem)))`,
          }}
        >
          {slides.map((slide) => (
            <article
              key={slide.title}
              className="flex w-[min(86vw,1080px)] shrink-0 flex-col overflow-hidden rounded-none bg-transparent"
            >
              <div className="px-8 pt-10 md:px-12 md:pt-14">
                <h3 className="max-w-[16ch] text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[44px]">
                  {slide.title}
                </h3>
                <p className="mt-4 max-w-[34rem] text-[17px] leading-snug text-[#86868b] md:text-[19px]">
                  {slide.body}
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {slide.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-[17px] text-[#ff5a5a] hover:underline"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className="mt-8 h-[280px] w-full object-cover object-center md:h-[380px]"
              />
            </article>
          ))}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="flex h-11 items-center gap-2.5 rounded-none bg-[#2c2c2e] px-4">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show ${slide.title}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => setActive(index)}
              className="grid h-6 place-items-center"
            >
              {index === active ? (
                <span className="relative block h-[3px] w-7 overflow-hidden rounded-none bg-white/30">
                  <span
                    key={`${active}-${paused ? "paused" : "play"}`}
                    className={`absolute inset-0 origin-left bg-white ${
                      paused ? "scale-x-100" : "reel-fill"
                    }`}
                  />
                </span>
              ) : (
                <span className="block size-1.5 rounded-none bg-white/80" />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={paused ? "Play highlights" : "Pause highlights"}
          onClick={() => setPaused((value) => !value)}
          className="grid size-11 place-items-center rounded-none bg-[#2c2c2e] text-white"
        >
          {paused ? (
            <Play className="size-4 fill-current" />
          ) : (
            <Pause className="size-4 fill-current" />
          )}
        </button>
      </div>
    </div>
  );
}
