# Suite end-to-end

La suite está hecha con Playwright y TypeScript, y prueba la tienda contra las reglas del README. El código lo escribió un agente de IA (Claude Code) y yo decidí qué probar, con qué técnica, y revisé cada prueba.

## Cómo se corre

Primero se instalan las dependencias y el navegador, una sola vez:

    npm install
    npx playwright install chromium

Después la suite completa se corre con un solo comando, que levanta la tienda en http://localhost:4173 por su cuenta:

    npm test

Al terminar queda el reporte HTML en la carpeta playwright-report, y se abre con npm run reporte. Para correr solo las pruebas rápidas del flujo principal está npm run smoke.

## Cómo está organizada

En la carpeta pages hay una clase por página de la tienda: LoginPage, CatalogoPage, CarritoPage, CheckoutPage, ResumenPage y ConfirmacionPage, más Encabezado, que es la barra con el contador y el botón de cerrar sesión que sale en todas las páginas. Solo los page objects tienen localizadores, y casi todos son por rol o por etiqueta, como se recomienda en clase. Los que usan data-test son el precio, el contador y los montos del resumen, porque no tienen un rol propio. Los page objects no tienen asserts ni esperas fijas.

En tests/fixtures.ts están los fixtures que le dan a cada prueba sus páginas ya creadas, la tabla de precios del README y tres flujos que se repiten mucho: iniciar sesión, armar el carrito y llegar al resumen.

Hay un archivo de pruebas por regla, y el nombre de cada prueba dice entre corchetes la regla y la técnica, por ejemplo [Descuento][Valores límite]. Los mensajes de los expect también dicen qué regla se rompió.

## Qué técnica se usó en cada regla

| Regla | Técnica | Archivo |
|---|---|---|
| Ingreso | Tabla de decisión con usuario y contraseña (7 reglas), y partición de equivalencia para el usuario lento | ingreso.spec.ts |
| Sesión | Partición de equivalencia sobre las páginas protegidas y transición de estados para cerrar sesión | sesion.spec.ts |
| Catálogo | Partición de equivalencia, una clase por cada orden y el orden inicial | catalogo.spec.ts |
| Carrito | Transición de estados del botón Agregar y Quitar, y partición de equivalencia para el contador | carrito.spec.ts |
| Cantidad | Valores límite en 0, 1, 5 y 6, y partición de equivalencia para negativos y decimales | cantidad.spec.ts |
| Datos de envío | Tabla de decisión con los tres campos obligatorios y valores límite en el largo del código postal | datos-envio.spec.ts |
| Cupón | Partición de equivalencia con clases válidas e inválidas, y valores límite con una letra de más y de menos | cupon.spec.ts |
| Descuento | Valores límite en Q195 y Q200, Q495 y Q500 | precios.spec.ts |
| Envío y envío gratis | Tabla de decisión con código postal, subtotal con descuento y cupón, y valores límite alrededor de Q300 | precios.spec.ts |
| Total | Partición de equivalencia con un pedido que tiene descuento y envío | precios.spec.ts |
| Confirmación | Transición de estados desde el carrito hasta el pedido confirmado | confirmacion.spec.ts |
| Usuario problema | Partición de equivalencia sobre el usuario, repitiendo reglas que ya pasan con estandar | usuario-problema.spec.ts |

Para el descuento usé Q195 y Q495 como valores justo debajo del límite porque todos los precios son múltiplos de 5, entonces Q199 y Q499 no se pueden armar. Por lo mismo, para el envío gratis usé Q315 (que con el 5 % queda en Q299.25) y Q320 (que queda en Q304).

Las pruebas que quedan en rojo son las de los defectos de DEFECTOS.md. La tienda no se modificó.
