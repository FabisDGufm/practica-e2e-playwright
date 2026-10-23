import { test, expect, CLAVE } from './fixtures';

// Regla Ingreso: usuario y contraseña obligatorios. Si falta uno, si no coinciden
// o si el usuario está bloqueado, la tienda muestra un error y no deja entrar.
// Técnica: tabla de decisión. Condiciones: usuario (vacío, desconocido, bloqueado, válido)
// y contraseña (vacía, incorrecta, correcta). Cada fila es una regla de la tabla.
const filasRechazo = [
  { regla: 'R1', usuario: '', clave: CLAVE, caso: 'falta el usuario' },
  { regla: 'R2', usuario: 'estandar', clave: '', caso: 'falta la contraseña' },
  { regla: 'R3', usuario: '', clave: '', caso: 'faltan los dos' },
  { regla: 'R4', usuario: 'estandar', clave: 'otra-clave', caso: 'la contraseña no coincide' },
  { regla: 'R5', usuario: 'desconocido', clave: CLAVE, caso: 'el usuario no existe' },
  { regla: 'R6', usuario: 'bloqueado', clave: CLAVE, caso: 'el usuario está bloqueado' },
];

test.describe('Regla Ingreso', () => {
  for (const f of filasRechazo) {
    test(`[Ingreso][Tabla de decisión ${f.regla}] ${f.caso}: muestra error y no deja entrar`, async ({
      page,
      loginPage,
      catalogoPage,
    }) => {
      await loginPage.goto();
      await loginPage.ingresar(f.usuario, f.clave);

      await expect(loginPage.error, `Regla Ingreso: si ${f.caso}, la tienda tiene que mostrar un error`).toHaveText(/\S/);
      await expect(page, `Regla Ingreso: si ${f.caso}, la tienda no deja entrar`).toHaveURL(/\/$|\/index/);
      await expect(catalogoPage.titulo).toBeHidden();
    });
  }

  test('[Ingreso][Tabla de decisión R7] usuario válido y contraseña correcta entra al catálogo', { tag: '@smoke' }, async ({
    loginPage,
    catalogoPage,
  }) => {
    await loginPage.goto();
    await loginPage.ingresar('estandar', CLAVE);

    await expect(catalogoPage.titulo, 'Regla Ingreso: con datos correctos se entra al catálogo').toBeVisible();
  });

  // Técnica: partición de equivalencia, clase "usuario válido que tarda en entrar".
  // Sin esperas fijas: el expect reintenta hasta que aparece el catálogo.
  test('[Ingreso][Partición de equivalencia] el usuario lento entra sin esperas fijas', async ({ loginPage, catalogoPage }) => {
    await loginPage.goto();
    await loginPage.ingresar('lento', CLAVE);

    await expect(catalogoPage.titulo, 'Regla Ingreso: el usuario lento también entra al catálogo').toBeVisible({ timeout: 10_000 });
  });
});
