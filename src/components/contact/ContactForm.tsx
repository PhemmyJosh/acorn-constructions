"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof ContactFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Contact form submission:", formData);
    setSubmitted(true);
    setFormData(initialFormData);
  }

  if (submitted) {
    return (
      <div className="rounded-sm border border-acorn-gold/30 bg-acorn-stone p-8">
        <h3 className="text-lg font-semibold text-acorn-charcoal">Thanks for reaching out.</h3>
        <p className="mt-2 text-sm leading-relaxed text-acorn-charcoal/70">
          We&apos;ve received your message and will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-semibold uppercase tracking-wider text-acorn-gold hover:text-acorn-bronze"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold text-acorn-charcoal">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(event) => handleChange("name", event.target.value)}
            className="rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-semibold text-acorn-charcoal">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            className="rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-acorn-charcoal">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(event) => handleChange("email", event.target.value)}
          className="rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-semibold text-acorn-charcoal">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(event) => handleChange("message", event.target.value)}
          className="resize-none rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold"
        />
      </div>

      <Button type="submit" variant="primary" className="self-start">
        Send Message
      </Button>
    </form>
  );
}
