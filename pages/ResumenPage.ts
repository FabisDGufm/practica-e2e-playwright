import { type Locator, type Page } from '@playwright/test';

export class ResumenPage {
  readonly titulo: Locator;
  readonly subtotal: Locator;
  readonly descuentoPct: Locator;
  readonly descuento: Locator;
  readonly envio: Locator;
  readonly total: Locator;
  readonly confirmarBoton: Locator;

  constructor(private readonly page: Page) {
    this.titulo = page.getByRole('heading', { name: 'Resumen del pedido' });
    this.subtotal = page.getByTestId('subtotal');
    this.descuentoPct = page.getByTestId('descuento-pct');
    this.descuento = page.getByTestId('descuento');
    this.envio = page.getByTestId('envio');
    this.total = page.getByTestId('total');
    this.confirmarBoton = page.getByRole('button', { name: 'Confirmar compra' });
  }

  async goto() {
    await this.page.goto('/resumen');
  }

  async confirmar() {
    await this.confirmarBoton.click();
  }
}
