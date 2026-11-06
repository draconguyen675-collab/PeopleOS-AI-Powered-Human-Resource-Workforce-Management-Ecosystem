package com.peopleos.modules.organization.api;

import java.util.UUID;

public record DepartmentDetail(UUID id, String name, String description, UUID parentId, String parentName,
                               long employeeCount, long childCount, long version) { }
