import { test, expect, P } from './fixtures';

// Regla Confirmación: confirmar la compra muestra un número de pedido de 6 dígitos
// y deja el carrito vacío.
// Técnica: transición de estados del pedido: carrito con productos -> datos -> resumen
// -> confirmado (carrito vacío).
test.describe('Regla Confirmación', () => {
  test('[Confirmación][Transición de estados] confirmar muestra un pedido de 6 dígitos y vacía el carrito', { tag: '@smoke' }, async ({
    irAlResumen,
    resumenPage,
    confirmacionPage,
    carritoPage,
  }) => {
    await irAlResumen([{ producto: P.prensa, cantidad: 2 }], { nombre: 'Ana', apellido: 'López', cp: '01001' });
    await resumenPage.confirmar();

    await expect(confirmacionPage.titulo).toBeVisible();
    await expect(confirmacionPage.numeroPedido, 'Regla Confirmación: el número de pedido tiene 6 dígitos').toHaveText(/^\d{6}$/);
    await expect(confirmacionPage.encabezado.contador, 'Regla Confirmación: después de confirmar el carrito queda vacío').toHaveText('0');

    await confirmacionPage.encabezado.irAlCarrito();
    await expect(carritoPage.vacio, 'Regla Confirmación: después de confirmar el carrito queda vacío').toBeVisible();
  });
});
