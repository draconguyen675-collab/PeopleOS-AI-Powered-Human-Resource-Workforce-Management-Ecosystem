package com.peopleos.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.parameters.RequestBody;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import java.util.List;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean OpenAPI peopleOsApi() {
        return new OpenAPI().info(new Info().title("PeopleOS API").version("v1")
                .description("Tenant-scoped APIs. Obtain a CSRF token before login and refresh it after login. "
                    + "Include the returned header and session cookie on writes. Session cookies are HttpOnly."))
            .components(new Components().addSecuritySchemes("sessionCookie", new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.COOKIE).name("SESSION")))
            .addSecurityItem(new SecurityRequirement().addList("sessionCookie"));
    }

    @Bean OpenApiCustomizer authenticationOperations() {
        return api -> {
            var form = new ObjectSchema().addProperty("username", new StringSchema()
                    .description("Workspace slug, colon, email").example("novatech:owner@example.test"))
                .addProperty("password", new StringSchema().format("password").writeOnly(true))
                .required(List.of("username", "password"));
            api.getPaths().addPathItem("/api/v1/auth/login", new PathItem().post(new Operation()
                .operationId("login").summary("Sign in and rotate the session cookie").tags(List.of("Authentication"))
                .security(List.of()).requestBody(new RequestBody().required(true).content(new Content()
                    .addMediaType("application/x-www-form-urlencoded", new MediaType().schema(form))))
                .responses(new ApiResponses().addApiResponse("204", response("Signed in; refresh the CSRF token"))
                    .addApiResponse("401", response("Invalid workspace, email or password"))
                    .addApiResponse("403", response("Missing or invalid CSRF token"))
                    .addApiResponse("429", response("Too many login attempts")))));
            api.getPaths().addPathItem("/api/v1/auth/logout", new PathItem().post(new Operation()
                .operationId("logout").summary("Invalidate the current session").tags(List.of("Authentication"))
                .responses(new ApiResponses().addApiResponse("204", response("Signed out"))
                    .addApiResponse("403", response("Missing or invalid CSRF token")))));
            api.getPaths().get("/api/v1/auth/csrf").getGet().security(List.of());
            api.getPaths().values().forEach(path -> path.readOperationsMap().forEach((method, operation) -> {
                if (List.of(PathItem.HttpMethod.POST, PathItem.HttpMethod.PATCH, PathItem.HttpMethod.PUT,
                        PathItem.HttpMethod.DELETE).contains(method))
                    operation.addParametersItem(new HeaderParameter().name("X-CSRF-TOKEN").required(true)
                        .description("Token returned by GET /api/v1/auth/csrf for this session")
                        .schema(new StringSchema()));
            }));
        };
    }
    private static ApiResponse response(String description) { return new ApiResponse().description(description); }
}
