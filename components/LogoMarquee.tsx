import { clients } from "@/src/data";

export default function LogoMarquee() {
  return (
    <div className="logo-marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <div className="logo-track flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex items-center gap-16 pr-16 md:gap-20 md:pr-20">
            {clients.map((client) => (
              <li key={`${copy}-${client.name}`}>
                <img
                  src={client.src}
                  alt={copy === 0 ? client.name : ""}
                  className="h-16 w-auto max-w-[200px] object-contain opacity-60 mix-blend-multiply grayscale transition hover:opacity-100 hover:grayscale-0 md:h-20"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
