import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { Archive, ArrowLeft, Pencil, RotateCcw } from "lucide-react";
import { api } from "../../services/api";
import { useMe } from "../../services/queries";
import type { AuditEvent, EmployeeDetail, Page } from "../../types/api";
import { Button } from "../../components/ui/button";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";
import { initials } from "../../lib/utils";

function ArchiveAction({ employee }: { employee: EmployeeDetail }) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const client = useQueryClient();
  const archived = !!employee.archivedAt;
  // Capture the reviewed revision when opening the dialog; background refetches must not approve a newer revision.
  const [version, setVersion] = useState(employee.version);
  const mutation = useMutation({
    mutationFn: () =>
      api<EmployeeDetail>(
        archived
          ? `/employees/${employee.id}/restore`
          : `/employees/${employee.id}?version=${version}`,
        {
          method: archived ? "POST" : "DELETE",
          ...(archived ? { body: JSON.stringify({ version }) } : {}),
        },
      ),
    onSuccess: async (result) => {
      setOpen(false);
      client.setQueryData(["employee", employee.id], result);
      setNotice(
        result.archivedAt ? "Employee archived." : "Employee restored.",
      );
      await Promise.all(
        ["employees", "overview", "audit", "employee-history"].map((key) =>
          client.invalidateQueries({ queryKey: [key] }),
        ),
      );
    },
  });
  return (
    <div className="employee-archive-action">
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!mutation.isPending) {
            setOpen(next);
            setVersion(employee.version);
            mutation.reset();
          }
        }}
      >
        <Dialog.Trigger asChild>
          <Button variant="outline">
            {archived ? <RotateCcw size={16} /> : <Archive size={16} />}
            {archived ? "Restore employee" : "Archive employee"}
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className="confirmation-dialog"
            onPointerDownOutside={(event) => event.preventDefault()}
          >
            <Dialog.Title>
              {archived ? "Restore employee?" : "Archive employee?"}
            </Dialog.Title>
            <Dialog.Description>
              {archived
                ? "This profile will reappear in the current directory and workforce overview."
                : "This profile will leave the current directory and workforce overview. Its information and history will be kept, and you can restore it later. This does not complete an offboarding process."}
            </Dialog.Description>
            {mutation.error && (
              <p className="field-error" role="alert">
                {mutation.error.message} Close this dialog and refresh the
                profile before retrying if it has changed.
              </p>
            )}
            <div className="confirmation-actions">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending
                  ? "Saving…"
                  : archived
                    ? "Confirm restore"
                    : "Confirm archive"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {notice && (
        <p role="status" className="success-message">
          {notice}
        </p>
      )}
    </div>
  );
}

function EmployeeHistory({ id }: { id: string }) {
  const [page, setPage] = useState(0);
  const history = useQuery({
    queryKey: ["employee-history", id, page],
    queryFn: () =>
      api<Page<AuditEvent>>(`/employees/${id}/history?page=${page}&size=10`),
  });
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Profile activity</h2>
          <p>Changes to this work profile · times in your browser timezone</p>
        </div>
      </div>
      {history.isPending ? (
        <Loading />
      ) : history.error ? (
        <ErrorState
          error={history.error}
          retry={() => void history.refetch()}
        />
      ) : history.data.items.length === 0 ? (
        <p className="employee-empty-history">
          No profile changes have been recorded yet.
        </p>
      ) : (
        <ol className="audit-list">
          {history.data.items.map((event) => (
            <li key={event.id}>
              <div>
                <strong>{event.summary}</strong>
                <span>{event.actor}</span>
              </div>
              <time dateTime={event.occurredAt}>
                {format(new Date(event.occurredAt), "MMM d, yyyy · HH:mm")}
              </time>
            </li>
          ))}
        </ol>
      )}
      <div className="table-pagination">
        <span>{history.data?.total ?? 0} events</span>
        <div>
          <Button
            variant="outline"
            disabled={!page || history.isFetching}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={
              !history.data ||
              (page + 1) * 10 >= history.data.total ||
              history.isFetching
            }
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
export default function EmployeeDetailPage() {
  const { id } = useParams();
  const { data: me } = useMe();
  const query = useQuery({
    queryKey: ["employee", id],
    queryFn: () => api<EmployeeDetail>(`/employees/${id}`),
  });
  if (query.isPending) return <Loading />;
  if (query.error)
    return (
      <ErrorState error={query.error} retry={() => void query.refetch()} />
    );
  const employee = query.data;
  const writable = me?.permissions.includes("employees:write");
  return (
    <>
      <PageHeading
        eyebrow="PEOPLE / WORK PROFILE"
        title={employee.name}
        description={`${employee.position} · ${employee.department}`}
        action={
          <Button variant="outline" asChild>
            <Link
              to={
                employee.archivedAt
                  ? "/app/people/employees?archived=true"
                  : "/app/people/employees"
              }
            >
              <ArrowLeft size={16} />
              Directory
            </Link>
          </Button>
        }
      />
      <section className="panel employee-profile">
        <div className="employee-profile-header">
          <div className="avatar avatar-green">{initials(employee.name)}</div>
          <div>
            <h2>Work information</h2>
            <p>
              {employee.archivedAt ? "Archived profile" : "Current profile"}
            </p>
          </div>
          {writable && !employee.archivedAt && (
            <Button variant="outline" asChild>
              <Link to={`/app/people/employees/${id}/edit`}>
                <Pencil size={16} />
                Edit profile
              </Link>
            </Button>
          )}
        </div>
        <dl className="employee-detail-grid">
          {[
            ["Employee number", employee.employeeNumber],
            ["Work email", employee.workEmail],
            ["Department", employee.department],
            ["Position", employee.position],
            ["Position catalog", employee.positionName ?? "Not linked"],
            ["Location", employee.location],
            [
              "Status",
              {
                ACTIVE: "Active",
                ONBOARDING: "Onboarding",
                ON_LEAVE: "On leave",
              }[employee.status],
            ],
            ["Start date", employee.startedOn],
            [
              "Last updated",
              format(new Date(employee.updatedAt), "MMM d, yyyy · HH:mm"),
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {writable && <ArchiveAction employee={employee} />}
      </section>
      <EmployeeHistory id={employee.id} />
      <p className="quiet-note">
        Work information only. Personal data, compensation and employment
        lifecycle workflows are separate capabilities.
      </p>
    </>
  );
}
