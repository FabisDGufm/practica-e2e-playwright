import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogoPage } from '../pages/CatalogoPage';
import { CarritoPage } from '../pages/CarritoPage';
import { CheckoutPage, type DatosEnvio } from '../pages/CheckoutPage';
import { ResumenPage } from '../pages/ResumenPage';
import { ConfirmacionPage } from '../pages/ConfirmacionPage';

export const CLAVE = 'calidad2026';

// Precios de la tabla del README, que es la especificación.
export const P = {
  huehue: { nombre: 'Café de Huehuetenango 250 g', precio: 75 },
  antigua: { nombre: 'Café de Antigua 500 g', precio: 140 },
  taza: { nombre: 'Taza de barro', precio: 60 },
  prensa: { nombre: 'Prensa francesa', precio: 225 },
  molino: { nombre: 'Molino manual', precio: 350 },
  filtros: { nombre: 'Filtros de papel (100)', precio: 25 },
} as const;

export type Producto = (typeof P)[keyof typeof P];
export type Linea = { producto: Producto; cantidad: number };

export const quetzales = (n: number) => 'Q' + n.toFixed(2);

type Pages = {
  loginPage: LoginPage;
  catalogoPage: CatalogoPage;
  carritoPage: CarritoPage;
  checkoutPage: CheckoutPage;
  resumenPage: ResumenPage;
  confirmacionPage: ConfirmacionPage;
};

type Flujos = {
  // Inicia sesión y espera el catálogo.
  iniciarSesion: (usuario?: string) => Promise<void>;
  // Agrega cada producto desde el catálogo y deja su cantidad en el carrito.
  armarCarrito: (lineas: Linea[]) => Promise<void>;
  // Recorre todo el flujo hasta el resumen del pedido.
  irAlResumen: (lineas: Linea[], datos: DatosEnvio) => Promise<void>;
};

export const test = base.extend<Pages & Flujos>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  catalogoPage: async ({ page }, use) => use(new CatalogoPage(page)),
  carritoPage: async ({ page }, use) => use(new CarritoPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  resumenPage: async ({ page }, use) => use(new ResumenPage(page)),
  confirmacionPage: async ({ page }, use) => use(new ConfirmacionPage(page)),

  iniciarSesion: async ({ loginPage, catalogoPage }, use) => {
    await use(async (usuario = 'estandar') => {
      await loginPage.goto();
      await loginPage.ingresar(usuario, CLAVE);
      await catalogoPage.titulo.waitFor();
    });
  },

  armarCarrito: async ({ catalogoPage, carritoPage }, use) => {
    await use(async (lineas) => {
      for (const { producto } of lineas) await catalogoPage.agregar(producto.nombre);
      await catalogoPage.encabezado.irAlCarrito();
      for (const { producto, cantidad } of lineas) {
        if (cantidad !== 1) await carritoPage.cambiarCantidad(producto.nombre, String(cantidad));
      }
    });
  },

  irAlResumen: async ({ iniciarSesion, armarCarrito, carritoPage, checkoutPage, resumenPage }, use) => {
    await use(async (lineas, datos) => {
      await iniciarSesion();
      await armarCarrito(lineas);
      await carritoPage.continuar();
      await checkoutPage.llenar(datos);
      await resumenPage.titulo.waitFor();
    });
  },
});

export { expect } from '@playwright/test';
