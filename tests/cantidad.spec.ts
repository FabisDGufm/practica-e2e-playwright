import { test, expect, P } from './fixtures';

// Regla Cantidad: un número entero de 1 a 5 por producto. Fuera de ese rango,
// negativo o con decimales, la tienda muestra un error y no deja continuar al pago.
const validos = [
  { valor: '1', tecnica: 'Valores límite', caso: 'límite inferior válido' },
  { valor: '3', tecnica: 'Partición de equivalencia', caso: 'valor dentro del rango' },
  { valor: '5', tecnica: 'Valores límite', caso: 'límite superior válido' },
];

const invalidos = [
  { valor: '0', tecnica: 'Valores límite', caso: 'justo debajo del mínimo' },
  { valor: '6', tecnica: 'Valores límite', caso: 'justo encima del máximo' },
  { valor: '-2', tecnica: 'Partición de equivalencia', caso: 'número negativo' },
  { valor: '2.5', tecnica: 'Partición de equivalencia', caso: 'número con decimales' },
];

test.describe('Regla Cantidad', () => {
  test.beforeEach(async ({ iniciarSesion, armarCarrito }) => {
    await iniciarSesion();
    await armarCarrito([{ producto: P.huehue, cantidad: 1 }]);
  });

  for (const c of validos) {
    test(`[Cantidad][${c.tecnica}] ${c.valor} (${c.caso}) se acepta`, async ({ carritoPage }) => {
      await carritoPage.cambiarCantidad(P.huehue.nombre, c.valor);

      await expect(carritoPage.error, `Regla Cantidad: ${c.valor} es válido y no debe dar error`).toHaveText('');
      await expect(carritoPage.encabezado.contador).toHaveText(c.valor);
      await expect(carritoPage.continuarBoton, `Regla Cantidad: con ${c.valor} se puede continuar al pago`).toBeEnabled();
    });
  }

  for (const c of invalidos) {
    test(`[Cantidad][${c.tecnica}] ${c.valor} (${c.caso}) da error y no deja continuar`, async ({ carritoPage }) => {
      await carritoPage.cambiarCantidad(P.huehue.nombre, c.valor);

      await expect(carritoPage.error, `Regla Cantidad: ${c.valor} tiene que mostrar un error`).toHaveText(/\S/);
      await expect(carritoPage.continuarBoton, `Regla Cantidad: con ${c.valor} no se puede continuar al pago`).toBeDisabled();
    });
  }
});
