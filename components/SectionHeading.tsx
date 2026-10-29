import type { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "light",
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  const dark = tone === "dark";
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-[48rem] ${className}`}>
      {eyebrow && (
        <p className={`text-[17px] font-semibold md:text-[19px] ${dark ? "text-[#ff5a5a]" : "text-[#a01010]"}`}>
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-1.5 text-[36px] font-semibold leading-[1.08] tracking-[-0.02em] md:text-[52px] ${
          dark ? "text-white" : "text-[#1d1d1f]"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-4 text-[19px] leading-[1.45] md:text-[21px] ${center ? "mx-auto max-w-[38rem]" : "max-w-[40rem]"} ${
            dark ? "text-white/65" : "text-[#6e6e73]"
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
