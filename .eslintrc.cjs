module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    // https://mui.com/material-ui/guides/minimizing-bundle-size/#option-one-use-path-imports
    "no-restricted-imports": [
      "error",
      { patterns: ["@mui/*/*/*", "!@mui/material/test-utils/*"] },
    ],
  },
};
