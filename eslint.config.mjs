import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".claude/**",
      ".ignore/**",
      ".next/**",
      "integrate/**",
      "node_modules/**",
      "package-lock.json",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default config;
