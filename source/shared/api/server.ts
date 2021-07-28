// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.

import * as autoguard from "@joelek/ts-autoguard/dist/lib-server";
import * as shared from "./index";

export const makeServer = (routes: autoguard.api.Server<shared.Autoguard.Requests, shared.Autoguard.Responses>, serverOptions?: autoguard.api.MakeServerOptions): autoguard.api.RequestListener => {
	let endpoints = new Array<autoguard.api.Endpoint>();
	endpoints.push((raw, auxillary) => {
		let method = "GET";
		let matchers = new Array<autoguard.api.RouteMatcher>();
		matchers.push(new autoguard.api.StaticRouteMatcher(decodeURIComponent("food")));
		matchers.push(new autoguard.api.DynamicRouteMatcher(1, 1, false, autoguard.guards.Number));
		matchers.push(new autoguard.api.StaticRouteMatcher(decodeURIComponent("")));
		return {
			acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),
			acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
			validateRequest: async () => {
				let options: Record<string, autoguard.api.JSON> = {};
				options["food_id"] = matchers[1].getValue();
				options = { ...options, ...autoguard.api.decodeUndeclaredParameters(raw.parameters ?? {}, Object.keys(options)) };
				let headers: Record<string, autoguard.api.JSON> = {};
				headers = { ...headers, ...autoguard.api.decodeUndeclaredHeaders(raw.headers ?? {}, Object.keys(headers)) };
				let payload = raw.payload;
				let guard = shared.Autoguard.Requests["getFood"];
				let request = guard.as({ options, headers, payload }, "request");
				return {
					handleRequest: async () => {
						let response = await routes["getFood"](new autoguard.api.ClientRequest(request, true, auxillary));
						return {
							validateResponse: async () => {
								let guard = shared.Autoguard.Responses["getFood"];
								guard.as(response, "response");
								let status = response.status ?? 200;
								let headers = new Array<[string, string]>();
								headers.push(...autoguard.api.encodeUndeclaredHeaderPairs(response.headers ?? {}, headers.map((header) => header[0])));
								let payload = autoguard.api.serializePayload(response.payload);
								let defaultHeaders = serverOptions?.defaultHeaders?.slice() ?? [];
								defaultHeaders.push(["Content-Type", "application/json; charset=utf-8"]);
								return autoguard.api.finalizeResponse({ status, headers, payload }, defaultHeaders);
							}
						};
					}
				};
			}
		};
	});
	endpoints.push((raw, auxillary) => {
		let method = "GET";
		let matchers = new Array<autoguard.api.RouteMatcher>();
		matchers.push(new autoguard.api.DynamicRouteMatcher(0, Infinity, true, autoguard.guards.String));
		return {
			acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),
			acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
			validateRequest: async () => {
				let options: Record<string, autoguard.api.JSON> = {};
				options["filename"] = matchers[0].getValue();
				options = { ...options, ...autoguard.api.decodeUndeclaredParameters(raw.parameters ?? {}, Object.keys(options)) };
				let headers: Record<string, autoguard.api.JSON> = {};
				headers = { ...headers, ...autoguard.api.decodeUndeclaredHeaders(raw.headers ?? {}, Object.keys(headers)) };
				let payload = raw.payload;
				let guard = shared.Autoguard.Requests["getStaticContent"];
				let request = guard.as({ options, headers, payload }, "request");
				return {
					handleRequest: async () => {
						let response = await routes["getStaticContent"](new autoguard.api.ClientRequest(request, true, auxillary));
						return {
							validateResponse: async () => {
								let guard = shared.Autoguard.Responses["getStaticContent"];
								guard.as(response, "response");
								let status = response.status ?? 200;
								let headers = new Array<[string, string]>();
								headers.push(...autoguard.api.encodeUndeclaredHeaderPairs(response.headers ?? {}, headers.map((header) => header[0])));
								let payload = response.payload ?? [];
								let defaultHeaders = serverOptions?.defaultHeaders?.slice() ?? [];
								defaultHeaders.push(["Content-Type", "application/octet-stream"]);
								return autoguard.api.finalizeResponse({ status, headers, payload }, defaultHeaders);
							}
						};
					}
				};
			}
		};
	});
	return (request, response) => autoguard.api.route(endpoints, request, response, serverOptions);
};
