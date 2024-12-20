// This file was auto-generated by @joelek/autoguard. Edit at own risk.

import * as autoguard from "@joelek/autoguard/dist/lib-client";
import * as shared from "./index";

export type Client = autoguard.api.Client<shared.Autoguard.Requests, shared.Autoguard.Responses>;

export const makeClient = (clientOptions?: autoguard.api.ClientOptions): Client => ({
	"getFood": async (request, requestOptions) => {
		let guard = autoguard.api.wrapMessageGuard(shared.Autoguard.Requests["getFood"], clientOptions?.debugMode);
		guard.as(request, "request");
		let method = "GET";
		let components = new Array<string>();
		components.push("food");
		components.push(...autoguard.api.encodeComponents([request.options?.["food_id"]], false));
		components.push("");
		let parameters = new Array<[string, string]>();
		parameters.push(...autoguard.api.encodeUndeclaredParameterPairs(request.options ?? {}, [...["food_id"], ...parameters.map((parameter) => parameter[0])]));
		let headers = new Array<[string, string]>();
		headers.push(...autoguard.api.encodeUndeclaredHeaderPairs(request.headers ?? {}, headers.map((header) => header[0])));
		let payload = request.payload ?? [];
		let requestHandler = clientOptions?.requestHandler ?? autoguard.api.xhr;
		let defaultHeaders = clientOptions?.defaultHeaders?.slice() ?? [];
		defaultHeaders.push(["Content-Type", "application/octet-stream"]);
		defaultHeaders.push(["Accept", "application/json; charset=utf-8"]);
		let raw = await requestHandler(autoguard.api.finalizeRequest({ method, components, parameters, headers, payload }, defaultHeaders), clientOptions, requestOptions);
		{
			let status = raw.status;
			let headers: Record<string, autoguard.api.JSON> = {};
			headers = { ...headers, ...autoguard.api.decodeUndeclaredHeaders(raw.headers, Object.keys(headers)) };
			let payload = await autoguard.api.deserializePayload(raw.payload);
			let guard = autoguard.api.wrapMessageGuard(shared.Autoguard.Responses["getFood"], clientOptions?.debugMode);
			let response = guard.as({ status, headers, payload }, "response");
			return new autoguard.api.ServerResponse(response, false);
		}
	},
	"getStaticContent": async (request, requestOptions) => {
		let guard = autoguard.api.wrapMessageGuard(shared.Autoguard.Requests["getStaticContent"], clientOptions?.debugMode);
		guard.as(request, "request");
		let method = "GET";
		let components = new Array<string>();
		components.push(...autoguard.api.encodeComponents(request.options?.["filename"] ?? [], true));
		let parameters = new Array<[string, string]>();
		parameters.push(...autoguard.api.encodeUndeclaredParameterPairs(request.options ?? {}, [...["filename"], ...parameters.map((parameter) => parameter[0])]));
		let headers = new Array<[string, string]>();
		headers.push(...autoguard.api.encodeUndeclaredHeaderPairs(request.headers ?? {}, headers.map((header) => header[0])));
		let payload = request.payload ?? [];
		let requestHandler = clientOptions?.requestHandler ?? autoguard.api.xhr;
		let defaultHeaders = clientOptions?.defaultHeaders?.slice() ?? [];
		defaultHeaders.push(["Content-Type", "application/octet-stream"]);
		defaultHeaders.push(["Accept", "application/octet-stream"]);
		let raw = await requestHandler(autoguard.api.finalizeRequest({ method, components, parameters, headers, payload }, defaultHeaders), clientOptions, requestOptions);
		{
			let status = raw.status;
			let headers: Record<string, autoguard.api.JSON> = {};
			headers = { ...headers, ...autoguard.api.decodeUndeclaredHeaders(raw.headers, Object.keys(headers)) };
			let payload = raw.payload;
			let guard = autoguard.api.wrapMessageGuard(shared.Autoguard.Responses["getStaticContent"], clientOptions?.debugMode);
			let response = guard.as({ status, headers, payload }, "response");
			return new autoguard.api.ServerResponse(response, true);
		}
	},
});
