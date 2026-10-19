import { useQuery } from "@tanstack/react-query";
import { Check, ShieldCheck } from "lucide-react";
import { api } from "../../services/api";
import type { Role } from "../../types/api";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";
const permissionLabels: Record<string, string> = {
  "dashboard:read": "View workforce overview",
  "employees:read": "View employee directory",
  "company:read": "View company settings",
  "company:write": "Update company settings",
  "roles:read": "View roles and permissions",
  "audit:read": "Read workspace audit log",
};
export default function RolesPage() {
  const query = useQuery({
    queryKey: ["roles"],
    queryFn: () => api<Role[]>("/roles"),
  });
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION / ACCESS"
        title="The right access, for everyone."
        description="Understand what each workspace role can see and do."
      />
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <div className="role-grid">
          {query.data.map((role) => (
            <article className="panel role-card" key={role.code}>
              <div className="role-icon">
                <ShieldCheck size={25} />
              </div>
              <h2>{role.name}</h2>
              <p>{role.description}</p>
              <span className="subtle-badge">
                {role.permissions.length} permissions
              </span>
              <ul>
                {role.permissions.map((permission) => (
                  <li key={permission}>
                    <Check size={16} />
                    {permissionLabels[permission] ?? permission}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
      <p className="quiet-note">
        Permissions are enforced by the server on every request. This view shows
        the current role catalog.
      </p>
    </>
  );
}
