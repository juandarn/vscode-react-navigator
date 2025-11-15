# CSS Pointer

CSS Pointer es una extensión para Visual Studio Code que te permite:

- Ir desde `className` o `id` en tus componentes React (JS/TS/JSX/TSX)  
  directamente a la definición en tu archivo **CSS**.
- Ver un **hover** con el bloque CSS correspondiente al pasar el mouse sobre el
  `className` o `id`.
- Soporta múltiples definiciones con el mismo nombre (por ejemplo, la misma clase
  en distintos archivos CSS):
  - Al usar **F12 / Ctrl+Click**, VS Code te muestra todas las ubicaciones para elegir.
  - Al hacer hover, puedes ver varios bloques CSS (hasta un máximo configurado internamente).

## Características

- Soporte para:
  - `className="chat-header"`
  - `class="chat-header"`
  - `id="chat-header"`
- Búsqueda en archivos `*.css` dentro del workspace (excluyendo `node_modules`).
- Soporte para nombres de clase e id con guiones, por ejemplo:
  - `chat-header`
  - `chat-container-primary`
- Vista previa de CSS en hover:
  - Muestra el bloque completo desde la línea del selector hasta el cierre de `}`.
  - Cuando hay varias coincidencias, muestra varias secciones con el path del archivo.

## Uso

1. Instala la extensión en VS Code.
2. Abre un proyecto React (JavaScript o TypeScript) con archivos CSS.
3. En tu JSX/TSX, por ejemplo:

   ```tsx
   <div className="chat-header">
     ...
   </div>
