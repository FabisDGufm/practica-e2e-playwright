import { test, expect, P, quetzales, type Linea } from './fixtures';

// Oráculo escrito a partir de las reglas del README, no del código de la tienda.
function esperado(lineas: Linea[], cp: string, cupon: boolean) {
  const subtotal = lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0);
  const pct = subtotal < 200 ? 0 : subtotal < 500 ? 5 : 10;
  const descuento = (subtotal * pct) / 100;
  const base = subtotal - descuento;
  const envio = base >= 300 || cupon ? 0 : cp.startsWith('01') ? 25 : 40;
  return { subtotal, pct, descuento, envio, total: base + envio };
}

const datos = (cp: string, cupon = '') => ({ nombre: 'Ana', apellido: 'López', cp, cupon });

test.describe('Regla Descuento', () => {
  // Técnica: análisis de valores límite en las fronteras de los tramos de descuento
  // (Q199/Q200 y Q499/Q500), más un valor dentro del tramo de 10 %. Los precios son
  // múltiplos de 5, así que Q195 y Q495 son los valores alcanzables justo debajo de cada límite.
  const casos: { caso: string; lineas: Linea[] }[] = [
    { caso: 'Q195, justo debajo de Q200, sin descuento', lineas: [{ producto: P.huehue, cantidad: 1 }, { producto: P.taza, cantidad: 2 }] },
    { caso: 'Q200, límite del tramo de 5 %', lineas: [{ producto: P.antigua, cantidad: 1 }, { producto: P.taza, cantidad: 1 }] },
    {
      caso: 'Q495, justo debajo de Q500, 5 %',
      lineas: [{ producto: P.molino, cantidad: 1 }, { producto: P.taza, cantidad: 2 }, { producto: P.filtros, cantidad: 1 }],
    },
    { caso: 'Q500, límite del tramo de 10 %', lineas: [{ producto: P.molino, cantidad: 1 }, { producto: P.huehue, cantidad: 2 }] },
    { caso: 'Q700, dentro del tramo de 10 %', lineas: [{ producto: P.molino, cantidad: 2 }] },
  ];

  for (const c of casos) {
    test(`[Descuento][Valores límite] subtotal ${c.caso}`, async ({ irAlResumen, resumenPage }) => {
      const e = esperado(c.lineas, '01001', false);
      await irAlResumen(c.lineas, datos('01001'));

      await expect(resumenPage.subtotal).toHaveText(quetzales(e.subtotal));
      await expect(resumenPage.descuentoPct, `Regla Descuento: con subtotal ${quetzales(e.subtotal)} el descuento es ${e.pct} %`).toHaveText(
        String(e.pct),
      );
      await expect(resumenPage.descuento, `Regla Descuento: el descuento de ${quetzales(e.subtotal)} es ${quetzales(e.descuento)}`).toHaveText(
        '-' + quetzales(e.descuento),
      );
      await expect(resumenPage.total, 'Regla Total: subtotal menos descuento más envío').toHaveText(quetzales(e.total));
    });
  }
});

test.describe('Regla Envío y Envío gratis', () => {
  // Técnica: tabla de decisión con tres condiciones: el código postal empieza con 01,
  // el subtotal con descuento es de Q300 o más, y se usa el cupón ENVIOGRATIS.
  // Dentro de ella, partición de equivalencia sobre el código postal (01..., 0 sin 1, otro)
  // y valores límite sobre Q300 (Q315 deja Q299.25 y Q320 deja Q304).
  const un75: Linea[] = [{ producto: P.huehue, cantidad: 1 }];
  const sub315: Linea[] = [{ producto: P.antigua, cantidad: 1 }, { producto: P.huehue, cantidad: 2 }, { producto: P.filtros, cantidad: 1 }];
  const sub320: Linea[] = [{ producto: P.antigua, cantidad: 1 }, { producto: P.taza, cantidad: 3 }];

  const filas = [
    { regla: 'R1', tecnica: 'Tabla de decisión', caso: 'capital, menos de Q300, sin cupón: Q25', lineas: un75, cp: '01001', cupon: '' },
    { regla: 'R2', tecnica: 'Partición de equivalencia', caso: 'código 02001 (empieza con 0 pero no con 01): Q40', lineas: un75, cp: '02001', cupon: '' },
    { regla: 'R2', tecnica: 'Partición de equivalencia', caso: 'código 10001 (fuera de la capital): Q40', lineas: un75, cp: '10001', cupon: '' },
    { regla: 'R2', tecnica: 'Valores límite', caso: 'fuera de la capital con Q299.25 después del descuento: Q40', lineas: sub315, cp: '12345', cupon: '' },
    { regla: 'R3', tecnica: 'Valores límite', caso: 'fuera de la capital con Q304 después del descuento: gratis', lineas: sub320, cp: '12345', cupon: '' },
    { regla: 'R4', tecnica: 'Tabla de decisión', caso: 'capital con Q304 después del descuento: gratis', lineas: sub320, cp: '01001', cupon: '' },
    { regla: 'R5', tecnica: 'Tabla de decisión', caso: 'capital, menos de Q300, con cupón: gratis', lineas: un75, cp: '01001', cupon: 'ENVIOGRATIS' },
    { regla: 'R6', tecnica: 'Tabla de decisión', caso: 'fuera de la capital, menos de Q300, con cupón: gratis', lineas: un75, cp: '12345', cupon: 'ENVIOGRATIS' },
  ];

  for (const f of filas) {
    test(`[Envío][${f.tecnica} ${f.regla}] ${f.caso}`, async ({ irAlResumen, resumenPage }) => {
      const e = esperado(f.lineas, f.cp, f.cupon !== '');
      await irAlResumen(f.lineas, datos(f.cp, f.cupon));

      await expect(
        resumenPage.envio,
        `Regla Envío: con código ${f.cp}, subtotal ${quetzales(e.subtotal)} y ${f.cupon ? 'cupón' : 'sin cupón'}, el envío es ${quetzales(e.envio)}`,
      ).toHaveText(quetzales(e.envio));
      await expect(resumenPage.total, 'Regla Total: subtotal menos descuento más envío').toHaveText(quetzales(e.total));
    });
  }
});

test.describe('Regla Total', () => {
  // Técnica: partición de equivalencia, un pedido con descuento con centavos y envío con costo,
  // para que las tres partes de la fórmula cuenten en el total.
  test('[Total][Partición de equivalencia] subtotal Q215 con 5 % y envío Q25 da Q229.25', { tag: '@smoke' }, async ({
    irAlResumen,
    resumenPage,
  }) => {
    const lineas: Linea[] = [{ producto: P.antigua, cantidad: 1 }, { producto: P.huehue, cantidad: 1 }];
    const e = esperado(lineas, '01001', false);
    await irAlResumen(lineas, datos('01001'));

    await expect(resumenPage.subtotal).toHaveText(quetzales(e.subtotal));
    await expect(resumenPage.descuento).toHaveText('-' + quetzales(e.descuento));
    await expect(resumenPage.envio).toHaveText(quetzales(e.envio));
    await expect(resumenPage.total, 'Regla Total: Q215 - Q10.75 + Q25 = Q229.25').toHaveText(quetzales(e.total));
  });
});
