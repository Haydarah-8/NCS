import { company } from "../data";
import { useTitle } from "../components/Shell";

export default function Careers() {
  useTitle("Careers");
  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">Careers</p>
        <h1>Looking for a career in security.</h1>
        <p className="dek">
          Looking for a career in security, or extra shifts. Applications go
          through the company form.
        </p>
        <div className="actions">
          <a
            className="button large"
            href={company.careers}
            target="_blank"
            rel="noreferrer"
          >
            Apply
          </a>
          <a
            className="button large ghost"
            href={company.staffLogin}
            target="_blank"
            rel="noreferrer"
          >
            Staff login
          </a>
        </div>
      </header>
      <div className="stage">
        <img
          src="/images/street.jpg"
          alt="New Concept Security officer in uniform"
        />
      </div>
      <div className="copy prose">
        <p>
          Posts cover static guarding, mobile patrols,
          healthcare (including patient watch) and key holding. Officers need to
          be SIA licensed. Patient watch also needs an enhanced DBS check and
          restraint training.
        </p>
        <p>
          Questions can go to the office on{" "}
          <a href={company.phoneHref}>{company.phone}</a> or{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>.
        </p>
      </div>
    </article>
  );
}
