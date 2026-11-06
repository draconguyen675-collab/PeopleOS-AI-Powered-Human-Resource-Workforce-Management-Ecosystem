import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BriefcaseBusiness, Plus, RefreshCw, Search } from "lucide-react";
import { api, ApiError } from "../../services/api";
import { useMe } from "../../services/queries";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import type { Page, PositionDetail } from "../../types/api";
import { Button } from "../../components/ui/button";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";

const schema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Position code is required.")
    .max(30)
    .regex(
      /^[A-Z0-9][A-Z0-9._-]*$/,
      "Use letters, numbers, dots, hyphens or underscores.",
    ),
  title: z.string().trim().min(1, "Position title is required.").max(120),
  description: z.string().trim().max(1000),
});
type Values = z.infer<typeof schema>;
type DialogProps = {
  onClose: () => void;
  onChanged: () => void;
  restoreFocus: () => void;
};

function PositionEditor({
  position,
  onClose,
  onChanged,
  restoreFocus,
}: DialogProps & { position: PositionDetail | null }) {
  const [error, setError] = useState<Error | null>(null);
  const {
    register,
    reset,
    handleSubmit,
    setError: fieldError,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: position
      ? {
          code: position.code,
          title: position.title,
          description: position.description,
        }
      : { code: "", title: "", description: "" },
  });
  useUnsavedChanges(isDirty);
  function close() {
    if (
      isSubmitting ||
      (isDirty && !window.confirm("Discard unsaved position changes?"))
    )
      return;
    onClose();
  }
  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      await api<PositionDetail>(
        position
          ? `/organization/positions/${position.id}`
          : "/organization/positions",
        {
          method: position ? "PATCH" : "POST",
          body: JSON.stringify(
            position ? { version: position.version, details: values } : values,
          ),
        },
      );
      reset(values);
      onChanged();
      onClose();
    } catch (failure) {
      if (failure instanceof ApiError && failure.errors) {
        for (const [path, message] of Object.entries(failure.errors)) {
          const key = path.replace(/^details\./, "");
          if (key in values) fieldError(key as keyof Values, { message });
        }
      }
      setError(
        failure instanceof Error
          ? failure
          : new Error("Could not save position."),
      );
    }
  });
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="confirmation-dialog department-editor"
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            if (isSubmitting) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
        >
          <Dialog.Title>
            {position ? "Edit position" : "Add position"}
          </Dialog.Title>
          <Dialog.Description>
            Define a standard role for employee profiles. Changes to this
            catalog do not change an employee’s individual position title.
          </Dialog.Description>
          <form onSubmit={submit} noValidate>
            <fieldset disabled={isSubmitting}>
              {(
                [
                  { key: "code", label: "Position code", max: 30 },
                  { key: "title", label: "Position title", max: 120 },
                ] as const
              ).map(({ key, label, max }) => (
                <div className="field" key={key}>
                  <label htmlFor={`position-${key}`}>{label}</label>
                  <input
                    id={`position-${key}`}
                    maxLength={max}
                    {...register(key)}
                    aria-invalid={!!errors[key]}
                    aria-describedby={
                      errors[key] ? `position-${key}-error` : undefined
                    }
                  />
                  {errors[key] && (
                    <small id={`position-${key}-error`} className="field-error">
                      {errors[key].message}
                    </small>
                  )}
                </div>
              ))}
              <div className="field">
                <label htmlFor="position-description">Description</label>
                <textarea
                  id="position-description"
                  rows={4}
                  maxLength={1000}
                  {...register("description")}
                  aria-invalid={!!errors.description}
                  aria-describedby={
                    errors.description
                      ? "position-description-error"
                      : undefined
                  }
                />
                {errors.description && (
                  <small
                    id="position-description-error"
                    className="field-error"
                  >
                    {errors.description.message}
                  </small>
                )}
              </div>
            </fieldset>
            {error && (
              <p role="alert" className="field-error">
                {error.message}
                {error instanceof ApiError && error.status === 409
                  ? " Close the editor and refresh the list before retrying."
                  : ""}
              </p>
            )}
            <div className="confirmation-actions">
              <Button variant="outline" disabled={isSubmitting} onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Saving…" : "Save position"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DeletePosition({
  position,
  onClose,
  onChanged,
  restoreFocus,
}: DialogProps & { position: PositionDetail }) {
  const mutation = useMutation({
    mutationFn: () =>
      api<void>(
        `/organization/positions/${position.id}?version=${position.version}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      onChanged();
      onClose();
    },
  });
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="confirmation-dialog"
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            if (mutation.isPending) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
        >
          <Dialog.Title>Delete position?</Dialog.Title>
          <Dialog.Description>
            Delete {position.code} · {position.title}. Only unused positions can
            be deleted. This action is recorded in the activity log.
          </Dialog.Description>
          {mutation.error && (
            <p role="alert" className="field-error">
              {mutation.error.message}
            </p>
          )}
          <div className="confirmation-actions">
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Deleting…" : "Confirm deletion"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function PositionsPage() {
  const { data: me } = useMe();
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [editing, setEditing] = useState<{
    position: PositionDetail | null;
  } | null>(null);
  const [deleting, setDeleting] = useState<PositionDetail | null>(null);
  const [notice, setNotice] = useState("");
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const canRead = !!me?.permissions.includes("organization:read");
  const writable = !!me?.permissions.includes("organization:write");
  const params = new URLSearchParams({
    page: String(page),
    size: "12",
    search: submittedSearch,
  });
  const query = useQuery({
    queryKey: ["organization-positions", params.toString()],
    queryFn: () =>
      api<Page<PositionDetail>>(`/organization/positions?${params}`),
    enabled: canRead,
  });
  function restoreFocus() {
    if (dialogTrigger.current?.isConnected) dialogTrigger.current.focus();
    else searchInput.current?.focus();
  }
  function changed(message: string) {
    setNotice(message);
    setPage(0);
    void Promise.all(
      ["organization-positions", "positions", "employee", "audit"].map((key) =>
        client.invalidateQueries({ queryKey: [key] }),
      ),
    );
  }
  if (!canRead)
    return (
      <ErrorState
        error={
          new Error(
            "You do not have permission to view organization positions.",
          )
        }
      />
    );
  return (
    <>
      <PageHeading
        eyebrow="PEOPLE / ORGANIZATION"
        title="Clarity for every role."
        description="Build your position catalog and connect standard roles to employee work profiles."
        action={
          <div className="employee-page-actions">
            <Button
              variant="outline"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            {writable && (
              <Button
                onClick={(event) => {
                  dialogTrigger.current = event.currentTarget;
                  setNotice("");
                  setEditing({ position: null });
                }}
              >
                <Plus size={16} />
                Add position
              </Button>
            )}
          </div>
        }
      />
      {notice && (
        <p role="status" className="session-notice">
          {notice}
        </p>
      )}
      <section className="panel">
        <div className="directory-toolbar">
          <form
            className="search-field"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedSearch(search);
              setPage(0);
            }}
          >
            <Search size={17} />
            <input
              ref={searchInput}
              aria-label="Search positions"
              maxLength={100}
              placeholder="Search by title or code…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" variant="ghost">
              Search
            </Button>
          </form>
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness size={30} />
            <h2>No positions found</h2>
            <p>
              Add a position or adjust your search. Existing employee titles
              stay available in their profiles.
            </p>
            {submittedSearch && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSubmittedSearch("");
                  setPage(0);
                }}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="department-grid">
            {query.data.items.map((position) => (
              <article className="department-card" key={position.id}>
                <div className="department-card-heading">
                  <div className="company-mark">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <div>
                    <h2>{position.title}</h2>
                    <p>{position.code}</p>
                  </div>
                </div>
                <p className="department-description">
                  {position.description || "No description added."}
                </p>
                <dl className="department-counts">
                  <div>
                    <dt>Linked profiles</dt>
                    <dd>{position.employeeCount}</dd>
                  </div>
                </dl>
                {writable && (
                  <div className="department-actions">
                    <Button
                      variant="outline"
                      aria-label={`Edit ${position.code}`}
                      onClick={(event) => {
                        dialogTrigger.current = event.currentTarget;
                        setNotice("");
                        setEditing({ position });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label={`Delete ${position.code}`}
                      disabled={position.employeeCount > 0}
                      onClick={(event) => {
                        dialogTrigger.current = event.currentTarget;
                        setNotice("");
                        setDeleting(position);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
                {position.employeeCount > 0 && (
                  <p className="department-retention">
                    Unlink employee profiles before deleting.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
        <div className="table-pagination">
          <span>{query.data?.total ?? 0} positions</span>
          <div>
            <Button
              variant="outline"
              disabled={!page || query.isFetching}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={
                !query.data ||
                (page + 1) * 12 >= query.data.total ||
                query.isFetching
              }
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
      <p className="quiet-note">
        Linked profile counts include archived employees. A catalog entry
        represents a standard role; it does not represent an approved vacancy or
        headcount plan.
      </p>
      {editing && (
        <PositionEditor
          position={editing.position}
          onClose={() => setEditing(null)}
          onChanged={() => changed("Position saved.")}
          restoreFocus={restoreFocus}
        />
      )}
      {deleting && (
        <DeletePosition
          position={deleting}
          onClose={() => setDeleting(null)}
          onChanged={() => changed("Position deleted.")}
          restoreFocus={restoreFocus}
        />
      )}
    </>
  );
}
