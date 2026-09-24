/**
 * Compiles LaTeX to PDF entirely in the browser, using pdftex.js (an
 * Emscripten build of pdftex running in a Web Worker) served from jsdelivr's
 * npm CDN. No server involved, no dependency added to this repo: the ~2.8MB
 * worker script and ~48MB texlive data are fetched lazily, once, only when a
 * visitor actually views a LaTeX result's PDF preview.
 *
 * pdftex.js's own wrapper creates its Worker with a same-origin-relative URL,
 * which won't resolve to the CDN, so we talk to the worker script directly:
 * fetch it as text, prepend a `Module.locateFile` hook that points its
 * asset loads (the .data/.mem files) back at the CDN, then run it from a
 * blob: URL. This mirrors the worker's own message protocol (see the
 * package's src/pdftex-worker-pre.js) rather than reimplementing it.
 */

const CDN_BASE = "https://cdn.jsdelivr.net/npm/pdftex.js@0.0.10/";

interface CompileResult {
  success: boolean;
  pdfUrl?: string;
  log: string;
  message?: string;
}

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const response = await fetch(`${CDN_BASE}pdftex-worker.js`);
      if (!response.ok) throw new Error("Could not load the PDF engine.");
      const workerSource = await response.text();
      const preamble = `var Module = { locateFile: function (path) { return ${JSON.stringify(CDN_BASE)} + path; }, memoryInitializerPrefixURL: ${JSON.stringify(CDN_BASE)} };\n`;
      const blob = new Blob([preamble, workerSource], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));

      await new Promise<void>((resolve, reject) => {
        function onMessage(event: MessageEvent) {
          if (event.data?.type === "ready") {
            worker.removeEventListener("message", onMessage);
            resolve();
          }
        }
        function onError(event: ErrorEvent) {
          worker.removeEventListener("error", onError);
          reject(new Error(event.message || "The PDF engine failed to load."));
        }
        worker.addEventListener("message", onMessage);
        worker.addEventListener("error", onError);
      });

      return worker;
    })().catch((err) => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

/** Runs one LaTeX source through pdftex. Rejects only on infrastructure
    failure (engine wouldn't load); a LaTeX compile error is a normal
    `{ success: false }` result with the engine's log attached. */
export async function compileLatexToPdf(source: string): Promise<CompileResult> {
  const worker = await getWorker();

  return new Promise<CompileResult>((resolve) => {
    function onMessage(event: MessageEvent) {
      if (event.data?.type !== "finish") return;
      worker.removeEventListener("message", onMessage);
      const value = event.data.value as { success: boolean; url: string | null; log: string; message?: string };
      resolve({
        success: value.success,
        pdfUrl: value.url ?? undefined,
        log: value.log ?? "",
        message: value.message,
      });
    }
    worker.addEventListener("message", onMessage);
    worker.postMessage({ type: "start", source, options: { enableUrls: false } });
  });
}
