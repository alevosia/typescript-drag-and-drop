<h1 align="center">
    Drag & Drop
</h1>
<p align="center">
    A TypeScript tutorial project
</p>

## Branches

This repository is divided into 3 branches depending on how the codebase is split.

### master

No code splitting implemented. All of the code is in a single file, `app.ts`.

### namespace

The code is split by enclosing all files in the `App` namespace and using the `/// <reference path="file_name.ts" />` to import other files. The source code is then compiled and bundled to a single JavaScript file.

### esmodules

The codebase is modularized using ES6 Modules, leveraging the `import` statement. Each file is compiled to its own JavaScript file with `app.js` embedded to `index.html` with `type="module"`. The browser will request for `app.js` and any subsequent dependencies.
  
## Scripts

Development
> npm run dev

Compile to JavaScript
> npm run build