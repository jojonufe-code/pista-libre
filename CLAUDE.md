# Pista Libre — notas para Claude

- Juego 3D (Three.js r128 desde CDN) que se entrega como **un solo `index.html`**.
- El código vive en `src/`; `sh build.sh` concatena `head.html + lib.js sim.js traffic.js render.js fbo.js fbor.js gfx.js audio.js ui.js` en `index.html`. Todo corre dentro de un IIFE (mismo ámbito); `window.PL` es la API de pruebas.
- Después de cada cambio: reconstruir, verificar sintaxis del script y correr las pruebas de `tests/` (Playwright con Chromium + swiftshader) sin errores de página.
- El usuario (Joel) escribe en español, prefiere respuestas cortas, avances visibles y que se le avise antes de cambios irreversibles. Juega en PC, tableta y teléfono Galaxy: cuidar el rendimiento en móvil.
- Publicación: GitHub Pages sirve `index.html` desde la rama `main`.
- `gfx.js`: calidad gráfica (localStorage `pl_gfx`: 0 Baja/móvil, 1 Alta, 2 Ultra; auto-baja si va lento), posproceso propio (bloom HDR, MSAA), reflejo plano del suelo (charcos, pisos pulidos), cubo dinámico para el vidrio, clima (`pl_wx`), lluvia en GPU, partículas, marcas de caucho, pantallas FIDS y cámara 🎬. Parchea `MeshStandardMaterial.prototype.onBeforeCompile` (sombras de nubes y superficies mojadas).
- Los render targets usan `stencilBuffer:true` para tener profundidad de 24 bits (con 16 bits el suelo parpadea con el plano exterior).
- `audio.js`: bus maestro con compresor (`auOut()`, volumen en localStorage `pl_vol`), voces de motor posicionales (jets, hélices, rotor), murmullo de terminal, clima, aves/grillos, anuncios de embarque con `speak()` y efectos `auSfx(k)`. Todo lo que suene debe conectarse a `auOut()`.
- Segundo piso: `G.up.f2` (terminal principal, `f2Get()` en sim.js calcula escaleras y lugares; modo de pasajero `'f2'`) y `G.fbo.f2` (Sky Lounge, asientos con altura `FB2Y`, `fbUp()/fbDown()` para la escalera).
- Personas: `person3(...,md,st)` dibuja cara y gestos según ánimo (0-100) y estado (`wait`, `bag`, `rush`, `joy`).
- Geometrías compartidas instanciables: marcar `geo.userData.inst=true` (copas `CROWNG`, frondas `FRONDG`, carrocerías `carGeo`); `bake()` las agrupa y `disposeGroup()` no las destruye (`isInstG`).
- Aviones: fuselaje torneado `fuseGeo(L,R)` (la librea mapea nariz→cola en todo el canvas; el dibujo antiguo ocupa la sección central vía `NR/KV`), góndolas `nacGeo`.
- En el pase de reflejo (`mirrorPass`) hay que ocultar todo material que lea `uRefl` (suelos con `GFX_GROUND`), si no WebGL da "feedback loop".
