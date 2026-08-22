"use client";

import { FormEvent, useRef, useState } from "react";
import HoneypotField from "@/components/ui/HoneypotField";
import {
  FormError,
  FormSubmitButton,
  FormSuccess,
  PreviousSubmissionNotice,
  useFormSubmission,
} from "@/components/ui/FormStatus";
import { postFormData } from "@/lib/submit-form";
import { HONEYPOT_FIELD } from "@/lib/spam";
import {
  proficiencyGroups,
  RESUME_ACCEPT,
  RESUME_MAX_BYTES,
  RESUME_MAX_MB,
} from "@/data/careers";

interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  yearsExperience: string;
  startDate: string;
  expectedWage: string;
  comments: string;
}

const initialFormData: ApplicationFormData = {
  name: "",
  email: "",
  phone: "",
  yearsExperience: "",
  startDate: "",
  expectedWage: "",
  comments: "",
};

const fieldClasses =
  "rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold";

const labelClasses = "text-sm font-semibold text-acorn-charcoal";

function toId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function ApplicationForm() {
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [proficiencies, setProficiencies] = useState<string[]>([]);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  // Remembered at submit time so the confirmation can name the file that was
  // actually uploaded, after the form state has been cleared.
  const [submittedResumeName, setSubmittedResumeName] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  function handleChange(field: keyof ApplicationFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function toggleProficiency(option: string) {
    setProficiencies((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  }

  function handleResumeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > RESUME_MAX_BYTES) {
      setResumeError(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please upload a file under ${RESUME_MAX_MB}MB.`
      );
      setResume(null);
      event.target.value = "";
      return;
    }

    setResumeError(null);
    setResume(file);
  }

  function resetForm() {
    setFormData(initialFormData);
    setProficiencies([]);
    setResume(null);
    setResumeError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;

    begin();

    // Multipart rather than JSON, so the resume goes up as a real file instead
    // of being base64-inflated into a JSON body.
    const payload = new FormData();
    for (const [field, value] of Object.entries(formData)) {
      payload.append(field, value);
    }

    // The honeypot input is uncontrolled, so read it straight off the form.
    const honeypot = new FormData(event.currentTarget).get(HONEYPOT_FIELD);
    payload.append(HONEYPOT_FIELD, typeof honeypot === "string" ? honeypot : "");

    for (const option of proficiencies) {
      payload.append("proficiencies", option);
    }
    if (resume) {
      payload.append("resume", resume, resume.name);
    }

    const result = await postFormData("/api/careers", payload);

    if (!result.ok) {
      fail(result.error ?? null);
      return;
    }

    setSubmittedResumeName(resume?.name ?? null);
    succeed();
    resetForm();
  }

  function handleReset() {
    // Clears the text fields, the checkboxes, and the file input's value, so
    // the previous resume is not silently re-submitted.
    resetForm();
    reset();
  }

  return (
    <div ref={containerRef}>
      {isSuccess ? (
        <FormSuccess
          headline="Your application has been submitted"
          buttonLabel="Submit Another Application"
          onReset={handleReset}
        >
          <p>
            We&apos;ve received your application and will be in touch within
            1&ndash;2 business days if there&apos;s a fit on one of our crews.
          </p>
          <p>
            {submittedResumeName ? (
              <>
                Your r&eacute;sum&eacute;{" "}
                <span className="font-semibold text-acorn-charcoal">
                  {submittedResumeName}
                </span>{" "}
                was received.
              </>
            ) : (
              <>
                No r&eacute;sum&eacute; was attached. That&apos;s fine, but if
                you have one, feel free to submit again with it attached.
              </>
            )}
          </p>
        </FormSuccess>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <HoneypotField />

          {hasSubmittedBefore && (
            <PreviousSubmissionNotice>
              Your previous application was submitted successfully. This is a
              new, blank application &mdash; re-attach a r&eacute;sum&eacute; if
              you want to include one.
            </PreviousSubmissionNotice>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="applicant-name" className={labelClasses}>
                Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="applicant-name"
                type="text"
                required
                value={formData.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className={fieldClasses}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="applicant-phone" className={labelClasses}>
                Phone Number <span aria-hidden="true">*</span>
              </label>
              <input
                id="applicant-phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                className={fieldClasses}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="applicant-email" className={labelClasses}>
              Email Address <span aria-hidden="true">*</span>
            </label>
            <input
              id="applicant-email"
              type="email"
              required
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className={fieldClasses}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="applicant-experience" className={labelClasses}>
                Years of Experience
              </label>
              <input
                id="applicant-experience"
                type="text"
                inputMode="numeric"
                value={formData.yearsExperience}
                onChange={(event) => handleChange("yearsExperience", event.target.value)}
                className={fieldClasses}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="applicant-start" className={labelClasses}>
                When Can You Start?
              </label>
              <input
                id="applicant-start"
                type="text"
                value={formData.startDate}
                onChange={(event) => handleChange("startDate", event.target.value)}
                className={fieldClasses}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="applicant-wage" className={labelClasses}>
                Expected Wage
              </label>
              <input
                id="applicant-wage"
                type="text"
                value={formData.expectedWage}
                onChange={(event) => handleChange("expectedWage", event.target.value)}
                className={fieldClasses}
              />
            </div>
          </div>

          <fieldset className="flex flex-col gap-4 rounded-sm border border-acorn-bronze/30 bg-white p-5 sm:p-6">
            <legend className="px-1 text-sm font-semibold text-acorn-charcoal">
              Proficient In
            </legend>
            {proficiencyGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
                  {group.label}
                </p>
                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.options.map((option) => {
                    const id = `proficiency-${toId(option)}`;
                    return (
                      // The label fills the row and is tied to the input, so the
                      // whole 44px-tall row is a tap target, not just the 20px box.
                      <div key={option} className="flex min-h-11 items-center gap-3">
                        <input
                          id={id}
                          type="checkbox"
                          checked={proficiencies.includes(option)}
                          onChange={() => toggleProficiency(option)}
                          className="h-5 w-5 shrink-0 cursor-pointer accent-acorn-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold"
                        />
                        <label
                          htmlFor={id}
                          className="flex-1 cursor-pointer py-3 text-sm text-acorn-charcoal/80"
                        >
                          {option}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="applicant-comments" className={labelClasses}>
              Comments
            </label>
            <textarea
              id="applicant-comments"
              rows={5}
              value={formData.comments}
              onChange={(event) => handleChange("comments", event.target.value)}
              className={`resize-none ${fieldClasses}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="applicant-resume" className={labelClasses}>
              Upload Resume
            </label>
            <input
              ref={fileInputRef}
              id="applicant-resume"
              type="file"
              accept={RESUME_ACCEPT}
              onChange={handleResumeChange}
              aria-describedby="resume-help"
              className="rounded-sm border border-acorn-bronze/30 bg-white p-2 text-sm text-acorn-charcoal/80 outline-none file:mr-4 file:cursor-pointer file:rounded-sm file:border-0 file:bg-acorn-charcoal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-acorn-cream focus:border-acorn-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold"
            />
            <p id="resume-help" className="text-xs text-acorn-charcoal/60">
              PDF, DOC or DOCX. Maximum file size {RESUME_MAX_MB}MB.
            </p>
            {resumeError ? (
              <p role="alert" className="text-xs font-semibold text-acorn-rust">
                {resumeError}
              </p>
            ) : null}
            {resume ? (
              <p className="text-xs font-medium text-acorn-charcoal/70">
                Attached: {resume.name}
              </p>
            ) : null}
          </div>

          {error && <FormError>{error}</FormError>}

          <FormSubmitButton isSending={isSending} className="self-start">
            Apply Now
          </FormSubmitButton>
        </form>
      )}
    </div>
  );
}
