package co.edu.uniquindio.quindiostay.exception;

public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }

    public RecursoNoEncontradoException(String recurso, Object id) {
        super(recurso + " con id " + id + " no encontrado");
    }
}
