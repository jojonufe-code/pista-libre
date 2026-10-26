#!/bin/sh
# Une los módulos en un solo index.html jugable
cd "$(dirname "$0")/src"
{ cat head.html; cat lib.js sim.js traffic.js render.js fbo.js fbor.js ui.js; echo '</script>'; echo '</body></html>'; } > ../index.html
echo "index.html listo"
