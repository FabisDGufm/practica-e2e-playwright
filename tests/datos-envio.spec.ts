import { test, expect, P } from './fixtures';
import type { DatosEnvio } from '../pages/CheckoutPage';

const completos: DatosEnvio = { nombre: 'Ana', apellido: 'López', cp: '01001' };

test.describe('Regla Datos de envío', () => {
  test.beforeEach(async ({ iniciarSesion, armarCarrito, carritoPage, checkoutPage }) => {
    await iniciarSesion();
    await armarCarrito([{ producto: P.huehue, cantidad: 1 }]);
    await carritoPage.continuar();
    await checkoutPage.titulo.waitFor();
  });

  // Técnica: tabla de decisión con las tres condiciones obligatorias
  // (nombre, apellido, código postal). Una regla por campo que falta, más la regla con todo lleno.
  const faltantes: { regla: string; campo: string; datos: DatosEnvio }[] = [
    { regla: 'R1', campo: 'nombre', datos: { ...completos, nombre: '' } },
    { regla: 'R2', campo: 'apellido', datos: { ...completos, apellido: '' } },
    { regla: 'R3', campo: 'código postal', datos: { ...completos, cp: '' } },
    { regla: 'R4', campo: 'todos', datos: { nombre: '', apellido: '', cp: '' } },
  ];

  for (const f of faltantes) {
    test(`[Datos de envío][Tabla de decisión ${f.regla}] falta ${f.campo}: muestra error y no avanza`, async ({
      checkoutPage,
    }) => {
      await checkoutPage.llenar(f.datos);

      await expect(checkoutPage.error, `Regla Datos de envío: falta ${f.campo} y tiene que haber error`).toHaveText(/\S/);
      await expect(checkoutPage.titulo, 'Regla Datos de envío: con datos incompletos no se pasa al resumen').toBeVisible();
    });
  }

  test('[Datos de envío][Tabla de decisión R5] nombre, apellido y código postal llenos pasan al resumen', async ({
    checkoutPage,
    resumenPage,
  }) => {
    await checkoutPage.llenar(completos);

    await expect(resumenPage.titulo, 'Regla Datos de envío: con los datos completos se pasa al resumen').toBeVisible();
  });

  // Técnica: análisis de valores límite sobre la longitud del código postal (4, 5 y 6 dígitos)
  // y partición de equivalencia para un código con letras.
  const cps = [
    { cp: '0100', valido: false, tecnica: 'Valores límite', caso: '4 dígitos' },
    { cp: '01001', valido: true, tecnica: 'Valores límite', caso: '5 dígitos' },
    { cp: '010011', valido: false, tecnica: 'Valores límite', caso: '6 dígitos' },
    { cp: '01A01', valido: false, tecnica: 'Partición de equivalencia', caso: 'con una letra' },
  ];

  for (const c of cps) {
    test(`[Datos de envío][${c.tecnica}] código postal con ${c.caso} ${c.valido ? 'se acepta' : 'se rechaza'}`, async ({
      checkoutPage,
      resumenPage,
    }) => {
      await checkoutPage.llenar({ ...completos, cp: c.cp });

      if (c.valido) {
        await expect(resumenPage.titulo, `Regla Datos de envío: el código postal ${c.cp} es válido`).toBeVisible();
      } else {
        await expect(checkoutPage.error, `Regla Datos de envío: el código postal ${c.cp} no tiene exactamente 5 dígitos`).toHaveText(/\S/);
        await expect(checkoutPage.titulo).toBeVisible();
      }
    });
  }
});
