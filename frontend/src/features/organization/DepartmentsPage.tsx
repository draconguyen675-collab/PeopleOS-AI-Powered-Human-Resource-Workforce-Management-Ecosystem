import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, RefreshCw, Search } from "lucide-react";
import { api } from "../../services/api";
import { useMe } from "../../services/queries";
import type { Department, DepartmentDetail, Page } from "../../types/api";
import { Button } from "../../components/ui/button";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";
import { DepartmentEditor, DeleteDepartment } from "./DepartmentDialogs";

export default function DepartmentsPage() {
  const { data: me } = useMe();
  const client = useQueryClient();
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  function restoreFocus() {
    const trigger = dialogTrigger.current;
    if (trigger?.isConnected) trigger.focus();
    else searchInput.current?.focus();
  }
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [parentId, setParentId] = useState("");
  const [editing, setEditing] = useState<{
    department: DepartmentDetail | null;
  } | null>(null);
  const [deleting, setDeleting] = useState<DepartmentDetail | null>(null);
  const [notice, setNotice] = useState("");
  const canRead = !!me?.permissions.includes("organization:read");
  const writable = !!me?.permissions.includes("organization:write");
  const params = new URLSearchParams({
    page: String(page),
    size: "12",
    search: submittedSearch,
  });
  if (parentId) params.set("parentId", parentId);
  const query = useQuery({
    queryKey: ["organization-departments", params.toString()],
    queryFn: () =>
      api<Page<DepartmentDetail>>(`/organization/departments?${params}`),
    enabled: canRead,
  });
  const options = useQuery({
    queryKey: ["departments"],
    queryFn: () => api<Department[]>("/departments"),
    enabled: canRead,
  });
  function changed(message: string) {
    setNotice(message);
    setPage(0);
    void Promise.all(
      [
        "organization-departments",
        "departments",
        "employees",
        "employee",
        "overview",
        "audit",
      ].map((key) => client.invalidateQueries({ queryKey: [key] })),
    );
  }
  if (!canRead)
    return (
      <ErrorState
        error={
          new Error(
            "You do not have permission to view organization departments.",
          )
        }
      />
    );
  return (
    <>
      <PageHeading
        eyebrow="PEOPLE / ORGANIZATION"
        title="A place for every team."
        description="Connect departments, keep work profiles organized and maintain a clear reporting structure."
        action={
          <div className="employee-page-actions">
            <Button
              variant="outline"
              disabled={query.isFetching}
              onClick={() => {
                void query.refetch();
                void options.refetch();
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            {writable && (
              <Button
                disabled={!options.data}
                onClick={(event) => {
                  dialogTrigger.current = event.currentTarget;
                  setNotice("");
                  setEditing({ department: null });
                }}
              >
                <Plus size={16} />
                Add department
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
              aria-label="Search departments"
              maxLength={100}
              placeholder="Find a department…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" variant="ghost">
              Search
            </Button>
          </form>
          <select
            aria-label="Filter by parent department"
            value={parentId}
            onChange={(event) => {
              setParentId(event.target.value);
              setPage(0);
            }}
          >
            <option value="">All parent departments</option>
            {options.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        {options.error && (
          <ErrorState
            error={options.error}
            retry={() => void options.refetch()}
          />
        )}
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <div className="empty-state">
            <Building2 size={30} />
            <h2>No departments found</h2>
            <p>Create a department or adjust the filters.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setSubmittedSearch("");
                setParentId("");
                setPage(0);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="department-grid">
            {query.data.items.map((department) => (
              <article className="department-card" key={department.id}>
                <div className="department-card-heading">
                  <div className="company-mark">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h2>{department.name}</h2>
                    <p>
                      {department.parentName
                        ? `Within ${department.parentName}`
                        : "Top-level department"}
                    </p>
                  </div>
                </div>
                <p className="department-description">
                  {department.description || "No description added."}
                </p>
                <dl className="department-counts">
                  <div>
                    <dt>Linked profiles</dt>
                    <dd>{department.employeeCount}</dd>
                  </div>
                  <div>
                    <dt>Child departments</dt>
                    <dd>{department.childCount}</dd>
                  </div>
                </dl>
                <div className="department-links">
                  <Link
                    to={`/app/people/employees?department=${department.id}`}
                  >
                    View current employees
                  </Link>
                  {department.childCount > 0 && (
                    <button
                      onClick={() => {
                        setParentId(department.id);
                        setSearch("");
                        setSubmittedSearch("");
                        setPage(0);
                      }}
                    >
                      Show child departments
                    </button>
                  )}
                </div>
                {writable && (
                  <div className="department-actions">
                    <Button
                      variant="outline"
                      aria-label={`Edit ${department.name}`}
                      disabled={!options.data}
                      onClick={(event) => {
                        dialogTrigger.current = event.currentTarget;
                        setNotice("");
                        setEditing({ department });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      aria-label={`Delete ${department.name}`}
                      disabled={
                        department.employeeCount > 0 ||
                        department.childCount > 0
                      }
                      onClick={(event) => {
                        dialogTrigger.current = event.currentTarget;
                        setNotice("");
                        setDeleting(department);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
                {(department.employeeCount > 0 ||
                  department.childCount > 0) && (
                  <p className="department-retention">
                    Move linked profiles and child departments before deleting.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
        <div className="table-pagination">
          <span>{query.data?.total ?? 0} departments</span>
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
        Linked profile counts include archived employees. Department changes are
        recorded in the activity log.
      </p>
      {editing && options.data && (
        <DepartmentEditor
          department={editing.department}
          options={options.data}
          onClose={() => setEditing(null)}
          onSaved={() => changed("Department saved.")}
          restoreFocus={restoreFocus}
        />
      )}
      {deleting && (
        <DeleteDepartment
          department={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => changed("Department deleted.")}
          restoreFocus={restoreFocus}
        />
      )}
    </>
  );
}
