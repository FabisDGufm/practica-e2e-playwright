# Defectos encontrados

Cada fila es un defecto de la tienda que deja en rojo una prueba de la suite. Todos se encontraron corriendo npm test contra la tienda local, en Chromium. La contraseña de todos los usuarios es calidad2026.

| # | Usuario | Regla | Pasos | Resultado esperado | Resultado obtenido | Prueba en rojo |
|---|---|---|---|---|---|---|
| 1 | estandar | Descuento | Ingresar, agregar Molino manual y Café de Huehuetenango 250 g, poner 2 de café en el carrito (subtotal Q500), llenar datos con código postal 01001 y continuar al resumen. | Descuento de 10 %, es decir -Q50.00, y total Q450.00, porque desde Q500 el descuento es de 10 %. | Descuento de 5 %, -Q25.00, y total Q475.00. El tramo de 10 % empieza después de Q500 y no en Q500. | precios.spec.ts, subtotal Q500, límite del tramo de 10 % |
| 2 | estandar | Envío gratis | Ingresar, agregar Café de Huehuetenango 250 g (subtotal Q75), llenar datos con código postal 12345 y cupón ENVIOGRATIS, y continuar al resumen. | Envío Q0.00 y total Q75.00, porque el cupón vale para cualquier código postal. | Envío Q40.00 y total Q115.00. El cupón solo da envío gratis si el código postal empieza con 01. | precios.spec.ts, fuera de la capital, menos de Q300, con cupón |
| 3 | problema | Catálogo | Ingresar y ordenar el catálogo por Precio (menor a mayor). | Precios en orden Q25, Q60, Q75, Q140, Q225, Q350. | Los productos no se ordenan y salen en el orden en que la tienda los tiene guardados: Q75, Q140, Q60, Q225, Q350, Q25. | usuario-problema.spec.ts, ordenar por precio de menor a mayor |
| 4 | problema | Catálogo | Ingresar y ordenar el catálogo por Precio (mayor a menor). | Precios en orden Q350, Q225, Q140, Q75, Q60, Q25. | Los productos no se ordenan y salen otra vez como Q75, Q140, Q60, Q225, Q350, Q25. | usuario-problema.spec.ts, ordenar por precio de mayor a menor |
| 5 | problema | Carrito | Ingresar, agregar Taza de barro desde el catálogo e ir al carrito. | En el carrito está Taza de barro con cantidad 1. | En el carrito aparece Filtros de papel (100) en lugar de la taza, y el botón de la taza sigue diciendo Agregar al carrito. | usuario-problema.spec.ts, agregar Taza de barro la deja en el carrito |
| 6 | problema | Datos de envío | Ingresar, agregar un producto, continuar al pago y llenar nombre Ana, apellido López y código postal 01001. | Pasa al resumen del pedido sin error. | Muestra "Falta el apellido." aunque el apellido está lleno, así que no se puede terminar ninguna compra. | usuario-problema.spec.ts, con los datos completos pasa al resumen |

Las demás reglas del README (ingreso, sesión, orden por nombre, cantidad, datos de envío, cupón, envío normal, total y confirmación) se probaron con el usuario estandar y pasan.
