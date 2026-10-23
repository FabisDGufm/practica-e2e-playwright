import { test, expect, P } from './fixtures';

const datos = { nombre: 'Ana', apellido: 'López', cp: '01001' };

test.describe('Regla Cupón', () => {
  test.beforeEach(async ({ iniciarSesion, armarCarrito, carritoPage, checkoutPage }) => {
    await iniciarSesion();
    await armarCarrito([{ producto: P.huehue, cantidad: 1 }]);
    await carritoPage.continuar();
    await checkoutPage.titulo.waitFor();
  });

  // Técnica: partición de equivalencia. Clases válidas: sin cupón (es opcional),
  // en mayúsculas, en minúsculas, con espacios al inicio y al final.
  const validos = [
    { cupon: '', caso: 'sin cupón' },
    { cupon: 'ENVIOGRATIS', caso: 'en mayúsculas' },
    { cupon: 'enviogratis', caso: 'en minúsculas' },
    { cupon: '  EnvioGratis  ', caso: 'con espacios al inicio y al final' },
  ];

  for (const c of validos) {
    test(`[Cupón][Partición de equivalencia] ${c.caso} se acepta`, async ({ checkoutPage, resumenPage }) => {
      await checkoutPage.llenar({ ...datos, cupon: c.cupon });

      await expect(resumenPage.titulo, `Regla Cupón: "${c.cupon}" es válido y se pasa al resumen`).toBeVisible();
    });
  }

  // Técnica: partición de equivalencia (clases inválidas) y valores límite sobre el texto:
  // una letra de más y una letra de menos que ENVIOGRATIS.
  const invalidos = [
    { cupon: 'ENVIOGRATISS', tecnica: 'Valores límite', caso: 'una letra de más' },
    { cupon: 'ENVIOGRATI', tecnica: 'Valores límite', caso: 'una letra de menos' },
    { cupon: 'ENVIO GRATIS', tecnica: 'Partición de equivalencia', caso: 'con un espacio en medio' },
    { cupon: 'DESCUENTO10', tecnica: 'Partición de equivalencia', caso: 'otro texto' },
  ];

  for (const c of invalidos) {
    test(`[Cupón][${c.tecnica}] ${c.caso} da "El cupón no existe."`, async ({ checkoutPage }) => {
      await checkoutPage.llenar({ ...datos, cupon: c.cupon });

      await expect(checkoutPage.error, `Regla Cupón: "${c.cupon}" no es un cupón válido`).toHaveText('El cupón no existe.');
      await expect(checkoutPage.titulo).toBeVisible();
    });
  }
});
