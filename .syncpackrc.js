// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  customTypes: {
    engines: {
      path: "engines",
      strategy: "versionsByName",
    },
    packageManager: {
      path: "packageManager",
      strategy: "name@version",
    },
  },
  // dependencyTypes: ["dev", "peer", "prod", "engines", "packageManager"],
  versionGroups: [
    {
      label: "Use root package manager version",
      dependencyTypes: ["packageManager"],
      snapTo: ["webapp"],
    },
    {
      label: "Use root engine versions",
      dependencyTypes: ["engines"],
      snapTo: ["webapp"],
    },
    {
      label: "Use prisma version supported by zenstack",
      dependencies: ["prisma", "@prisma/**"],
      pinVersion: "~6.7.0",
    },
  ],
  semverGroups: [
    {
      dependencyTypes: ["dev", "peer", "prod"],
      range: "^",
    },
  ],
}

module.exports = config
