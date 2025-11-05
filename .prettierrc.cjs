module.exports = {
  quoteProps: "consistent",
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: ["^react$", "^react/(.*)$", "<THIRD_PARTY_MODULES>", "^[./]"],
};
