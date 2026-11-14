package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Municipio;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Rol;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.TipoPrestador;
import co.edu.uniquindio.quindiostay.domain.entity.tours.CategoriaTour;
import co.edu.uniquindio.quindiostay.domain.entity.tours.Idioma;
import co.edu.uniquindio.quindiostay.domain.enums.NombreCategoriaTour;
import co.edu.uniquindio.quindiostay.domain.enums.NombreIdioma;
import co.edu.uniquindio.quindiostay.domain.enums.NombreRol;
import co.edu.uniquindio.quindiostay.domain.enums.NombreTipoPrestador;
import co.edu.uniquindio.quindiostay.dto.catalogos.CatalogosRequests.*;
import co.edu.uniquindio.quindiostay.dto.prestadores.MunicipioDto;
import co.edu.uniquindio.quindiostay.dto.prestadores.TipoPrestadorDto;
import co.edu.uniquindio.quindiostay.dto.tours.CategoriaTourDto;
import co.edu.uniquindio.quindiostay.dto.tours.IdiomaResumen;
import co.edu.uniquindio.quindiostay.dto.usuarios.RolDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogoAdminService {

    private final MunicipioRepository municipioRepository;
    private final TipoPrestadorRepository tipoPrestadorRepository;
    private final RolRepository rolRepository;
    private final CategoriaTourRepository categoriaTourRepository;
    private final IdiomaRepository idiomaRepository;

    // --- MUNICIPIOS ---
    @Transactional(readOnly = true)
    public List<MunicipioDto> listarMunicipios() {
        return municipioRepository.findAll().stream()
                .map(m -> new MunicipioDto(m.getIdMunicipio(), m.getNombre(), m.getCodigoDane()))
                .toList();
    }

    @Transactional
    public MunicipioDto crearMunicipio(MunicipioRequest req) {
        Municipio m = new Municipio(req.nombre().trim(), req.codigoDane().trim());
        m = municipioRepository.save(m);
        return new MunicipioDto(m.getIdMunicipio(), m.getNombre(), m.getCodigoDane());
    }

    @Transactional
    public MunicipioDto modificarMunicipio(Long id, MunicipioRequest req) {
        Municipio m = municipioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Municipio", id));
        m.setNombre(req.nombre().trim());
        m.setCodigoDane(req.codigoDane().trim());
        m = municipioRepository.save(m);
        return new MunicipioDto(m.getIdMunicipio(), m.getNombre(), m.getCodigoDane());
    }

    @Transactional
    public void eliminarMunicipio(Long id) {
        if (!municipioRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Municipio", id);
        }
        municipioRepository.deleteById(id);
    }

    // --- TIPOS DE PRESTADOR ---
    @Transactional(readOnly = true)
    public List<TipoPrestadorDto> listarTiposPrestador() {
        return tipoPrestadorRepository.findAll().stream()
                .map(tp -> new TipoPrestadorDto(tp.getIdTipoPrestador(), tp.getNombre().name()))
                .toList();
    }

    @Transactional
    public TipoPrestadorDto crearTipoPrestador(TipoPrestadorRequest req) {
        NombreTipoPrestador enumNombre = NombreTipoPrestador.valueOf(req.nombre().trim().toUpperCase());
        TipoPrestador tp = new TipoPrestador(enumNombre);
        tp = tipoPrestadorRepository.save(tp);
        return new TipoPrestadorDto(tp.getIdTipoPrestador(), tp.getNombre().name());
    }

    @Transactional
    public TipoPrestadorDto modificarTipoPrestador(Long id, TipoPrestadorRequest req) {
        TipoPrestador tp = tipoPrestadorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("TipoPrestador", id));
        tp.setNombre(NombreTipoPrestador.valueOf(req.nombre().trim().toUpperCase()));
        tp = tipoPrestadorRepository.save(tp);
        return new TipoPrestadorDto(tp.getIdTipoPrestador(), tp.getNombre().name());
    }

    @Transactional
    public void eliminarTipoPrestador(Long id) {
        if (!tipoPrestadorRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("TipoPrestador", id);
        }
        tipoPrestadorRepository.deleteById(id);
    }

    // --- ROLES ---
    @Transactional(readOnly = true)
    public List<RolDto> listarRoles() {
        return rolRepository.findAll().stream()
                .map(r -> new RolDto(r.getIdRol(), r.getNombre().name()))
                .toList();
    }

    @Transactional
    public RolDto crearRol(RolRequest req) {
        NombreRol enumNombre = NombreRol.valueOf(req.nombre().trim().toUpperCase());
        Rol r = new Rol(enumNombre);
        r = rolRepository.save(r);
        return new RolDto(r.getIdRol(), r.getNombre().name());
    }

    @Transactional
    public RolDto modificarRol(Long id, RolRequest req) {
        Rol r = rolRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol", id));
        r.setNombre(NombreRol.valueOf(req.nombre().trim().toUpperCase()));
        r = rolRepository.save(r);
        return new RolDto(r.getIdRol(), r.getNombre().name());
    }

    @Transactional
    public void eliminarRol(Long id) {
        if (!rolRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Rol", id);
        }
        rolRepository.deleteById(id);
    }

    // --- CATEGORIAS TOUR ---
    @Transactional(readOnly = true)
    public List<CategoriaTourDto> listarCategoriasTour() {
        return categoriaTourRepository.findAll().stream()
                .map(c -> new CategoriaTourDto(c.getIdCategoria(), c.getNombre().name(), c.getDescripcion()))
                .toList();
    }

    @Transactional
    public CategoriaTourDto crearCategoriaTour(CategoriaTourRequest req) {
        NombreCategoriaTour enumNombre = NombreCategoriaTour.valueOf(req.nombre().trim().toUpperCase());
        CategoriaTour c = new CategoriaTour(enumNombre, req.descripcion());
        c = categoriaTourRepository.save(c);
        return new CategoriaTourDto(c.getIdCategoria(), c.getNombre().name(), c.getDescripcion());
    }

    @Transactional
    public CategoriaTourDto modificarCategoriaTour(Long id, CategoriaTourRequest req) {
        CategoriaTour c = categoriaTourRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("CategoriaTour", id));
        c.setNombre(NombreCategoriaTour.valueOf(req.nombre().trim().toUpperCase()));
        c.setDescripcion(req.descripcion());
        c = categoriaTourRepository.save(c);
        return new CategoriaTourDto(c.getIdCategoria(), c.getNombre().name(), c.getDescripcion());
    }

    @Transactional
    public void eliminarCategoriaTour(Long id) {
        if (!categoriaTourRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("CategoriaTour", id);
        }
        categoriaTourRepository.deleteById(id);
    }

    // --- IDIOMAS ---
    @Transactional(readOnly = true)
    public List<IdiomaResumen> listarIdiomas() {
        return idiomaRepository.findAll().stream()
                .map(i -> new IdiomaResumen(i.getIdIdioma(), i.getNombre()))
                .toList();
    }

    @Transactional
    public IdiomaResumen crearIdioma(IdiomaRequest req) {
        NombreIdioma enumNombre = NombreIdioma.valueOf(req.nombre().trim().toUpperCase());
        Idioma i = new Idioma(enumNombre);
        i = idiomaRepository.save(i);
        return new IdiomaResumen(i.getIdIdioma(), i.getNombre());
    }

    @Transactional
    public IdiomaResumen modificarIdioma(Long id, IdiomaRequest req) {
        Idioma i = idiomaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Idioma", id));
        i.setNombre(NombreIdioma.valueOf(req.nombre().trim().toUpperCase()));
        i = idiomaRepository.save(i);
        return new IdiomaResumen(i.getIdIdioma(), i.getNombre());
    }

    @Transactional
    public void eliminarIdioma(Long id) {
        if (!idiomaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Idioma", id);
        }
        idiomaRepository.deleteById(id);
    }
}
