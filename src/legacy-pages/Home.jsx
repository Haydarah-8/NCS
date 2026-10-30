import { Link } from "react-router-dom";
import { clients, company, getService } from "../data";
import { useTitle } from "../components/Shell";

const facts = [
  { value: "2017", label: "Founded in Blackpool, working across the UK" },
  { value: "24/7", label: "Control room, 365 days a year" },
  { value: "ACS", label: "Approved for guarding and key holding" },
  { value: "60 min", label: "Average alarm response, in a liveried vehicle" },
];

const stance = [
  {
    title: "A North West company, working nationally",
    body: "Founded in Blackpool in 2017, New Concept has grown into one of the leading security suppliers in the North West, with officers on sites across the UK.",
  },
  {
    title: "Able to move at the speed of the job",
    body: "A can-do culture, set up to react and deliver at speed and at scale — one post, or a contract that runs across towns.",
  },
  {
    title: "Approved for the work that carries risk",
    body: "SIA Approved Contractor Scheme status for Security Guarding and Key Holding. Officers are SIA licensed.",
  },
];

const paths = [
  {
    index: "01",
    title: "People on the premises",
    body: "A constant, recognisable presence. The team and the uniform are set around the building, and around the image you want visitors to see.",
    image: "/images/reception.jpg",
    imageAlt: "Two suited security officers standing in a reception",
    slugs: [
      "guarding",
      "static-guards",
      "retail-guarding",
      "healthcare",
      "personal-security",
    ],
  },
  {
    index: "02",
    title: "When something happens",
    body: "Keys held off site, officers sent in liveried vehicles, and a control room that does not close. Alarm response averages 60 minutes.",
    image: "/images/control-room.jpg",
    imageAlt: "Security officer at a monitoring desk",
    slugs: ["key-holding", "mobile-security", "fire-services"],
    flip: true,
  },
  {
    index: "03",
    title: "The site itself",
    body: "A survey first, then the patrols, cameras or access control that premises actually need — including blind spots, plant and a perimeter.",
    image: "/images/balfour-site.jpg",
    imageAlt:
      "New Concept Security officer in high-visibility uniform on an industrial site",
    slugs: ["site-security", "cctv-and-alarms", "security-personnel"],
  },
];

const steps = [
  {
    n: "01",
    title: "Survey",
    body: "We look at the site, the hours and the weak points before a package is written.",
  },
  {
    n: "02",
    title: "Assign",
    body: "Licensed officers, the right uniform, and a manager who stays responsible for the account.",
  },
  {
    n: "03",
    title: "Remain",
    body: "The control room stays open through the night. The site is not left to a shift that ends.",
  },
];

export default function Home() {
  useTitle("");

  return (
    <div className="home">
      <section className="home-hero">
        <div>
          <p className="home-kicker">
            SIA Approved Contractor · {company.region}
          </p>
          <h1>
            Security, held to a <em>higher standard.</em>
          </h1>
          <p className="home-lede">
            Manned guarding and key holding for public and
            private organisations. Based at Concept House in Blackpool since{" "}
            {company.founded}, with a national footprint.
          </p>
          <div className="home-actions">
            <a className="button" href={company.phoneHref}>
              Call {company.phone}
            </a>
            <Link className="text-link" to="/our-details">
              Enquire about a site
            </Link>
          </div>
        </div>
        <figure className="home-hero-figure">
          <img
            src="/images/street.jpg"
            alt="A New Concept Security security officer at a building entrance"
          />
          <figcaption>Security officers, on site.</figcaption>
        </figure>
      </section>

      <section className="home-facts" aria-label="At a glance">
        <ul>
          {facts.map((fact) => (
            <li key={fact.value}>
              <span>{fact.value}</span>
              <p>{fact.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-proof" aria-label="Clients">
        <p>On sites for</p>
        <ul className="home-logos">
          {clients.map((client) => (
            <li key={client.name}>
              <img src={client.src} alt={client.name} />
            </li>
          ))}
        </ul>
      </section>

      <section className="home-block home-stance">
        <p className="home-index">The company</p>
        <h2>Raising the standard, then keeping to it.</h2>
        <div className="home-stance-grid">
          {stance.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-block home-paths" id="services">
        <p className="home-index">The work</p>
        <h2>Choose the kind of cover the site needs.</h2>
        <p className="home-intro">
          Three ways in. Each one is staffed by SIA-licensed officers and
          looked after by a manager, from a single premises to a national
          contract.
        </p>
        <div className="path-list">
          {paths.map((path) => (
            <article
              className={path.flip ? "path path-flip" : "path"}
              key={path.index}
            >
              <figure className="path-media">
                <img src={path.image} alt={path.imageAlt} />
              </figure>
              <div>
                <p className="path-kicker">{path.index}</p>
                <h3>{path.title}</h3>
                <p>{path.body}</p>
                <ul className="path-links">
                  {path.slugs.map((slug) => {
                    const service = getService(slug);
                    return (
                      <li key={slug}>
                        <Link to={`/services/${service.slug}`}>
                          {service.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-block home-method">
        <p className="home-index">What happens next</p>
        <h2>How a site is taken on.</h2>
        <div className="home-steps">
          {steps.map((step) => (
            <article key={step.n}>
              <span>{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-close">
        <div>
          <p className="home-index">The office</p>
          <h2>Tell us about the site.</h2>
          <a className="home-phone" href={company.phoneHref}>
            {company.phone}
          </a>
          <div className="home-actions">
            <Link className="button" to="/our-details">
              Enquire
            </Link>
            <a className="text-link" href={company.mobileHref}>
              Managers {company.mobile}
            </a>
          </div>
        </div>
        <div className="home-close-meta">
          <p>{company.address.join(", ")}</p>
          <p>{company.hoursOffice}</p>
          <p>{company.hoursControl}</p>
          <p>
            <a href={company.acs}>ACS reference {company.acsCode}</a>
          </p>
        </div>
      </section>
    </div>
  );
}
