# Armonikus

Herramientas web para escribir ejercicios de teoría musical. Módulo actual: **escritura a cuatro voces (SATB)**. Más módulos (contrapunto, serialismo…) vendrán después.

Editor web para escribir ejercicios de armonía a cuatro voces sobre gran pentagrama. Se usa desde el navegador, sin instalar nada, y está pensado para tareas de **Lenguaje Musical III** (Instituto de Bellas Artes, Universidad del Quindío).

Es un solo archivo HTML autocontenido: `dist/Editor_Escritura_4_Voces.html`. La misma página se publica con GitHub Pages desde `docs/index.html`.

## Qué hace

- Gran pentagrama con 30 armaduras (mayores y menores) y compases 4/4, 3/4, 2/4, 2/2 y 6/8.
- Modo lápiz (iPad/tableta): dibuja la nota a mano (cabeza, plica, corchete, puntillo) y la app reconoce la figura (redonda, blanca, negra, corchea, semicorchea y puntillos).
- Mapa de progresiones armónicas (mayor y menor, con cadencia plagal y rota) al final de la página.
- Ritmo independiente por voz (p. ej., blanca en la soprano sobre negras en las demás).
- Cambios de tonalidad en cualquier compás (varios por ejercicio): la armadura cambia desde ese compás, con becuadros que cancelan la anterior; las notas, los grados y el revisor usan la nueva tonalidad. También viajan en el código del docente.
- Anacrusa (antecompás) opcional al inicio, de corchea a blanca con puntillo.
- Escritura por clic en cada voz (S, A, T, B), con figuras de redonda a semicorchea, puntillos, silencios y alteraciones (♭ ♮ ♯).
- Grado en cifrado romano (inversiones, séptima, dominantes secundarias como V/V, sexta aumentada y napolitana) y cifrado americano (con bajo, ej. `C/E`) para cada acorde.
- Opción de marcar con líneas los grados mayores (IV, V en modo mayor; III, V, VI en menor).
- Escuchar el ejercicio con instrumentos sintetizados (piano, órgano, flauta, cuerdas, coro) y tempo ajustable.
- Revisor opcional de conducción de voces: quintas y octavas paralelas o directas, cruce y superposición de voces, espaciamiento y registro.
- Deshacer y rehacer, guardado automático en el navegador y guardado/apertura de trabajos en `.json`.
- Descarga del ejercicio en PNG o PDF (impresión), con nombre, grupo y fecha del estudiante. El PNG lleva incrustado el ejercicio: el docente puede abrirlo en la app con «Abrir trabajo» para revisarlo.

## Uso para estudiantes

1. Abre la página. Si el docente dejó un **código de ejercicio**, pégalo en «Cargar ejercicio».
2. Elige voz y figura, y haz clic en el pentagrama. El compás sombreado indica dónde va el siguiente acorde.
3. Pon el grado debajo y el cifrado americano encima de cada acorde.
4. Escribe tu nombre y descarga el PNG o el PDF. Súbelo a la tarea.

## Modo docente

1. Elige tonalidad, compás y número de compases.
2. Escribe la melodía en la voz Soprano.
3. Abre «Modo docente», marca las opciones y pulsa «Generar código».
4. Pega el código (o el enlace con `#ej=...`) en la descripción de la tarea.

Con «Bloquear soprano y ritmo» activado, el estudiante solo puede completar Alto, Tenor y Bajo, y los grados y cifrados.

## Uso en Moodle

- Súbelo como recurso de tipo **Archivo** (o alójalo en otro sitio y enlázalo). Los editores de texto de Moodle suelen eliminar los scripts de las páginas pegadas.
- La página no puede enviar el ejercicio a la tarea por sí sola: el estudiante descarga su archivo y lo sube.

## Desarrollo

Requiere Node.js (solo para descargar VexFlow) y Python 3.

```bash
npm install
python3 build.py     # genera dist/Editor_Escritura_4_Voces.html
```

```
src/template.html    estructura de la página
src/style.css        estilos
src/app.js           lógica del editor
build.py             une todo (incluida la librería VexFlow) en un solo HTML
dist/                resultado listo para usar
```

## Límites actuales

- Las cuatro voces comparten el ritmo (una figura por acorde), como en los ejercicios de nota contra nota.
- El revisor solo evalúa la conducción de voces entre acordes con las cuatro voces escritas.
- Los instrumentos son sintetizados, no grabaciones.

## Contenidos

El proyecto no incluye ejercicios de libros de texto. Cada docente escribe y carga los suyos.

## Créditos y licencias

- Notación musical: [VexFlow](https://www.vexflow.com) 4.2.5 (licencia MIT), incluido en el archivo generado. Ver `THIRD_PARTY_VEXFLOW_LICENSE.txt`.
- Autor: Mtro. Andrés Chávez Becerra.
- La licencia del código de este proyecto está por definir (añade un archivo `LICENSE`).


## Licencia

Copyright © Andrés Chávez Becerra. Todos los derechos reservados. VexFlow se incluye bajo licencia MIT (ver `THIRD_PARTY_VEXFLOW_LICENSE.txt`).
