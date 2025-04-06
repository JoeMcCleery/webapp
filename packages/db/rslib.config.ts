import { defineConfig } from "@rslib/core"

export default defineConfig({
  lib: [
    {
      format: "esm",
      dts: {
        bundle: true,
      },
    },
  ],
  output: {
    copy: [
      {
        from: "*query_engine*",
        context: "./src/generated/client",
        to: "../",
      },
    ],
  },
})
