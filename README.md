# Express Boilerplate

Este proyecto lo puedes utilizar como base para construir tus sistemas.

El proyecto ya viene configurado con algunos paquetes comunes que utilizamos.

## Instalación

1. Descarga las dependencias del proyecto
```shell
npm install
```

2. Copia el `template` de las variables de entorno y configuralas según tu ambiente.
```shell
cp .env.example .env
```

3. Ejecuta las migraciones del sistema
```shell
knex migrate:latest
```

4. Ejecuta las semillas del sistema
```
knex seed:run
```

## Ejecución
```
node server.js
```

## Manejo de React en el template

Para que puedas construir el paquete de React debes de modificar: `resources/app.js`, posteriormente ejecutar `npm run build`.

`npm run build` va a construir el archivo `public/bundle.js` el cual está referenciado desde el template `views/layouts/main.hbs` al final del documento.

Cada que hagas una modificación en `resources/app.js` o algún archivo relacionado tienes que volver a ejecutar `npm run build`.

Toma en cuenta que por defecto `public/bundle.js` se ignora desde el archivo de `.gitignore`, si no quieres que se ignorado entonces modifica `.gitignore`.
