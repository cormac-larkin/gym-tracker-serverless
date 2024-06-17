import type { Config } from "jest";

const config: Config = {
  verbose: true,
  rootDir: "src/",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  moduleFileExtensions: ["ts", "js", "json", "node", "test.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["**/*.ts"],
  clearMocks: true,
  coverageDirectory: "coverage",
};

export default config;
