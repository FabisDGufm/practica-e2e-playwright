import { type Locator, type Page } from '@playwright/test';

export type DatosEnvio = { nombre: string; apellido: string; cp: string; cupon?: string };

export class CheckoutPage {
  readonly titulo: Locator;
  readonly nombre: Locator;
  readonly apellido: Locator;
  readonly cp: Locator;
  readonly cupon: Locator;
  readonly error: Locator;
  readonly continuarBoton: Locator;
  readonly cancelarBoton: Locator;

  constructor(private readonly page: Page) {
    this.titulo = page.getByRole('heading', { name: 'Datos de envío' });
    this.nombre = page.getByLabel('Nombre', { exact: true });
    this.apellido = page.getByLabel('Apellido', { exact: true });
    this.cp = page.getByLabel('Código postal');
    this.cupon = page.getByLabel('Cupón (opcional)');
    this.error = page.getByRole('alert');
    this.continuarBoton = page.getByRole('button', { name: 'Continuar' });
    this.cancelarBoton = page.getByRole('button', { name: 'Cancelar' });
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async llenar(datos: DatosEnvio) {
    await this.nombre.fill(datos.nombre);
    await this.apellido.fill(datos.apellido);
    await this.cp.fill(datos.cp);
    await this.cupon.fill(datos.cupon ?? '');
    await this.continuarBoton.click();
  }
}
