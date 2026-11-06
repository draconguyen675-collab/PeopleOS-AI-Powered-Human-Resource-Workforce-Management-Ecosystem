ALTER TABLE employees ADD COLUMN version bigint NOT NULL DEFAULT 0;
ALTER TABLE employees ADD COLUMN archived_at timestamptz;
ALTER TABLE employees ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE employees ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX employees_tenant_number_normalized ON employees(tenant_id, lower(employee_number));
CREATE UNIQUE INDEX employees_tenant_email_normalized ON employees(tenant_id, lower(work_email));
CREATE INDEX employees_tenant_archived_idx ON employees(tenant_id, archived_at, name, id);
CREATE INDEX audit_employee_history_idx ON audit_logs(tenant_id, resource_type, resource_id, occurred_at DESC);
INSERT INTO permissions VALUES ('employees:write');
INSERT INTO role_permissions VALUES ('OWNER', 'employees:write'), ('HR_ADMIN', 'employees:write');
UPDATE roles SET description = 'Manage employee work profiles and review workspace activity.' WHERE code = 'HR_ADMIN';
-- Existing serialized authorities must be refreshed when permissions change.
DELETE FROM spring_session WHERE principal_name IN (SELECT cast(id AS varchar) FROM users WHERE role_code IN ('OWNER', 'HR_ADMIN'));
