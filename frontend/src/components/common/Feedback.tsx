import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Loading your workspace…
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <div className="feedback error" role="alert">
      <AlertCircle size={22} />
      <div>
        <strong>We couldn’t load this view</strong>
        <p>{error.message}</p>
        {retry && (
          <Button variant="outline" onClick={retry}>
            <RefreshCw size={15} />
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
