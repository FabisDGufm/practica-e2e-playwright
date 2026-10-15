// Café de Altura: tienda de práctica para pruebas end-to-end.
// El estado vive en sessionStorage, así que cada pestaña nueva empieza limpia.

const CLAVE = "calidad2026";
const USUARIOS = ["estandar", "bloqueado", "problema", "lento"];
const MAX_POR_PRODUCTO = 5;

const PRODUCTOS = [
  { id: "cafe-250", nombre: "Café de Huehuetenango 250 g", precio: 75, desc: "Grano entero, tueste medio." },
  { id: "cafe-500", nombre: "Café de Antigua 500 g", precio: 140, desc: "Grano entero, tueste oscuro." },
  { id: "taza", nombre: "Taza de barro", precio: 60, desc: "Hecha a mano, 300 ml." },
  { id: "prensa", nombre: "Prensa francesa", precio: 225, desc: "Vidrio y acero, 1 litro." },
  { id: "molino", nombre: "Molino manual", precio: 350, desc: "Muelas de cerámica ajustables." },
  { id: "filtros", nombre: "Filtros de papel (100)", precio: 25, desc: "Para goteo, tamaño 4." },
];

const leer = (k, def) => JSON.parse(sessionStorage.getItem(k) ?? JSON.stringify(def));
const guardar = (k, v) => sessionStorage.setItem(k, JSON.stringify(v));
const usuario = () => leer("usuario", null);
const carrito = () => leer("carrito", {});
const q = (n) => "Q" + n.toFixed(2);
const $ = (s) => document.querySelector(s);
const producto = (id) => PRODUCTOS.find((p) => p.id === id);

function cantidadTotal() {
  return Object.values(carrito()).reduce((a, b) => a + b, 0);
}

function subtotal() {
  return Object.entries(carrito()).reduce((s, [id, n]) => s + producto(id).precio * n, 0);
}

function calcular(sub, cp, cupon) {
  const pct = sub > 500 ? 10 : sub >= 200 ? 5 : 0;
  const descuento = Math.round(sub * pct) / 100;
  const base = sub - descuento;
  const capital = cp.startsWith("01");
  const gratis = base >= 300 || (cupon === "ENVIOGRATIS" && capital);
  const envio = gratis ? 0 : capital ? 25 : 40;
  return { pct, descuento, envio, total: base + envio };
}

function encabezado() {
  const h = document.createElement("header");
  h.innerHTML = `
    <a class="marca" href="catalogo.html">Café de Altura</a>
    <nav>
      <a href="carrito.html" data-test="enlace-carrito">Carrito (<span data-test="contador-carrito">${cantidadTotal()}</span>)</a>
      <button type="button" data-test="cerrar-sesion">Cerrar sesión</button>
    </nav>`;
  h.querySelector("button").onclick = () => {
    sessionStorage.clear();
    location.href = "index.html";
  };
  document.body.prepend(h);
}

function refrescarContador() {
  const c = $("[data-test=contador-carrito]");
  if (c) c.textContent = cantidadTotal();
}

