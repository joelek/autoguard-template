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
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/is", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.present = exports.absent = void 0;
    function absent(subject) {
        return subject == null;
    }
    exports.absent = absent;
    ;
    function present(subject) {
        return subject != null;
    }
    exports.present = present;
    ;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/api", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/guards", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/is"], function (require, exports, guards, is) {
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
    exports.makeReadStreamResponse = exports.getContentTypeFromExtension = exports.parseRangeHeader = exports.route = exports.combineRawHeaders = exports.respond = exports.makeNodeRequestHandler = exports.xhr = exports.acceptsMethod = exports.acceptsComponents = exports.transformResponse = exports.getContentType = exports.deserializePayload = exports.deserializeStringPayload = exports.serializePayload = exports.serializeStringPayload = exports.collectPayload = exports.ServerResponse = exports.ClientRequest = exports.getHeaders = exports.getParameters = exports.getComponents = exports.getBooleanOption = exports.getNumberOption = exports.getStringOption = exports.serializeParameters = exports.combineKeyValuePairs = exports.extractKeyValuePairs = exports.serializeComponents = exports.Binary = exports.SyncBinary = exports.AsyncBinary = exports.Headers = exports.Options = void 0;
    exports.Options = guards.Record.of(guards.Union.of(guards.Boolean, guards.Number, guards.String));
    exports.Headers = guards.Record.of(guards.Union.of(guards.Boolean, guards.Number, guards.String));
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
    function serializeComponents(components) {
        return "/" + components
            .map((component) => {
            return encodeURIComponent(component);
        })
            .join("/");
    }
    exports.serializeComponents = serializeComponents;
    ;
    function extractKeyValuePairs(record, exclude = []) {
        let pairs = new Array();
        for (let [key, value] of Object.entries(record)) {
            if (value !== undefined && !exclude.includes(key)) {
                pairs.push([key, String(value)]);
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
    function getStringOption(pairs, key) {
        for (let pair of pairs) {
            if (pair[0] === key) {
                try {
                    let value = pair[1];
                    if (guards.String.is(value)) {
                        return value;
                    }
                }
                catch (error) { }
            }
        }
    }
    exports.getStringOption = getStringOption;
    ;
    function getNumberOption(pairs, key) {
        for (let pair of pairs) {
            if (pair[0] === key) {
                try {
                    let value = JSON.parse(pair[1]);
                    if (guards.Number.is(value)) {
                        return value;
                    }
                }
                catch (error) { }
            }
        }
    }
    exports.getNumberOption = getNumberOption;
    ;
    function getBooleanOption(pairs, key) {
        for (let pair of pairs) {
            if (pair[0] === key) {
                try {
                    let value = JSON.parse(pair[1]);
                    if (guards.Boolean.is(value)) {
                        return value;
                    }
                }
                catch (error) { }
            }
        }
    }
    exports.getBooleanOption = getBooleanOption;
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
    class ClientRequest {
        constructor(request) {
            this.request = request;
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
                let payload = this.request.payload;
                return (exports.Binary.is(payload) ? yield collectPayload(payload) : payload);
            });
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
                let payload = this.response.payload;
                return (exports.Binary.is(payload) ? yield collectPayload(payload) : payload);
            });
        }
    }
    exports.ServerResponse = ServerResponse;
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
        let string = JSON.stringify(payload);
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
            return string === "" ? undefined : JSON.parse(string);
        });
    }
    exports.deserializePayload = deserializePayload;
    ;
    function getContentType(payload) {
        if (exports.Binary.is(payload) || payload === undefined) {
            return "application/octet-stream";
        }
        else {
            return "application/json; charset=utf-8";
        }
    }
    exports.getContentType = getContentType;
    ;
    function transformResponse(response) {
        var _a, _b;
        let status = (_a = response.status) !== null && _a !== void 0 ? _a : 200;
        let headers = extractKeyValuePairs((_b = response.headers) !== null && _b !== void 0 ? _b : {});
        let contentType = headers.find((header) => {
            return header[0].toLowerCase() === "content-type";
        });
        if (contentType === undefined) {
            headers.push(["Content-Type", getContentType(response.payload)]);
        }
        let payload = exports.Binary.is(response.payload) ? response.payload : serializePayload(response.payload);
        return {
            status: status,
            headers: headers,
            payload: payload
        };
    }
    exports.transformResponse = transformResponse;
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
            let raw = {
                method,
                components,
                parameters,
                headers,
                payload
            };
            let filteredEndpoints = endpoints.map((endpoint) => endpoint(raw));
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
                        let response = yield handled.validateResponse();
                        let raw = transformResponse(response);
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
                    let status = 500;
                    if (Number.isInteger(error) && error >= 100 && error <= 999) {
                        status = error;
                    }
                    return respond(httpResponse, {
                        status: status,
                        headers: [],
                        payload: []
                    });
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
        if (is.absent(value)) {
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
        if (is.present(parts)) {
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
        if (is.present(parts)) {
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
        if (is.present(parts)) {
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
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/tokenization", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.expect = exports.Tokenizer = exports.IdentifierFamilies = exports.Families = void 0;
    exports.Families = ((...tuple) => tuple)("WS", "(", ")", "[", "]", "{", "}", "?", "|", ".", "..", "/", "&", ",", ":", ";", "<", ">", "=>", "<=", "any", "binary", "boolean", "false", "guard", "null", "number", "route", "string", "true", "undefined", "IDENTIFIER", "NUMBER_LITERAL", "STRING_LITERAL", "PATH_COMPONENT");
    exports.IdentifierFamilies = ((...tuple) => tuple)("any", "binary", "boolean", "false", "guard", "null", "number", "route", "string", "true", "undefined", "IDENTIFIER");
    class Tokenizer {
        constructor(string) {
            let matchers = {
                "WS": /^([\t\r\n ]+)/su,
                "(": /^([\(])/su,
                ")": /^([\)])/su,
                "[": /^([\[])/su,
                "]": /^([\]])/su,
                "{": /^([\{])/su,
                "}": /^([\}])/su,
                "?": /^([\?])/su,
                "|": /^([\|])/su,
                ".": /^([\.])/su,
                "..": /^([\.][\.])/su,
                "/": /^([\/])/su,
                "&": /^([&])/su,
                ",": /^([,])/su,
                ":": /^([:])/su,
                ";": /^([;])/su,
                "<": /^([<])/su,
                ">": /^([>])/su,
                "=>": /^([=][>])/su,
                "<=": /^([<][=])/su,
                "any": /^(any)/su,
                "binary": /^(binary)/su,
                "boolean": /^(boolean)/su,
                "false": /^(false)/su,
                "guard": /^(guard)/su,
                "null": /^(null)/su,
                "number": /^(number)/su,
                "route": /^(route)/su,
                "string": /^(string)/su,
                "true": /^(true)/su,
                "undefined": /^(undefined)/su,
                "IDENTIFIER": /^([a-zA-Z][a-zA-Z0-9_]*)/su,
                "NUMBER_LITERAL": /^(([1-9][0-9]+)|([0-9]))/su,
                "STRING_LITERAL": /^(["][^"]*["])/su,
                "PATH_COMPONENT": /^(([a-zA-Z0-9_.~-]|[%][0-9a-fA-F]{2})+)/su
            };
            let tokens = new Array();
            let row = 1;
            let col = 1;
            while (string.length > 0) {
                let token;
                for (let key in matchers) {
                    let type = key;
                    let exec = matchers[type].exec(string);
                    if (exec == null) {
                        continue;
                    }
                    if ((token == null) || (exec[1].length > token[1].length)) {
                        token = [type, exec[1]];
                    }
                }
                if (token == null) {
                    throw `Unrecognized token at row ${row}, col ${col}!`;
                }
                tokens.push({
                    family: token[0],
                    value: token[1],
                    row: row,
                    col: col
                });
                string = string.slice(token[1].length);
                let lines = token[1].split(/\r?\n/);
                if (lines.length > 1) {
                    row += lines.length - 1;
                    col = 1;
                }
                col += lines[lines.length - 1].length;
            }
            this.tokens = tokens.filter((token) => {
                return token.family !== "WS";
            });
            this.offset = 0;
        }
        peek() {
            return this.tokens[this.offset];
        }
        read() {
            if (this.offset >= this.tokens.length) {
                throw `Unexpectedly reached end of stream!`;
            }
            return this.tokens[this.offset++];
        }
        newContext(producer) {
            let offset = this.offset;
            try {
                return producer(() => this.read(), () => this.peek());
            }
            catch (error) {
                this.offset = offset;
                throw error;
            }
        }
    }
    exports.Tokenizer = Tokenizer;
    ;
    function expect(token, family) {
        let families = Array.isArray(family) ? family : [family];
        if (!families.includes(token.family)) {
            throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
        }
        return token;
    }
    exports.expect = expect;
    ;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/types", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/tokenization"], function (require, exports, tokenization) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Options = exports.Headers = exports.UnionType = exports.UndefinedType = exports.TupleType = exports.StringLiteralType = exports.StringType = exports.ReferenceType = exports.RecordType = exports.ObjectType = exports.NumberLiteralType = exports.NumberType = exports.NullType = exports.IntersectionType = exports.GroupType = exports.BooleanLiteralType = exports.BooleanType = exports.Binary = exports.ArrayType = exports.AnyType = exports.Type = void 0;
    ;
    exports.Type = {
        parse(tokenizer, ...exclude) {
            try {
                return UnionType.parse(tokenizer, ...exclude);
            }
            catch (error) { }
            try {
                return IntersectionType.parse(tokenizer, ...exclude);
            }
            catch (error) { }
            try {
                return ArrayType.parse(tokenizer, ...exclude);
            }
            catch (error) { }
            try {
                return AnyType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return BooleanType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return BooleanLiteralType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return NullType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return NumberType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return NumberLiteralType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return StringType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return StringLiteralType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return UndefinedType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return ReferenceType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return TupleType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return ObjectType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return GroupType.parse(tokenizer);
            }
            catch (error) { }
            try {
                return RecordType.parse(tokenizer);
            }
            catch (error) { }
            return tokenizer.newContext((read, peek) => {
                let token = read();
                throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
            });
        }
    };
    class AnyType {
        constructor() {
        }
        generateSchema(options) {
            return "any";
        }
        generateType(options) {
            return "any";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.Any");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "any");
                return AnyType.INSTANCE;
            });
        }
    }
    exports.AnyType = AnyType;
    AnyType.INSTANCE = new AnyType();
    ;
    class ArrayType {
        constructor(type) {
            this.type = type;
        }
        generateSchema(options) {
            return this.type.generateSchema(options) + "[]";
        }
        generateType(options) {
            return this.type.generateType(options) + "[]";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.Array.of(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
            return lines.join(options.eol);
        }
        getImports() {
            return this.type.getImports();
        }
        static parse(tokenizer, ...exclude) {
            if (exclude.includes("Array")) {
                throw `Recursion prevention!`;
            }
            return tokenizer.newContext((read, peek) => {
                let type = exports.Type.parse(tokenizer, ...exclude, "Array");
                tokenization.expect(read(), "[");
                tokenization.expect(read(), "]");
                let array = new ArrayType(type);
                while (true) {
                    try {
                        tokenizer.newContext((read, peek) => {
                            tokenization.expect(read(), "[");
                            tokenization.expect(read(), "]");
                            array = new ArrayType(array);
                        });
                    }
                    catch (error) {
                        break;
                    }
                }
                return array;
            });
        }
    }
    exports.ArrayType = ArrayType;
    ;
    class Binary {
        constructor() {
        }
        generateSchema(options) {
            return "binary";
        }
        generateType(options) {
            return "autoguard.api.Binary";
        }
        generateTypeGuard(options) {
            return "autoguard.api.Binary";
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "binary");
                return Binary.INSTANCE;
            });
        }
    }
    exports.Binary = Binary;
    Binary.INSTANCE = new Binary();
    ;
    class BooleanType {
        constructor() {
        }
        generateSchema(options) {
            return "boolean";
        }
        generateType(options) {
            return "boolean";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.Boolean");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "boolean");
                return BooleanType.INSTANCE;
            });
        }
    }
    exports.BooleanType = BooleanType;
    BooleanType.INSTANCE = new BooleanType();
    ;
    class BooleanLiteralType {
        constructor(value) {
            this.value = value;
        }
        generateSchema(options) {
            return "" + this.value;
        }
        generateType(options) {
            return "" + this.value;
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.BooleanLiteral.of(" + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                let token = tokenization.expect(read(), [
                    "true",
                    "false"
                ]);
                if (token.family === "true") {
                    return BooleanLiteralType.INSTANCE_TRUE;
                }
                else {
                    return BooleanLiteralType.INSTANCE_FALSE;
                }
            });
        }
    }
    exports.BooleanLiteralType = BooleanLiteralType;
    BooleanLiteralType.INSTANCE_TRUE = new BooleanLiteralType(true);
    BooleanLiteralType.INSTANCE_FALSE = new BooleanLiteralType(false);
    ;
    class GroupType {
        constructor(type) {
            this.type = type;
        }
        generateSchema(options) {
            return "(" + this.type.generateSchema(options) + ")";
        }
        generateType(options) {
            return "(" + this.type.generateType(options) + ")";
        }
        generateTypeGuard(options) {
            return this.type.generateTypeGuard(options);
        }
        getImports() {
            return this.type.getImports();
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "(");
                let type = exports.Type.parse(tokenizer);
                tokenization.expect(read(), ")");
                return new GroupType(type);
            });
        }
    }
    exports.GroupType = GroupType;
    ;
    class IntersectionType {
        constructor(types = []) {
            this.types = new Set(types);
        }
        add(type) {
            this.types.add(type);
            return this;
        }
        generateSchema(options) {
            let lines = new Array();
            for (let type of this.types) {
                lines.push(type.generateSchema(options));
            }
            let string = lines.join(" & ");
            return string;
        }
        generateType(options) {
            let lines = new Array();
            for (let type of this.types) {
                lines.push(type.generateType(options));
            }
            let string = lines.join(" & ");
            return string;
        }
        generateTypeGuard(options) {
            let lines = new Array();
            for (let type of this.types) {
                lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            return "autoguard.guards.Intersection.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
        }
        getImports() {
            let imports = new Array();
            for (let type of this.types) {
                imports.push(...type.getImports());
            }
            return imports;
        }
        static parse(tokenizer, ...exclude) {
            if (exclude.includes("Intersection")) {
                throw `Recursion prevention!`;
            }
            return tokenizer.newContext((read, peek) => {
                var _a;
                let type = exports.Type.parse(tokenizer, ...exclude, "Intersection");
                let instance = new IntersectionType();
                instance.add(type);
                while (true) {
                    if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "&") {
                        break;
                    }
                    tokenization.expect(read(), "&");
                    let type = exports.Type.parse(tokenizer, ...exclude, "Intersection");
                    instance.add(type);
                }
                if (instance.types.size === 1) {
                    return type;
                }
                return instance;
            });
        }
    }
    exports.IntersectionType = IntersectionType;
    ;
    class NullType {
        constructor() {
        }
        generateSchema(options) {
            return "null";
        }
        generateType(options) {
            return "null";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.Null");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "null");
                return NullType.INSTANCE;
            });
        }
    }
    exports.NullType = NullType;
    NullType.INSTANCE = new NullType();
    ;
    class NumberType {
        constructor() {
        }
        generateSchema(options) {
            return "number";
        }
        generateType(options) {
            return "number";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.Number");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "number");
                return NumberType.INSTANCE;
            });
        }
    }
    exports.NumberType = NumberType;
    NumberType.INSTANCE = new NumberType();
    ;
    class NumberLiteralType {
        constructor(value) {
            this.value = value;
        }
        generateSchema(options) {
            return "" + this.value;
        }
        generateType(options) {
            return "" + this.value;
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.NumberLiteral.of(" + this.generateType(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                let value = tokenization.expect(read(), "NUMBER_LITERAL").value;
                return new NumberLiteralType(Number.parseInt(value));
            });
        }
    }
    exports.NumberLiteralType = NumberLiteralType;
    ;
    class ObjectType {
        constructor(members = []) {
            this.members = new Map(members);
        }
        add(key, value) {
            this.members.set(key, value);
            return this;
        }
        generateSchema(options) {
            if (this.members.size === 0) {
                return "{}";
            }
            let lines = new Array();
            for (let [key, value] of this.members) {
                lines.push("	\"" + key + "\"" + (value.optional ? "?" : "") + ": " + value.type.generateSchema(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
            return "{" + string + "}";
        }
        generateType(options) {
            if (this.members.size === 0) {
                return "{}";
            }
            let lines = new Array();
            for (let [key, value] of this.members) {
                lines.push("	\"" + key + "\"" + (value.optional ? "?" : "") + ": " + value.type.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
            return "{" + string + "}";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            for (let [key, value] of this.members) {
                let type = value.type;
                if (value.optional) {
                    let union = new UnionType();
                    union.add(UndefinedType.INSTANCE);
                    union.add(type);
                    type = union;
                }
                lines.push("	\"" + key + "\": " + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            let guard = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
            return "autoguard.guards.Object.of({" + guard + "})";
        }
        getImports() {
            let imports = new Array();
            for (let [key, value] of this.members) {
                let type = value.type;
                imports.push(...type.getImports());
            }
            return imports;
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a, _b, _c;
                tokenization.expect(read(), "{");
                let instance = new ObjectType();
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
                    while (true) {
                        let optional = false;
                        let token = tokenization.expect(read(), [
                            ...tokenization.IdentifierFamilies,
                            "STRING_LITERAL"
                        ]);
                        let key = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
                        if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.value) === "?") {
                            read();
                            optional = true;
                        }
                        tokenization.expect(read(), ":");
                        let type = exports.Type.parse(tokenizer);
                        instance.add(key, {
                            type,
                            optional
                        });
                        if (((_c = peek()) === null || _c === void 0 ? void 0 : _c.value) !== ",") {
                            break;
                        }
                        tokenization.expect(read(), ",");
                    }
                }
                tokenization.expect(read(), "}");
                return instance;
            });
        }
    }
    exports.ObjectType = ObjectType;
    ;
    class RecordType {
        constructor(type) {
            this.type = type;
        }
        generateSchema(options) {
            return "{ " + this.type.generateSchema(options) + " }";
        }
        generateType(options) {
            return "Record<string, undefined | " + this.type.generateType(options) + ">";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.Record.of(" + this.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol })) + ")");
            return lines.join(options.eol);
        }
        getImports() {
            return this.type.getImports();
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "{");
                let type = exports.Type.parse(tokenizer);
                tokenization.expect(read(), "}");
                return new RecordType(type);
            });
        }
    }
    exports.RecordType = RecordType;
    ;
    class ReferenceType {
        constructor(path, typename) {
            this.path = path;
            this.typename = typename;
        }
        generateSchema(options) {
            return [...this.path, ""].join("/") + this.typename;
        }
        generateType(options) {
            return this.typename;
        }
        generateTypeGuard(options) {
            return "autoguard.guards.Reference.of(() => " + this.typename + ")";
        }
        getImports() {
            if (this.path.length > 0) {
                return [
                    {
                        path: this.path,
                        typename: this.typename
                    }
                ];
            }
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a;
                let tokens = new Array();
                while (true) {
                    let token = read();
                    tokenization.expect(token, [".", "..", "IDENTIFIER"]);
                    tokens.push(token);
                    if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) !== "/") {
                        break;
                    }
                    tokenization.expect(read(), "/");
                }
                let last = tokens.pop();
                tokenization.expect(last, "IDENTIFIER");
                return new ReferenceType(tokens.map((token) => token.value), last.value);
            });
        }
    }
    exports.ReferenceType = ReferenceType;
    ;
    class StringType {
        constructor() {
        }
        generateSchema(options) {
            return "string";
        }
        generateType(options) {
            return "string";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.String");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "string");
                return StringType.INSTANCE;
            });
        }
    }
    exports.StringType = StringType;
    StringType.INSTANCE = new StringType();
    ;
    class StringLiteralType {
        constructor(value) {
            this.value = value;
        }
        generateSchema(options) {
            return "\"" + this.value + "\"";
        }
        generateType(options) {
            return "\"" + this.value + "\"";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.StringLiteral.of(\"" + this.value + "\")");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                let value = tokenization.expect(read(), "STRING_LITERAL").value;
                return new StringLiteralType(value.slice(1, -1));
            });
        }
    }
    exports.StringLiteralType = StringLiteralType;
    ;
    class TupleType {
        constructor(types = []) {
            this.types = Array.from(types);
        }
        add(type) {
            this.types.push(type);
            return this;
        }
        generateSchema(options) {
            let strings = new Array();
            for (let type of this.types) {
                strings.push("	" + type.generateSchema(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            let string = strings.length > 0 ? options.eol + strings.join("," + options.eol) + options.eol : "";
            return "[" + string + "]";
        }
        generateType(options) {
            let strings = new Array();
            for (let type of this.types) {
                strings.push("	" + type.generateType(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            let string = strings.length > 0 ? options.eol + strings.join("," + options.eol) + options.eol : "";
            return "[" + string + "]";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            for (let type of this.types) {
                lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            let string = lines.length > 0 ? options.eol + lines.join("," + options.eol) + options.eol : "";
            return "autoguard.guards.Tuple.of(" + string + ")";
        }
        getImports() {
            let imports = new Array();
            for (let type of this.types) {
                imports.push(...type.getImports());
            }
            return imports;
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a, _b;
                tokenization.expect(read(), "[");
                let instance = new TupleType();
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "]") {
                    while (true) {
                        let type = exports.Type.parse(tokenizer);
                        instance.add(type);
                        if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.value) !== ",") {
                            break;
                        }
                        tokenization.expect(read(), ",");
                    }
                }
                tokenization.expect(read(), "]");
                return instance;
            });
        }
    }
    exports.TupleType = TupleType;
    ;
    class UndefinedType {
        constructor() {
        }
        generateSchema(options) {
            return "undefined";
        }
        generateType(options) {
            return "undefined";
        }
        generateTypeGuard(options) {
            let lines = new Array();
            lines.push("autoguard.guards.Undefined");
            return lines.join(options.eol);
        }
        getImports() {
            return [];
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "undefined");
                return UndefinedType.INSTANCE;
            });
        }
    }
    exports.UndefinedType = UndefinedType;
    UndefinedType.INSTANCE = new UndefinedType();
    ;
    class UnionType {
        constructor(types = []) {
            this.types = new Set(types);
        }
        add(type) {
            this.types.add(type);
            return this;
        }
        generateSchema(options) {
            let lines = new Array();
            for (let type of this.types) {
                lines.push(type.generateSchema(options));
            }
            let string = lines.join(" | ");
            return string;
        }
        generateType(options) {
            let lines = new Array();
            for (let type of this.types) {
                lines.push(type.generateType(options));
            }
            let string = lines.join(" | ");
            return string;
        }
        generateTypeGuard(options) {
            let lines = new Array();
            for (let type of this.types) {
                lines.push("	" + type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" })));
            }
            return "autoguard.guards.Union.of(" + options.eol + lines.join("," + options.eol) + options.eol + ")";
        }
        getImports() {
            let imports = new Array();
            for (let type of this.types) {
                imports.push(...type.getImports());
            }
            return imports;
        }
        static parse(tokenizer, ...exclude) {
            if (exclude.includes("Union")) {
                throw `Recursion prevention!`;
            }
            return tokenizer.newContext((read, peek) => {
                var _a;
                let type = exports.Type.parse(tokenizer, ...exclude, "Union");
                let instance = new UnionType();
                instance.add(type);
                while (true) {
                    if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "|") {
                        break;
                    }
                    tokenization.expect(read(), "|");
                    let type = exports.Type.parse(tokenizer, ...exclude, "Union");
                    instance.add(type);
                }
                if (instance.types.size === 1) {
                    return type;
                }
                return instance;
            });
        }
    }
    exports.UnionType = UnionType;
    ;
    class Headers {
        constructor() {
        }
        generateSchema(options) {
            throw `Method not implemented!`;
        }
        generateType(options) {
            return "autoguard.api.Headers";
        }
        generateTypeGuard(options) {
            return "autoguard.api.Headers";
        }
        getImports() {
            return [];
        }
    }
    exports.Headers = Headers;
    Headers.INSTANCE = new Headers();
    ;
    class Options {
        constructor() {
        }
        generateSchema(options) {
            throw `Method not implemented!`;
        }
        generateType(options) {
            return "autoguard.api.Options";
        }
        generateTypeGuard(options) {
            return "autoguard.api.Options";
        }
        getImports() {
            return [];
        }
    }
    exports.Options = Options;
    Options.INSTANCE = new Options();
    ;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/guard", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/tokenization", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/types"], function (require, exports, tokenization, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Guard = void 0;
    class Guard {
        constructor(typename, type) {
            this.typename = typename;
            this.type = type;
        }
        generateSchema(options) {
            let lines = new Array();
            lines.push(`guard ${this.typename}: ${this.type.generateSchema(options)};`);
            return lines.join(options.eol);
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                tokenization.expect(read(), "guard");
                let typename = tokenization.expect(read(), "IDENTIFIER").value;
                tokenization.expect(read(), ":");
                let type = types.Type.parse(tokenizer);
                tokenization.expect(read(), ";");
                return new Guard(typename, type);
            });
        }
    }
    exports.Guard = Guard;
    ;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/route", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/is", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/tokenization", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/types"], function (require, exports, is, tokenization, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Route = exports.Message = exports.Headers = exports.Parameters = exports.Parameter = exports.Method = exports.Path = exports.Component = void 0;
    class Component {
        constructor(name, type) {
            this.name = name;
            this.type = type;
        }
        generateSchema(options) {
            if (is.present(this.type)) {
                return "<" + this.name + ":" + this.type + ">";
            }
            else {
                return this.name;
            }
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a, _b;
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "<") {
                    tokenization.expect(read(), "<");
                    let token = tokenization.expect(read(), [
                        ...tokenization.IdentifierFamilies,
                        "STRING_LITERAL"
                    ]);
                    let name = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
                    tokenization.expect(read(), ":");
                    let type = tokenization.expect(read(), ["boolean", "number", "string"]).value;
                    tokenization.expect(read(), ">");
                    return new Component(name, type);
                }
                else {
                    let name = "";
                    if ([...tokenization.IdentifierFamilies, "PATH_COMPONENT"].includes((_b = peek()) === null || _b === void 0 ? void 0 : _b.family)) {
                        let token = tokenization.expect(read(), [
                            ...tokenization.IdentifierFamilies,
                            "PATH_COMPONENT"
                        ]);
                        name = token.family === "PATH_COMPONENT" ? decodeURIComponent(token.value) : token.value;
                    }
                    return new Component(name);
                }
            });
        }
    }
    exports.Component = Component;
    ;
    class Path {
        constructor(components) {
            this.components = components;
        }
        generateSchema(options) {
            let parts = new Array();
            for (let component of this.components) {
                parts.push(component.generateSchema(options));
            }
            return "/" + parts.join("/");
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a;
                let components = new Array();
                while (true) {
                    tokenization.expect(read(), "/");
                    let component = Component.parse(tokenizer);
                    components.push(component);
                    if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) !== "/") {
                        break;
                    }
                }
                return new Path(components);
            });
        }
    }
    exports.Path = Path;
    ;
    class Method {
        constructor(method) {
            this.method = method;
        }
        generateSchema(options) {
            return this.method;
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                let method = tokenization.expect(read(), "IDENTIFIER").value;
                return new Method(method);
            });
        }
    }
    exports.Method = Method;
    ;
    class Parameter {
        constructor(name, type, optional) {
            this.name = name;
            this.type = type;
            this.optional = optional;
        }
        generateSchema(options) {
            return this.name + (this.optional ? "?" : "") + ": " + this.type;
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a;
                let token = tokenization.expect(read(), [
                    ...tokenization.IdentifierFamilies,
                    "STRING_LITERAL"
                ]);
                let name = token.family === "STRING_LITERAL" ? token.value.slice(1, -1) : token.value;
                let optional = false;
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "?") {
                    tokenization.expect(read(), "?");
                    optional = true;
                }
                tokenization.expect(read(), ":");
                let type = tokenization.expect(read(), ["boolean", "number", "string"]).value;
                return new Parameter(name, type, optional);
            });
        }
    }
    exports.Parameter = Parameter;
    ;
    class Parameters {
        constructor(parameters) {
            this.parameters = parameters;
        }
        generateSchema(options) {
            if (this.parameters.length === 0) {
                return "";
            }
            let parts = new Array();
            for (let parameter of this.parameters) {
                parts.push(parameter.generateSchema(options));
            }
            return " ? <{ " + parts.join(", ") + " }>";
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a, _b;
                let parameters = new Array();
                tokenization.expect(read(), "<");
                tokenization.expect(read(), "{");
                while (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) !== "}") {
                    let parameter = Parameter.parse(tokenizer);
                    parameters.push(parameter);
                    if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === ",") {
                        tokenization.expect(read(), ",");
                    }
                    else {
                        break;
                    }
                }
                tokenization.expect(read(), "}");
                tokenization.expect(read(), ">");
                return new Parameters(parameters);
            });
        }
    }
    exports.Parameters = Parameters;
    ;
    class Headers {
        constructor(headers) {
            this.headers = headers;
        }
        generateSchema(options) {
            if (this.headers.length === 0) {
                return "";
            }
            let parts = new Array();
            for (let header of this.headers) {
                parts.push(header.generateSchema(options));
            }
            return "<{ " + parts.join(", ") + " }>";
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a, _b;
                let headers = new Array();
                tokenization.expect(read(), "<");
                tokenization.expect(read(), "{");
                while (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
                    let header = Parameter.parse(tokenizer);
                    header.name = header.name.toLowerCase();
                    headers.push(header);
                    if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === ",") {
                        tokenization.expect(read(), ",");
                    }
                    else {
                        break;
                    }
                }
                tokenization.expect(read(), "}");
                tokenization.expect(read(), ">");
                return new Headers(headers);
            });
        }
    }
    exports.Headers = Headers;
    ;
    class Message {
        constructor(headers, payload) {
            this.headers = headers;
            this.payload = payload;
        }
        generateSchema(options) {
            let lines = new Array();
            let parts = new Array();
            let headers = this.headers.generateSchema(options);
            if (headers !== "") {
                parts.push(headers);
            }
            if (this.payload !== types.UndefinedType.INSTANCE) {
                parts.push(this.payload.generateSchema(options));
            }
            lines.push(parts.join(" "));
            return lines.join(options.eol);
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a, _b;
                let headers = new Headers([]);
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "<") {
                    headers = Headers.parse(tokenizer);
                }
                let payload = types.UndefinedType.INSTANCE;
                if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === "binary") {
                    tokenization.expect(read(), "binary");
                    payload = types.Binary.INSTANCE;
                }
                else {
                    try {
                        payload = types.Type.parse(tokenizer);
                    }
                    catch (error) { }
                }
                return new Message(headers, payload);
            });
        }
    }
    exports.Message = Message;
    ;
    class Route {
        constructor(method, path, parameters, request, response) {
            this.method = method;
            this.path = path;
            this.parameters = parameters;
            this.request = request;
            this.response = response;
        }
        generateSchema(options) {
            let lines = new Array();
            lines.push(`route ${this.method.generateSchema(options)}:${this.path.generateSchema(options)}${this.parameters.generateSchema(options)}`);
            let request = this.request.generateSchema(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" }));
            if (request !== "") {
                lines.push(`\t<= ${request}`);
            }
            let response = this.response.generateSchema(Object.assign(Object.assign({}, options), { eol: options.eol + "\t" }));
            if (response !== "") {
                lines.push(`\t=> ${response}`);
            }
            return lines.join(options.eol) + ";";
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a, _b, _c;
                tokenization.expect(read(), "route");
                let method = Method.parse(tokenizer);
                tokenization.expect(read(), ":");
                let path = Path.parse(tokenizer);
                let parameters = new Parameters([]);
                if (((_a = peek()) === null || _a === void 0 ? void 0 : _a.family) === "?") {
                    tokenization.expect(read(), "?");
                    parameters = Parameters.parse(tokenizer);
                }
                let request = new Message(new Headers([]), types.UndefinedType.INSTANCE);
                if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === "<=") {
                    tokenization.expect(read(), "<=");
                    request = Message.parse(tokenizer);
                }
                let response = new Message(new Headers([]), types.UndefinedType.INSTANCE);
                if (((_c = peek()) === null || _c === void 0 ? void 0 : _c.family) === "=>") {
                    tokenization.expect(read(), "=>");
                    response = Message.parse(tokenizer);
                }
                tokenization.expect(read(), ";");
                return new Route(method, path, parameters, request, response);
            });
        }
    }
    exports.Route = Route;
    ;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/schema", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/guard", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/is", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/route", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/tokenization", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/types"], function (require, exports, guard, is, route, tokenization, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Schema = void 0;
    function makeParser(type) {
        if (type === "boolean") {
            return "getBooleanOption";
        }
        if (type === "number") {
            return "getNumberOption";
        }
        if (type === "string") {
            return "getStringOption";
        }
        throw `Expected "${type}" to be a supported parameter type!`;
    }
    function areAllMembersOptional(object) {
        for (let [key, value] of object.members) {
            if (!value.optional) {
                return false;
            }
        }
        return true;
    }
    function makeRouteTag(route) {
        let components = route.path.components.map((component) => {
            if (is.present(component.type)) {
                return `/<${component.name}>`;
            }
            else {
                return `/${encodeURIComponent(component.name)}`;
            }
        });
        return `${route.method.method}:${components.join("")}`;
    }
    function makeOptionType() {
        return new types.RecordType(new types.UnionType([
            types.BooleanType.INSTANCE,
            types.NumberType.INSTANCE,
            types.StringType.INSTANCE
        ]));
    }
    function getRequestType(route) {
        let request = new types.ObjectType();
        let options = new types.ObjectType();
        for (let component of route.path.components) {
            if (is.present(component.type)) {
                options.add(component.name, {
                    type: types.Type.parse(new tokenization.Tokenizer(component.type)),
                    optional: false
                });
            }
        }
        for (let parameter of route.parameters.parameters) {
            options.add(parameter.name, {
                type: types.Type.parse(new tokenization.Tokenizer(parameter.type)),
                optional: parameter.optional
            });
        }
        request.add("options", {
            type: new types.IntersectionType([
                types.Options.INSTANCE,
                options
            ]),
            optional: areAllMembersOptional(options)
        });
        let headers = new types.ObjectType();
        for (let header of route.request.headers.headers) {
            headers.add(header.name, {
                type: types.Type.parse(new tokenization.Tokenizer(header.type)),
                optional: header.optional
            });
        }
        request.add("headers", {
            type: new types.IntersectionType([
                types.Headers.INSTANCE,
                headers
            ]),
            optional: areAllMembersOptional(headers)
        });
        let payload = route.request.payload;
        request.add("payload", {
            type: payload,
            optional: payload === types.UndefinedType.INSTANCE
        });
        return request;
    }
    function getResponseType(route) {
        let response = new types.ObjectType();
        let headers = new types.ObjectType();
        for (let header of route.response.headers.headers) {
            headers.add(header.name, {
                type: types.Type.parse(new tokenization.Tokenizer(header.type)),
                optional: header.optional
            });
        }
        response.add("status", {
            type: types.NumberType.INSTANCE,
            optional: true
        });
        response.add("headers", {
            type: new types.IntersectionType([
                types.Headers.INSTANCE,
                headers
            ]),
            optional: areAllMembersOptional(headers)
        });
        let payload = route.response.payload;
        response.add("payload", {
            type: payload,
            optional: payload === types.UndefinedType.INSTANCE
        });
        return response;
    }
    class Schema {
        constructor(guards, routes) {
            this.guards = guards;
            this.routes = routes;
        }
        getImports() {
            let imports = new Map();
            for (let guard of this.guards) {
                let entries = guard.type.getImports();
                for (let entry of entries) {
                    imports.set(entry.typename, entry.path);
                }
            }
            for (let route of this.routes) {
                let request = route.request.payload;
                if (is.present(request)) {
                    let entries = request.getImports();
                    for (let entry of entries) {
                        imports.set(entry.typename, entry.path);
                    }
                }
                let response = route.response.payload;
                if (is.present(response)) {
                    let entries = response.getImports();
                    for (let entry of entries) {
                        imports.set(entry.typename, entry.path);
                    }
                }
            }
            return Array.from(imports.entries())
                .sort((one, two) => one[0].localeCompare(two[0]))
                .map((entry) => {
                return {
                    path: entry[1],
                    typename: entry[0]
                };
            });
        }
        generateSchema(options) {
            let lines = new Array();
            for (let guard of this.guards) {
                lines.push(guard.generateSchema(options));
                lines.push(``);
            }
            for (let route of this.routes) {
                lines.push(route.generateSchema(options));
                lines.push(``);
            }
            return lines.join(options.eol);
        }
        generateClient(options) {
            let lines = new Array();
            lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
            lines.push(``);
            lines.push(`import * as autoguard from "@joelek/ts-autoguard";`);
            lines.push(`import * as shared from "./index";`);
            lines.push(``);
            lines.push(`export const makeClient = (options?: Partial<{`);
            lines.push(`\turlPrefix: string,`);
            lines.push(`\trequestHandler: autoguard.api.RequestHandler`);
            lines.push(`}>): autoguard.api.Client<shared.Autoguard.Requests, shared.Autoguard.Responses> => ({`);
            for (let route of this.routes) {
                let tag = makeRouteTag(route);
                lines.push(`\t"${tag}": async (request) => {`);
                lines.push(`\t\tlet guard = shared.Autoguard.Requests["${tag}"];`);
                lines.push(`\t\tguard.as(request, "CLIENT:request");`);
                lines.push(`\t\tlet method = "${route.method.method}";`);
                lines.push(`\t\tlet components = new Array<string>();`);
                for (let component of route.path.components) {
                    if (is.absent(component.type)) {
                        lines.push(`\t\tcomponents.push(decodeURIComponent("${encodeURIComponent(component.name)}"));`);
                    }
                    else {
                        lines.push(`\t\tcomponents.push(String(request.options["${component.name}"]));`);
                    }
                }
                let exclude = new Array();
                for (let component of route.path.components) {
                    if (is.present(component.type)) {
                        exclude.push(`"${component.name}"`);
                    }
                }
                lines.push(`\t\tlet parameters = autoguard.api.extractKeyValuePairs(request.options ?? {}, [${exclude.join(",")}]);`);
                lines.push(`\t\tlet headers = autoguard.api.extractKeyValuePairs(request.headers ?? {});`);
                if (route.request.payload === types.Binary.INSTANCE) {
                    lines.push(`\t\tlet payload = request.payload;`);
                }
                else {
                    lines.push(`\t\tlet payload = autoguard.api.serializePayload(request.payload);`);
                }
                lines.push(`\t\tlet requestHandler = options?.requestHandler ?? autoguard.api.xhr;`);
                lines.push(`\t\tlet raw = await requestHandler({ method, components, parameters, headers, payload }, options?.urlPrefix);`);
                lines.push(`\t\t{`);
                lines.push(`\t\t\tlet status = raw.status;`);
                lines.push(`\t\t\tlet headers = autoguard.api.combineKeyValuePairs(raw.headers);`);
                for (let header of route.response.headers.headers) {
                    lines.push(`\t\t\theaders["${header.name}"] = autoguard.api.${makeParser(header.type)}(raw.headers, "${header.name}");`);
                }
                if (route.response.payload === types.Binary.INSTANCE) {
                    lines.push(`\t\t\tlet payload = raw.payload;`);
                }
                else {
                    lines.push(`\t\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
                }
                lines.push(`\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
                lines.push(`\t\t\tlet response = guard.as({ status, headers, payload }, "CLIENT:response");`);
                lines.push(`\t\t\treturn new autoguard.api.ServerResponse(response);`);
                lines.push(`\t\t}`);
                lines.push(`\t},`);
            }
            lines.push(`});`);
            lines.push(``);
            return lines.join(options.eol);
        }
        generateServer(options) {
            let lines = new Array();
            lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
            lines.push(``);
            lines.push(`import * as autoguard from "@joelek/ts-autoguard";`);
            lines.push(`import * as shared from "./index";`);
            lines.push(``);
            lines.push(`export const makeServer = (routes: autoguard.api.Server<shared.Autoguard.Requests, shared.Autoguard.Responses>, options?: Partial<{ urlPrefix: string }>): autoguard.api.RequestListener => {`);
            lines.push(`\tlet endpoints = new Array<autoguard.api.Endpoint>();`);
            for (let route of this.routes) {
                let tag = makeRouteTag(route);
                lines.push(`\tendpoints.push((raw) => {`);
                lines.push(`\t\tlet method = "${route.method.method}";`);
                lines.push(`\t\tlet components = new Array<[string, string]>();`);
                for (let [index, component] of route.path.components.entries()) {
                    if (is.present(component.type)) {
                        lines.push(`\t\tcomponents.push(["${component.name}", raw.components[${index}]]);`);
                    }
                    else {
                        lines.push(`\t\tcomponents.push(["", decodeURIComponent("${encodeURIComponent(component.name)}")]);`);
                    }
                }
                lines.push(`\t\treturn {`);
                lines.push(`\t\t\tacceptsComponents: () => autoguard.api.acceptsComponents(raw.components, components),`);
                lines.push(`\t\t\tacceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),`);
                lines.push(`\t\t\tvalidateRequest: async () => {`);
                lines.push(`\t\t\t\tlet options = autoguard.api.combineKeyValuePairs(raw.parameters);`);
                for (let component of route.path.components) {
                    if (is.present(component.type)) {
                        lines.push(`\t\t\t\toptions["${component.name}"] = autoguard.api.${makeParser(component.type)}(components, "${component.name}");`);
                    }
                }
                for (let parameter of route.parameters.parameters) {
                    lines.push(`\t\t\t\toptions["${parameter.name}"] = autoguard.api.${makeParser(parameter.type)}(raw.parameters, "${parameter.name}");`);
                }
                lines.push(`\t\t\t\tlet headers = autoguard.api.combineKeyValuePairs(raw.headers);`);
                for (let header of route.request.headers.headers) {
                    lines.push(`\t\t\t\theaders["${header.name}"] = autoguard.api.${makeParser(header.type)}(raw.headers, "${header.name}");`);
                }
                if (route.request.payload === types.Binary.INSTANCE) {
                    lines.push(`\t\t\t\tlet payload = raw.payload;`);
                }
                else {
                    lines.push(`\t\t\t\tlet payload = await autoguard.api.deserializePayload(raw.payload);`);
                }
                lines.push(`\t\t\t\tlet guard = shared.Autoguard.Requests["${tag}"];`);
                lines.push(`\t\t\t\tlet request = guard.as({ options, headers, payload }, "SERVER:request");`);
                lines.push(`\t\t\t\treturn {`);
                lines.push(`\t\t\t\t\thandleRequest: async () => {`);
                lines.push(`\t\t\t\t\t\tlet response = await routes["${tag}"](new autoguard.api.ClientRequest(request));`);
                lines.push(`\t\t\t\t\t\treturn {`);
                lines.push(`\t\t\t\t\t\t\tvalidateResponse: async () => {`);
                lines.push(`\t\t\t\t\t\t\t\tlet guard = shared.Autoguard.Responses["${tag}"];`);
                lines.push(`\t\t\t\t\t\t\t\tguard.as(response, "SERVER:response");`);
                lines.push(`\t\t\t\t\t\t\t\treturn response;`);
                lines.push(`\t\t\t\t\t\t\t}`);
                lines.push(`\t\t\t\t\t\t};`);
                lines.push(`\t\t\t\t\t}`);
                lines.push(`\t\t\t\t};`);
                lines.push(`\t\t\t}`);
                lines.push(`\t\t};`);
                lines.push(`\t});`);
            }
            lines.push(`\treturn (request, response) => autoguard.api.route(endpoints, request, response, options?.urlPrefix);`);
            lines.push(`};`);
            lines.push(``);
            return lines.join(options.eol);
        }
        generateShared(options) {
            let lines = new Array();
            lines.push(`// This file was auto-generated by @joelek/ts-autoguard. Edit at own risk.`);
            lines.push(``);
            lines.push(`import * as autoguard from "@joelek/ts-autoguard";`);
            let imports = this.getImports();
            if (imports.length > 0) {
                for (let entry of imports) {
                    lines.push(`import { ${entry.typename} } from "${["..", ...entry.path].join("/")}";`);
                }
            }
            lines.push(``);
            for (let guard of this.guards) {
                lines.push(`export const ${guard.typename} = ${guard.type.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol }))};`);
                lines.push(``);
                lines.push(`export type ${guard.typename} = ReturnType<typeof ${guard.typename}["as"]>;`);
                lines.push(``);
            }
            let guards = new Array();
            for (let guard of this.guards) {
                let reference = new types.ReferenceType([], guard.typename);
                guards.push(`\t\t"${guard.typename}": ${reference.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
            }
            lines.push(`export namespace Autoguard {`);
            lines.push(`\texport const Guards = {${guards.length > 0 ? options.eol + guards.join("," + options.eol) + options.eol + "\t" : ""}};`);
            lines.push(``);
            lines.push(`\texport type Guards = { [A in keyof typeof Guards]: ReturnType<typeof Guards[A]["as"]>; };`);
            lines.push(``);
            let requests = new Array();
            for (let route of this.routes) {
                let request = getRequestType(route);
                let tag = makeRouteTag(route);
                requests.push(`\t\t"${tag}": ${request.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
            }
            lines.push(`\texport const Requests = {${requests.length > 0 ? options.eol + requests.join("," + options.eol) + options.eol + "\t" : ""}};`);
            lines.push(``);
            lines.push(`\texport type Requests = { [A in keyof typeof Requests]: ReturnType<typeof Requests[A]["as"]>; };`);
            lines.push(``);
            let responses = new Array();
            for (let route of this.routes) {
                let response = getResponseType(route);
                let tag = makeRouteTag(route);
                responses.push(`\t\t"${tag}": ${response.generateTypeGuard(Object.assign(Object.assign({}, options), { eol: options.eol + "\t\t" }))}`);
            }
            lines.push(`\texport const Responses = {${responses.length > 0 ? options.eol + responses.join("," + options.eol) + options.eol + "\t" : ""}};`);
            lines.push(``);
            lines.push(`\texport type Responses = { [A in keyof typeof Responses]: ReturnType<typeof Responses[A]["as"]>; };`);
            lines.push(`};`);
            lines.push(``);
            return lines.join(options.eol);
        }
        static parseOld(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                var _a, _b;
                let guards = new Array();
                let routes = new Array();
                tokenization.expect(read(), "{");
                while (((_a = peek()) === null || _a === void 0 ? void 0 : _a.value) !== "}") {
                    let identifier = tokenization.expect(read(), "IDENTIFIER").value;
                    tokenization.expect(read(), ":");
                    let type = types.Type.parse(tokenizer);
                    guards.push(new guard.Guard(identifier, type));
                    if (((_b = peek()) === null || _b === void 0 ? void 0 : _b.family) === ",") {
                        tokenization.expect(read(), ",");
                    }
                    else {
                        break;
                    }
                }
                tokenization.expect(read(), "}");
                if (is.present(peek())) {
                    throw `Expected end of stream!`;
                }
                return new Schema(guards, routes);
            });
        }
        static parse(tokenizer) {
            return tokenizer.newContext((read, peek) => {
                let guards = new Array();
                let routes = new Array();
                while (peek()) {
                    try {
                        guards.push(guard.Guard.parse(tokenizer));
                        continue;
                    }
                    catch (error) { }
                    try {
                        routes.push(route.Route.parse(tokenizer));
                        continue;
                    }
                    catch (error) { }
                    return tokenizer.newContext((read, peek) => {
                        let token = read();
                        throw `Unexpected ${token.family} at row ${token.row}, col ${token.col}!`;
                    });
                }
                return new Schema(guards, routes);
            });
        }
    }
    exports.Schema = Schema;
    ;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/guard", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/route", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/schema", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/types"], function (require, exports, guard, route, schema, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.types = exports.schema = exports.route = exports.guard = void 0;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.types = exports.schema = exports.route = exports.guard = void 0;
    exports.guard = guard;
    exports.route = route;
    exports.schema = schema;
    exports.types = types;
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/shared", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("node_modules/@joelek/ts-autoguard/build/autoguard-lib/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/api", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/guards", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/is", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/language/index", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/serialization", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/shared", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/tokenization"], function (require, exports, api, guards, is, language, serialization, shared, tokenization) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tokenization = exports.shared = exports.serialization = exports.language = exports.is = exports.guards = exports.api = void 0;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tokenization = exports.shared = exports.serialization = exports.language = exports.is = exports.guards = exports.api = void 0;
    exports.api = api;
    exports.guards = guards;
    exports.is = is;
    exports.language = language;
    exports.serialization = serialization;
    exports.shared = shared;
    exports.tokenization = tokenization;
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
            "GET:/food/<food_id>/": autoguard.guards.Object.of({
                "options": autoguard.guards.Intersection.of(autoguard.api.Options, autoguard.guards.Object.of({
                    "food_id": autoguard.guards.Number
                })),
                "headers": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Intersection.of(autoguard.api.Headers, autoguard.guards.Object.of({}))),
                "payload": autoguard.guards.Union.of(autoguard.guards.Undefined)
            }),
            "GET:/<filename>": autoguard.guards.Object.of({
                "options": autoguard.guards.Intersection.of(autoguard.api.Options, autoguard.guards.Object.of({
                    "filename": autoguard.guards.String
                })),
                "headers": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Intersection.of(autoguard.api.Headers, autoguard.guards.Object.of({}))),
                "payload": autoguard.guards.Union.of(autoguard.guards.Undefined)
            })
        };
        Autoguard.Responses = {
            "GET:/food/<food_id>/": autoguard.guards.Object.of({
                "status": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Number),
                "headers": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Intersection.of(autoguard.api.Headers, autoguard.guards.Object.of({}))),
                "payload": autoguard.guards.Object.of({
                    "food": autoguard.guards.Reference.of(() => exports.Food)
                })
            }),
            "GET:/<filename>": autoguard.guards.Object.of({
                "status": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Number),
                "headers": autoguard.guards.Union.of(autoguard.guards.Undefined, autoguard.guards.Intersection.of(autoguard.api.Headers, autoguard.guards.Object.of({}))),
                "payload": autoguard.api.Binary
            })
        };
    })(Autoguard = exports.Autoguard || (exports.Autoguard = {}));
    ;
});
define("build/shared/api/server", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/index", "build/shared/api/index"], function (require, exports, autoguard, shared) {
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
    exports.makeServer = void 0;
    const makeServer = (routes, options) => {
        let endpoints = new Array();
        endpoints.push((raw) => {
            let method = "GET";
            let components = new Array();
            components.push(["", decodeURIComponent("food")]);
            components.push(["food_id", raw.components[1]]);
            components.push(["", decodeURIComponent("")]);
            return {
                acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, components),
                acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
                validateRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                    let options = autoguard.api.combineKeyValuePairs(raw.parameters);
                    options["food_id"] = autoguard.api.getNumberOption(components, "food_id");
                    let headers = autoguard.api.combineKeyValuePairs(raw.headers);
                    let payload = yield autoguard.api.deserializePayload(raw.payload);
                    let guard = shared.Autoguard.Requests["GET:/food/<food_id>/"];
                    let request = guard.as({ options, headers, payload }, "SERVER:request");
                    return {
                        handleRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                            let response = yield routes["GET:/food/<food_id>/"](new autoguard.api.ClientRequest(request));
                            return {
                                validateResponse: () => __awaiter(void 0, void 0, void 0, function* () {
                                    let guard = shared.Autoguard.Responses["GET:/food/<food_id>/"];
                                    guard.as(response, "SERVER:response");
                                    return response;
                                })
                            };
                        })
                    };
                })
            };
        });
        endpoints.push((raw) => {
            let method = "GET";
            let components = new Array();
            components.push(["filename", raw.components[0]]);
            return {
                acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, components),
                acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
                validateRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                    let options = autoguard.api.combineKeyValuePairs(raw.parameters);
                    options["filename"] = autoguard.api.getStringOption(components, "filename");
                    let headers = autoguard.api.combineKeyValuePairs(raw.headers);
                    let payload = yield autoguard.api.deserializePayload(raw.payload);
                    let guard = shared.Autoguard.Requests["GET:/<filename>"];
                    let request = guard.as({ options, headers, payload }, "SERVER:request");
                    return {
                        handleRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                            let response = yield routes["GET:/<filename>"](new autoguard.api.ClientRequest(request));
                            return {
                                validateResponse: () => __awaiter(void 0, void 0, void 0, function* () {
                                    let guard = shared.Autoguard.Responses["GET:/<filename>"];
                                    guard.as(response, "SERVER:response");
                                    return response;
                                })
                            };
                        })
                    };
                })
            };
        });
        return (request, response) => autoguard.api.route(endpoints, request, response, options === null || options === void 0 ? void 0 : options.urlPrefix);
    };
    exports.makeServer = makeServer;
});
define("build/server/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/build/autoguard-lib/index", "http", "build/shared/api/server"], function (require, exports, autoguard, libhttp, libserver) {
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
    const port = 8080;
    const httpServer = libhttp.createServer({}, libserver.makeServer({
        "GET:/food/<food_id>/": (request) => __awaiter(void 0, void 0, void 0, function* () {
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
        }),
        "GET:/<filename>": (request) => __awaiter(void 0, void 0, void 0, function* () {
            let options = request.options();
            return autoguard.api.makeReadStreamResponse("./dist/client/", options.filename, request);
        })
    }, { urlPrefix: "" }));
    httpServer.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}/ ...`);
    });
});
function define(e,t,l){null==this.x&&(this.x=new Map),null==this.z&&(this.z=(e=>require(e))),null==this.y&&(this.y=(e=>{let t=this.x.get(e);if(null==t||null!=t.module)return;let l=Array(),u={exports:{}};for(let e of t.dependencies){if("require"===e){l.push(this.z);continue}if("module"===e){l.push(u);continue}if("exports"===e){l.push(u.exports);continue}try{l.push(this.z(e));continue}catch(e){}let t=this.x.get(e);if(null==t||null==t.module)return;l.push(t.module.exports)}t.callback(...l),t.module=u;for(let e of t.dependencies)this.y(e)}));let u=this.x.get(e);if(null!=u)throw'Duplicate module found with name "'+e+'"!';u={callback:l,dependencies:t,module:null},this.x.set(e,u),this.y(e)}