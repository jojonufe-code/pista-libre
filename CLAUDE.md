# Pista Libre — notas para Claude

- Juego 3D (Three.js r128 desde CDN) que se entrega como **un solo `index.html`**.
- El código vive en `src/`; `sh build.sh` concatena `head.html + lib.js sim.js traffic.js render.js fbo.js fbor.js ui.js` en `index.html`. Todo corre dentro de un IIFE (mismo ámbito); `window.PL` es la API de pruebas.
- Después de cada cambio: reconstruir, verificar sintaxis del script y correr las pruebas de `tests/` (Playwright con Chromium + swiftshader) sin errores de página.
- El usuario (Joel) escribe en español, prefiere respuestas cortas, avances visibles y que se le avise antes de cambios irreversibles. Juega en PC, tableta y teléfono Galaxy: cuidar el rendimiento en móvil.
- Publicación: GitHub Pages sirve `index.html` desde la rama `main`.
