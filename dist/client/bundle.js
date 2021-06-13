define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/serialization", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageSerializer = exports.MessageGuardError = void 0;
    class MessageGuardError {
        constructor(guard, subject, path) {
            this.guard = guard;
            this.subject = subject;
            this.path = path;
        }
        getSubjectType() {
            if (this.subject === null) {
                return "null";
            }
            if (this.subject instanceof Array) {
                return "array";
            }
            return typeof this.subject;
        }
        toString() {
            return `The type ${this.getSubjectType()} at ${this.path} is type-incompatible with the expected type: ${this.guard.ts()}`;
        }
    }
    exports.MessageGuardError = MessageGuardError;
    ;
    class MessageSerializer {
        constructor(guards) {
            this.guards = guards;
        }
        deserialize(string, cb) {
            let json = JSON.parse(string);
            if ((json != null) && (json.constructor === Object)) {
                if ((json.type != null) && (json.type.constructor === String)) {
                    let type = json.type;
                    let data = json.data;
                    let guard = this.guards[type];
                    if (guard === undefined) {
                        throw "Unknown message type \"" + type + "\"!";
                    }
                    cb(type, guard.as(data));
                    return;
                }
            }
            throw "Invalid message envelope!";
        }
        serialize(type, data) {
            return JSON.stringify({
                type,
                data
            });
        }
    }
    exports.MessageSerializer = MessageSerializer;
    ;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/guards", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/serialization"], function (require, exports, serialization) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Union = exports.Undefined = exports.Tuple = exports.StringLiteral = exports.String = exports.Reference = exports.Record = exports.Object = exports.NumberLiteral = exports.Number = exports.Null = exports.Intersection = exports.BooleanLiteral = exports.Boolean = exports.Array = exports.Any = void 0;
    exports.Any = {
        as(subject, path = "") {
            return subject;
        },
        is(subject) {
            try {
                this.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        },
        ts(eol = "\n") {
            return `any`;
        }
    };
    exports.Array = {
        of(guard) {
            return {
                as(subject, path = "") {
                    if ((subject != null) && (subject.constructor === globalThis.Array)) {
                        for (let i = 0; i < subject.length; i++) {
                            guard.as(subject[i], path + "[" + i + "]");
                        }
                        return subject;
                    }
                    throw new serialization.MessageGuardError(this, subject, path);
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    return `${guard.ts(eol)}[]`;
                }
            };
        }
    };
    exports.Boolean = {
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        },
        is(subject) {
            try {
                this.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        },
        ts(eol = "\n") {
            return `boolean`;
        }
    };
    exports.BooleanLiteral = {
        of(value) {
            return {
                as(subject, path = "") {
                    if (subject === value) {
                        return subject;
                    }
                    throw new serialization.MessageGuardError(this, subject, path);
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    return `${value}`;
                }
            };
        }
    };
    exports.Intersection = {
        of(...guards) {
            return {
                as(subject, path = "") {
                    for (let guard of guards) {
                        guard.as(subject, path);
                    }
                    return subject;
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    let lines = new globalThis.Array();
                    for (let guard of guards) {
                        lines.push(guard.ts(eol));
                    }
                    let string = lines.join(" & ");
                    return string;
                }
            };
        }
    };
    exports.Null = {
        as(subject, path = "") {
            if (subject === null) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        },
        is(subject) {
            try {
                this.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        },
        ts(eol = "\n") {
            return `null`;
        }
    };
    exports.Number = {
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Number)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        },
        is(subject) {
            try {
                this.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        },
        ts(eol = "\n") {
            return `number`;
        }
    };
    exports.NumberLiteral = {
        of(value) {
            return {
                as(subject, path = "") {
                    if (subject === value) {
                        return subject;
                    }
                    throw new serialization.MessageGuardError(this, subject, path);
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    return `${value}`;
                }
            };
        }
    };
    exports.Object = {
        of(guards) {
            return {
                as(subject, path = "") {
                    if ((subject != null) && (subject.constructor === globalThis.Object)) {
                        for (let key in guards) {
                            guards[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
                        }
                        return subject;
                    }
                    throw new serialization.MessageGuardError(this, subject, path);
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    let lines = new globalThis.Array();
                    for (let [key, value] of globalThis.Object.entries(guards)) {
                        lines.push(`\t"${key}": ${value.ts(eol + "\t")}`);
                    }
                    return lines.length > 0 ? "{" + eol + lines.join("," + eol) + eol + "}" : "{}";
                }
            };
        }
    };
    exports.Record = {
        of(guard) {
            return {
                as(subject, path = "") {
                    if ((subject != null) && (subject.constructor === globalThis.Object)) {
                        let wrapped = exports.Union.of(exports.Undefined, guard);
                        for (let key of globalThis.Object.keys(subject)) {
                            wrapped.as(subject[key], path + "[\"" + key + "\"]");
                        }
                        return subject;
                    }
                    throw new serialization.MessageGuardError(this, subject, path);
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    return `{ [key]: ${guard.ts(eol)} }`;
                }
            };
        }
    };
    exports.Reference = {
        of(guard) {
            return {
                as(subject, path = "") {
                    return guard().as(subject, path);
                },
                is(subject) {
                    return guard().is(subject);
                },
                ts(eol = "\n") {
                    return guard().ts(eol);
                }
            };
        }
    };
    exports.String = {
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.String)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        },
        is(subject) {
            try {
                this.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        },
        ts(eol = "\n") {
            return "string";
        }
    };
    exports.StringLiteral = {
        of(value) {
            return {
                as(subject, path = "") {
                    if (subject === value) {
                        return subject;
                    }
                    throw new serialization.MessageGuardError(this, subject, path);
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    return `"${value}"`;
                }
            };
        }
    };
    exports.Tuple = {
        of(...guards) {
            return {
                as(subject, path = "") {
                    if ((subject != null) && (subject.constructor === globalThis.Array)) {
                        for (let i = 0; i < guards.length; i++) {
                            guards[i].as(subject[i], path + "[" + i + "]");
                        }
                        return subject;
                    }
                    throw new serialization.MessageGuardError(this, subject, path);
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    let lines = new globalThis.Array();
                    for (let guard of guards) {
                        lines.push(`\t${guard.ts(eol + "\t")}`);
                    }
                    return lines.length > 0 ? "[" + eol + lines.join("," + eol) + eol + "]" : "[]";
                }
            };
        }
    };
    exports.Undefined = {
        as(subject, path = "") {
            if (subject === undefined) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        },
        is(subject) {
            try {
                this.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        },
        ts(eol = "\n") {
            return "undefined";
        }
    };
    exports.Union = {
        of(...guards) {
            return {
                as(subject, path = "") {
                    for (let guard of guards) {
                        try {
                            return guard.as(subject, path);
                        }
                        catch (error) { }
                    }
                    throw new serialization.MessageGuardError(this, subject, path);
                },
                is(subject) {
                    try {
                        this.as(subject);
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
                ts(eol = "\n") {
                    let lines = new globalThis.Array();
                    for (let guard of guards) {
                        lines.push(guard.ts(eol));
                    }
                    let string = lines.join(" | ");
                    return string;
                }
            };
        }
    };
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/api", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/guards"], function (require, exports, guards) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __asyncValues = (this && this.__asyncValues) || function (o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeReadStreamResponse = exports.getContentTypeFromExtension = exports.parseRangeHeader = exports.route = exports.combineRawHeaders = exports.respond = exports.makeNodeRequestHandler = exports.xhr = exports.acceptsMethod = exports.acceptsComponents = exports.finalizeResponse = exports.deserializePayload = exports.deserializeStringPayload = exports.serializePayload = exports.serializeStringPayload = exports.collectPayload = exports.EndpointError = exports.ServerResponse = exports.ClientRequest = exports.isPayloadBinary = exports.getHeaders = exports.getParameters = exports.getComponents = exports.deserializeValue = exports.serializeValue = exports.getValue = exports.serializeParameters = exports.combineKeyValuePairs = exports.extractKeyValuePairs = exports.appendKeyValuePair = exports.serializeComponents = exports.Headers = exports.Options = exports.JSON = exports.Primitive = exports.Binary = exports.SyncBinary = exports.AsyncBinary = void 0;
    exports.AsyncBinary = {
        as(subject, path = "") {
            if (subject != null) {
                let member = subject[Symbol.asyncIterator];
                if (member != null && member.constructor === globalThis.Function) {
                    return subject;
                }
            }
            throw "Expected AsyncBinary at " + path + "!";
        },
        is(subject) {
            try {
                this.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        },
        ts(eol = "\n") {
            return `AsyncBinary`;
        }
    };
    exports.SyncBinary = {
        as(subject, path = "") {
            if (subject != null) {
                let member = subject[Symbol.iterator];
                if (member != null && member.constructor === globalThis.Function) {
                    return subject;
                }
            }
            throw "Expected SyncBinary at " + path + "!";
        },
        is(subject) {
            try {
                this.as(subject);
            }
            catch (error) {
                return false;
            }
            return true;
        },
        ts(eol = "\n") {
            return `SyncBinary`;
        }
    };
    exports.Binary = guards.Union.of(exports.AsyncBinary, exports.SyncBinary);
    exports.Primitive = guards.Union.of(guards.Boolean, guards.Number, guards.String, guards.Undefined);
    exports.JSON = guards.Union.of(guards.Boolean, guards.Null, guards.Number, guards.String, guards.Array.of(guards.Reference.of(() => exports.JSON)), guards.Record.of(guards.Reference.of(() => exports.JSON)), guards.Undefined);
    exports.Options = guards.Record.of(exports.JSON);
    exports.Headers = guards.Record.of(exports.JSON);
    function serializeComponents(components) {
        return "/" + components
            .map((component) => {
            return encodeURIComponent(component);
        })
            .join("/");
    }
    exports.serializeComponents = serializeComponents;
    ;
    function appendKeyValuePair(pairs, key, value, plain) {
        let serialized = serializeValue(value, plain);
        if (serialized !== undefined) {
            pairs.push([key, serialized]);
        }
    }
    exports.appendKeyValuePair = appendKeyValuePair;
    ;
    function extractKeyValuePairs(record, exclude) {
        let pairs = new Array();
        for (let [key, value] of Object.entries(record)) {
            if (!exclude.includes(key) && value !== undefined) {
                if (guards.String.is(value)) {
                    pairs.push([key, value]);
                }
                else {
                    throw `Expected value of undeclared "${key}" to be a string!`;
                }
            }
        }
        return pairs;
    }
    exports.extractKeyValuePairs = extractKeyValuePairs;
    ;
    function combineKeyValuePairs(pairs) {
        let record = {};
        for (let pair of pairs) {
            record[pair[0]] = pair[1];
        }
        return record;
    }
    exports.combineKeyValuePairs = combineKeyValuePairs;
    ;
    function serializeParameters(parameters) {
        let parts = parameters.map((parameters) => {
            let key = encodeURIComponent(parameters[0]);
            let value = encodeURIComponent(parameters[1]);
            return `${key}=${value}`;
        });
        if (parts.length === 0) {
            return "";
        }
        return `?${parts.join("&")}`;
    }
    exports.serializeParameters = serializeParameters;
    ;
    function getValue(pairs, key, plain) {
        for (let pair of pairs) {
            if (pair[0] === key) {
                try {
                    let value = pair[1];
                    return deserializeValue(value, plain);
                }
                catch (error) { }
            }
        }
    }
    exports.getValue = getValue;
    ;
    function serializeValue(value, plain) {
        if (value === undefined) {
            return;
        }
        return plain ? String(value) : globalThis.JSON.stringify(value);
    }
    exports.serializeValue = serializeValue;
    ;
    function deserializeValue(value, plain) {
        if (value === undefined) {
            return;
        }
        return plain ? value : globalThis.JSON.parse(value);
    }
    exports.deserializeValue = deserializeValue;
    ;
    function getComponents(url) {
        return url.split("?")[0].split("/").map((part) => {
            return decodeURIComponent(part);
        }).slice(1);
    }
    exports.getComponents = getComponents;
    ;
    function getParameters(url) {
        let query = url.split("?").slice(1).join("?");
        return query === "" ? [] : query.split("&").map((part) => {
            let parts = part.split("=");
            if (parts.length === 1) {
                let key = decodeURIComponent(parts[0]);
                let value = "";
                return [key, value];
            }
            else {
                let key = decodeURIComponent(parts[0]);
                let value = decodeURIComponent(parts.slice(1).join("="));
                return [key, value];
            }
        });
    }
    exports.getParameters = getParameters;
    ;
    function getHeaders(headers) {
        return headers.map((part) => {
            let parts = part.split(":");
            if (parts.length === 1) {
                let key = parts[0].toLowerCase();
                let value = "";
                return [key, value];
            }
            else {
                let key = parts[0].toLowerCase();
                let value = parts.slice(1).join(":").trim();
                return [key, value];
            }
        });
    }
    exports.getHeaders = getHeaders;
    ;
    function isPayloadBinary(payload) {
        return typeof payload !== "string" && exports.Binary.is(payload);
    }
    exports.isPayloadBinary = isPayloadBinary;
    ;
    class ClientRequest {
        constructor(request, auxillary) {
            this.request = request;
            this.auxillary = auxillary;
        }
        options() {
            let options = this.request.options;
            return Object.assign({}, options);
        }
        headers() {
            let headers = this.request.headers;
            return Object.assign({}, headers);
        }
        payload() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.collectedPayload !== undefined) {
                    return this.collectedPayload;
                }
                let payload = this.request.payload;
                let collectedPayload = (isPayloadBinary(payload) ? yield collectPayload(payload) : payload);
                this.collectedPayload = collectedPayload;
                return collectedPayload;
            });
        }
        socket() {
            return this.auxillary.socket;
        }
    }
    exports.ClientRequest = ClientRequest;
    ;
    class ServerResponse {
        constructor(response) {
            this.response = response;
        }
        status() {
            let status = this.response.status;
            return status !== null && status !== void 0 ? status : 200;
        }
        headers() {
            let headers = this.response.headers;
            return Object.assign({}, headers);
        }
        payload() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.collectedPayload !== undefined) {
                    return this.collectedPayload;
                }
                let payload = this.response.payload;
                let collectedPayload = (isPayloadBinary(payload) ? yield collectPayload(payload) : payload);
                this.collectedPayload = collectedPayload;
                return collectedPayload;
            });
        }
    }
    exports.ServerResponse = ServerResponse;
    ;
    class EndpointError {
        constructor(response) {
            this.response = response;
        }
        getResponse() {
            var _a, _b, _c;
            let status = (_a = this.response.status) !== null && _a !== void 0 ? _a : 500;
            let headers = (_b = this.response.headers) !== null && _b !== void 0 ? _b : [];
            let payload = (_c = this.response.payload) !== null && _c !== void 0 ? _c : [];
            return {
                status,
                headers,
                payload
            };
        }
    }
    exports.EndpointError = EndpointError;
    ;
    function collectPayload(binary) {
        var binary_1, binary_1_1;
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let chunks = new Array();
            let length = 0;
            try {
                for (binary_1 = __asyncValues(binary); binary_1_1 = yield binary_1.next(), !binary_1_1.done;) {
                    let chunk = binary_1_1.value;
                    chunks.push(chunk);
                    length += chunk.length;
                }
            }
            catch (e_1_1) {
                e_1 = { error: e_1_1 };
            }
            finally {
                try {
                    if (binary_1_1 && !binary_1_1.done && (_a = binary_1.return))
                        yield _a.call(binary_1);
                }
                finally {
                    if (e_1)
                        throw e_1.error;
                }
            }
            let payload = new Uint8Array(length);
            let offset = 0;
            for (let chunk of chunks) {
                payload.set(chunk, offset);
                offset += chunk.length;
            }
            return payload;
        });
    }
    exports.collectPayload = collectPayload;
    ;
    function serializeStringPayload(string) {
        let encoder = new TextEncoder();
        let array = encoder.encode(string);
        return [array];
    }
    exports.serializeStringPayload = serializeStringPayload;
    ;
    function serializePayload(payload) {
        if (payload === undefined) {
            return [];
        }
        let string = globalThis.JSON.stringify(payload);
        return serializeStringPayload(string);
    }
    exports.serializePayload = serializePayload;
    ;
    function deserializeStringPayload(binary) {
        return __awaiter(this, void 0, void 0, function* () {
            let buffer = yield collectPayload(binary);
            let decoder = new TextDecoder();
            let string = decoder.decode(buffer);
            return string;
        });
    }
    exports.deserializeStringPayload = deserializeStringPayload;
    ;
    function deserializePayload(binary) {
        return __awaiter(this, void 0, void 0, function* () {
            let string = yield deserializeStringPayload(binary);
            return string === "" ? undefined : globalThis.JSON.parse(string);
        });
    }
    exports.deserializePayload = deserializePayload;
    ;
    function finalizeResponse(raw, defaultContentType) {
        let headers = raw.headers;
        let contentType = headers.find((header) => {
            return header[0].toLowerCase() === "content-type";
        });
        if (contentType === undefined) {
            headers = [
                ...headers,
                ["Content-Type", defaultContentType]
            ];
        }
        return Object.assign(Object.assign({}, raw), { headers });
    }
    exports.finalizeResponse = finalizeResponse;
    ;
    function acceptsComponents(one, two) {
        if (one.length !== two.length) {
            return false;
        }
        let length = one.length;
        for (let i = 0; i < length; i++) {
            if (two[i][0] === "") {
                if (one[i] !== two[i][1]) {
                    return false;
                }
            }
        }
        return true;
    }
    exports.acceptsComponents = acceptsComponents;
    ;
    function acceptsMethod(one, two) {
        return one === two;
    }
    exports.acceptsMethod = acceptsMethod;
    ;
    function xhr(raw, urlPrefix) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let xhr = new XMLHttpRequest();
            xhr.onerror = reject;
            xhr.onabort = reject;
            xhr.onload = () => {
                let status = xhr.status;
                let headers = getHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
                let payload = [new Uint8Array(xhr.response)];
                resolve({
                    status,
                    headers,
                    payload
                });
            };
            let url = urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "";
            url += serializeComponents(raw.components);
            url += serializeParameters(raw.parameters);
            xhr.open(raw.method, url, true);
            xhr.responseType = "arraybuffer";
            for (let header of raw.headers) {
                xhr.setRequestHeader(header[0], header[1]);
            }
            xhr.send(yield collectPayload(raw.payload));
        }));
    }
    exports.xhr = xhr;
    ;
    function makeNodeRequestHandler(options) {
        return (raw, urlPrefix) => {
            let libhttp = require("http");
            let libhttps = require("https");
            let lib = (urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "").startsWith("https:") ? libhttps : libhttp;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let headers = {};
                for (let header of raw.headers) {
                    headers[header[0]] = header[1];
                }
                let url = urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "";
                url += serializeComponents(raw.components);
                url += serializeParameters(raw.parameters);
                let request = lib.request(url, Object.assign(Object.assign({}, options), { method: raw.method, headers: headers }), (response) => {
                    var _a;
                    let status = (_a = response.statusCode) !== null && _a !== void 0 ? _a : 200;
                    let headers = getHeaders(combineRawHeaders(response.rawHeaders));
                    let payload = {
                        [Symbol.asyncIterator]: () => response[Symbol.asyncIterator]()
                    };
                    resolve({ status, headers, payload });
                });
                request.on("abort", reject);
                request.on("error", reject);
                request.write(yield collectPayload(raw.payload));
                request.end();
            }));
        };
    }
    exports.makeNodeRequestHandler = makeNodeRequestHandler;
    ;
    function respond(httpResponse, raw) {
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (let header of raw.headers) {
                httpResponse.setHeader(header[0], header[1]);
            }
            httpResponse.writeHead(raw.status);
            try {
                for (var _b = __asyncValues(raw.payload), _c; _c = yield _b.next(), !_c.done;) {
                    let chunk = _c.value;
                    if (!httpResponse.write(chunk)) {
                        yield new Promise((resolve, reject) => {
                            httpResponse.once("drain", resolve);
                        });
                    }
                }
            }
            catch (e_2_1) {
                e_2 = { error: e_2_1 };
            }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return))
                        yield _a.call(_b);
                }
                finally {
                    if (e_2)
                        throw e_2.error;
                }
            }
            httpResponse.end();
            yield new Promise((resolve, reject) => {
                httpResponse.once("finish", resolve);
            });
        });
    }
    exports.respond = respond;
    ;
    function combineRawHeaders(raw) {
        let headers = new Array();
        for (let i = 0; i < raw.length; i += 2) {
            headers.push(`${raw[i + 0]}: ${raw[i + 1]}`);
        }
        return headers;
    }
    exports.combineRawHeaders = combineRawHeaders;
    ;
    function route(endpoints, httpRequest, httpResponse, urlPrefix = "") {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let method = (_a = httpRequest.method) !== null && _a !== void 0 ? _a : "GET";
            let url = (_b = httpRequest.url) !== null && _b !== void 0 ? _b : "";
            if (!url.startsWith(urlPrefix)) {
                throw `Expected url "${url}" to have prefix "${urlPrefix}"!`;
            }
            url = url.slice(urlPrefix === null || urlPrefix === void 0 ? void 0 : urlPrefix.length);
            let components = getComponents(url);
            let parameters = getParameters(url);
            let headers = getHeaders(combineRawHeaders(httpRequest.rawHeaders));
            let payload = {
                [Symbol.asyncIterator]: () => httpRequest[Symbol.asyncIterator]()
            };
            let socket = httpRequest.socket;
            let raw = {
                method,
                components,
                parameters,
                headers,
                payload
            };
            let auxillary = {
                socket
            };
            let filteredEndpoints = endpoints.map((endpoint) => endpoint(raw, auxillary));
            filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsComponents());
            if (filteredEndpoints.length === 0) {
                return respond(httpResponse, {
                    status: 404,
                    headers: [],
                    payload: []
                });
            }
            filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsMethod());
            if (filteredEndpoints.length === 0) {
                return respond(httpResponse, {
                    status: 405,
                    headers: [],
                    payload: []
                });
            }
            let endpoint = filteredEndpoints[0];
            try {
                let valid = yield endpoint.validateRequest();
                try {
                    let handled = yield valid.handleRequest();
                    try {
                        let raw = yield handled.validateResponse();
                        return yield respond(httpResponse, raw);
                    }
                    catch (error) {
                        let payload = serializeStringPayload(String(error));
                        return respond(httpResponse, {
                            status: 500,
                            headers: [],
                            payload: payload
                        });
                    }
                }
                catch (error) {
                    let response = {
                        status: 500,
                        headers: [],
                        payload: []
                    };
                    if (Number.isInteger(error) && error >= 100 && error <= 999) {
                        response.status = error;
                    }
                    else if (error instanceof EndpointError) {
                        response = error.getResponse();
                    }
                    return respond(httpResponse, response);
                }
            }
            catch (error) {
                let payload = serializeStringPayload(String(error));
                return respond(httpResponse, {
                    status: 400,
                    headers: [],
                    payload: payload
                });
            }
        });
    }
    exports.route = route;
    ;
    function parseRangeHeader(value, size) {
        var _a, _b, _c;
        if (value === undefined) {
            return {
                status: 200,
                offset: 0,
                length: size,
                size: size
            };
        }
        let s416 = {
            status: 416,
            offset: 0,
            length: 0,
            size: size
        };
        let parts;
        parts = (_a = /^bytes[=]([0-9]+)[-]$/.exec(String(value))) !== null && _a !== void 0 ? _a : undefined;
        if (parts !== undefined) {
            let one = Number.parseInt(parts[1], 10);
            if (one >= size) {
                return s416;
            }
            return {
                status: 206,
                offset: one,
                length: size - one,
                size: size
            };
        }
        parts = (_b = /^bytes[=]([0-9]+)[-]([0-9]+)$/.exec(String(value))) !== null && _b !== void 0 ? _b : undefined;
        if (parts !== undefined) {
            let one = Number.parseInt(parts[1], 10);
            let two = Number.parseInt(parts[2], 10);
            if (two < one) {
                return s416;
            }
            if (one >= size) {
                return s416;
            }
            if (two >= size) {
                two = size - 1;
            }
            return {
                status: 206,
                offset: one,
                length: two - one + 1,
                size: size
            };
        }
        parts = (_c = /^bytes[=][-]([0-9]+)$/.exec(String(value))) !== null && _c !== void 0 ? _c : undefined;
        if (parts !== undefined) {
            let one = Number.parseInt(parts[1], 10);
            if (one < 1) {
                return s416;
            }
            if (size < 1) {
                return s416;
            }
            if (one > size) {
                one = size;
            }
            return {
                status: 206,
                offset: size - one,
                length: one,
                size: size
            };
        }
        return s416;
    }
    exports.parseRangeHeader = parseRangeHeader;
    ;
    function getContentTypeFromExtension(extension) {
        let extensions = {
            ".css": "text/css",
            ".htm": "text/html",
            ".html": "text/html",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".js": "text/javascript",
            ".json": "application/json",
            ".png": "image/png"
        };
        return extensions[extension];
    }
    exports.getContentTypeFromExtension = getContentTypeFromExtension;
    ;
    function makeReadStreamResponse(pathPrefix, pathSuffix, request) {
        let libfs = require("fs");
        let libpath = require("path");
        if (libpath.normalize(pathSuffix).split(libpath.sep)[0] === "..") {
            throw 400;
        }
        let path = libpath.join(pathPrefix, pathSuffix);
        while (libfs.existsSync(path) && libfs.statSync(path).isDirectory()) {
            path = libpath.join(path, "index.html");
        }
        if (!libfs.existsSync(path)) {
            throw 404;
        }
        let range = parseRangeHeader(request.headers().range, libfs.statSync(path).size);
        let stream = libfs.createReadStream(path, {
            start: range.offset,
            end: range.offset + range.length
        });
        return {
            status: range.status,
            headers: {
                "Accept-Ranges": "bytes",
                "Content-Length": `${range.length}`,
                "Content-Range": range.length > 0 ? `bytes ${range.offset}-${range.offset + range.length - 1}/${range.size}` : `bytes */${range.size}`,
                "Content-Type": getContentTypeFromExtension(libpath.extname(path))
            },
            payload: stream
        };
    }
    exports.makeReadStreamResponse = makeReadStreamResponse;
    ;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/api", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/guards", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/serialization"], function (require, exports, api, guards, serialization) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serialization = exports.guards = exports.api = void 0;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serialization = exports.guards = exports.api = void 0;
    exports.api = api;
    exports.guards = guards;
    exports.serialization = serialization;
});
define("build/shared/api/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/index"], function (require, exports, autoguard) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Autoguard = exports.Food = void 0;
    exports.Food = autoguard.guards.Object.of({
        "food_id": autoguard.guards.Number,
        "name": autoguard.guards.String
    });
    var Autoguard;
    (function (Autoguard) {
        Autoguard.Guards = {
            "Food": autoguard.guards.Reference.of(() => exports.Food)
        };
        Autoguard.Requests = {
            "getFood": autoguard.guards.Object.of({
                "options": autoguard.guards.Intersection.of(autoguard.api.Options, autoguard.guards.Object.of({
                    "food_id": autoguard.guards.Number
                })),
                "headers": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Intersection.of(autoguard.api.Headers, autoguard.guards.Object.of({}))),
                "payload": autoguard.guards.Union.of(autoguard.guards.Undefined)
            }),
            "getStaticContent": autoguard.guards.Object.of({
                "options": autoguard.guards.Intersection.of(autoguard.api.Options, autoguard.guards.Object.of({
                    "filename": autoguard.guards.String
                })),
                "headers": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Intersection.of(autoguard.api.Headers, autoguard.guards.Object.of({}))),
                "payload": autoguard.guards.Union.of(autoguard.guards.Undefined)
            })
        };
        Autoguard.Responses = {
            "getFood": autoguard.guards.Object.of({
                "status": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Number),
                "headers": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Intersection.of(autoguard.api.Headers, autoguard.guards.Object.of({}))),
                "payload": autoguard.guards.Object.of({
                    "food": autoguard.guards.Reference.of(() => exports.Food)
                })
            }),
            "getStaticContent": autoguard.guards.Object.of({
                "status": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Number),
                "headers": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Intersection.of(autoguard.api.Headers, autoguard.guards.Object.of({}))),
                "payload": autoguard.api.Binary
            })
        };
    })(Autoguard = exports.Autoguard || (exports.Autoguard = {}));
    ;
});
define("build/shared/api/client", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/index", "build/shared/api/index"], function (require, exports, autoguard, shared) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeClient = void 0;
    const makeClient = (options) => ({
        "getFood": (request) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let guard = shared.Autoguard.Requests["getFood"];
            guard.as(request, "request");
            let method = "GET";
            let components = new Array();
            components.push(decodeURIComponent("food"));
            components.push((_a = autoguard.api.serializeValue(request.options["food_id"], false)) !== null && _a !== void 0 ? _a : "");
            components.push(decodeURIComponent(""));
            let parameters = new Array();
            parameters.push(...autoguard.api.extractKeyValuePairs((_b = request.options) !== null && _b !== void 0 ? _b : {}, [...["food_id"], ...parameters.map((parameter) => parameter[0])]));
            let headers = new Array();
            headers.push(...autoguard.api.extractKeyValuePairs((_c = request.headers) !== null && _c !== void 0 ? _c : {}, headers.map((header) => header[0])));
            let payload = autoguard.api.serializePayload(request.payload);
            let requestHandler = (_d = options === null || options === void 0 ? void 0 : options.requestHandler) !== null && _d !== void 0 ? _d : autoguard.api.xhr;
            let raw = yield requestHandler({ method, components, parameters, headers, payload }, options === null || options === void 0 ? void 0 : options.urlPrefix);
            {
                let status = raw.status;
                let headers = autoguard.api.combineKeyValuePairs(raw.headers);
                let payload = yield autoguard.api.deserializePayload(raw.payload);
                let guard = shared.Autoguard.Responses["getFood"];
                let response = guard.as({ status, headers, payload }, "response");
                return new autoguard.api.ServerResponse(response);
            }
        }),
        "getStaticContent": (request) => __awaiter(void 0, void 0, void 0, function* () {
            var _e, _f, _g, _h;
            let guard = shared.Autoguard.Requests["getStaticContent"];
            guard.as(request, "request");
            let method = "GET";
            let components = new Array();
            components.push((_e = autoguard.api.serializeValue(request.options["filename"], true)) !== null && _e !== void 0 ? _e : "");
            let parameters = new Array();
            parameters.push(...autoguard.api.extractKeyValuePairs((_f = request.options) !== null && _f !== void 0 ? _f : {}, [...["filename"], ...parameters.map((parameter) => parameter[0])]));
            let headers = new Array();
            headers.push(...autoguard.api.extractKeyValuePairs((_g = request.headers) !== null && _g !== void 0 ? _g : {}, headers.map((header) => header[0])));
            let payload = autoguard.api.serializePayload(request.payload);
            let requestHandler = (_h = options === null || options === void 0 ? void 0 : options.requestHandler) !== null && _h !== void 0 ? _h : autoguard.api.xhr;
            let raw = yield requestHandler({ method, components, parameters, headers, payload }, options === null || options === void 0 ? void 0 : options.urlPrefix);
            {
                let status = raw.status;
                let headers = autoguard.api.combineKeyValuePairs(raw.headers);
                let payload = raw.payload;
                let guard = shared.Autoguard.Responses["getStaticContent"];
                let response = guard.as({ status, headers, payload }, "response");
                return new autoguard.api.ServerResponse(response);
            }
        }),
    });
    exports.makeClient = makeClient;
});
define("build/client/index", ["require", "exports", "build/shared/api/client"], function (require, exports, libclient) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                }
                catch (e) {
                    reject(e);
                }
            }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const client = libclient.makeClient({ urlPrefix: "" });
    client.getFood({
        options: {
            food_id: 1337
        }
    }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
        let payload = yield response.payload();
        document.write(`<pre>${JSON.stringify(payload, null, "\t")}</pre>`);
    }));
});
function define(e,t,l){null==this.x&&(this.x=new Map),null==this.z&&(this.z=(e=>require(e))),null==this.y&&(this.y=(e=>{let t=this.x.get(e);if(null==t||null!=t.module)return;let l=Array(),u={exports:{}};for(let e of t.dependencies){if("require"===e){l.push(this.z);continue}if("module"===e){l.push(u);continue}if("exports"===e){l.push(u.exports);continue}try{l.push(this.z(e));continue}catch(e){}let t=this.x.get(e);if(null==t||null==t.module)return;l.push(t.module.exports)}t.callback(...l),t.module=u;for(let e of t.dependencies)this.y(e)}));let u=this.x.get(e);if(null!=u)throw'Duplicate module found with name "'+e+'"!';u={callback:l,dependencies:t,module:null},this.x.set(e,u),this.y(e)}