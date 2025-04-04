// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  dependencyTypes: ["dev", "peer", "prod"],
  semverGroups: [
    {
      range: "^",
      dependencies: ["**"],
      packages: ["**"],
    },
  ],
};

module.exports = config;
