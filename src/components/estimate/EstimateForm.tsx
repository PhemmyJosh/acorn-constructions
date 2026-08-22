"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";

const BUILDING_TYPES = ["Residential", "Commercial", "Post Frame"] as const;
const COUNTRIES = ["Canada", "United States"] as const;

interface EstimateFormData {
  name: string;
  email: string;
  phone: string;
  mailingAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  buildingType: string;
  buildingLocation: string;
  startDate: string;
  buildingSize: string;
  buildingDescription: string;
  additionalComments: string;
}

const initialFormData: EstimateFormData = {
  name: "",
  email: "",
  phone: "",
  mailingAddress: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Canada",
  buildingType: "",
  buildingLocation: "",
  startDate: "",
  buildingSize: "",
  buildingDescription: "",
  additionalComments: "",
};

const fieldClasses =
  "rounded-sm border border-acorn-bronze/30 bg-white px-4 py-3 text-sm text-acorn-charcoal outline-none focus:border-acorn-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold";

// Selects need extra right padding so the native arrow is not crowded
// against the border, matching the inputs' horizontal rhythm.
const selectClasses = `${fieldClasses} pr-10`;

const labelClasses = "text-sm font-semibold text-acorn-charcoal";

const legendClasses =
  "mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-acorn-gold";

export default function EstimateForm() {
  const [formData, setFormData] = useState<EstimateFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof EstimateFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Estimate request submission:", formData);
    setSubmitted(true);
    setFormData(initialFormData);
  }

  if (submitted) {
    return (
      <div className="rounded-sm border border-acorn-gold/30 bg-acorn-stone p-8">
        <h3 className="text-lg font-semibold text-acorn-charcoal">
          Thanks, your request is in.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-acorn-charcoal/70">
          We&apos;ve received your project details and will get back to you with
          a free, no-obligation estimate.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-semibold uppercase tracking-wider text-acorn-gold hover:text-acorn-bronze"
        >
          Request another estimate
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <fieldset className="flex flex-col gap-6">
        <legend className={legendClasses}>Contact Information</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-name" className={labelClasses}>
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="estimate-name"
              type="text"
              required
              value={formData.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className={fieldClasses}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-phone" className={labelClasses}>
              Phone
            </label>
            <input
              id="estimate-phone"
              type="tel"
              value={formData.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              className={fieldClasses}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="estimate-email" className={labelClasses}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="estimate-email"
            type="email"
            required
            value={formData.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className={fieldClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="estimate-address" className={labelClasses}>
            Mailing Address
          </label>
          <input
            id="estimate-address"
            type="text"
            autoComplete="street-address"
            value={formData.mailingAddress}
            onChange={(event) => handleChange("mailingAddress", event.target.value)}
            className={fieldClasses}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-city" className={labelClasses}>
              City
            </label>
            <input
              id="estimate-city"
              type="text"
              autoComplete="address-level2"
              value={formData.city}
              onChange={(event) => handleChange("city", event.target.value)}
              className={fieldClasses}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-region" className={labelClasses}>
              State / Province / Region
            </label>
            <input
              id="estimate-region"
              type="text"
              autoComplete="address-level1"
              value={formData.region}
              onChange={(event) => handleChange("region", event.target.value)}
              className={fieldClasses}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-postal" className={labelClasses}>
              ZIP / Postal Code
            </label>
            <input
              id="estimate-postal"
              type="text"
              autoComplete="postal-code"
              value={formData.postalCode}
              onChange={(event) => handleChange("postalCode", event.target.value)}
              className={fieldClasses}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:max-w-xs">
          <label htmlFor="estimate-country" className={labelClasses}>
            Country
          </label>
          <select
            id="estimate-country"
            autoComplete="country-name"
            value={formData.country}
            onChange={(event) => handleChange("country", event.target.value)}
            className={selectClasses}
          >
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <hr className="my-10 border-acorn-bronze/25" />

      <fieldset className="flex flex-col gap-6">
        <legend className={legendClasses}>Building Information</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-type" className={labelClasses}>
              Type of Building
            </label>
            <select
              id="estimate-type"
              value={formData.buildingType}
              onChange={(event) => handleChange("buildingType", event.target.value)}
              className={selectClasses}
            >
              <option value="">Select a building type</option>
              {BUILDING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-location" className={labelClasses}>
              Building Location
            </label>
            <input
              id="estimate-location"
              type="text"
              value={formData.buildingLocation}
              onChange={(event) => handleChange("buildingLocation", event.target.value)}
              className={fieldClasses}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-start" className={labelClasses}>
              Proposed Start Date
            </label>
            <input
              id="estimate-start"
              type="date"
              value={formData.startDate}
              onChange={(event) => handleChange("startDate", event.target.value)}
              className={fieldClasses}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="estimate-size" className={labelClasses}>
              Approximate Building Size (sq ft)
            </label>
            <input
              id="estimate-size"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="e.g. 1,200"
              value={formData.buildingSize}
              onChange={(event) => handleChange("buildingSize", event.target.value)}
              className={`placeholder:text-acorn-charcoal/40 ${fieldClasses}`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="estimate-description" className={labelClasses}>
            Description of the Building
          </label>
          <textarea
            id="estimate-description"
            rows={5}
            placeholder="Tell us about your project"
            value={formData.buildingDescription}
            onChange={(event) => handleChange("buildingDescription", event.target.value)}
            className={`resize-none placeholder:text-acorn-charcoal/40 ${fieldClasses}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="estimate-comments" className={labelClasses}>
            Additional Comments
          </label>
          <textarea
            id="estimate-comments"
            rows={4}
            value={formData.additionalComments}
            onChange={(event) => handleChange("additionalComments", event.target.value)}
            className={`resize-none ${fieldClasses}`}
          />
        </div>
      </fieldset>

      <Button type="submit" variant="primary" className="mt-10 self-start">
        Get My Free Estimate
      </Button>
    </form>
  );
}
