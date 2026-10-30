"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Send } from "lucide-react";
import { company, services } from "@/src/data";
import { btnPrimary } from "@/lib/styles";

const empty = {
  name: "",
  organisation: "",
  phone: "",
  email: "",
  service: "General enquiry",
  customService: "",
  message: "",
};

const label = "grid gap-2 text-[14px] font-medium text-[#1d1d1f]";
const field =
  "h-12 rounded-none border border-[#d2d2d7] bg-white px-4 text-[16px] font-normal text-[#1d1d1f] outline-none transition placeholder:text-[#a1a1a6] focus:border-[#a01010] focus:ring-4 focus:ring-[#a01010]/10";

export default function ContactForm({ defaultService }: { defaultService?: string }) {
  const known = services.some((service) => service.title === defaultService);
  const [form, setForm] = useState({ ...empty, service: known ? defaultService! : empty.service });
  const [note, setNote] = useState<string | null>(null);

  function update(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const name = event.target.name as keyof typeof empty;
    setForm((current) => ({ ...current, [name]: event.target.value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setNote("Add your name, email and a note about the site.");
      return;
    }
    const selectedService = form.service === "other" ? form.customService.trim() : form.service;
    if (!selectedService) {
      setNote("Tell us which service you need.");
      return;
    }
    // Saved for the admin panel's enquiries inbox; the email still opens either way.
    fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.organisation,
        site: selectedService,
        message: form.message,
        website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value || "",
        source: "contact",
        page: window.location.pathname,
      }),
    }).catch(() => {});
    const body = [
      `Name: ${form.name}`,
      `Organisation: ${form.organisation || "—"}`,
      `Phone: ${form.phone || "—"}`,
      `Email: ${form.email}`,
      `Service: ${selectedService}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
      `Enquiry from ${form.name} — ${selectedService}`,
    )}&body=${encodeURIComponent(body)}`;
    setNote("Your email app should open. If it does not, call the office.");
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      {/* Left empty by people; robots fill it in and are ignored. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
      <label className={label}>
        Name
        <input name="name" value={form.name} onChange={update} autoComplete="name" required className={field} />
      </label>
      <label className={label}>
        Organisation
        <input
          name="organisation"
          value={form.organisation}
          onChange={update}
          autoComplete="organization"
          className={field}
        />
      </label>
      <label className={label}>
        Phone
        <input name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" className={field} />
      </label>
      <label className={label}>
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={update}
          autoComplete="email"
          required
          className={field}
        />
      </label>
      <label className={`${label} sm:col-span-2`}>
        Service
        <select name="service" value={form.service} onChange={update} className={field}>
          <option value="other">Other service — please specify</option>
          <option>General enquiry</option>
          {services.map((service) => (
            <option key={service.slug}>{service.title}</option>
          ))}
        </select>
      </label>
      {form.service === "other" && (
        <label className={`${label} sm:col-span-2`}>
          Custom service
          <input
            name="customService"
            value={form.customService}
            onChange={update}
            required
            maxLength={80}
            placeholder="Tell us which service you need"
            className={field}
          />
        </label>
      )}
      <label className={`${label} sm:col-span-2`}>
        Message
        <textarea
          name="message"
          value={form.message}
          onChange={update}
          rows={5}
          required
          placeholder="The site, the hours you need covering, and anything we should know."
          className={`${field} h-auto py-3`}
        />
      </label>
      {note && (
        <p role="status" className="text-[14px] text-[#a01010] sm:col-span-2">
          {note}
        </p>
      )}
      <div className="flex flex-col-reverse gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[13px] text-[#86868b]">Opens your email app, addressed to {company.email}</span>
        <button type="submit" className={`${btnPrimary} shrink-0`}>
          Send enquiry
          <Send className="size-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
