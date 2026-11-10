package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.auth.LoginRequest;
import co.edu.uniquindio.quindiostay.dto.auth.LoginResponse;
import co.edu.uniquindio.quindiostay.dto.auth.UsuarioActualResponse;
import co.edu.uniquindio.quindiostay.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión y consulta de usuario actual")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión como Personal o Cliente")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/registro-cliente")
    @Operation(summary = "Registrar nueva cuenta de Cliente con su perfil y preferencias")
    public ResponseEntity<LoginResponse> registroCliente(@Valid @RequestBody co.edu.uniquindio.quindiostay.dto.auth.RegistroClienteRequest request) {
        return ResponseEntity.ok(authService.registrarCliente(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener datos del usuario actualmente autenticado")
    public ResponseEntity<UsuarioActualResponse> me() {
        return ResponseEntity.ok(authService.obtenerUsuarioActual());
    }
}
