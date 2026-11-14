package co.edu.uniquindio.quindiostay.exception;

import co.edu.uniquindio.quindiostay.dto.comunes.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ApiError> manejarRecursoNoEncontrado(RecursoNoEncontradoException ex, HttpServletRequest request) {
        var error = new ApiError(HttpStatus.NOT_FOUND.value(), ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ApiError> manejarReglaNegocio(ReglaNegocioException ex, HttpServletRequest request) {
        var error = new ApiError(HttpStatus.BAD_REQUEST.value(), ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<ApiError> manejarConflicto(ConflictoException ex, HttpServletRequest request) {
        var error = new ApiError(HttpStatus.CONFLICT.value(), ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> manejarValidacion(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> detalles = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            detalles.add(fieldError.getField() + ": " + fieldError.getDefaultMessage());
        }
        var error = new ApiError(HttpStatus.BAD_REQUEST.value(), "Error de validacion en la solicitud", request.getRequestURI(), detalles);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> manejarCredenciales(BadCredentialsException ex, HttpServletRequest request) {
        var error = new ApiError(HttpStatus.UNAUTHORIZED.value(), "Usuario o contrasena incorrectos", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> manejarAccesoDenegado(AccessDeniedException ex, HttpServletRequest request) {
        var error = new ApiError(HttpStatus.FORBIDDEN.value(), "No tiene permisos para realizar esta accion", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> manejarViolacionIntegridad(DataIntegrityViolationException ex, HttpServletRequest request) {
        String rootMsg = ex.getMostSpecificCause().getMessage();
        String mensaje;
        HttpStatus status;

        if (rootMsg != null && rootMsg.contains("3819")) {
            // MySQL error 3819: CHECK constraint violation
            mensaje = "Violacion de restriccion CHECK en la base de datos: " + extraerConstraint(rootMsg);
            status = HttpStatus.BAD_REQUEST;
        } else if (rootMsg != null && (rootMsg.contains("foreign key") || rootMsg.contains("FOREIGN KEY") || rootMsg.contains("Cannot delete or update a parent row"))) {
            // FK RESTRICT violation
            mensaje = "No se puede eliminar o modificar este registro porque esta referenciado por otros datos";
            status = HttpStatus.CONFLICT;
        } else if (rootMsg != null && (rootMsg.contains("Duplicate entry") || rootMsg.contains("unique constraint"))) {
            mensaje = "Ya existe un registro con esos datos: " + extraerDuplicado(rootMsg);
            status = HttpStatus.CONFLICT;
        } else {
            mensaje = "Violacion de restriccion de integridad en la base de datos";
            status = HttpStatus.CONFLICT;
        }

        var error = new ApiError(status.value(), mensaje, request.getRequestURI());
        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> manejarGeneral(Exception ex, HttpServletRequest request) {
        ex.printStackTrace();
        var error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Ha ocurrido un error interno en el servidor: " + ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String extraerConstraint(String msg) {
        // Intenta extraer el nombre del CHECK constraint del mensaje MySQL
        int idx = msg.indexOf("Check constraint");
        if (idx >= 0) {
            return msg.substring(idx);
        }
        return msg.length() > 200 ? msg.substring(0, 200) : msg;
    }

    private String extraerDuplicado(String msg) {
        int idx = msg.indexOf("Duplicate entry");
        if (idx >= 0) {
            int end = msg.indexOf("'", idx + 17);
            if (end > idx) {
                return msg.substring(idx, Math.min(end + 1, msg.length()));
            }
        }
        return "dato duplicado";
    }
}
