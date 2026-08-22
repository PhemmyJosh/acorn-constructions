"use client";

import { FormEvent, useState } from "react";
import HoneypotField from "@/components/ui/HoneypotField";
import {
  FormError,
  FormSubmitButton,
  FormSuccess,
  PreviousSubmissionNotice,
  useFormSubmission,
} from "@/components/ui/FormStatus";
import { postJson } from "@/lib/submit-form";
import { HONEYPOT_FIELD } from "@/lib/spam";

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

const fieldClasses =
  "rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const {
    error,
    isSending,
    isSuccess,
    hasSubmittedBefore,
    containerRef,
    begin,
    succeed,
    fail,
    reset,
  } = useFormSubmission();

  function handleChange(field: keyof ContactFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;

    begin();

    // The honeypot input is uncontrolled, so read it straight off the form.
    const honeypot = new FormData(event.currentTarget).get(HONEYPOT_FIELD);

    const result = await postJson("/api/contact", {
      ...formData,
      [HONEYPOT_FIELD]: typeof honeypot === "string" ? honeypot : "",
    });

    if (!result.ok) {
      fail(result.error ?? null);
      return;
    }

    succeed();
    setFormData(initialFormData);
  }

  function handleReset() {
    setFormData(initialFormData);
    reset();
  }

  return (
    <div ref={containerRef}>
      {isSuccess ? (
        <FormSuccess
          headline="Thanks, we’ve received your message"
          buttonLabel="Send Another Message"
          onReset={handleReset}
        >
          <p>
            We&apos;ll be in touch within 1&ndash;2 business days. If it&apos;s
            urgent, give us a call and we&apos;ll pick up faster than email.
          </p>
        </FormSuccess>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <HoneypotField />

          {hasSubmittedBefore && (
            <PreviousSubmissionNotice>
              Your previous message was sent successfully. This is a new, blank
              message.
            </PreviousSubmissionNotice>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-semibold text-acorn-charcoal"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className={fieldClasses}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="text-sm font-semibold text-acorn-charcoal"
              >
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                className={fieldClasses}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-acorn-charcoal"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className={fieldClasses}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="text-sm font-semibold text-acorn-charcoal"
            >
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(event) => handleChange("message", event.target.value)}
              className={`resize-none ${fieldClasses}`}
            />
          </div>

          {error && <FormError>{error}</FormError>}

          <FormSubmitButton isSending={isSending} className="self-start">
            Send Message
          </FormSubmitButton>
        </form>
      )}
    </div>
  );
}
