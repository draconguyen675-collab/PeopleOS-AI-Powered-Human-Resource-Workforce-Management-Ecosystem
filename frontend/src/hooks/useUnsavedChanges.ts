import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedChanges(isDirty: boolean) {
  const blocker = useBlocker(isDirty);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("Leave this page and discard your unsaved changes?"))
      blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [isDirty]);
}
