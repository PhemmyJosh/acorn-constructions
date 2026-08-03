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
      <div className="rounded-sm border border-amber-200 bg-amber-50 p-8">
        <h3 className="text-lg font-semibold text-stone-900">Thanks for reaching out.</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          We&apos;ve received your message and will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-semibold uppercase tracking-wider text-amber-600 hover:text-amber-700"
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
          <label htmlFor="name" className="text-sm font-semibold text-stone-900">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(event) => handleChange("name", event.target.value)}
            className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-600"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-semibold text-stone-900">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-600"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-stone-900">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(event) => handleChange("email", event.target.value)}
          className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-600"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-semibold text-stone-900">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(event) => handleChange("message", event.target.value)}
          className="resize-none rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-600"
        />
      </div>

      <Button type="submit" variant="primary" className="self-start">
        Send Message
      </Button>
    </form>
  );
}
