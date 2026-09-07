import fs from "fs";
import path from "path";

// 1. Obtener el argumento desde la terminal
const argument = process.argv[2];

if (!argument) {
  console.error(
    "\x1b[31mError:\x1b[0m Por favor, especifica el módulo y el feature."
  );
  console.log(
    "\x1b[36mEjemplo:\x1b[0m npm run feature products/cart"
  );
  process.exit(1);
}

// 2. Separar módulo y feature usando "/"
const parts = argument.split("/");

if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
  console.error(
    '\x1b[31mError:\x1b[0m Debes especificar el módulo y el feature separados por "/".'
  );
  console.log(
    "\x1b[36mEjemplo:\x1b[0m npm run feature products/cart"
  );
  process.exit(1);
}

// 3. Normalizar los nombres
const moduleName = parts[0].trim().toLowerCase();
const featureName = parts[1].trim().toLowerCase();

// 4. Definir la ruta final
const featureDir = path.join(
  process.cwd(),
  "src",
  "features",
  moduleName,
  featureName
);

// 5. Definir las subcarpetas de la arquitectura Feature-First
const subdirectories = [
  "components",
  "interfaces",
  "layouts",
  "pages",
  "services",
  "store",
];

// 6. Definir archivos iniciales
const initialFiles = {
  "interfaces/index.ts": `// Tipos y contratos TypeScript para el módulo ${featureName}\n`,
  "services/index.ts": `// Endpoints y llamadas asíncronas para el módulo ${featureName}\n`,
  "store/index.ts": `// Estado local o global (Zustand, Redux, etc.) para el módulo ${featureName}\n`,
  "pages/index.ts": `// Páginas contenedoras para el módulo ${featureName}\n`,
};

// 7. Ejecución de la creación
try {
  // Verificar si el feature ya existe
  if (fs.existsSync(featureDir)) {
    console.error(
      `\x1b[31mError:\x1b[0m El feature "${featureName}" ya existe en src/features/${moduleName}/.`
    );
    process.exit(1);
  }

  console.log(
    `\x1b[34mCreando feature:\x1b[0m ${moduleName}/${featureName}...`
  );

  // Crear módulo y feature
  fs.mkdirSync(featureDir, { recursive: true });

  // Crear subdirectorios
  subdirectories.forEach((subDir) => {
    fs.mkdirSync(path.join(featureDir, subDir), { recursive: true });
  });

  // Crear archivos base
  for (const [filePath, content] of Object.entries(initialFiles)) {
    fs.writeFileSync(
      path.join(featureDir, filePath),
      content,
      "utf8"
    );
  }

  console.log(
    `\x1b[32m¡Éxito!\x1b[0m Feature "${featureName}" creado correctamente en \x1b[2msrc/features/${moduleName}/${featureName}\x1b[0m.`
  );
} catch (error) {
  console.error(
    "\x1b[31mError inesperado al crear el feature:\x1b[0m",
    error
  );
  process.exit(1);
}