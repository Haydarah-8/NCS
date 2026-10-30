import { Link } from "react-router-dom";
import { useTitle } from "../components/Shell";

export default function NotFound() {
  useTitle("Page not found");
  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">404</p>
        <h1>That page is not here.</h1>
        <p className="dek">
          The address may have changed. The services and the office have not.
        </p>
        <div className="actions">
          <Link className="button large" to="/">
            Home
          </Link>
          <Link className="button large ghost" to="/#services">
            Services
          </Link>
        </div>
      </header>
    </article>
  );
}
