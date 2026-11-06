import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { api, ApiError } from "../../services/api";
import type { Department, EmployeeDetail, Position } from "../../types/api";
import { Button } from "../../components/ui/button";
import { ErrorState, Loading } from "../../components/common/Feedback";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { employeeSchema, type EmployeeValues } from "./employeeSchema";

export default function EmployeeForm({
  employee,
}: {
  employee?: EmployeeDetail;
}) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(employee?.version);
  const [savedId, setSavedId] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [latestArchived, setLatestArchived] = useState(false);
  const [notice, setNotice] = useState("");
  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: () => api<Department[]>("/departments"),
  });
  const positions = useQuery({
    queryKey: ["positions"],
    queryFn: () => api<Position[]>("/positions"),
  });
  const {
    register,
    reset,
    handleSubmit,
    setError: fieldError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? { ...employee, positionId: employee.positionId ?? "" }
      : {
          employeeNumber: "",
          name: "",
          workEmail: "",
          departmentId: "",
          position: "",
          positionId: "",
          location: "",
          status: "ONBOARDING",
          startedOn: format(new Date(), "yyyy-MM-dd"),
        },
  });
  useUnsavedChanges(isDirty);
  useEffect(() => {
    if (savedId && !isDirty)
      navigate(`/app/people/employees/${savedId}`, { replace: true });
  }, [savedId, isDirty, navigate]);
  async function reload() {
    if (
      !employee ||
      (isDirty &&
        !window.confirm(
          "Discard your draft and reload the latest employee profile?",
        ))
    )
      return;
    setLoadingLatest(true);
    try {
      const latest = await api<EmployeeDetail>(`/employees/${employee.id}`);
      reset({ ...latest, positionId: latest.positionId ?? "" });
      setRevision(latest.version);
      setLatestArchived(!!latest.archivedAt);
      client.setQueryData(["employee", latest.id], latest);
      setError(null);
      setNotice(
        latest.archivedAt
          ? "This employee was archived. Return to the profile to restore it."
          : "Latest profile loaded.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure
          : new Error("Could not reload the profile."),
      );
    } finally {
      setLoadingLatest(false);
    }
  }
  const submit = handleSubmit(async (values) => {
    setError(null);
    setNotice("");
    try {
      const details = { ...values, positionId: values.positionId || null };
      const result = await api<EmployeeDetail>(
        employee ? `/employees/${employee.id}` : "/employees",
        {
          method: employee ? "PATCH" : "POST",
          body: JSON.stringify(
            employee ? { version: revision, details } : details,
          ),
        },
      );
      reset({ ...result, positionId: result.positionId ?? "" });
      setRevision(result.version);
      client.setQueryData(["employee", result.id], result);
      await Promise.all(
        [
          "employees",
          "overview",
          "audit",
          "employee-history",
          "organization-departments",
          "organization-positions",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      );
      setNotice("Employee profile saved.");
      if (!employee) setSavedId(result.id);
    } catch (failure) {
      if (failure instanceof ApiError && failure.errors) {
        for (const [path, message] of Object.entries(failure.errors)) {
          const key = path.replace(/^details\./, "");
          if (key in values)
            fieldError(key as keyof EmployeeValues, { message });
        }
      }
      setError(
        failure instanceof Error
          ? failure
          : new Error("Could not save the employee."),
      );
    }
  });
  if (departments.isPending || positions.isPending) return <Loading />;
  const optionsError = departments.error ?? positions.error;
  if (optionsError)
    return (
      <ErrorState
        error={optionsError}
        retry={() => {
          void departments.refetch();
          void positions.refetch();
        }}
      />
    );
  if (!departments.data || !positions.data) return <Loading />;
  const fields = [
    { key: "employeeNumber", label: "Employee number", type: "text", max: 30 },
    { key: "name", label: "Full name", type: "text", max: 120 },
    { key: "workEmail", label: "Work email", type: "email", max: 254 },
    { key: "position", label: "Position", type: "text", max: 120 },
    { key: "location", label: "Location", type: "text", max: 120 },
    { key: "startedOn", label: "Start date", type: "date", max: undefined },
  ] as const;
  return (
    <form onSubmit={submit} noValidate className="settings-form">
      <div className="form-section-heading">
        <h2>Work information</h2>
        <p>
          Use an employee number unique to this workspace. The catalog link is
          optional; other fields are required.
        </p>
      </div>
      <fieldset disabled={isSubmitting || loadingLatest || latestArchived}>
        <div className="employee-form-grid">
          {fields.map(({ key, label, type, max }) => (
            <div className="field" key={key}>
              <label htmlFor={`employee-${key}`}>{label}</label>
              <input
                id={`employee-${key}`}
                type={type}
                maxLength={max}
                {...register(key)}
                aria-invalid={!!errors[key]}
                aria-describedby={errors[key] ? `error-${key}` : undefined}
              />
              {errors[key] && (
                <small id={`error-${key}`} className="field-error">
                  {errors[key]?.message}
                </small>
              )}
            </div>
          ))}
          <div className="field">
            <label htmlFor="employee-position-catalog">
              Position catalog (optional)
            </label>
            <select
              id="employee-position-catalog"
              {...register("positionId")}
              aria-describedby="position-catalog-help"
            >
              <option value="">No catalog link</option>
              {positions.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.title}
                </option>
              ))}
            </select>
            <small id="position-catalog-help">
              Link to a standard role. The position title above remains specific
              to this employee.
            </small>
          </div>
          <div className="field">
            <label htmlFor="employee-department">Department</label>
            <select
              id="employee-department"
              {...register("departmentId")}
              aria-invalid={!!errors.departmentId}
              aria-describedby={
                errors.departmentId ? "error-departmentId" : undefined
              }
            >
              <option value="">Choose a department</option>
              {departments.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <small id="error-departmentId" className="field-error">
                {errors.departmentId.message}
              </small>
            )}
          </div>
          <div className="field">
            <label htmlFor="employee-status">Status</label>
            <select id="employee-status" {...register("status")}>
              <option value="ACTIVE">Active</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="ON_LEAVE">On leave</option>
            </select>
            {errors.status && (
              <small className="field-error">{errors.status.message}</small>
            )}
          </div>
        </div>
      </fieldset>
      {error && (
        <div className="form-error" role="alert">
          {error.message}
          {employee && error instanceof ApiError && error.status === 409 && (
            <Button
              variant="outline"
              disabled={loadingLatest}
              onClick={() => void reload()}
            >
              Reload latest profile
            </Button>
          )}
        </div>
      )}
      {notice && (
        <p role="status" className="success-message">
          {notice}
        </p>
      )}
      <div className="form-actions">
        <span>Changes are recorded in the employee’s activity history.</span>
        <div>
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() =>
              navigate(
                employee
                  ? `/app/people/employees/${employee.id}`
                  : "/app/people/employees",
              )
            }
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !isDirty || isSubmitting || loadingLatest || latestArchived
            }
          >
            {isSubmitting
              ? "Saving…"
              : employee
                ? "Save employee"
                : "Create employee"}
          </Button>
        </div>
      </div>
    </form>
  );
}
