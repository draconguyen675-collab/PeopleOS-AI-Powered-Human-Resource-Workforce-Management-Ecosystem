package com.peopleos.modules.organization.api;
import java.util.UUID;
public record PositionDetail(UUID id, String code, String title, String description, long employeeCount, long version) { }
