import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { company, mainNav } from "../data";

export default function Shell() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="gnav">
        <Link to="/" className="brand" aria-label="New Concept Security home">
          <img src="/images/logo-light.png" alt="New Concept Security" />
        </Link>
        <nav
          className={open ? "gnav-links open" : "gnav-links"}
          aria-label="Primary"
        >
          <NavLink to="/" end>
            Home
          </NavLink>
          <div
            className={servicesOpen ? "services-wrap open" : "services-wrap"}
          >
            <button
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services
            </button>
            <div className="flyout flyout-list">
              {mainNav.map((item) => (
                <Link key={item.slug} to={`/services/${item.slug}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/privacy-policy">Privacy Policy</NavLink>
          <NavLink to="/our-details">Our Details</NavLink>
        </nav>
        <div className="nav-end">
          <Link className="nav-cta" to="/our-details">
            Enquire
          </Link>
          <button
            className="menu-btn"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </header>
      <main id="content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h3>Contact</h3>
            <p>{company.address.join(", ")}</p>
            <a href={company.phoneHref}>{company.phone}</a>
            <a href={company.mobileHref}>{company.mobile}</a>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </div>
          <div>
            <h3>Quick Links</h3>
            <Link to="/">Home</Link>
            <Link to="/our-details">Our Details</Link>
            <a href={company.careers} target="_blank" rel="noreferrer">
              Join New Concept Security
            </a>
            <a href={company.staffLogin} target="_blank" rel="noreferrer">
              Staff login
            </a>
          </div>
          <div>
            <h3>Services</h3>
            {mainNav.map((item) => (
              <Link key={item.slug} to={`/services/${item.slug}`}>
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Work Hours</h3>
            <p>{company.hoursOffice}</p>
            <p>24-7, 365 days a year. Control room.</p>
            <a href={company.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>
        </div>
        <p className="fine">
          {company.legal}. Company No. {company.number}. Registered in England
          and Wales. Copyright © {new Date().getFullYear()} {company.legal}.
        </p>
      </footer>
    </div>
  );
}

export function useTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} - New Concept Security`
      : "New Concept Security";
  }, [title]);
}
