import { Link } from "react-router-dom";
import { serviceGroups, services } from "../data";
import { useTitle } from "../components/Shell";

export default function Services() {
  useTitle("Services");
  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">Services</p>
        <h1>Services we provide.</h1>
        <p className="dek">
          New Concept has grown to become one of the leading security suppliers
          in the North West, providing a range of security services to meet the
          demands of an ever changing marketplace.
        </p>
      </header>
      {serviceGroups.map((group) => (
        <section key={group}>
          <h2 className="group-label">{group}</h2>
          <div className="cards" style={{ maxWidth: 1200, margin: "0 auto" }}>
            {services
              .filter((service) => service.group === group)
              .map((service) => (
                <Link
                  className="card"
                  key={service.slug}
                  to={`/services/${service.slug}`}
                >
                  <img src={service.image} alt="" />
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.summary}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </article>
  );
}
