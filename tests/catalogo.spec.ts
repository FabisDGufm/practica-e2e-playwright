import { test, expect, P, quetzales } from './fixtures';
import type { Orden } from '../pages/CatalogoPage';

const todos = Object.values(P);
const porNombre = todos.map((p) => p.nombre).sort((a, b) => a.localeCompare(b, 'es'));
const porPrecio = [...todos].sort((a, b) => a.precio - b.precio);

// Técnica: partición de equivalencia. Cada opción de orden es una clase distinta.
const casos: { orden: Orden; campo: 'nombre' | 'precio'; esperado: string[] }[] = [
  { orden: 'Nombre (A a Z)', campo: 'nombre', esperado: porNombre },
  { orden: 'Nombre (Z a A)', campo: 'nombre', esperado: [...porNombre].reverse() },
  { orden: 'Precio (menor a mayor)', campo: 'precio', esperado: porPrecio.map((p) => quetzales(p.precio)) },
  { orden: 'Precio (mayor a menor)', campo: 'precio', esperado: [...porPrecio].reverse().map((p) => quetzales(p.precio)) },
];

test.describe('Regla Catálogo', () => {
  test.beforeEach(async ({ iniciarSesion }) => {
    await iniciarSesion();
  });

  test('[Catálogo][Partición de equivalencia] al entrar, el orden es por nombre de A a Z', async ({ catalogoPage }) => {
    await expect(catalogoPage.nombres, 'Regla Catálogo: al entrar, el orden es por nombre de A a Z').toHaveText(porNombre);
  });

  for (const c of casos) {
    test(`[Catálogo][Partición de equivalencia] ordenar por ${c.orden}`, async ({ catalogoPage }) => {
      await catalogoPage.ordenarPor(c.orden);

      const lista = c.campo === 'nombre' ? catalogoPage.nombres : catalogoPage.precios;
      await expect(lista, `Regla Catálogo: el orden "${c.orden}" no se respeta`).toHaveText(c.esperado);
    });
  }

  test('[Catálogo][Partición de equivalencia] cada producto muestra el precio de la tabla', async ({ catalogoPage }) => {
    for (const p of todos) {
      await expect(catalogoPage.producto(p.nombre), `Regla Catálogo: ${p.nombre} cuesta ${quetzales(p.precio)}`).toContainText(
        quetzales(p.precio),
      );
    }
  });
});
