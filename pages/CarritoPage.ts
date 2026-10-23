import { type Locator, type Page } from '@playwright/test';
import { Encabezado } from './Encabezado';

export class CarritoPage {
  readonly titulo: Locator;
  readonly lineas: Locator;
  readonly vacio: Locator;
  readonly error: Locator;
  readonly subtotal: Locator;
  readonly continuarBoton: Locator;
  readonly encabezado: Encabezado;

  constructor(private readonly page: Page) {
    this.titulo = page.getByRole('heading', { name: 'Carrito' });
    this.lineas = page.getByRole('row').filter({ has: page.getByRole('spinbutton') });
    this.vacio = page.getByText('El carrito está vacío.');
    this.error = page.getByRole('alert');
    this.subtotal = page.getByTestId('subtotal');
    this.continuarBoton = page.getByRole('button', { name: 'Continuar al pago' });
    this.encabezado = new Encabezado(page);
  }

  async goto() {
    await this.page.goto('/carrito');
  }

  cantidad(nombre: string): Locator {
    return this.page.getByRole('spinbutton', { name: `Cantidad de ${nombre}` });
  }

  // El carrito valida la cantidad en el evento change, que se dispara al salir del campo.
  async cambiarCantidad(nombre: string, valor: string) {
    await this.cantidad(nombre).fill(valor);
    await this.cantidad(nombre).blur();
  }

  async continuar() {
    await this.continuarBoton.click();
  }
}
