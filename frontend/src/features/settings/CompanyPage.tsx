import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Building2, Check, Save } from "lucide-react";
import { useCompany, useMe } from "../../services/queries";
import { api, ApiError } from "../../services/api";
import type { Company } from "../../types/api";
import { Button } from "../../components/ui/button";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";

import { companySchema } from "./companySchema";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
type Values = z.infer<typeof companySchema>;
function CompanyForm({
  company,
  writable,
}: {
  company: Company;
  writable: boolean;
}) {
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError: fieldError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(companySchema),
    defaultValues: company,
  });
  useEffect(() => {
    reset(company);
  }, [company, reset]);
  useUnsavedChanges(isDirty);
  const submit = handleSubmit(async (values) => {
    setError("");
    setMessage("");
    try {
      const result = await api<Company>("/company", {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      reset(result);
      client.setQueryData(["company"], result);
      await client.invalidateQueries({ queryKey: ["audit"] });
      setMessage("Company settings saved.");
    } catch (failure) {
      if (failure instanceof ApiError && failure.errors)
        for (const [key, value] of Object.entries(failure.errors))
          if (key in values)
            fieldError(key as keyof Values, { message: value });
      setError(
        failure instanceof Error ? failure.message : "Could not save settings.",
      );
    }
  });
  return (
    <form onSubmit={submit} noValidate className="settings-form">
      <div className="company-identity">
        <div className="company-mark large">{company.name[0]}</div>
        <div>
          <h2>{company.name}</h2>
          <span>{company.slug}.peopleos</span>
        </div>
      </div>
      <div className="form-section-heading">
        <h2>Company details</h2>
        <p>The basics that make this workspace yours.</p>
      </div>
      <fieldset disabled={!writable || isSubmitting}>
        <div className="field">
          <label htmlFor="company-name">
            Company name <span>*</span>
          </label>
          <input
            id="company-name"
            {...register("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <small id="name-error" className="field-error">
              {errors.name.message}
            </small>
          )}
        </div>
        <div className="form-columns">
          <div className="field">
            <label htmlFor="timezone">
              Timezone <span>*</span>
            </label>
            <input
              id="timezone"
              list="timezones"
              {...register("timezone")}
              aria-invalid={!!errors.timezone}
            />
            <datalist id="timezones">
              <option value="Asia/Ho_Chi_Minh" />
              <option value="Asia/Bangkok" />
              <option value="Asia/Singapore" />
              <option value="UTC" />
              <option value="Europe/London" />
              <option value="America/New_York" />
            </datalist>
            <small>Used for your company’s regional settings.</small>
            {errors.timezone && (
              <small className="field-error">{errors.timezone.message}</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="currency">
              Currency <span>*</span>
            </label>
            <select id="currency" {...register("currency")}>
              <option value="VND">VND · Vietnamese dong</option>
              <option value="USD">USD · US dollar</option>
              <option value="EUR">EUR · Euro</option>
              <option value="THB">THB · Thai baht</option>
              <option value="SGD">SGD · Singapore dollar</option>
            </select>
            {errors.currency && (
              <small className="field-error">{errors.currency.message}</small>
            )}
          </div>
        </div>
      </fieldset>
      {error && (
        <div role="alert" className="form-error">
          {error}
          <Button
            variant="ghost"
            onClick={() => {
              void client.invalidateQueries({ queryKey: ["company"] });
            }}
          >
            Reload settings
          </Button>
        </div>
      )}
      {message && (
        <p className="success-message" role="status">
          <Check size={17} />
          {message}
        </p>
      )}
      <div className="form-actions">
        <span>
          {writable
            ? "Changes are recorded in your activity log."
            : "Only workspace owners can edit these settings."}
        </span>
        {writable && (
          <div>
            <Button
              variant="outline"
              disabled={!isDirty || isSubmitting}
              onClick={() => {
                reset(company);
                setError("");
                setMessage("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              <Save size={16} />
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
export default function CompanyPage() {
  const query = useCompany();
  const { data: me } = useMe();
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION / COMPANY"
        title="Your company, your workspace."
        description="Keep your organization’s details in one thoughtful place."
      />
      <div className="settings-grid">
        <section className="panel">
          {query.isPending ? (
            <Loading />
          ) : query.error ? (
            <ErrorState
              error={query.error}
              retry={() => void query.refetch()}
            />
          ) : (
            <CompanyForm
              company={query.data}
              writable={!!me?.permissions.includes("company:write")}
            />
          )}
        </section>
        <aside className="settings-aside">
          <Building2 size={26} />
          <h2>A strong foundation.</h2>
          <p>
            Company settings are shared across your workspace. Keep them up to
            date as your organization grows.
          </p>
          <hr />
          <strong>Workspace access</strong>
          <p>Your current role: {me?.role.replace("_", " ").toLowerCase()}.</p>
        </aside>
      </div>
    </>
  );
}
