# Justicia Cercana

Prototipo web de Interacción Humano-Computador para juezas y jueces de paz en comunidades rurales del Perú.

## Cómo ejecutar

```bash
cd justicia-cercana
npm install
npm run dev
```

Abra la dirección que muestre Vite (por lo general `http://localhost:5173`).

## Tableta de referencia

El diseño está pensado para **tableta de 10 pulgadas en horizontal** (**1280×800**). En el navegador, use las herramientas de desarrollo (Ctrl+Shift+M) y elija esa resolución o un dispositivo similar.

## Cómo probar el modo sin conexión

1. La aplicación inicia **sin conexión** (como en una jornada rural).
2. Use el botón **Simular conexión** / **Simular sin conexión** de la barra superior.
3. Registre un caso, una actuación o una actividad: verá **Guardado en esta tableta** y **Pendiente de sincronización**.
4. Al volver a **Simular conexión**, aparece el aviso **Internet disponible**.
5. En **Sincronizar ahora** puede completar la sincronización o pulsar **Simular error** para ver que los datos no se pierden.

## Flujos implementados

- Registrar, consultar, editar y actualizar un caso judicial.
- Registrar y consultar una actuación notarial, con aviso de posible duplicado.
- Agenda mensual, detalle de un día y nueva actividad.
- Trabajo sin Internet, guardado local y sincronización.

## Ayuda y documentación

- **En la aplicación:** barra superior → **Ayuda** (`/ayuda`). Manual por temas, búsqueda e **Imprimir / PDF** en cada artículo.
- **Sin conexión:** todo el manual integrado funciona sin Internet (contenido embebido en la app).
- **Documento descargable:** `public/docs/manual-usuario.html` — en Ayuda use *Descargar manual (HTML)* para guardarlo en la tableta.
- **Desarrollo:** el contenido editable está en `src/data/helpTopics.ts`.
