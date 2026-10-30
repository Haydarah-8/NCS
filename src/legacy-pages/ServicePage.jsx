import { Link, Navigate, useParams } from "react-router-dom";
import { company, getService, services } from "../data";
import { useTitle } from "../components/Shell";

export default function ServicePage() {
  const { slug } = useParams();
  const service = getService(slug);
  useTitle(service ? service.title : "Service");
  if (!service) return <Navigate to="/#services" replace />;

  const related = services
    .filter(
      (item) => item.slug !== service.slug && item.group === service.group,
    )
    .slice(0, 3);

  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">
          <Link to="/#services">Services</Link> · {service.group}
        </p>
        <h1>{service.title}.</h1>
        <p className="dek">{service.summary}</p>
        <div className="actions">
          <Link className="button large" to="/our-details">
            Let&apos;s contact us
          </Link>
          <a className="button large ghost" href={company.phoneHref}>
            {company.phone}
          </a>
        </div>
      </header>
      <div className="stage">
        <img src={service.image} alt={service.imageAlt} />
      </div>
      <div className="copy prose">
        {service.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {service.points && (
          <ul className="specs">
            {service.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
        {service.groups?.map((group) => (
          <section key={group.heading}>
            <h3>{group.heading}</h3>
            <ul className="specs">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
        {service.sections?.map((section) => (
          <section key={section.heading}>
            <h3>{section.heading}</h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        <p style={{ marginTop: 28, color: "#6e6e73" }}>
          Managers: <a href={company.mobileHref}>{company.mobile}</a>
        </p>
      </div>
      {related.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "64px auto 0" }}>
          <h2 className="group-label">Also in {service.group}</h2>
          <div className="cards">
            {related.map((item) => (
              <Link
                className="card"
                key={item.slug}
                to={`/services/${item.slug}`}
              >
                <img src={item.image} alt="" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
