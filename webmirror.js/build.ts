import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: [
    "main.ts",
  ],
  outfile: "dist/webmirror.esm.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  globalName: "webmirror",
  target: ["chrome131", "firefox133"],
});

esbuild.stop();
