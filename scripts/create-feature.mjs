import fs from "fs";
import path from "path";

// 1. Obtener el nombre del feature desde los argumentos de la terminal
const featureName = process.argv[2];

if (!featureName) {
  console.error("\x1b[31mError:\x1b[0m Por favor, especifica el nombre del feature.");
  console.log("\x1b[36mEjemplo:\x1b[0m npm run create:feature products");
  process.exit(1);
}

// Normalizar el nombre (primera letra en minúscula para la carpeta, PascalCase opcional si lo deseas)
const formattedName = featureName.trim().toLowerCase();
const featureDir = path.join(process.cwd(), "src", "features", formattedName);

// 2. Definir las subcarpetas de la arquitectura Feature-First
const subdirectories = ["components", "interfaces", "layouts", "pages", "services", "store"];

// 3. Definir archivos iniciales con contenido base opcional
const initialFiles = {
  "interfaces/index.ts": `// Tipos y contratos TypeScript para el módulo ${formattedName}\n`,
  "services/index.ts": `// Endpoints y llamadas asíncronas para el módulo ${formattedName}\n`,
  "store/index.ts": `// Estado local o global (Zustand, Redux, etc.) para el módulo ${formattedName}\n`,
  "pages/index.ts": `// Páginas contenedoras para el módulo ${formattedName}\n`,
};

// 4. Ejecución de la creación
try {
  if (fs.existsSync(featureDir)) {
    console.error(
      `\x1b[31mError:\x1b[0m El feature "${formattedName}" ya existe en src/features/.`
    );
    process.exit(1);
  }

  console.log(`\x1b[34mCreando feature:\x1b[0m ${formattedName}...`);

  // Crear directorio principal y subdirectorios
  fs.mkdirSync(featureDir, { recursive: true });
  subdirectories.forEach((subDir) => {
    fs.mkdirSync(path.join(featureDir, subDir), { recursive: true });
  });

  // Crear archivos base
  for (const [filePath, content] of Object.entries(initialFiles)) {
    fs.writeFileSync(path.join(featureDir, filePath), content, "utf8");
  }

  console.log(
    `\x1b[32m¡Éxito!\x1b[0m Feature "${formattedName}" creado correctamente en \x1b[2msrc/features/${formattedName}\x1b[0m.`
  );
} catch (error) {
  console.error("\x1b[31mError inesperado al crear el feature:\x1b[0m", error);
  process.exit(1);
}
