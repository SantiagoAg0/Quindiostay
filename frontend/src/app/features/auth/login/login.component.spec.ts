import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/auth/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente de login', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debe ser invalido si los campos estan vacios', () => {
    component.loginForm.controls['identificador'].setValue('');
    component.loginForm.controls['contrasena'].setValue('');
    expect(component.loginForm.valid).toBeFalse();
  });

  it('debe cambiar a CLIENTE cuando se presiona la pestana', () => {
    component.cambiarTipo('CLIENTE');
    expect(component.tipoIngreso).toBe('CLIENTE');
    expect(component.loginForm.get('identificador')?.value).toBe('cliente@correo.com');
  });
});
