// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.

import * as autoguard from "@joelek/ts-autoguard";
import * as shared from "./index";

export const makeClient = (options?: Partial<{
	urlPrefix: string,
	requestHandler: autoguard.api.RequestHandler
}>): autoguard.api.Client<shared.Autoguard.Requests, shared.Autoguard.Responses> => ({
	"GET:/food/<food_id>/": async (request) => {
		let guard = shared.Autoguard.Requests["GET:/food/<food_id>/"];
		guard.as(request, "CLIENT:request");
		let method = "GET";
		let components = new Array<string>();
		components.push(decodeURIComponent("food"));
		components.push(String(request.options["food_id"]));
		components.push(decodeURIComponent(""));
		let parameters = autoguard.api.extractKeyValuePairs(request.options ?? {}, ["food_id"]);
		let headers = autoguard.api.extractKeyValuePairs(request.headers ?? {});
		let payload = autoguard.api.serializePayload(request.payload);
		let requestHandler = options?.requestHandler ?? autoguard.api.xhr;
		let raw = await requestHandler({ method, components, parameters, headers, payload }, options?.urlPrefix);
		{
			let status = raw.status;
			let headers = autoguard.api.combineKeyValuePairs(raw.headers);
			let payload = await autoguard.api.deserializePayload(raw.payload);
			let guard = shared.Autoguard.Responses["GET:/food/<food_id>/"];
			let response = guard.as({ status, headers, payload }, "CLIENT:response");
			return new autoguard.api.ServerResponse(response);
		}
	},
	"GET:/<filename>": async (request) => {
		let guard = shared.Autoguard.Requests["GET:/<filename>"];
		guard.as(request, "CLIENT:request");
		let method = "GET";
		let components = new Array<string>();
		components.push(String(request.options["filename"]));
		let parameters = autoguard.api.extractKeyValuePairs(request.options ?? {}, ["filename"]);
		let headers = autoguard.api.extractKeyValuePairs(request.headers ?? {});
		let payload = autoguard.api.serializePayload(request.payload);
		let requestHandler = options?.requestHandler ?? autoguard.api.xhr;
		let raw = await requestHandler({ method, components, parameters, headers, payload }, options?.urlPrefix);
		{
			let status = raw.status;
			let headers = autoguard.api.combineKeyValuePairs(raw.headers);
			let payload = raw.payload;
			let guard = shared.Autoguard.Responses["GET:/<filename>"];
			let response = guard.as({ status, headers, payload }, "CLIENT:response");
			return new autoguard.api.ServerResponse(response);
		}
	},
});
