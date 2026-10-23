import { type Locator, type Page } from '@playwright/test';
import { Encabezado } from './Encabezado';

export class ConfirmacionPage {
  readonly titulo: Locator;
  readonly numeroPedido: Locator;
  readonly encabezado: Encabezado;

  constructor(private readonly page: Page) {
    this.titulo = page.getByRole('heading', { name: 'Pedido confirmado' });
    this.numeroPedido = page.getByTestId('pedido');
    this.encabezado = new Encabezado(page);
  }

  async goto() {
    await this.page.goto('/confirmacion');
  }
}
