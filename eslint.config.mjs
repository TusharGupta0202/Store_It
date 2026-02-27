import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier"

export default defineConfig([
  // Next.js core rules
  ...nextVitals,

  // TypeScript rules
  ...nextTs,

  // Disable rules that conflict with Prettier
  prettier,

  // Ignore build folders
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**"
  ]),
])