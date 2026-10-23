import { test, expect, P } from './fixtures';

test.describe('Regla Carrito', () => {
  test.beforeEach(async ({ iniciarSesion }) => {
    await iniciarSesion();
  });

  // Técnica: transición de estados del botón de un producto:
  // fuera del carrito (Agregar) -> en el carrito (Quitar) -> fuera del carrito (Agregar).
  test('[Carrito][Transición de estados] un producto se agrega una sola vez desde el catálogo', async ({ catalogoPage }) => {
    await catalogoPage.agregar(P.prensa.nombre);
    await expect(catalogoPage.botonAgregar(P.prensa.nombre), 'Regla Carrito: un producto se agrega una sola vez').toBeHidden();
    await expect(catalogoPage.botonQuitar(P.prensa.nombre)).toBeVisible();
    await expect(catalogoPage.encabezado.contador).toHaveText('1');

    await catalogoPage.botonQuitar(P.prensa.nombre).click();
    await expect(catalogoPage.botonAgregar(P.prensa.nombre)).toBeVisible();
    await expect(catalogoPage.encabezado.contador).toHaveText('0');
  });

  // Técnica: partición de equivalencia. Cada producto agregado desde el catálogo
  // tiene que aparecer en el carrito, y no otro.
  for (const p of Object.values(P)) {
    test(`[Carrito][Partición de equivalencia] agregar ${p.nombre} lo deja en el carrito`, async ({ catalogoPage, carritoPage }) => {
      await catalogoPage.agregar(p.nombre);
      await catalogoPage.encabezado.irAlCarrito();

      await expect(carritoPage.cantidad(p.nombre), `Regla Carrito: el producto agregado tiene que ser ${p.nombre}`).toHaveValue('1');
      await expect(carritoPage.lineas).toHaveCount(1);
    });
  }

  // Técnica: partición de equivalencia sobre el contador: carrito vacío, un producto,
  // varios productos con cantidades distintas de 1.
  test('[Carrito][Partición de equivalencia] el contador muestra el total de unidades', async ({ armarCarrito, carritoPage }) => {
    await expect(carritoPage.encabezado.contador, 'Regla Carrito: con el carrito vacío el contador es 0').toHaveText('0');

    await armarCarrito([
      { producto: P.huehue, cantidad: 3 },
      { producto: P.filtros, cantidad: 2 },
    ]);

    await expect(carritoPage.encabezado.contador, 'Regla Carrito: el contador suma unidades, 3 + 2 = 5').toHaveText('5');
  });
});
