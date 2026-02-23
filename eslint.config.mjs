import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: ["android/**", ".next/**", "node_modules/**"] },
  ...nextConfig,
  {
    rules: {
      // react-hooks v7 신규 규칙 — 기존 코드 패턴과 충돌하므로 warn으로 완화
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
