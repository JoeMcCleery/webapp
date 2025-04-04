import { rpc } from "./rpc";
import type { FastifyPluginCallback } from "fastify";

export const routes: FastifyPluginCallback = function (app) {
  app.register(rpc, { prefix: "/rpc" });
};
