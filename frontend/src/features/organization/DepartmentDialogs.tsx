import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "../../services/api";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import type { Department, DepartmentDetail } from "../../types/api";
import { Button } from "../../components/ui/button";

const schema = z.object({
  name: z.string().trim().min(1, "Department name is required.").max(100),
  description: z.string().trim().max(300),
  parentId: z.union([z.literal(""), z.string().uuid()]),
});
type Values = z.infer<typeof schema>;
export function DepartmentEditor({
  department,
  options,
  onClose,
  onSaved,
  restoreFocus,
}: {
  department: DepartmentDetail | null;
  options: Department[];
  onClose: () => void;
  onSaved: () => void;
  restoreFocus: () => void;
}) {
  const [error, setError] = useState<Error | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError: fieldError,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: department
      ? {
          name: department.name,
          description: department.description,
          parentId: department.parentId ?? "",
        }
      : { name: "", description: "", parentId: "" },
  });
  useUnsavedChanges(isDirty);
  function close() {
    if (
      isSubmitting ||
      (isDirty && !window.confirm("Discard unsaved department changes?"))
    )
      return;
    onClose();
  }
  const submit = handleSubmit(async (values) => {
    setError(null);
    const details = { ...values, parentId: values.parentId || null };
    try {
      await api<DepartmentDetail>(
        department
          ? `/organization/departments/${department.id}`
          : "/organization/departments",
        {
          method: department ? "PATCH" : "POST",
          body: JSON.stringify(
            department ? { version: department.version, details } : details,
          ),
        },
      );
      reset(values);
      onSaved();
      onClose();
    } catch (failure) {
      if (failure instanceof ApiError && failure.errors) {
        for (const [key, message] of Object.entries(failure.errors)) {
          const field = key.replace(/^details\./, "");
          if (field in values) fieldError(field as keyof Values, { message });
        }
      }
      setError(
        failure instanceof Error
          ? failure
          : new Error("Could not save department."),
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
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            if (isSubmitting) event.preventDefault();
          }}
        >
          <Dialog.Title>
            {department ? "Edit department" : "Add department"}
          </Dialog.Title>
          <Dialog.Description>
            Organize teams with a parent department. Names must be unique within
            this workspace.
          </Dialog.Description>
          <form onSubmit={submit} noValidate>
            <fieldset disabled={isSubmitting}>
              <div className="field">
                <label htmlFor="department-name">Department name</label>
                <input
                  id="department-name"
                  maxLength={100}
                  {...register("name")}
                  aria-invalid={!!errors.name}
                  aria-describedby={
                    errors.name ? "department-name-error" : undefined
                  }
                />
                {errors.name && (
                  <small id="department-name-error" className="field-error">
                    {errors.name.message}
                  </small>
                )}
              </div>
              <div className="field">
                <label htmlFor="department-description">Description</label>
                <textarea
                  id="department-description"
                  maxLength={300}
                  rows={3}
                  {...register("description")}
                  aria-invalid={!!errors.description}
                />
                {errors.description && (
                  <small className="field-error">
                    {errors.description.message}
                  </small>
                )}
              </div>
              <div className="field">
                <label htmlFor="department-parent">Parent department</label>
                <select id="department-parent" {...register("parentId")}>
                  <option value="">No parent · top level</option>
                  {options
                    .filter((item) => item.id !== department?.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
            </fieldset>
            {error && (
              <p className="field-error" role="alert">
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
                {isSubmitting ? "Saving…" : "Save department"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function DeleteDepartment({
  department,
  onClose,
  onDeleted,
  restoreFocus,
}: {
  department: DepartmentDetail;
  onClose: () => void;
  onDeleted: () => void;
  restoreFocus: () => void;
}) {
  const mutation = useMutation({
    mutationFn: () =>
      api<void>(
        `/organization/departments/${department.id}?version=${department.version}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      onDeleted();
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
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            if (mutation.isPending) event.preventDefault();
          }}
        >
          <Dialog.Title>Delete department?</Dialog.Title>
          <Dialog.Description>
            Delete {department.name}. Only departments with no linked employee
            profiles or child departments can be deleted. This action is
            recorded in the activity log.
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
