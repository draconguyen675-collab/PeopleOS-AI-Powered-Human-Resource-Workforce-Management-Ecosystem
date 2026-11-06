CREATE TABLE positions (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    code varchar(30) NOT NULL,
    title varchar(120) NOT NULL,
    description varchar(1000) NOT NULL DEFAULT '',
    version bigint NOT NULL DEFAULT 0,
    UNIQUE (tenant_id, id)
);
CREATE UNIQUE INDEX positions_tenant_code_normalized ON positions(tenant_id, lower(code));
CREATE INDEX positions_tenant_title_idx ON positions(tenant_id, title, id);
ALTER TABLE employees ADD COLUMN position_id uuid;
ALTER TABLE employees ADD CONSTRAINT employees_position_tenant_fk
    FOREIGN KEY (tenant_id, position_id) REFERENCES positions(tenant_id, id);
CREATE INDEX employees_tenant_position_idx ON employees(tenant_id, position_id);
-- Existing free-text titles remain intact. Linking to the catalog is an explicit HR action.
