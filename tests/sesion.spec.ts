import { test, expect, P } from './fixtures';

test.describe('Regla Sesión', () => {
  // Técnica: partición de equivalencia sobre las páginas protegidas. Cada página
  // es un representante de la clase "página que requiere sesión".
  for (const ruta of ['/catalogo', '/carrito', '/checkout', '/resumen', '/confirmacion']) {
    test(`[Sesión][Partición de equivalencia] sin sesión, ${ruta} lleva al ingreso`, async ({ page, loginPage }) => {
      await page.goto(ruta);

      await expect(loginPage.ingresarBoton, `Regla Sesión: sin sesión, ${ruta} tiene que llevar al ingreso`).toBeVisible();
      await expect(page).not.toHaveURL(new RegExp(ruta));
    });
  }

  // Técnica: transición de estados. Estados: sin sesión -> con sesión y carrito
  // -> cerrar sesión -> sin sesión -> con sesión otra vez. El carrito tiene que quedar vacío.
  test('[Sesión][Transición de estados] cerrar sesión vacía el carrito', async ({
    iniciarSesion,
    catalogoPage,
    carritoPage,
    loginPage,
  }) => {
    await iniciarSesion();
    await catalogoPage.agregar(P.huehue.nombre);
    await catalogoPage.agregar(P.taza.nombre);
    await expect(catalogoPage.encabezado.contador).toHaveText('2');

    await catalogoPage.encabezado.cerrarSesion();
    await expect(loginPage.ingresarBoton, 'Regla Sesión: cerrar sesión vuelve al ingreso').toBeVisible();

    await iniciarSesion();
    await expect(catalogoPage.encabezado.contador, 'Regla Sesión: cerrar sesión vacía el carrito').toHaveText('0');
    await carritoPage.goto();
    await expect(carritoPage.vacio, 'Regla Sesión: cerrar sesión vacía el carrito').toBeVisible();
  });

  // Técnica: transición de estados. Después de cerrar sesión, una página protegida ya no abre.
  test('[Sesión][Transición de estados] después de cerrar sesión el catálogo lleva al ingreso', async ({
    iniciarSesion,
    catalogoPage,
    loginPage,
  }) => {
    await iniciarSesion();
    await catalogoPage.encabezado.cerrarSesion();
    await catalogoPage.goto();

    await expect(loginPage.ingresarBoton, 'Regla Sesión: sin sesión, el catálogo lleva al ingreso').toBeVisible();
  });
});
