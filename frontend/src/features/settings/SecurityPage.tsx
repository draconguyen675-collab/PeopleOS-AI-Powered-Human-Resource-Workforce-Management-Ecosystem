import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { Monitor, RefreshCw } from "lucide-react";
import { api } from "../../services/api";
import type { Page, SignInSession } from "../../types/api";
import { Button } from "../../components/ui/button";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";

function timestamp(value: string) {
  return format(new Date(value), "MMM d, yyyy · HH:mm:ss");
}

function RevokeSession({
  session,
  onRevoked,
}: {
  session: SignInSession;
  onRevoked: () => void;
}) {
  const [open, setOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: () =>
      api<void>(`/auth/sessions/${session.id}`, { method: "DELETE" }),
    onSuccess: () => {
      setOpen(false);
      onRevoked();
    },
  });
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) {
          setOpen(next);
          mutation.reset();
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="outline">Revoke session</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="confirmation-dialog"
          onEscapeKeyDown={(event) => {
            if (mutation.isPending) event.preventDefault();
          }}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <Dialog.Title>Revoke this session?</Dialog.Title>
          <Dialog.Description>
            The session started {timestamp(session.createdAt)} will need to sign
            in again on its next request. Your current session will stay signed
            in.
          </Dialog.Description>
          {mutation.error && (
            <p role="alert" className="field-error">
              {mutation.error.message}
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
              {mutation.isPending ? "Revoking…" : "Confirm revocation"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function SecurityPage() {
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState("");
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["sessions", page],
    queryFn: () =>
      api<Page<SignInSession>>(`/auth/sessions?page=${page}&size=10`),
  });
  function revoked() {
    setNotice("Session revoked. That session must sign in again.");
    setPage(0);
    void client.invalidateQueries({ queryKey: ["sessions"] });
    void client.invalidateQueries({ queryKey: ["audit"] });
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR ACCOUNT / SECURITY"
        title="Your sign-in sessions."
        description="Review active sessions and end access you no longer need."
        action={
          <Button
            variant="outline"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        }
      />
      {notice && (
        <p role="status" className="session-notice">
          {notice}
        </p>
      )}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Active sessions</h2>
            <p>Only your account · times shown in your browser timezone</p>
          </div>
          <Monitor size={20} />
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <div className="empty-state">
            <h2>No sessions on this page</h2>
            <p>Refresh or return to the previous page.</p>
          </div>
        ) : (
          <ul className="session-list">
            {query.data.items.map((session) => (
              <li key={session.id} data-session-id={session.id}>
                <div className="session-details">
                  <h3>Started {timestamp(session.createdAt)}</h3>
                  <p>
                    Last active{" "}
                    <time dateTime={session.lastAccessedAt}>
                      {timestamp(session.lastAccessedAt)}
                    </time>
                  </p>
                  <p>
                    Expires after inactivity{" "}
                    <time dateTime={session.expiresAt}>
                      {timestamp(session.expiresAt)}
                    </time>
                  </p>
                </div>
                {session.current ? (
                  <span className="subtle-badge">This session</span>
                ) : (
                  <RevokeSession session={session} onRevoked={revoked} />
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="table-pagination">
          <span>{query.data?.total ?? 0} active sessions</span>
          <div>
            <Button
              variant="outline"
              disabled={page === 0 || query.isFetching}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={
                !query.data ||
                (page + 1) * 10 >= query.data.total ||
                query.isFetching
              }
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
      <p className="session-footnote">
        Use Sign out in the navigation to end your current session. Activity
        extends the inactivity expiry; use Refresh for the latest times.
      </p>
    </>
  );
}
