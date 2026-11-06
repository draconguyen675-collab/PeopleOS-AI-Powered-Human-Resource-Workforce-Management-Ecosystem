import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useMe } from "../../services/queries";
import type { EmployeeDetail } from "../../types/api";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";
import { Button } from "../../components/ui/button";
import EmployeeForm from "./EmployeeForm";

function EditorSnapshot({ employee }: { employee?: EmployeeDetail }) {
  // Background refreshes must not replace a draft or remove it when another user archives the profile.
  const [initial] = useState(employee);
  return initial?.archivedAt ? (
    <div className="empty-state">
      <h2>This profile is archived</h2>
      <p>Restore it from the employee profile before editing.</p>
    </div>
  ) : (
    <EmployeeForm employee={initial} />
  );
}

export default function EmployeeEditorPage() {
  const { id } = useParams();
  const { data: me } = useMe();
  const writable = !!me?.permissions.includes("employees:write");
  const query = useQuery({
    queryKey: ["employee", id],
    queryFn: () => api<EmployeeDetail>(`/employees/${id}`),
    enabled: !!id && writable,
  });
  if (!writable)
    return (
      <ErrorState
        error={
          new Error("You do not have permission to manage employee profiles.")
        }
      />
    );
  if (id && query.isPending) return <Loading />;
  if (query.error && !query.data)
    return (
      <ErrorState error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <>
      <PageHeading
        eyebrow="PEOPLE / WORK PROFILE"
        title={id ? "Edit employee profile." : "Welcome someone new."}
        description="Keep your team’s work information accurate and connected."
        action={
          <Button variant="outline" asChild>
            <Link
              to={id ? `/app/people/employees/${id}` : "/app/people/employees"}
            >
              Back
            </Link>
          </Button>
        }
      />
      <section className="panel">
        <EditorSnapshot key={id ?? "new"} employee={query.data} />
      </section>
    </>
  );
}
