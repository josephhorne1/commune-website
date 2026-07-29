import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, "..");
const argumentsList = process.argv.slice(2);

function argumentValue(name, fallback) {
  const index = argumentsList.indexOf(name);
  if (index === -1 || !argumentsList[index + 1]) return fallback;
  return argumentsList[index + 1];
}

const host = argumentValue("--host", "127.0.0.1");
const port = Number(argumentValue("--port", "4173"));

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".txt", "text/plain; charset=utf-8"]
]);

function safePathname(requestUrl) {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  const decoded = decodeURIComponent(url.pathname);
  const normalized = path
    .normalize(decoded)
    .replace(/^([/\\])+/, "");
  const resolved = path.resolve(siteRoot, normalized);

  if (
    resolved !== siteRoot &&
    !resolved.startsWith(`${siteRoot}${path.sep}`)
  ) {
    return null;
  }

  return resolved;
}

async function fileForRequest(requestUrl) {
  let requestedPath = safePathname(requestUrl);
  if (!requestedPath) return null;

  try {
    const information = await stat(requestedPath);
    if (information.isDirectory()) {
      requestedPath = path.join(requestedPath, "index.html");
    }
  } catch {
    return null;
  }

  try {
    const information = await stat(requestedPath);
    return information.isFile() ? requestedPath : null;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  const requestedFile = await fileForRequest(request.url || "/");

  if (!requestedFile) {
    response.writeHead(404, {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store"
    });
    response.end("Not found");
    return;
  }

  try {
    const contents = await readFile(requestedFile);
    const extension = path.extname(requestedFile).toLowerCase();
    response.writeHead(200, {
      "content-type": mimeTypes.get(extension) || "application/octet-stream",
      "cache-control": "no-store"
    });

    if (request.method === "HEAD") {
      response.end();
    } else {
      response.end(contents);
    }
  } catch {
    response.writeHead(500, {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store"
    });
    response.end("Server error");
  }
});

server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`direction.design preview: http://${host}:${port}`);
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
