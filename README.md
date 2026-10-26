# Pista Libre

Juego de construcción y gestión de aeropuertos en 3D (Three.js), en un solo archivo HTML.

## Jugar
Abre `index.html` en el navegador (PC, tableta o teléfono).

## Estructura
- `src/head.html` — estilos e interfaz (HUD, paneles, botones)
- `src/lib.js` — utilidades, motor 3D, personas, aviones, vehículos de plataforma, ciudad
- `src/sim.js` — simulación: terminal, pasajeros, vuelos, contratos, economía
- `src/traffic.js` — conducción realista y tráfico de acceso (taxis, buses, carros, estacionamiento)
- `src/render.js` — mundo 3D de la terminal, pista, plataforma y vías
- `src/fbo.js` — aeródromo ejecutivo norte (simulación: jets, helicópteros, VIP, tren, shuttle)
- `src/fbor.js` — aeródromo ejecutivo (gráficos)
- `src/ui.js` — barra de herramientas, paneles, guardado y bucle principal
- `tests/` — pruebas automáticas con Playwright

## Construir
```
sh build.sh
```
Genera `index.html` uniendo los módulos de `src/`.
