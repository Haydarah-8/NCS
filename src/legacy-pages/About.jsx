import { Link } from "react-router-dom";
import { company } from "../data";
import { useTitle } from "../components/Shell";

export default function About() {
  useTitle("About");
  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">Since {company.founded}</p>
        <h1>Introducing New Concept Security.</h1>
        <p className="dek">
          Based in Blackpool with a National footprint, founded in{" "}
          {company.founded} with the mission of raising standards in the private
          security industry.
        </p>
      </header>
      <div className="stage">
        <img
          src="/images/reception.jpg"
          alt="Security officers in a reception"
          style={{ objectPosition: "center 30%" }}
        />
      </div>
      <div className="copy prose">
        <p>
          New Concept Security is based in Blackpool with a national footprint.
          From local contracts the company now provides security and facility
          services throughout the UK, and has become one of the leading
          suppliers in the North West.
        </p>
        <p>
          The work is built around reacting quickly and delivering at scale.
          Every recommendation is specific to the site. If a smaller service
          will do the job, that is the one that gets quoted.
        </p>
        <p>
          {company.legal} holds SIA Approved Contractor Scheme status for
          Security Guarding and Key Holding. Officers are SIA
          licensed. The control room at Concept House runs 24 hours a day, 365
          days a year. Company number {company.number}.
        </p>
        <p>
          <Link className="button large" to="/#services">
            See the services
          </Link>
        </p>
      </div>
    </article>
  );
}
