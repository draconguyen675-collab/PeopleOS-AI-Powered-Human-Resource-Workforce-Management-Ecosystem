import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { api } from "../../services/api";
import type { Department, Employee, Page } from "../../types/api";
import { initials } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";

const column = createColumnHelper<Employee>();
const statusLabels = {
  ACTIVE: "Active",
  ONBOARDING: "Onboarding",
  ON_LEAVE: "On leave",
};
export default function EmployeesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const submittedSearch = params.get("search") ?? "";
  useEffect(() => {
    setSearch(submittedSearch);
  }, [submittedSearch]);
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const page = Math.max(0, Number(params.get("page")) || 0);
  const size = 12;
  const queryString = new URLSearchParams(params);
  queryString.set("size", String(size));
  queryString.set("page", String(page));
  const query = useQuery({
    queryKey: ["employees", queryString.toString()],
    queryFn: () => api<Page<Employee>>(`/employees?${queryString}`),
    placeholderData: keepPreviousData,
  });
  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: () => api<Department[]>("/departments"),
  });
  function change(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  }
  const columns = useMemo(
    () => [
      column.accessor("name", {
        header: "Employee",
        cell: (info) => (
          <div className="employee-cell">
            <div
              className={`avatar avatar-${info.row.index % 3 === 0 ? "green" : info.row.index % 3 === 1 ? "peach" : "purple"}`}
            >
              {initials(info.getValue())}
            </div>
            <div>
              <strong>{info.getValue()}</strong>
              <span>{info.row.original.workEmail}</span>
            </div>
          </div>
        ),
      }),
      column.accessor("position", {
        header: "Position",
        cell: (info) => (
          <div className="position-cell">
            {info.getValue()}
            <span>{info.row.original.employeeNumber}</span>
          </div>
        ),
      }),
      column.accessor("department", {
        header: "Department",
        cell: (info) => (
          <span className="department-tag">{info.getValue()}</span>
        ),
      }),
      column.accessor("location", { header: "Location" }),
      column.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span
            className={`status-badge status-${info.getValue().toLowerCase()}`}
          >
            <span />
            {statusLabels[info.getValue()]}
          </span>
        ),
      }),
    ],
    [],
  );
  const table = useReactTable({
    data: query.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility: visibility },
    onColumnVisibilityChange: setVisibility,
  });
  return (
    <>
      <PageHeading
        eyebrow="PEOPLE / DIRECTORY"
        title="Good people. Great possibilities."
        description="Get to know the people who make your organization."
        action={
          <span className="count-pill">
            <Users size={16} />
            {query.data?.total ?? "…"} people
          </span>
        }
      />
      <section className="panel directory-panel">
        <div className="directory-toolbar">
          <form
            className="search-field"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              change("search", search);
            }}
          >
            <Search size={17} />
            <input
              aria-label="Search employee directory"
              placeholder="Search by name or work email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit" variant="ghost">
              Search
            </Button>
          </form>
          <div className="table-filters">
            <select
              aria-label="Filter by department"
              value={params.get("department") ?? ""}
              onChange={(event) => change("department", event.target.value)}
            >
              <option value="">All departments</option>
              {departments.data?.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={params.get("status") ?? ""}
              onChange={(event) => change("status", event.target.value)}
            >
              <option value="">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              aria-label={`Sort by name ${params.get("direction") === "desc" ? "ascending" : "descending"}`}
              onClick={() =>
                change(
                  "direction",
                  params.get("direction") === "desc" ? "asc" : "desc",
                )
              }
            >
              <ArrowDownUp size={16} />
              <span>Sort</span>
            </Button>
            <details className="column-picker">
              <summary aria-label="Choose table columns">
                <SlidersHorizontal size={17} />
              </summary>
              <div>
                {table
                  .getAllLeafColumns()
                  .filter((item) => item.id !== "name")
                  .map((item) => (
                    <label key={item.id}>
                      <input
                        type="checkbox"
                        checked={item.getIsVisible()}
                        onChange={item.getToggleVisibilityHandler()}
                      />
                      {String(item.columnDef.header)}
                    </label>
                  ))}
              </div>
            </details>
          </div>
        </div>
        {departments.error && (
          <ErrorState
            error={departments.error}
            retry={() => void departments.refetch()}
          />
        )}
        <div aria-live="polite" className="table-status">
          {query.isFetching && !query.isPending
            ? "Updating directory…"
            : `${query.data?.total ?? 0} people in this view`}
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <div className="empty-state">
            <Users size={32} />
            <h2>No people found</h2>
            <p>Try a different name or adjust your filters.</p>
            <Button
              variant="outline"
              onClick={() => {
                setParams({});
                setSearch("");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <caption className="sr-only">Employee directory</caption>
                <thead>
                  {table.getHeaderGroups().map((group) => (
                    <tr key={group.id}>
                      {group.headers.map((header) => (
                        <th key={header.id} scope="col">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-employee-list">
              {query.data.items.map((employee) => (
                <article key={employee.id}>
                  <div className="employee-cell">
                    <div className="avatar avatar-green">
                      {initials(employee.name)}
                    </div>
                    <div>
                      <strong>{employee.name}</strong>
                      <span>{employee.position}</span>
                    </div>
                  </div>
                  <div className="mobile-employee-meta">
                    <span>{employee.department}</span>
                    <span
                      className={`status-badge status-${employee.status.toLowerCase()}`}
                    >
                      {statusLabels[employee.status]}
                    </span>
                  </div>
                  <p>{employee.workEmail}</p>
                </article>
              ))}
            </div>
          </>
        )}
        <div className="table-pagination">
          <span>
            {query.data?.total
              ? `${page * size + 1}–${Math.min((page + 1) * size, query.data.total)} of ${query.data.total} people`
              : "0 people"}
          </span>
          <div>
            <Button
              variant="outline"
              disabled={page === 0 || query.isFetching}
              onClick={() => change("page", String(page - 1))}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              disabled={
                !query.data ||
                (page + 1) * size >= query.data.total ||
                query.isFetching
              }
              onClick={() => change("page", String(page + 1))}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </section>
      <p className="quiet-note">
        This directory shows work information only. Personal and compensation
        details are not included.
      </p>
    </>
  );
}
