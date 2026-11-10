package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Municipio;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Prestador;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.TipoPrestador;
import co.edu.uniquindio.quindiostay.dto.prestadores.CrearPrestadorRequest;
import co.edu.uniquindio.quindiostay.dto.prestadores.MunicipioDto;
import co.edu.uniquindio.quindiostay.dto.prestadores.PrestadorDto;
import co.edu.uniquindio.quindiostay.dto.prestadores.TipoPrestadorDto;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.repository.MunicipioRepository;
import co.edu.uniquindio.quindiostay.repository.PrestadorRepository;
import co.edu.uniquindio.quindiostay.repository.TipoPrestadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrestadorService {

    private final PrestadorRepository prestadorRepository;
    private final MunicipioRepository municipioRepository;
    private final TipoPrestadorRepository tipoPrestadorRepository;

    @Transactional(readOnly = true)
    public List<PrestadorDto> listar() {
        return prestadorRepository.findAll().stream().map(this::convertirADto).toList();
    }

    @Transactional(readOnly = true)
    public PrestadorDto obtenerPorId(Long id) {
        Prestador p = prestadorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Prestador", id));
        return convertirADto(p);
    }

    @Transactional
    public PrestadorDto crear(CrearPrestadorRequest req) {
        Municipio m = municipioRepository.findById(req.idMunicipio())
                .orElseThrow(() -> new RecursoNoEncontradoException("Municipio", req.idMunicipio()));
        TipoPrestador tp = tipoPrestadorRepository.findById(req.idTipoPrestador())
                .orElseThrow(() -> new RecursoNoEncontradoException("TipoPrestador", req.idTipoPrestador()));

        Prestador p = new Prestador();
        p.setNombreComercial(req.nombreComercial());
        p.setNitDocumento(req.nitDocumento());
        p.setRnt(req.rnt());
        p.setDireccion(req.direccion());
        p.setTelefono(req.telefono());
        p.setCorreo(req.correo());
        p.setEstado(req.estado());
        p.setMunicipio(m);
        p.setTipoPrestador(tp);

        p = prestadorRepository.save(p);
        return convertirADto(p);
    }

    @Transactional
    public PrestadorDto actualizar(Long id, CrearPrestadorRequest req) {
        Prestador p = prestadorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Prestador", id));
        Municipio m = municipioRepository.findById(req.idMunicipio())
                .orElseThrow(() -> new RecursoNoEncontradoException("Municipio", req.idMunicipio()));
        TipoPrestador tp = tipoPrestadorRepository.findById(req.idTipoPrestador())
                .orElseThrow(() -> new RecursoNoEncontradoException("TipoPrestador", req.idTipoPrestador()));

        p.setNombreComercial(req.nombreComercial());
        p.setNitDocumento(req.nitDocumento());
        p.setRnt(req.rnt());
        p.setDireccion(req.direccion());
        p.setTelefono(req.telefono());
        p.setCorreo(req.correo());
        p.setEstado(req.estado());
        p.setMunicipio(m);
        p.setTipoPrestador(tp);

        p = prestadorRepository.save(p);
        return convertirADto(p);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!prestadorRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Prestador", id);
        }
        prestadorRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MunicipioDto> listarMunicipios() {
        return municipioRepository.findAll().stream()
                .map(m -> new MunicipioDto(m.getIdMunicipio(), m.getNombre(), m.getCodigoDane()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TipoPrestadorDto> listarTiposPrestador() {
        return tipoPrestadorRepository.findAll().stream()
                .map(tp -> new TipoPrestadorDto(tp.getIdTipoPrestador(), tp.getNombre().name()))
                .toList();
    }

    private PrestadorDto convertirADto(Prestador p) {
        String munNombre = p.getMunicipio() != null ? p.getMunicipio().getNombre() : "N/A";
        Long idMun = p.getMunicipio() != null ? p.getMunicipio().getIdMunicipio() : null;
        String tipoNombre = p.getTipoPrestador() != null ? p.getTipoPrestador().getNombre().name() : "N/A";
        Long idTipo = p.getTipoPrestador() != null ? p.getTipoPrestador().getIdTipoPrestador() : null;

        return new PrestadorDto(
                p.getIdPrestador(),
                p.getNombreComercial(),
                p.getNitDocumento(),
                p.getRnt(),
                p.getDireccion(),
                p.getTelefono(),
                p.getCorreo(),
                p.getEstado(),
                idMun,
                munNombre,
                idTipo,
                tipoNombre
        );
    }
}
