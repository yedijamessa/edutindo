import { createRequire } from "module";

const require = createRequire(import.meta.url);

try {
  require("server-only");
} catch {
  // Next.js resolves "server-only" internally, but plain Node scripts do not.
}
