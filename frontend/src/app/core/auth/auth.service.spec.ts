import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginResponse } from '../models/usuario.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe guardar el token en login exitoso', () => {
    const mockRes: LoginResponse = {
      token: 'jwt-token-123',
      tipo: 'Bearer',
      nombre: 'admin',
      rol: 'ADMINISTRADOR_PLATAFORMA',
      idPrestador: null
    };

    service.login({ tipoIngreso: 'PERSONAL', identificador: 'admin', contrasena: '123' }).subscribe((res) => {
      expect(res.token).toEqual('jwt-token-123');
      expect(service.getToken()).toEqual('jwt-token-123');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);
  });
});
