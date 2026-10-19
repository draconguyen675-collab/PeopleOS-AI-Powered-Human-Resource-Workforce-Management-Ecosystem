CREATE TABLE tenants (
    id uuid PRIMARY KEY,
    slug varchar(60) NOT NULL UNIQUE,
    name varchar(120) NOT NULL,
    timezone varchar(60) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    currency varchar(3) NOT NULL DEFAULT 'VND',
    version bigint NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE roles (code varchar(40) PRIMARY KEY, name varchar(80) NOT NULL, description varchar(240) NOT NULL);
CREATE TABLE permissions (code varchar(80) PRIMARY KEY);
CREATE TABLE role_permissions (
    role_code varchar(40) REFERENCES roles(code),
    permission_code varchar(80) REFERENCES permissions(code),
    PRIMARY KEY (role_code, permission_code)
);
CREATE TABLE users (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    email varchar(254) NOT NULL,
    display_name varchar(120) NOT NULL,
    password_hash varchar(255) NOT NULL,
    role_code varchar(40) NOT NULL REFERENCES roles(code),
    enabled boolean NOT NULL DEFAULT true,
    UNIQUE (tenant_id, email),
    UNIQUE (tenant_id, id)
);
CREATE TABLE departments (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    name varchar(100) NOT NULL,
    UNIQUE (tenant_id, name),
    UNIQUE (tenant_id, id)
);
CREATE TABLE employees (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    employee_number varchar(30) NOT NULL,
    name varchar(120) NOT NULL,
    work_email varchar(254) NOT NULL,
    department_id uuid NOT NULL,
    position varchar(120) NOT NULL,
    location varchar(120) NOT NULL,
    status varchar(20) NOT NULL CHECK (status IN ('ACTIVE', 'ONBOARDING', 'ON_LEAVE')),
    started_on date NOT NULL,
    UNIQUE (tenant_id, employee_number),
    UNIQUE (tenant_id, work_email),
    FOREIGN KEY (tenant_id, department_id) REFERENCES departments(tenant_id, id)
);
CREATE INDEX employees_tenant_name_idx ON employees(tenant_id, name, id);
CREATE INDEX employees_tenant_department_idx ON employees(tenant_id, department_id);
CREATE INDEX employees_tenant_started_idx ON employees(tenant_id, started_on);
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    actor_id uuid,
    action varchar(80) NOT NULL,
    resource_type varchar(60) NOT NULL,
    resource_id uuid,
    summary varchar(300) NOT NULL,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (tenant_id, actor_id) REFERENCES users(tenant_id, id)
);
CREATE INDEX audit_tenant_time_idx ON audit_logs(tenant_id, occurred_at DESC, id);

CREATE TABLE spring_session (
    primary_id char(36) NOT NULL PRIMARY KEY,
    session_id char(36) NOT NULL,
    creation_time bigint NOT NULL,
    last_access_time bigint NOT NULL,
    max_inactive_interval integer NOT NULL,
    expiry_time bigint NOT NULL,
    principal_name varchar(100)
);
CREATE UNIQUE INDEX spring_session_ix1 ON spring_session(session_id);
CREATE INDEX spring_session_ix2 ON spring_session(expiry_time);
CREATE INDEX spring_session_ix3 ON spring_session(principal_name);
CREATE TABLE spring_session_attributes (
    session_primary_id char(36) NOT NULL REFERENCES spring_session(primary_id) ON DELETE CASCADE,
    attribute_name varchar(200) NOT NULL,
    attribute_bytes bytea NOT NULL,
    PRIMARY KEY (session_primary_id, attribute_name)
);

INSERT INTO roles VALUES
 ('OWNER','Workspace owner','Manage company settings and review workspace security.'),
 ('HR_ADMIN','HR administrator','Read the employee directory and workspace activity.'),
 ('VIEWER','Workspace viewer','View aggregate workforce information.');
INSERT INTO permissions VALUES ('dashboard:read'),('employees:read'),('company:read'),('company:write'),('roles:read'),('audit:read');
INSERT INTO role_permissions SELECT 'OWNER', code FROM permissions;
INSERT INTO role_permissions SELECT 'HR_ADMIN', code FROM permissions WHERE code <> 'company:write';
INSERT INTO role_permissions VALUES ('VIEWER','dashboard:read'),('VIEWER','company:read');
