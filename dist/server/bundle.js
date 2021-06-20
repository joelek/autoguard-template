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
    exports.Union = exports.Undefined = exports.Tuple = exports.StringLiteral = exports.String = exports.Reference = exports.Record = exports.Object = exports.NumberLiteral = exports.Number = exports.Null = exports.Intersection = exports.Group = exports.BooleanLiteral = exports.Boolean = exports.Array = exports.Any = void 0;
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
                    return `array<${guard.ts(eol)}>`;
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
    exports.Group = {
        of(guard, name) {
            return {
                as(subject, path = "") {
                    return guard.as(subject, path);
                },
                is(subject) {
                    return guard.is(subject);
                },
                ts(eol = "\n") {
                    return name !== null && name !== void 0 ? name : guard.ts(eol);
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
                        lines.push("\t" + guard.ts(eol + "\t"));
                    }
                    return "intersection<" + eol + lines.join("," + eol) + eol + ">";
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
                    return "object<" + eol + lines.join("," + eol) + eol + ">";
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
                    return `record<${guard.ts(eol)}>`;
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
                    return "tuple<" + eol + lines.join("," + eol) + eol + ">";
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
                        lines.push("\t" + guard.ts(eol + "\t"));
                    }
                    return "union<" + eol + lines.join("," + eol) + eol + ">";
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
    exports.route = exports.combineRawHeaders = exports.respond = exports.makeNodeRequestHandler = exports.xhr = exports.acceptsMethod = exports.acceptsComponents = exports.finalizeResponse = exports.deserializePayload = exports.deserializeStringPayload = exports.compareArrays = exports.serializePayload = exports.serializeStringPayload = exports.collectPayload = exports.EndpointError = exports.ServerResponse = exports.ClientRequest = exports.deserializeValue = exports.serializeValue = exports.Headers = exports.Options = exports.JSON = exports.Primitive = exports.Binary = exports.SyncBinary = exports.AsyncBinary = exports.DynamicRouteMatcher = exports.StaticRouteMatcher = exports.decodeUndeclaredHeaders = exports.decodeHeaderValue = exports.decodeHeaderValues = exports.decodeUndeclaredParameters = exports.decodeParameterValue = exports.decodeParameterValues = exports.encodeUndeclaredParameterPairs = exports.encodeParameterPairs = exports.escapeParameterValue = exports.escapeParameterKey = exports.encodeComponents = exports.escapeComponent = exports.encodeUndeclaredHeaderPairs = exports.encodeHeaderPairs = exports.escapeHeaderValue = exports.escapeHeaderKey = exports.splitHeaders = exports.combineParameters = exports.splitParameters = exports.combineComponents = exports.splitComponents = exports.decodeURIComponent = void 0;
    exports.makeReadStreamResponse = exports.getContentTypeFromExtension = exports.parseRangeHeader = void 0;
    function decodeURIComponent(string) {
        try {
            return globalThis.decodeURIComponent(string);
        }
        catch (error) { }
    }
    exports.decodeURIComponent = decodeURIComponent;
    ;
    function splitComponents(url) {
        let components = new Array();
        for (let part of url.split("?")[0].split("/").slice(1)) {
            components.push(part);
        }
        return components;
    }
    exports.splitComponents = splitComponents;
    ;
    function combineComponents(components) {
        return "/" + components.join("/");
    }
    exports.combineComponents = combineComponents;
    ;
    function splitParameters(url) {
        let parameters = new Array();
        let query = url.split("?").slice(1).join("?");
        if (query !== "") {
            for (let part of query.split("&")) {
                let parts = part.split("=");
                if (parts.length === 1) {
                    let key = parts[0];
                    let value = "";
                    parameters.push([key, value]);
                }
                else {
                    let key = parts[0];
                    let value = parts.slice(1).join("=");
                    parameters.push([key, value]);
                }
            }
        }
        return parameters;
    }
    exports.splitParameters = splitParameters;
    ;
    function combineParameters(parameters) {
        let parts = parameters.map((parameters) => {
            let key = parameters[0];
            let value = parameters[1];
            return `${key}=${value}`;
        });
        if (parts.length === 0) {
            return "";
        }
        return `?${parts.join("&")}`;
    }
    exports.combineParameters = combineParameters;
    ;
    function splitHeaders(lines) {
        return lines.map((part) => {
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
    exports.splitHeaders = splitHeaders;
    ;
    const RFC7320_DELIMITERS = "\"(),/:;<=>?@[\\]{}";
    const RFC7320_WHITESPACE = "\t ";
    // The specification (rfc7320) allows octets 33-126 and forbids delimiters. Octets 128-255 have been deprecated since rfc2616.
    function escapeHeaderKey(string, alwaysEncode = "") {
        return escapeHeaderValue(string, RFC7320_DELIMITERS + RFC7320_WHITESPACE + alwaysEncode);
    }
    exports.escapeHeaderKey = escapeHeaderKey;
    ;
    // The specification (rfc7320) allows octets 33-126 and whitespace. Octets 128-255 have been deprecated since rfc2616.
    function escapeHeaderValue(string, alwaysEncode = "") {
        return [...string]
            .map((codePointString) => {
            var _a;
            if (!alwaysEncode.includes(codePointString) && codePointString !== "%") {
                let codePoint = (_a = codePointString.codePointAt(0)) !== null && _a !== void 0 ? _a : 0;
                if (codePoint >= 33 && codePoint <= 126) {
                    return codePointString;
                }
                if (RFC7320_WHITESPACE.includes(codePointString)) {
                    return codePointString;
                }
            }
            return encodeURIComponent(codePointString);
        })
            .join("");
    }
    exports.escapeHeaderValue = escapeHeaderValue;
    ;
    function encodeHeaderPairs(key, values, plain) {
        let pairs = new Array();
        for (let value of values) {
            let serialized = serializeValue(value, plain);
            if (serialized !== undefined) {
                if (plain) {
                    pairs.push([
                        escapeHeaderKey(key),
                        escapeHeaderValue(serialized)
                    ]);
                }
                else {
                    pairs.push([
                        escapeHeaderKey(key),
                        escapeHeaderKey(serialized)
                    ]);
                }
            }
        }
        return pairs;
    }
    exports.encodeHeaderPairs = encodeHeaderPairs;
    ;
    function encodeUndeclaredHeaderPairs(record, exclude) {
        let pairs = new Array();
        for (let [key, value] of Object.entries(record)) {
            if (!exclude.includes(key) && value !== undefined) {
                if (guards.String.is(value)) {
                    pairs.push(...encodeHeaderPairs(key, [value], true));
                }
                else if (guards.Array.of(guards.String).is(value)) {
                    pairs.push(...encodeHeaderPairs(key, value, true));
                }
                else {
                    throw `Expected type of undeclared header "${key}" to be string or string[]!`;
                }
            }
        }
        return pairs;
    }
    exports.encodeUndeclaredHeaderPairs = encodeUndeclaredHeaderPairs;
    ;
    function escapeComponent(string) {
        return encodeURIComponent(string);
    }
    exports.escapeComponent = escapeComponent;
    ;
    function encodeComponents(values, plain) {
        let array = new Array();
        for (let value of values) {
            let serialized = serializeValue(value, plain);
            if (serialized !== undefined) {
                array.push(escapeComponent(serialized));
            }
        }
        return array;
    }
    exports.encodeComponents = encodeComponents;
    ;
    function escapeParameterKey(string) {
        return encodeURIComponent(string);
    }
    exports.escapeParameterKey = escapeParameterKey;
    ;
    function escapeParameterValue(string) {
        return encodeURIComponent(string);
    }
    exports.escapeParameterValue = escapeParameterValue;
    ;
    function encodeParameterPairs(key, values, plain) {
        let pairs = new Array();
        for (let value of values) {
            let serialized = serializeValue(value, plain);
            if (serialized !== undefined) {
                pairs.push([
                    escapeParameterKey(key),
                    escapeParameterValue(serialized)
                ]);
            }
        }
        return pairs;
    }
    exports.encodeParameterPairs = encodeParameterPairs;
    ;
    function encodeUndeclaredParameterPairs(record, exclude) {
        let pairs = new Array();
        for (let [key, value] of Object.entries(record)) {
            if (!exclude.includes(key) && value !== undefined) {
                if (guards.String.is(value)) {
                    pairs.push(...encodeParameterPairs(key, [value], true));
                }
                else if (guards.Array.of(guards.String).is(value)) {
                    pairs.push(...encodeParameterPairs(key, value, true));
                }
                else {
                    throw `Expected type of undeclared parameter "${key}" to be string or string[]!`;
                }
            }
        }
        return pairs;
    }
    exports.encodeUndeclaredParameterPairs = encodeUndeclaredParameterPairs;
    ;
    function decodeParameterValues(pairs, key, plain) {
        let values = new Array();
        for (let pair of pairs) {
            if (key === decodeURIComponent(pair[0])) {
                let parts = pair[1].split(",");
                for (let part of parts) {
                    let value = deserializeValue(decodeURIComponent(part), plain);
                    if (value === undefined) {
                        throw `Expected parameter "${key}" to be properly encoded!`;
                    }
                    values.push(value);
                }
            }
        }
        return values;
    }
    exports.decodeParameterValues = decodeParameterValues;
    ;
    function decodeParameterValue(pairs, key, plain) {
        let values = decodeParameterValues(pairs, key, plain);
        if (values.length > 1) {
            throw `Expected no more than one "${key}" parameter!`;
        }
        return values[0];
    }
    exports.decodeParameterValue = decodeParameterValue;
    ;
    function decodeUndeclaredParameters(pairs, exclude) {
        let map = {};
        for (let pair of pairs) {
            let key = decodeURIComponent(pair[0]);
            let value = decodeURIComponent(pair[1]);
            if (key === undefined || value === undefined) {
                throw `Expected undeclared parameter "${key}" to be properly encoded!`;
            }
            if (!exclude.includes(key)) {
                let values = map[key];
                if (values === undefined) {
                    values = new Array();
                    map[key] = values;
                }
                values.push(value);
            }
        }
        let record = {};
        for (let [key, value] of Object.entries(map)) {
            if (value.length === 1) {
                record[key] = value[0];
            }
            else {
                record[key] = value;
            }
        }
        return record;
    }
    exports.decodeUndeclaredParameters = decodeUndeclaredParameters;
    ;
    function decodeHeaderValues(pairs, key, plain) {
        let values = new Array();
        for (let pair of pairs) {
            if (key === decodeURIComponent(pair[0])) {
                let parts = pair[1].split(",");
                for (let part of parts) {
                    let value = deserializeValue(decodeURIComponent(part.trim()), plain);
                    if (value === undefined) {
                        throw `Expected header "${key}" to be properly encoded!`;
                    }
                    values.push(value);
                }
            }
        }
        return values;
    }
    exports.decodeHeaderValues = decodeHeaderValues;
    ;
    function decodeHeaderValue(pairs, key, plain) {
        let values = decodeHeaderValues(pairs, key, plain);
        if (values.length > 1) {
            throw `Expected no more than one "${key}" header!`;
        }
        return values[0];
    }
    exports.decodeHeaderValue = decodeHeaderValue;
    ;
    function decodeUndeclaredHeaders(pairs, exclude) {
        let map = {};
        for (let pair of pairs) {
            let key = decodeURIComponent(pair[0]);
            let value = decodeURIComponent(pair[1]);
            if (key === undefined || value === undefined) {
                throw `Expected undeclared header "${key}" to be properly encoded!`;
            }
            if (!exclude.includes(key)) {
                let values = map[key];
                if (values === undefined) {
                    values = new Array();
                    map[key] = values;
                }
                values.push(value);
            }
        }
        let record = {};
        for (let [key, value] of Object.entries(map)) {
            if (value.length === 1) {
                record[key] = value[0];
            }
            else {
                record[key] = value;
            }
        }
        return record;
    }
    exports.decodeUndeclaredHeaders = decodeUndeclaredHeaders;
    ;
    ;
    class StaticRouteMatcher {
        constructor(string) {
            this.string = string;
            this.accepted = false;
        }
        acceptComponent(component) {
            if (this.accepted) {
                return false;
            }
            this.accepted = component === this.string;
            return this.accepted;
        }
        getValue() {
            return this.string;
        }
        isSatisfied() {
            return this.accepted;
        }
    }
    exports.StaticRouteMatcher = StaticRouteMatcher;
    ;
    class DynamicRouteMatcher {
        constructor(minOccurences, maxOccurences, plain, guard) {
            this.minOccurences = minOccurences;
            this.maxOccurences = maxOccurences;
            this.plain = plain;
            this.guard = guard;
            this.values = new Array();
        }
        acceptComponent(component) {
            if (this.values.length >= this.maxOccurences) {
                return false;
            }
            try {
                let value = deserializeValue(component, this.plain);
                if (this.guard.is(value)) {
                    this.values.push(value);
                    return true;
                }
            }
            catch (error) { }
            return false;
        }
        getValue() {
            if (this.maxOccurences === 1) {
                return this.values[0];
            }
            else {
                return this.values;
            }
        }
        isSatisfied() {
            return this.minOccurences <= this.values.length && this.values.length <= this.maxOccurences;
        }
    }
    exports.DynamicRouteMatcher = DynamicRouteMatcher;
    ;
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
    exports.JSON = guards.Group.of(guards.Union.of(guards.Boolean, guards.Null, guards.Number, guards.String, guards.Array.of(guards.Reference.of(() => exports.JSON)), guards.Record.of(guards.Reference.of(() => exports.JSON)), guards.Undefined), "JSON");
    exports.Options = guards.Record.of(exports.JSON);
    exports.Headers = guards.Record.of(exports.JSON);
    function serializeValue(value, plain) {
        if (value === undefined) {
            return;
        }
        return plain ? String(value) : globalThis.JSON.stringify(value);
    }
    exports.serializeValue = serializeValue;
    ;
    function deserializeValue(value, plain) {
        if (value === undefined || plain) {
            return value;
        }
        try {
            return globalThis.JSON.parse(value);
        }
        catch (error) { }
    }
    exports.deserializeValue = deserializeValue;
    ;
    class ClientRequest {
        constructor(request, collect, auxillary) {
            this.request = request;
            this.collect = collect;
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
                let collectedPayload = (this.collect ? yield collectPayload(payload) : payload);
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
        constructor(response, collect) {
            this.response = response;
            this.collect = collect;
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
                let collectedPayload = (this.collect ? yield collectPayload(payload) : payload);
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
        let serialized = serializeValue(payload, false);
        if (serialized === undefined) {
            return [];
        }
        return serializeStringPayload(serialized);
    }
    exports.serializePayload = serializePayload;
    ;
    function compareArrays(one, two) {
        if (one.length !== two.length) {
            return false;
        }
        for (let i = 0; i < one.length; i++) {
            if (one[i] !== two[i]) {
                return false;
            }
        }
        return true;
    }
    exports.compareArrays = compareArrays;
    ;
    function deserializeStringPayload(binary) {
        return __awaiter(this, void 0, void 0, function* () {
            let buffer = yield collectPayload(binary);
            let decoder = new TextDecoder();
            let string = decoder.decode(buffer);
            let encoder = new TextEncoder();
            let encoded = encoder.encode(string);
            if (!compareArrays(buffer, encoded)) {
                throw `Expected payload to be UTF-8 encoded!`;
            }
            return string;
        });
    }
    exports.deserializeStringPayload = deserializeStringPayload;
    ;
    function deserializePayload(binary) {
        return __awaiter(this, void 0, void 0, function* () {
            let string = yield deserializeStringPayload(binary);
            if (string === "") {
                return;
            }
            let value = deserializeValue(string, false);
            if (value === undefined) {
                throw `Expected payload to be JSON encoded!`;
            }
            return value;
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
    function acceptsComponents(components, matchers) {
        let currentMatcher = 0;
        outer: for (let component of components) {
            let decoded = decodeURIComponent(component);
            if (decoded === undefined) {
                throw `Expected component to be properly encoded!`;
            }
            inner: for (let matcher of matchers.slice(currentMatcher)) {
                if (matcher.acceptComponent(decoded)) {
                    continue outer;
                }
                else {
                    if (matcher.isSatisfied()) {
                        currentMatcher += 1;
                        continue inner;
                    }
                    else {
                        break outer;
                    }
                }
            }
            break outer;
        }
        if (currentMatcher >= matchers.length) {
            return false;
        }
        for (let matcher of matchers.slice(currentMatcher)) {
            if (!matcher.isSatisfied()) {
                return false;
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
                // Header values for the same header name are joined by he XHR implementation.
                let headers = splitHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
                let payload = [new Uint8Array(xhr.response)];
                resolve({
                    status,
                    headers,
                    payload
                });
            };
            let url = urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "";
            url += combineComponents(raw.components);
            url += combineParameters(raw.parameters);
            xhr.open(raw.method, url, true);
            xhr.responseType = "arraybuffer";
            for (let header of raw.headers) {
                // Header values for the same header name are joined by he XHR implementation.
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
                    let key = header[0];
                    let value = header[1];
                    let values = headers[key];
                    if (values === undefined) {
                        values = new Array();
                        headers[key] = values;
                    }
                    values.push(value);
                }
                let url = urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "";
                url += combineComponents(raw.components);
                url += combineParameters(raw.parameters);
                let request = lib.request(url, Object.assign(Object.assign({}, options), { method: raw.method, headers: headers }), (response) => {
                    var _a;
                    let status = (_a = response.statusCode) !== null && _a !== void 0 ? _a : 200;
                    let headers = splitHeaders(combineRawHeaders(response.rawHeaders));
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
        var _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let rawHeaders = new Array();
            for (let header of (_b = raw.headers) !== null && _b !== void 0 ? _b : []) {
                rawHeaders.push(...header);
            }
            httpResponse.writeHead((_c = raw.status) !== null && _c !== void 0 ? _c : 200, rawHeaders);
            try {
                for (var _e = __asyncValues((_d = raw.payload) !== null && _d !== void 0 ? _d : []), _f; _f = yield _e.next(), !_f.done;) {
                    let chunk = _f.value;
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
                    if (_f && !_f.done && (_a = _e.return))
                        yield _a.call(_e);
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
            try {
                let components = splitComponents(url);
                let parameters = splitParameters(url);
                let headers = splitHeaders(combineRawHeaders(httpRequest.rawHeaders));
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
                        status: 404
                    });
                }
                filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.acceptsMethod());
                if (filteredEndpoints.length === 0) {
                    return respond(httpResponse, {
                        status: 405
                    });
                }
                let endpoint = filteredEndpoints[0];
                let valid = yield endpoint.validateRequest();
                try {
                    let handled = yield valid.handleRequest();
                    try {
                        let raw = yield handled.validateResponse();
                        return yield respond(httpResponse, raw);
                    }
                    catch (error) {
                        return respond(httpResponse, {
                            status: 500,
                            payload: serializeStringPayload(String(error))
                        });
                    }
                }
                catch (error) {
                    if (Number.isInteger(error) && error >= 100 && error <= 999) {
                        return respond(httpResponse, {
                            status: error
                        });
                    }
                    if (error instanceof EndpointError) {
                        let raw = error.getResponse();
                        return respond(httpResponse, raw);
                    }
                    return respond(httpResponse, {
                        status: 500
                    });
                }
            }
            catch (error) {
                return respond(httpResponse, {
                    status: 400,
                    payload: serializeStringPayload(String(error))
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
                "options": autoguard.guards.Intersection.of(autoguard.guards.Object.of({
                    "food_id": autoguard.guards.Number
                }), autoguard.api.Options),
                "headers": autoguard.guards.Union.of(autoguard.guards.Intersection.of(autoguard.guards.Object.of({}), autoguard.api.Headers), autoguard.guards.Undefined),
                "payload": autoguard.guards.Union.of(autoguard.api.Binary, autoguard.guards.Undefined)
            }),
            "getStaticContent": autoguard.guards.Object.of({
                "options": autoguard.guards.Union.of(autoguard.guards.Intersection.of(autoguard.guards.Object.of({
                    "filename": autoguard.guards.Union.of(autoguard.guards.Array.of(autoguard.guards.String), autoguard.guards.Undefined)
                }), autoguard.api.Options), autoguard.guards.Undefined),
                "headers": autoguard.guards.Union.of(autoguard.guards.Intersection.of(autoguard.guards.Object.of({}), autoguard.api.Headers), autoguard.guards.Undefined),
                "payload": autoguard.guards.Union.of(autoguard.api.Binary, autoguard.guards.Undefined)
            })
        };
        Autoguard.Responses = {
            "getFood": autoguard.guards.Object.of({
                "status": autoguard.guards.Union.of(autoguard.guards.Number, autoguard.guards.Undefined),
                "headers": autoguard.guards.Union.of(autoguard.guards.Intersection.of(autoguard.guards.Object.of({}), autoguard.api.Headers), autoguard.guards.Undefined),
                "payload": autoguard.guards.Object.of({
                    "food": autoguard.guards.Reference.of(() => exports.Food)
                })
            }),
            "getStaticContent": autoguard.guards.Object.of({
                "status": autoguard.guards.Union.of(autoguard.guards.Number, autoguard.guards.Undefined),
                "headers": autoguard.guards.Union.of(autoguard.guards.Intersection.of(autoguard.guards.Object.of({}), autoguard.api.Headers), autoguard.guards.Undefined),
                "payload": autoguard.guards.Union.of(autoguard.api.Binary, autoguard.guards.Undefined)
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
        endpoints.push((raw, auxillary) => {
            let method = "GET";
            let matchers = new Array();
            matchers.push(new autoguard.api.StaticRouteMatcher(decodeURIComponent("food")));
            matchers.push(new autoguard.api.DynamicRouteMatcher(1, 1, false, autoguard.guards.Number));
            matchers.push(new autoguard.api.StaticRouteMatcher(decodeURIComponent("")));
            return {
                acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),
                acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
                validateRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b;
                    let options = {};
                    options["food_id"] = matchers[1].getValue();
                    options = Object.assign(Object.assign({}, options), autoguard.api.decodeUndeclaredParameters((_a = raw.parameters) !== null && _a !== void 0 ? _a : {}, Object.keys(options)));
                    let headers = {};
                    headers = Object.assign(Object.assign({}, headers), autoguard.api.decodeUndeclaredHeaders((_b = raw.headers) !== null && _b !== void 0 ? _b : {}, Object.keys(headers)));
                    let payload = raw.payload;
                    let guard = shared.Autoguard.Requests["getFood"];
                    let request = guard.as({ options, headers, payload }, "request");
                    return {
                        handleRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                            let response = yield routes["getFood"](new autoguard.api.ClientRequest(request, true, auxillary));
                            return {
                                validateResponse: () => __awaiter(void 0, void 0, void 0, function* () {
                                    var _c, _d;
                                    let guard = shared.Autoguard.Responses["getFood"];
                                    guard.as(response, "response");
                                    let status = (_c = response.status) !== null && _c !== void 0 ? _c : 200;
                                    let headers = new Array();
                                    headers.push(...autoguard.api.encodeUndeclaredHeaderPairs((_d = response.headers) !== null && _d !== void 0 ? _d : {}, headers.map((header) => header[0])));
                                    let payload = autoguard.api.serializePayload(response.payload);
                                    return autoguard.api.finalizeResponse({ status, headers, payload }, "application/json; charset=utf-8");
                                })
                            };
                        })
                    };
                })
            };
        });
        endpoints.push((raw, auxillary) => {
            let method = "GET";
            let matchers = new Array();
            matchers.push(new autoguard.api.DynamicRouteMatcher(0, Infinity, true, autoguard.guards.String));
            return {
                acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),
                acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
                validateRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b;
                    let options = {};
                    options["filename"] = matchers[0].getValue();
                    options = Object.assign(Object.assign({}, options), autoguard.api.decodeUndeclaredParameters((_a = raw.parameters) !== null && _a !== void 0 ? _a : {}, Object.keys(options)));
                    let headers = {};
                    headers = Object.assign(Object.assign({}, headers), autoguard.api.decodeUndeclaredHeaders((_b = raw.headers) !== null && _b !== void 0 ? _b : {}, Object.keys(headers)));
                    let payload = raw.payload;
                    let guard = shared.Autoguard.Requests["getStaticContent"];
                    let request = guard.as({ options, headers, payload }, "request");
                    return {
                        handleRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                            let response = yield routes["getStaticContent"](new autoguard.api.ClientRequest(request, true, auxillary));
                            return {
                                validateResponse: () => __awaiter(void 0, void 0, void 0, function* () {
                                    var _c, _d, _e;
                                    let guard = shared.Autoguard.Responses["getStaticContent"];
                                    guard.as(response, "response");
                                    let status = (_c = response.status) !== null && _c !== void 0 ? _c : 200;
                                    let headers = new Array();
                                    headers.push(...autoguard.api.encodeUndeclaredHeaderPairs((_d = response.headers) !== null && _d !== void 0 ? _d : {}, headers.map((header) => header[0])));
                                    let payload = (_e = response.payload) !== null && _e !== void 0 ? _e : [];
                                    return autoguard.api.finalizeResponse({ status, headers, payload }, "application/octet-stream");
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
        getFood: (request) => __awaiter(void 0, void 0, void 0, function* () {
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
        getStaticContent: (request) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            let options = request.options();
            return autoguard.api.makeReadStreamResponse("./dist/client/", ((_a = options.filename) !== null && _a !== void 0 ? _a : []).join("/"), request);
        })
    }, { urlPrefix: "" }));
    httpServer.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}/ ...`);
    });
});
function define(e,t,l){null==this.x&&(this.x=new Map),null==this.z&&(this.z=(e=>require(e))),null==this.y&&(this.y=(e=>{let t=this.x.get(e);if(null==t||null!=t.module)return;let l=Array(),u={exports:{}};for(let e of t.dependencies){if("require"===e){l.push(this.z);continue}if("module"===e){l.push(u);continue}if("exports"===e){l.push(u.exports);continue}try{l.push(this.z(e));continue}catch(e){}let t=this.x.get(e);if(null==t||null==t.module)return;l.push(t.module.exports)}t.callback(...l),t.module=u;for(let e of t.dependencies)this.y(e)}));let u=this.x.get(e);if(null!=u)throw'Duplicate module found with name "'+e+'"!';u={callback:l,dependencies:t,module:null},this.x.set(e,u),this.y(e)}