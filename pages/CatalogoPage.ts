import { type Locator, type Page } from '@playwright/test';
import { Encabezado } from './Encabezado';

export type Orden = 'Nombre (A a Z)' | 'Nombre (Z a A)' | 'Precio (menor a mayor)' | 'Precio (mayor a menor)';

export class CatalogoPage {
  readonly titulo: Locator;
  readonly orden: Locator;
  readonly productos: Locator;
  readonly nombres: Locator;
  readonly precios: Locator;
  readonly encabezado: Encabezado;

  constructor(private readonly page: Page) {
    this.titulo = page.getByRole('heading', { name: 'Catálogo' });
    this.orden = page.getByRole('combobox', { name: 'Ordenar por' });
    this.productos = page.getByRole('article');
    this.nombres = this.productos.getByRole('heading');
    this.precios = this.productos.getByTestId('precio');
    this.encabezado = new Encabezado(page);
  }

  async goto() {
    await this.page.goto('/catalogo');
  }

  producto(nombre: string): Locator {
    return this.productos.filter({ has: this.page.getByRole('heading', { name: nombre, exact: true }) });
  }

  botonAgregar(nombre: string): Locator {
    return this.producto(nombre).getByRole('button', { name: 'Agregar al carrito' });
  }

  botonQuitar(nombre: string): Locator {
    return this.producto(nombre).getByRole('button', { name: 'Quitar' });
  }

  async ordenarPor(orden: Orden) {
    await this.orden.selectOption({ label: orden });
  }

  async agregar(nombre: string) {
    await this.botonAgregar(nombre).click();
  }
}
