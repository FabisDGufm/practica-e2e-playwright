import { type Locator, type Page } from '@playwright/test';

// El encabezado aparece en todas las páginas con sesión iniciada.
export class Encabezado {
  readonly contador: Locator;
  readonly enlaceCarrito: Locator;
  readonly cerrarSesionBoton: Locator;

  constructor(page: Page) {
    this.contador = page.getByTestId('contador-carrito');
    this.enlaceCarrito = page.getByRole('link', { name: /^Carrito/ });
    this.cerrarSesionBoton = page.getByRole('button', { name: 'Cerrar sesión' });
  }

  async irAlCarrito() {
    await this.enlaceCarrito.click();
  }

  async cerrarSesion() {
    await this.cerrarSesionBoton.click();
  }
}
