package co.edu.uniquindio.quindiostay.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "Verificación de estado del backend")
public class HealthController {

    private final Environment env;

    @GetMapping
    @Operation(summary = "Verificar estado del servicio")
    public ResponseEntity<Map<String, String>> health() {
        String[] perfiles = env.getActiveProfiles();
        String perfil = perfiles.length > 0 ? perfiles[0] : "h2";
        String bd = Arrays.asList(perfiles).contains("mysql") ? "MySQL" : "H2";

        return ResponseEntity.ok(Map.of(
                "estado", "OK",
                "perfil", perfil,
                "baseDeDatos", bd
        ));
    }
}
