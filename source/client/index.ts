import * as libclient from "../shared/api/client";

const client = libclient.makeClient({ urlPrefix: "" });

client.getFood({
	options: {
		food_id: 1337
	}
}).then(async (response) => {
	let payload = await response.payload();
	document.write(`<pre>${JSON.stringify(payload, null, "\t")}</pre>`);
});
