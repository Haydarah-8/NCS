import { faqs } from "../data";
import { useTitle } from "../components/Shell";

export default function Faq() {
  useTitle("Questions");
  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">Questions</p>
        <h1>Need for some help?</h1>
      </header>
      <div className="faq">
        {faqs.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </article>
  );
}
