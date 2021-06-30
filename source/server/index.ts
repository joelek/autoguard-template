import * as autoguard from "@joelek/ts-autoguard";
import * as libhttp from "http";
import * as libserver from "../shared/api/server";

const port = 8080;

const httpServer = libhttp.createServer({}, libserver.makeServer({
	getFood: async (request) => {
		let options = request.options();
		let food_id = options.food_id;
		if (food_id !== 1337) {
			throw 404;
		}
		return {
			payload: {
				food: {
					food_id: 1337,
					name: "Räksmörgås"
				}
			}
		};
	},
	getStaticContent: async (request) => {
		let options = request.options();
		return autoguard.api.makeReadStreamResponse("./dist/client/", (options.filename ?? []).join("/"), request);
	}
}, { urlPrefix: "" }));

httpServer.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}/ ...`);
});