const paginas = {
  login() {
    const error = $("[data-test=error]");
    if (new URLSearchParams(location.search).has("sesion")) error.textContent = "Inicie sesión primero.";
    $("form").onsubmit = (e) => {
      e.preventDefault();
      const u = $("#usuario").value.trim();
      const c = $("#clave").value;
      error.textContent = "";
      if (!u) return (error.textContent = "Falta el usuario.");
      if (!c) return (error.textContent = "Falta la contraseña.");
      if (!USUARIOS.includes(u) || c !== CLAVE) return (error.textContent = "Usuario o contraseña incorrectos.");
      if (u === "bloqueado") return (error.textContent = "Este usuario está bloqueado.");
      const entrar = () => {
        guardar("usuario", u);
        location.href = "catalogo.html";
      };
      if (u === "lento") {
        $("form button").disabled = true;
        $("form button").textContent = "Ingresando...";
        setTimeout(entrar, 2500);
      } else entrar();
    };
  },

  catalogo() {
    const lista = $("[data-test=productos]");
    const orden = $("#orden");
    const pintar = () => {
      const ps = [...PRODUCTOS];
      const v = orden.value;
      if (v === "az") ps.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      if (v === "za") ps.sort((a, b) => b.nombre.localeCompare(a.nombre, "es"));
      if (usuario() !== "problema") {
        if (v === "precio-asc") ps.sort((a, b) => a.precio - b.precio);
        if (v === "precio-desc") ps.sort((a, b) => b.precio - a.precio);
      }
      const c = carrito();
      lista.innerHTML = ps
        .map(
          (p) => `
        <article data-test="producto" data-id="${p.id}">
          <div class="foto" aria-hidden="true">${p.nombre[0]}</div>
          <h2>${p.nombre}</h2>
          <p>${p.desc}</p>
          <p class="precio" data-test="precio">${q(p.precio)}</p>
          <button type="button" data-test="${c[p.id] ? "quitar" : "agregar"}-${p.id}">${c[p.id] ? "Quitar" : "Agregar al carrito"}</button>
        </article>`
        )
        .join("");
      lista.querySelectorAll("button").forEach((b) => {
        b.onclick = () => {
          let id = b.closest("article").dataset.id;
          const c = carrito();
          if (c[id]) delete c[id];
          else {
            if (usuario() === "problema" && id === "taza") id = "filtros";
            c[id] = 1;
          }
          guardar("carrito", c);
          refrescarContador();
          pintar();
        };
      });
    };
    orden.onchange = pintar;
    pintar();
  },

  carrito() {
    const cuerpo = $("tbody");
    const error = $("[data-test=error]");
    const seguir = $("[data-test=continuar]");
    const pintar = () => {
      const c = carrito();
      cuerpo.innerHTML = Object.entries(c)
        .map(([id, n]) => {
          const p = producto(id);
          return `<tr data-test="linea" data-id="${id}">
            <td>${p.nombre}</td>
            <td>${q(p.precio)}</td>
            <td><input type="number" aria-label="Cantidad de ${p.nombre}" data-test="cantidad-${id}" value="${n}"></td>
            <td data-test="total-linea">${q(p.precio * n)}</td>
            <td><button type="button" data-test="quitar-${id}">Quitar</button></td>
          </tr>`;
        })
        .join("");
      $("[data-test=vacio]").hidden = Object.keys(c).length > 0;
      $("[data-test=subtotal]").textContent = q(subtotal());
      seguir.disabled = Object.keys(c).length === 0;
      cuerpo.querySelectorAll("input").forEach((i) => {
        i.onchange = () => {
          const n = Number(i.value);
          const id = i.closest("tr").dataset.id;
          if (!Number.isInteger(n) || n < 1 || n > MAX_POR_PRODUCTO) {
            error.textContent = `La cantidad tiene que estar entre 1 y ${MAX_POR_PRODUCTO}.`;
            seguir.disabled = true;
            return;
          }
          error.textContent = "";
          guardar("carrito", { ...carrito(), [id]: n });
          refrescarContador();
          pintar();
        };
      });
      cuerpo.querySelectorAll("button").forEach((b) => {
        b.onclick = () => {
          const c = carrito();
          delete c[b.closest("tr").dataset.id];
          guardar("carrito", c);
          error.textContent = "";
          refrescarContador();
          pintar();
        };
      });
    };
    seguir.onclick = () => (location.href = "checkout.html");
    pintar();
  },

  checkout() {
    if (cantidadTotal() === 0) return (location.href = "carrito.html");
    const error = $("[data-test=error]");
    $("form").onsubmit = (e) => {
      e.preventDefault();
      const nombre = $("#nombre").value.trim();
      const apellido = usuario() === "problema" ? "" : $("#apellido").value.trim();
      const cp = $("#cp").value.trim();
      const cupon = $("#cupon").value.trim().toUpperCase();
      error.textContent = "";
      if (!nombre) return (error.textContent = "Falta el nombre.");
      if (!apellido) return (error.textContent = "Falta el apellido.");
      if (!/^\d{5}$/.test(cp)) return (error.textContent = "El código postal tiene que tener 5 dígitos.");
      if (cupon && cupon !== "ENVIOGRATIS") return (error.textContent = "El cupón no existe.");
      guardar("datos", { nombre, apellido, cp, cupon });
      location.href = "resumen.html";
    };
    $("[data-test=cancelar]").onclick = () => (location.href = "carrito.html");
  },

  resumen() {
    const d = leer("datos", null);
    if (!d || cantidadTotal() === 0) return (location.href = "carrito.html");
    const sub = subtotal();
    const r = calcular(sub, d.cp, d.cupon);
    $("[data-test=lineas]").innerHTML = Object.entries(carrito())
      .map(([id, n]) => `<li>${n} x ${producto(id).nombre}: ${q(producto(id).precio * n)}</li>`)
      .join("");
    $("[data-test=subtotal]").textContent = q(sub);
    $("[data-test=descuento-pct]").textContent = r.pct;
    $("[data-test=descuento]").textContent = "-" + q(r.descuento);
    $("[data-test=envio]").textContent = q(r.envio);
    $("[data-test=total]").textContent = q(r.total);
    $("[data-test=confirmar]").onclick = () => {
      guardar("pedido", String(Math.floor(100000 + Math.random() * 900000)));
      guardar("carrito", {});
      sessionStorage.removeItem("datos");
      location.href = "confirmacion.html";
    };
    $("[data-test=cancelar]").onclick = () => (location.href = "catalogo.html");
  },

  confirmacion() {
    $("[data-test=pedido]").textContent = leer("pedido", "");
  },
};

const pagina = document.body.dataset.page;
if (pagina !== "login" && !usuario()) location.href = "index.html?sesion";
else {
  if (pagina !== "login") encabezado();
  paginas[pagina]();
}
