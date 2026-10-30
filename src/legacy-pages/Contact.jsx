import { useState } from "react";
import { company, services } from "../data";
import { useTitle } from "../components/Shell";

const empty = {
  name: "",
  organisation: "",
  phone: "",
  email: "",
  service: "General enquiry",
  message: "",
};

export default function Contact() {
  useTitle("Our Details");
  const [form, setForm] = useState(empty);
  const [note, setNote] = useState(null);

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setNote({
        kind: "bad",
        text: "Add your name, email and a note about the site.",
      });
      return;
    }
    const body = [
      `Name: ${form.name}`,
      `Organisation: ${form.organisation || "—"}`,
      `Phone: ${form.phone || "—"}`,
      `Email: ${form.email}`,
      `Service: ${form.service}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
      `Enquiry from ${form.name} — ${form.service}`,
    )}&body=${encodeURIComponent(body)}`;
    setNote({
      kind: "ok",
      text: "Your email app should open. If it does not, call the office.",
    });
  }

  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">Concept House, Blackpool</p>
        <h1>Don&apos;t hesitate to contact us.</h1>
        <p className="dek">
          Please call us or enquire for a security consultation or a quotation.
        </p>
      </header>
      <div className="contact">
        <ul className="detail">
          <li>
            <span>Office</span>
            {company.address.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <a href={company.maps} target="_blank" rel="noreferrer">
              Open in Maps
            </a>
          </li>
          <li>
            <span>Phone</span>
            <a href={company.phoneHref}>{company.phone}</a>
          </li>
          <li>
            <span>Managers</span>
            <a href={company.mobileHref}>{company.mobile}</a>
          </li>
          <li>
            <span>Email</span>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </li>
          <li>
            <span>Hours</span>
            {company.hoursOffice}
            <div>{company.hoursControl}</div>
          </li>
        </ul>
        <form onSubmit={submit}>
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={update}
              autoComplete="name"
            />
          </label>
          <label>
            Organisation
            <input
              name="organisation"
              value={form.organisation}
              onChange={update}
              autoComplete="organization"
            />
          </label>
          <label>
            Phone
            <input
              name="phone"
              value={form.phone}
              onChange={update}
              autoComplete="tel"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              autoComplete="email"
            />
          </label>
          <label className="full">
            Service
            <select name="service" value={form.service} onChange={update}>
              <option>General enquiry</option>
              {services.map((service) => (
                <option key={service.slug}>{service.title}</option>
              ))}
            </select>
          </label>
          <label className="full">
            Message
            <textarea name="message" value={form.message} onChange={update} />
          </label>
          {note && <p className={`note ${note.kind} full`}>{note.text}</p>}
          <div className="form-row">
            <span className="note">Sent to {company.email}</span>
            <button className="button large" type="submit">
              Send
            </button>
          </div>
        </form>
      </div>
      <div className="copy prose">
        <h2>Careers with New Concept Security</h2>
        <p>Looking for a career in security or additional contract work.</p>
        <p>Follow the link below to start:</p>
        <p>
          <a
            className="button"
            href={company.careers}
            target="_blank"
            rel="noreferrer"
          >
            Join New Concept Security
          </a>
        </p>
        <p>
          SIA Approved Contractor Scheme (ACS) status for the provision of
          Security Guarding and Key Holding.
        </p>
      </div>
    </article>
  );
}
