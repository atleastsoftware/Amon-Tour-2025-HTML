/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "fr", "es"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/client/src/locales/{locale}/messages",
      include: ["client/src"],
      exclude: ["**/node_modules/**"],
    },
  ],
  format: "minimal",
  compileNamespace: "es",
}