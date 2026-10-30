import { company } from "../data";
import { useTitle } from "../components/Shell";

export default function Privacy() {
  useTitle("Privacy policy");
  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy policy.</h1>
      </header>
      <div className="legal prose">
        <h2>New Concept Security</h2>
        <h3>1. Your personal data — what is it?</h3>
        <p>
          Personal data relates to a living individual who can be identified
          from that data. Identification can be by the information alone or in
          conjunction with any other information in the data controller’s
          possession or likely to come into such possession. The processing of
          personal data is governed by the General Data Protection Regulation
          (the “GDPR”).
        </p>
        <h3>2. How do we process personal data?</h3>
        <p>
          We comply with our obligations under the GDPR by keeping personal data
          up to date; by storing and destroying it securely; by not collecting
          or retaining excessive amounts of data; by protecting personal data
          from loss, misuse, unauthorised access and disclosure and by ensuring
          that appropriate technical measures are in place to protect personal
          data.
        </p>
        <p>We use your name and email address for the following purposes:</p>
        <ul>
          <li>
            To inform you of any activities or news that is directly
            relevant to you.
          </li>
        </ul>
        <h3>3. What is the legal basis for processing your personal data?</h3>
        <p>
          Explicit consent of the data subject so that we can keep you informed
          about any activities or news that is directly relevant to you.
        </p>
        <h3>4. Sharing your personal data</h3>
        <p>
          Your personal data will be treated in strict confidence and we do not
          share your information with anyone.
        </p>
        <h3>5. How long do we keep your personal data?</h3>
        <p>
          We keep your data for as long as you wish us to. Every time you
          receive any information you do not require please inform us so that we
          can change your preferences.
        </p>
        <h3>6. Your rights and your personal data</h3>
        <p>
          Unless subject to an exemption under the GDPR, you have the following
          rights with respect to your personal data:
        </p>
        <ul>
          <li>The right to request a copy of your personal data.</li>
          <li>
            The right to request that we correct any personal data if it is
            found to be inaccurate or out of date.
          </li>
          <li>
            The right to request your personal data is erased where it is no
            longer necessary.
          </li>
          <li>
            The right to withdraw your consent to the processing at any time.
          </li>
          <li>
            The right to request that the data controller provide the data
            subject with his or her personal data and, where possible, to
            transmit that data directly to another data controller (known as the
            right to data portability), where applicable.
          </li>
          <li>
            The right, where there is a dispute in relation to the accuracy or
            processing of your personal data, to request a restriction is placed
            on further processing.
          </li>
          <li>
            The right to object to the processing of personal data, where
            applicable. This only applies where processing is based on
            legitimate interests (or the performance of a task in the public
            interest or exercise of official authority), direct marketing, and
            processing for the purposes of scientific or historical research and
            statistics.
          </li>
          <li>
            The right to lodge a complaint with the Information Commissioner’s
            Office.
          </li>
        </ul>
        <h3>7. Further processing</h3>
        <p>
          If we wish to use your personal data for a new purpose, not covered by
          this Data Privacy Notice, then we will provide you with a new notice
          explaining this new use prior to commencing the processing and setting
          out the relevant purposes and processing conditions. Where and
          whenever necessary, we will seek your prior consent to the new
          processing.
        </p>
        <h3>8. Contact details</h3>
        <p>
          To exercise all relevant rights, queries or complaints please in the
          first instance contact the Data Controller at{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a> or write to
          our Data Controller at {company.address.join(", ")}.
        </p>
        <p>
          You can contact the Information Commissioner’s Office via{" "}
          <a
            href="https://ico.org.uk/global/contact-us/email/"
            target="_blank"
            rel="noreferrer"
          >
            ico.org.uk
          </a>{" "}
          or write to the Information Commissioner’s Office, Wycliffe House,
          Water Lane, Wilmslow, Cheshire, SK9 5AF.
        </p>
      </div>
    </article>
  );
}
