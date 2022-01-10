module.exports = {
  globDirectory: "public/",
  globPatterns: [
    "**/*.{html,ico,json,css,map}",
    "src/images/*.{jpg,png}",
    "src/js/*.min.js",
  ],
  swDest: "public/service-worker.js",
  swSrc: "public/sw-base.js",
  globIgnores: ["../workbox-cli-config.js", "help/**", "404.html"],
}
