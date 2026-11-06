ALTER TABLE departments ADD COLUMN description varchar(300) NOT NULL DEFAULT '';
ALTER TABLE departments ADD COLUMN parent_id uuid;
ALTER TABLE departments ADD COLUMN version bigint NOT NULL DEFAULT 0;
ALTER TABLE departments ADD CONSTRAINT departments_parent_tenant_fk FOREIGN KEY (tenant_id, parent_id) REFERENCES departments(tenant_id, id);
ALTER TABLE departments ADD CONSTRAINT departments_not_own_parent CHECK (parent_id IS NULL OR parent_id <> id);
CREATE UNIQUE INDEX departments_tenant_name_normalized ON departments(tenant_id, lower(name));
CREATE INDEX departments_tenant_parent_idx ON departments(tenant_id, parent_id);
INSERT INTO permissions VALUES ('organization:read'), ('organization:write');
INSERT INTO role_permissions VALUES ('OWNER', 'organization:read'), ('OWNER', 'organization:write'),
    ('HR_ADMIN', 'organization:read'), ('HR_ADMIN', 'organization:write');
DELETE FROM spring_session WHERE principal_name IN (SELECT cast(id AS varchar) FROM users WHERE role_code IN ('OWNER', 'HR_ADMIN'));
