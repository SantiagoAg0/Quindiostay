package co.edu.uniquindio.quindiostay.bootstrap;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.*;
import co.edu.uniquindio.quindiostay.domain.entity.tours.*;
import co.edu.uniquindio.quindiostay.domain.enums.*;
import co.edu.uniquindio.quindiostay.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Datos de desarrollo. Se borra al conectar MySQL.
 */
@Component
@Profile("h2")
@RequiredArgsConstructor
@Slf4j
public class DatosDesarrolloSeeder implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioSistemaRepository usuarioSistemaRepository;
    private final ClienteRepository clienteRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final MunicipioRepository municipioRepository;
    private final TipoPrestadorRepository tipoPrestadorRepository;
    private final PrestadorRepository prestadorRepository;
    private final CategoriaTourRepository categoriaTourRepository;
    private final IdiomaRepository idiomaRepository;
    private final GuiaRepository guiaRepository;
    private final GuiaIdiomaRepository guiaIdiomaRepository;
    private final TourRepository tourRepository;
    private final SalidaTourRepository salidaTourRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Iniciando carga de datos de desarrollo (H2)...");

        // 1. Roles
        Rol rolAdmin = rolRepository.save(new Rol(NombreRol.ADMINISTRADOR_PLATAFORMA));
        Rol rolEncargado = rolRepository.save(new Rol(NombreRol.ENCARGADO_PRESTADOR));
        Rol rolOperador = rolRepository.save(new Rol(NombreRol.OPERADOR));

        // 2. Municipios del Quindío
        var armenia = municipioRepository.save(new Municipio("Armenia", "63001"));
        municipioRepository.save(new Municipio("Buenavista", "63111"));
        municipioRepository.save(new Municipio("Calarcá", "63130"));
        municipioRepository.save(new Municipio("Circasia", "63190"));
        municipioRepository.save(new Municipio("Córdoba", "63212"));
        municipioRepository.save(new Municipio("Filandia", "63272"));
        municipioRepository.save(new Municipio("Génova", "63302"));
        municipioRepository.save(new Municipio("La Tebaida", "63401"));
        municipioRepository.save(new Municipio("Montenegro", "63470"));
        municipioRepository.save(new Municipio("Pijao", "63548"));
        municipioRepository.save(new Municipio("Quimbaya", "63594"));
        var salento = municipioRepository.save(new Municipio("Salento", "63690"));

        // 3. Tipos de prestador
        for (NombreTipoPrestador ntp : NombreTipoPrestador.values()) {
            tipoPrestadorRepository.save(new TipoPrestador(ntp));
        }
        var tipoGuianza = tipoPrestadorRepository.findByNombre(NombreTipoPrestador.GUIANZA).orElseThrow();

        // 4. Prestador activo
        Prestador prestador = new Prestador();
        prestador.setNombreComercial("Quindío Aventuras & Café SAS");
        prestador.setNitDocumento("900123456-1");
        prestador.setRnt("RNT-45892");
        prestador.setDireccion("Cra 14 # 21-15");
        prestador.setTelefono("3101234567");
        prestador.setCorreo("contacto@quindioaventuras.co");
        prestador.setEstado(EstadoPrestador.ACTIVO);
        prestador.setMunicipio(armenia);
        prestador.setTipoPrestador(tipoGuianza);
        prestador = prestadorRepository.save(prestador);

        // 5. Usuarios del sistema
        UsuarioSistema admin = new UsuarioSistema();
        admin.setNombreUsuario("admin");
        admin.setContrasenaCifrada(passwordEncoder.encode("Admin123*"));
        admin.setEstado(EstadoUsuario.ACTIVO);
        admin.setRol(rolAdmin);
        usuarioSistemaRepository.save(admin);

        UsuarioSistema operador = new UsuarioSistema();
        operador.setNombreUsuario("operador");
        operador.setContrasenaCifrada(passwordEncoder.encode("Operador123*"));
        operador.setEstado(EstadoUsuario.ACTIVO);
        operador.setRol(rolOperador);
        operador.setPrestador(prestador);
        usuarioSistemaRepository.save(operador);

        // 6. Cliente con perfil
        Cliente cliente = new Cliente();
        cliente.setNombres("Carlos");
        cliente.setApellidos("Gómez Restrepo");
        cliente.setTipoDocumento(TipoDocumento.CC);
        cliente.setNumeroDocumento("1094888999");
        cliente.setCorreo("cliente@correo.com");
        cliente.setTelefono("3159876543");
        cliente.setFechaNacimiento(LocalDate.of(1995, 6, 15));
        cliente.setCiudadOrigen("Bogotá");
        cliente = clienteRepository.save(cliente);

        PerfilCliente perfilCliente = new PerfilCliente();
        perfilCliente.setCliente(cliente);
        perfilCliente.setContrasenaCifrada(passwordEncoder.encode("Cliente123*"));
        perfilCliente.setIdiomaPreferido(IdiomaPreferido.ESPAÑOL);
        perfilCliente.setCanalPreferido(CanalPreferido.WHATSAPP);
        perfilCliente.setAnticipacionDias((short) 3);
        perfilCliente.setAceptaPromociones(AceptaPromociones.SI);
        perfilClienteRepository.save(perfilCliente);

        // 7. Categorías de tour e idiomas
        var catCafetero = categoriaTourRepository.save(new CategoriaTour(NombreCategoriaTour.CAFETERO, "Rutas de café y haciendas tradicionales"));
        var catNaturaleza = categoriaTourRepository.save(new CategoriaTour(NombreCategoriaTour.NATURALEZA, "Senderismo, avistamiento y paisajes naturales"));
        var catAventura = categoriaTourRepository.save(new CategoriaTour(NombreCategoriaTour.AVENTURA, "Canopy, rafting y adrenalina"));
        categoriaTourRepository.save(new CategoriaTour(NombreCategoriaTour.CULTURAL, "Historia y tradiciones quindianas"));

        var esp = idiomaRepository.save(new Idioma(NombreIdioma.ESPAÑOL));
        var ing = idiomaRepository.save(new Idioma(NombreIdioma.INGLES));
        var fra = idiomaRepository.save(new Idioma(NombreIdioma.FRANCES));
        idiomaRepository.save(new Idioma(NombreIdioma.ALEMAN));
        idiomaRepository.save(new Idioma(NombreIdioma.PORTUGUES));

        // 8. Guías y sus idiomas
        Guia g1 = guiaRepository.save(new Guia("Mateo Arango Valencia", "1094111222", "TP-GUIA-001"));
        Guia g2 = guiaRepository.save(new Guia("Laura Sofía Jaramillo", "1094333444", "TP-GUIA-002"));
        Guia g3 = guiaRepository.save(new Guia("Juan Esteban Cárdenas", "1094555666", "TP-GUIA-003"));
        Guia g4 = guiaRepository.save(new Guia("Daniela Osorio López", "1094777888", "TP-GUIA-004"));

        var gi1_esp = guiaIdiomaRepository.save(new GuiaIdioma(g1, esp));
        var gi1_ing = guiaIdiomaRepository.save(new GuiaIdioma(g1, ing));
        var gi2_esp = guiaIdiomaRepository.save(new GuiaIdioma(g2, esp));
        var gi2_fra = guiaIdiomaRepository.save(new GuiaIdioma(g2, fra));
        var gi3_esp = guiaIdiomaRepository.save(new GuiaIdioma(g3, esp));
        var gi4_esp = guiaIdiomaRepository.save(new GuiaIdioma(g4, esp));
        var gi4_ing = guiaIdiomaRepository.save(new GuiaIdioma(g4, ing));

        // 9. Tours
        Tour t1 = new Tour();
        t1.setNombre("Ruta del Café Tradicional en Hacienda");
        t1.setDescripcion("Recorrido experiencial del grano a la taza en finca cafetera de tradición.");
        t1.setDuracionHoras(new BigDecimal("4.0"));
        t1.setDificultad(Dificultad.BAJA);
        t1.setEdadMinima((short) 5);
        t1.setPrecioPersona(new BigDecimal("95000.00"));
        t1.setCategoria(catCafetero);
        t1.setPrestador(prestador);
        t1 = tourRepository.save(t1);

        Tour t2 = new Tour();
        t2.setNombre("Trek Valle de Cocora y Bosque de Palmas");
        t2.setDescripcion("Caminata por el santuario de las palmas de cera más altas del mundo.");
        t2.setDuracionHoras(new BigDecimal("5.5"));
        t2.setDificultad(Dificultad.MEDIA);
        t2.setEdadMinima((short) 10);
        t2.setPrecioPersona(new BigDecimal("120000.00"));
        t2.setCategoria(catNaturaleza);
        t2.setPrestador(prestador);
        t2 = tourRepository.save(t2);

        Tour t3 = new Tour();
        t3.setNombre("Canopy Aventura sobre el Río La Vieja");
        t3.setDescripcion("Vuelos en tirolina sobre el cañón con vistas panorámicas inolvidables.");
        t3.setDuracionHoras(new BigDecimal("3.0"));
        t3.setDificultad(Dificultad.ALTA);
        t3.setEdadMinima((short) 12);
        t3.setPrecioPersona(new BigDecimal("140000.00"));
        t3.setCategoria(catAventura);
        t3.setPrestador(prestador);
        t3 = tourRepository.save(t3);

        // 10. Salidas (8 salidas: varias PROGRAMADA, una REALIZADA, una CANCELADA)
        LocalDate hoy = LocalDate.now();

        crearSalida(t1, gi1_esp, hoy.plusDays(2), LocalTime.of(8, 30), (short) 12, EstadoSalida.PROGRAMADA);
        crearSalida(t1, gi1_ing, hoy.plusDays(3), LocalTime.of(14, 0), (short) 10, EstadoSalida.PROGRAMADA);
        crearSalida(t2, gi2_esp, hoy.plusDays(4), LocalTime.of(7, 0), (short) 15, EstadoSalida.PROGRAMADA);
        crearSalida(t2, gi2_fra, hoy.plusDays(5), LocalTime.of(8, 0), (short) 8, EstadoSalida.PROGRAMADA);
        crearSalida(t3, gi4_esp, hoy.plusDays(6), LocalTime.of(9, 30), (short) 14, EstadoSalida.PROGRAMADA);
        crearSalida(t1, gi3_esp, hoy.plusDays(7), LocalTime.of(10, 0), (short) 12, EstadoSalida.PROGRAMADA);

        // Salida REALIZADA (hace unos días)
        crearSalida(t1, gi1_esp, hoy.minusDays(5), LocalTime.of(9, 0), (short) 12, EstadoSalida.REALIZADA);

        // Salida CANCELADA
        crearSalida(t2, gi4_ing, hoy.plusDays(8), LocalTime.of(13, 0), (short) 10, EstadoSalida.CANCELADA);

        log.info("Datos de desarrollo cargados exitosamente (8 salidas, 4 guías, 3 tours, usuarios admin y operador).");
    }

    private void crearSalida(Tour tour, GuiaIdioma gi, LocalDate fecha, LocalTime hora, short cupo, EstadoSalida estado) {
        SalidaTour s = new SalidaTour();
        s.setTour(tour);
        s.setGuiaIdioma(gi);
        s.setFecha(fecha);
        s.setHoraInicio(hora);
        s.setCupo(cupo);
        s.setEstado(estado);
        salidaTourRepository.save(s);
    }
}
