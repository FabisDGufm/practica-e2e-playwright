import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly usuario: Locator;
  readonly clave: Locator;
  readonly ingresarBoton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.usuario = page.getByLabel('Usuario');
    this.clave = page.getByLabel('Contraseña');
    this.ingresarBoton = page.getByRole('button', { name: /Ingresar|Ingresando/ });
    this.error = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
  }

  async ingresar(usuario: string, clave: string) {
    await this.usuario.fill(usuario);
    await this.clave.fill(clave);
    await this.ingresarBoton.click();
  }
}
