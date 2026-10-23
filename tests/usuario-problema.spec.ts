import { test, expect, P, quetzales } from './fixtures';

// El usuario problema entra a la tienda, pero las reglas son las mismas que para estandar.
// Técnica: partición de equivalencia sobre el usuario. Estas pruebas repiten reglas ya
// cubiertas con estandar, ahora con el representante de la clase "usuario problema".
test.describe('Usuario problema', () => {
  test.beforeEach(async ({ iniciarSesion }) => {
    await iniciarSesion('problema');
  });

  const porPrecio = Object.values(P).sort((a, b) => a.precio - b.precio).map((p) => quetzales(p.precio));

  test('[Catálogo][Partición de equivalencia] usuario problema: ordenar por precio de menor a mayor', async ({ catalogoPage }) => {
    await catalogoPage.ordenarPor('Precio (menor a mayor)');

    await expect(catalogoPage.precios, 'Regla Catálogo: el orden por precio de menor a mayor no se respeta').toHaveText(porPrecio);
  });

  test('[Catálogo][Partición de equivalencia] usuario problema: ordenar por precio de mayor a menor', async ({ catalogoPage }) => {
    await catalogoPage.ordenarPor('Precio (mayor a menor)');

    await expect(catalogoPage.precios, 'Regla Catálogo: el orden por precio de mayor a menor no se respeta').toHaveText(
      [...porPrecio].reverse(),
    );
  });

  test('[Carrito][Partición de equivalencia] usuario problema: agregar Taza de barro la deja en el carrito', async ({
    catalogoPage,
    carritoPage,
  }) => {
    await catalogoPage.agregar(P.taza.nombre);
    await catalogoPage.encabezado.irAlCarrito();

    await expect(carritoPage.cantidad(P.taza.nombre), 'Regla Carrito: el producto agregado tiene que ser Taza de barro').toHaveValue('1');
    await expect(carritoPage.lineas).toHaveCount(1);
  });

  test('[Datos de envío][Tabla de decisión R5] usuario problema: con los datos completos pasa al resumen', async ({
    armarCarrito,
    carritoPage,
    checkoutPage,
    resumenPage,
  }) => {
    await armarCarrito([{ producto: P.huehue, cantidad: 1 }]);
    await carritoPage.continuar();
    await checkoutPage.llenar({ nombre: 'Ana', apellido: 'López', cp: '01001' });

    await expect(checkoutPage.error, 'Regla Datos de envío: con nombre, apellido y código postal llenos no hay error').toHaveText('');
    await expect(resumenPage.titulo, 'Regla Datos de envío: con los datos completos se pasa al resumen').toBeVisible();
  });
});
