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
  dependencyTypes: ["dev", "peer", "prod", "engines", "packageManager"],
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
  ],
  semverGroups: [
    {
      dependencyTypes: ["dev", "peer", "prod"],
      range: "^",
    },
  ],
}

module.exports = config
