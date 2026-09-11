import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  ...next,
  ...ts,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores(["out/**", ".next/**", "next-env.d.ts"]),
]);
