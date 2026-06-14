// Flat ESLint config (ESLint 9) using Expo's shared rules.
const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: ["dist/**", "node_modules/**", ".expo/**", "coverage/**", "web-build/**"],
  },
  {
    rules: {
      // Apostrophes/quotes in <Text> are fine in React Native; this is an HTML rule.
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Jest globals for test files.
    files: ["**/__tests__/**/*.{js,jsx}", "**/*.test.{js,jsx}"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },
];
