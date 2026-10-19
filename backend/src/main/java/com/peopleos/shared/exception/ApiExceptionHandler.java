package com.peopleos.shared.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger LOG = LoggerFactory.getLogger(ApiExceptionHandler.class);
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validation(MethodArgumentNotValidException ex) {
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Please correct the highlighted fields.");
        var errors = new java.util.LinkedHashMap<String, String>();
        ex.getBindingResult().getFieldErrors().forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        problem.setProperty("errors", errors);
        return problem;
    }
    @ExceptionHandler({ConstraintViolationException.class, HandlerMethodValidationException.class,
        MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class, IllegalArgumentException.class})
    ProblemDetail badRequest(Exception ex) { return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Request parameters are invalid."); }
    @ExceptionHandler(AccessDeniedException.class)
    ProblemDetail denied(AccessDeniedException ex) { return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "You do not have permission to perform this action."); }
    @ExceptionHandler({ObjectOptimisticLockingFailureException.class, DataIntegrityViolationException.class})
    ProblemDetail conflict(Exception ex) { return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "This record changed or conflicts with an existing record. Reload and try again."); }
    @ExceptionHandler(ResponseStatusException.class)
    ProblemDetail status(ResponseStatusException ex) { return ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason() == null ? "Request could not be completed." : ex.getReason()); }
    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception ex) {
        String reference = java.util.UUID.randomUUID().toString();
        LOG.error("Unhandled API failure reference={}", reference, ex);
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again.");
        problem.setProperty("reference", reference);
        return problem;
    }
}
