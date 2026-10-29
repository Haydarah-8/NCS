import { stats } from "@/src/data";

export default function TrustStats({
  items = stats,
  tone = "light",
  size = "lg",
}: {
  items?: { value: string; label: string }[];
  tone?: "light" | "dark";
  size?: "lg" | "md";
}) {
  const dark = tone === "dark";
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
      {items.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center text-center">
          <dt
            className={`order-2 mt-3 max-w-[13rem] text-[15px] leading-snug md:text-[17px] ${
              dark ? "text-white/65" : "text-[#6e6e73]"
            }`}
          >
            {stat.label}
          </dt>
          <dd
            className={`order-1 whitespace-nowrap bg-clip-text font-semibold leading-none tracking-[-0.04em] text-transparent ${
              size === "lg" ? "text-[52px] md:text-[72px]" : "text-[40px] md:text-[52px]"
            } ${dark ? "bg-gradient-to-b from-white to-white/60" : "bg-gradient-to-b from-[#d01a1a] to-[#7a0c0c]"}`}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
