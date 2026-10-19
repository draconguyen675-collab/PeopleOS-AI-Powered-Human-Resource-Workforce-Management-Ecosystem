import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, History, RefreshCw } from "lucide-react";
import { api } from "../../services/api";
import type { AuditEvent, Page } from "../../types/api";
import { Button } from "../../components/ui/button";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";
export default function AuditPage() {
  const [page, setPage] = useState(0);
  const query = useQuery({
    queryKey: ["audit", page],
    queryFn: () => api<Page<AuditEvent>>(`/audit?page=${page}&size=15`),
  });
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION / ACTIVITY"
        title="A clear record of what changed."
        description="Account activity and company updates, all in one place."
        action={
          <Button
            variant="outline"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        }
      />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Workspace activity</h2>
            <p>
              Most recent events first · times shown in your browser timezone
            </p>
          </div>
          <History size={20} />
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <div className="empty-state">
            <History size={30} />
            <h2>A fresh start</h2>
            <p>Workspace activity will appear here.</p>
          </div>
        ) : (
          <ol className="audit-list">
            {query.data.items.map((event) => (
              <li key={event.id}>
                <div className="audit-icon">
                  <History size={17} />
                </div>
                <div>
                  <strong>{event.summary}</strong>
                  <span>
                    {event.actor} <span aria-hidden="true">·</span>{" "}
                    {event.action.toLowerCase().replaceAll("_", " ")}
                  </span>
                </div>
                <time dateTime={event.occurredAt}>
                  {format(new Date(event.occurredAt), "MMM d, yyyy · HH:mm")}
                </time>
              </li>
            ))}
          </ol>
        )}
        <div className="table-pagination">
          <span>{query.data?.total ?? 0} recorded events</span>
          <div>
            <Button
              variant="outline"
              disabled={page === 0 || query.isFetching}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={
                !query.data ||
                (page + 1) * 15 >= query.data.total ||
                query.isFetching
              }
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
