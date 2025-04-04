import Fastify from "fastify";
import { routes } from "./routes";

// Create fastify server
const app = Fastify({
  logger: true,
});

// Register routes
app.register(routes);

// Run the server!
app.listen({ host: "0.0.0.0", port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(app.printRoutes());
});
