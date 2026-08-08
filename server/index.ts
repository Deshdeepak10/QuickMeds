import { createServer } from "http";
import path from "path";
import { app } from "./app";

const server = createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
