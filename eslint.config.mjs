import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import nextSecurity from "eslint-plugin-nextjs-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "nextjs-security": nextSecurity,
    },
    rules: {
      "nextjs-security/no-public-env-secrets": "error",
      "nextjs-security/no-dangerous-inner-html": "error",
      "nextjs-security/no-unprotected-api-routes": "error",
      "nextjs-security/no-server-action-missing-auth": [
        "error",
        {
          authFunctions: ["getGithubToken"],
        },
      ],
      "nextjs-security/no-hardcoded-secrets": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
