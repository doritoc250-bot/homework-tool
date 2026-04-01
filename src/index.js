import { join } from "node:path";
import { hostname } from "node:os";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import wisp from "wisp-server-node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const uvPath = join(__dirname, '../uv/');

const app = express();
app.use(express.static("./public"));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));
app.use((req, res) => {
	res.status(404);
	res.sendFile("./public/404.html");
});

const server = createServer();
server.on("request", (req, res) => {
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
	res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
	app(req, res);
});
server.on("upgrade", (req, socket, head) => {
	if (req.url.endsWith("/wisp/")) {
		wisp.routeRequest(req, socket, head);
		return;
	}
	socket.end();
});

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

server.on("listening", () => {
	const address = server.address();
	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(`\thttp://${address.family === "IPv6" ? `[${address.address}]` : address.address}:${address.port}`);

	// Keepalive ping every 4 minutes
	setInterval(async () => {
		try { await fetch(`http://localhost:${address.port}`); } catch(e) {}
	}, 4 * 60 * 1000);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
function shutdown() {
	console.log("SIGTERM signal received: closing HTTP server");
	server.close();
	process.exit(0);
}

server.listen({ port });
