var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define("node_modules/@joelek/ts-autoguard/dist/lib-shared/serialization", ["require", "exports"], function (require, exports) {
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
define("node_modules/@joelek/ts-autoguard/dist/lib-shared/guards", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-shared/serialization"], function (require, exports, serialization) {
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
define("node_modules/@joelek/ts-autoguard/dist/lib-shared/api", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-shared/guards"], function (require, exports, guards) {
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
    exports.deserializePayload = exports.deserializeStringPayload = exports.compareArrays = exports.serializePayload = exports.serializeStringPayload = exports.collectPayload = exports.deserializeValue = exports.serializeValue = exports.Headers = exports.Options = exports.JSON = exports.Primitive = exports.Binary = exports.SyncBinary = exports.AsyncBinary = exports.decodeUndeclaredHeaders = exports.decodeHeaderValue = exports.decodeHeaderValues = exports.decodeUndeclaredParameters = exports.decodeParameterValue = exports.decodeParameterValues = exports.encodeUndeclaredParameterPairs = exports.encodeParameterPairs = exports.escapeParameterValue = exports.escapeParameterKey = exports.encodeComponents = exports.escapeComponent = exports.encodeUndeclaredHeaderPairs = exports.encodeHeaderPairs = exports.escapeHeaderValue = exports.escapeHeaderKey = exports.splitHeaders = exports.combineParameters = exports.splitParameters = exports.combineComponents = exports.splitComponents = exports.decodeURIComponent = void 0;
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
        // @ts-ignore
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
            // @ts-ignore
            let decoder = new TextDecoder();
            let string = decoder.decode(buffer);
            // @ts-ignore
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
});
define("node_modules/@joelek/ts-autoguard/dist/lib-shared/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-shared/api", "node_modules/@joelek/ts-autoguard/dist/lib-shared/guards", "node_modules/@joelek/ts-autoguard/dist/lib-shared/serialization"], function (require, exports, api, guards, serialization) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serialization = exports.guards = exports.api = void 0;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serialization = exports.guards = exports.api = void 0;
    exports.api = api;
    exports.guards = guards;
    exports.serialization = serialization;
});
define("node_modules/@joelek/ts-autoguard/dist/lib-client/api", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-shared/index", "node_modules/@joelek/ts-autoguard/dist/lib-shared/api"], function (require, exports, shared, api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    }));
    var __exportStar = (this && this.__exportStar) || function (m, exports) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
                __createBinding(exports, m, p);
    };
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
    exports.finalizeRequest = exports.xhr = exports.ServerResponse = void 0;
    __exportStar(api_1, exports);
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
                let collectedPayload = (this.collect ? yield shared.api.collectPayload(payload) : payload);
                this.collectedPayload = collectedPayload;
                return collectedPayload;
            });
        }
    }
    exports.ServerResponse = ServerResponse;
    ;
    function xhr(raw, urlPrefix) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            let xhr = new XMLHttpRequest();
            xhr.onerror = reject;
            xhr.onabort = reject;
            xhr.onload = () => {
                let status = xhr.status;
                // Header values for the same header name are joined by he XHR implementation.
                let headers = shared.api.splitHeaders(xhr.getAllResponseHeaders().split("\r\n").slice(0, -1));
                let payload = [new Uint8Array(xhr.response)];
                resolve({
                    status,
                    headers,
                    payload
                });
            };
            let url = urlPrefix !== null && urlPrefix !== void 0 ? urlPrefix : "";
            url += shared.api.combineComponents(raw.components);
            url += shared.api.combineParameters(raw.parameters);
            xhr.open(raw.method, url, true);
            xhr.responseType = "arraybuffer";
            for (let header of raw.headers) {
                // Header values for the same header name are joined by he XHR implementation.
                xhr.setRequestHeader(header[0], header[1]);
            }
            xhr.send(yield shared.api.collectPayload(raw.payload));
        }));
    }
    exports.xhr = xhr;
    ;
    function finalizeRequest(raw, defaultHeaders) {
        let headersToAppend = defaultHeaders.filter((defaultHeader) => {
            let found = raw.headers.find((header) => header[0].toLowerCase() === defaultHeader[0].toLowerCase());
            return found === undefined;
        });
        return Object.assign(Object.assign({}, raw), { headers: [
                ...raw.headers,
                ...headersToAppend
            ] });
    }
    exports.finalizeRequest = finalizeRequest;
    ;
});
define("node_modules/@joelek/ts-autoguard/dist/lib-client/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-shared/index", "node_modules/@joelek/ts-autoguard/dist/lib-client/api"], function (require, exports, lib_shared_1, api) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.api = void 0;
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    }));
    var __exportStar = (this && this.__exportStar) || function (m, exports) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
                __createBinding(exports, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.api = void 0;
    __exportStar(lib_shared_1, exports);
    exports.api = api;
});
define("build/shared/api/index", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-shared/index"], function (require, exports, autoguard) {
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
define("build/shared/api/client", ["require", "exports", "node_modules/@joelek/ts-autoguard/dist/lib-client/index", "build/shared/api/index"], function (require, exports, autoguard, shared) {
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
    const makeClient = (clientOptions) => ({
        "getFood": (request) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            let guard = shared.Autoguard.Requests["getFood"];
            guard.as(request, "request");
            let method = "GET";
            let components = new Array();
            components.push("food");
            components.push(...autoguard.api.encodeComponents([(_a = request.options) === null || _a === void 0 ? void 0 : _a["food_id"]], false));
            components.push("");
            let parameters = new Array();
            parameters.push(...autoguard.api.encodeUndeclaredParameterPairs((_b = request.options) !== null && _b !== void 0 ? _b : {}, [...["food_id"], ...parameters.map((parameter) => parameter[0])]));
            let headers = new Array();
            headers.push(...autoguard.api.encodeUndeclaredHeaderPairs((_c = request.headers) !== null && _c !== void 0 ? _c : {}, headers.map((header) => header[0])));
            let payload = (_d = request.payload) !== null && _d !== void 0 ? _d : [];
            let requestHandler = (_e = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.requestHandler) !== null && _e !== void 0 ? _e : autoguard.api.xhr;
            let defaultHeaders = (_g = (_f = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.defaultHeaders) === null || _f === void 0 ? void 0 : _f.slice()) !== null && _g !== void 0 ? _g : [];
            defaultHeaders.push(["Content-Type", "application/octet-stream"]);
            defaultHeaders.push(["Accept", "application/json; charset=utf-8"]);
            let raw = yield requestHandler(autoguard.api.finalizeRequest({ method, components, parameters, headers, payload }, defaultHeaders), clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.urlPrefix);
            {
                let status = raw.status;
                let headers = {};
                headers = Object.assign(Object.assign({}, headers), autoguard.api.decodeUndeclaredHeaders((_h = raw.headers) !== null && _h !== void 0 ? _h : {}, Object.keys(headers)));
                let payload = yield autoguard.api.deserializePayload(raw.payload);
                let guard = shared.Autoguard.Responses["getFood"];
                let response = guard.as({ status, headers, payload }, "response");
                return new autoguard.api.ServerResponse(response, false);
            }
        }),
        "getStaticContent": (request) => __awaiter(void 0, void 0, void 0, function* () {
            var _j, _k, _l, _m, _o, _p, _q, _r, _s;
            let guard = shared.Autoguard.Requests["getStaticContent"];
            guard.as(request, "request");
            let method = "GET";
            let components = new Array();
            components.push(...autoguard.api.encodeComponents((_k = (_j = request.options) === null || _j === void 0 ? void 0 : _j["filename"]) !== null && _k !== void 0 ? _k : [], true));
            let parameters = new Array();
            parameters.push(...autoguard.api.encodeUndeclaredParameterPairs((_l = request.options) !== null && _l !== void 0 ? _l : {}, [...["filename"], ...parameters.map((parameter) => parameter[0])]));
            let headers = new Array();
            headers.push(...autoguard.api.encodeUndeclaredHeaderPairs((_m = request.headers) !== null && _m !== void 0 ? _m : {}, headers.map((header) => header[0])));
            let payload = (_o = request.payload) !== null && _o !== void 0 ? _o : [];
            let requestHandler = (_p = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.requestHandler) !== null && _p !== void 0 ? _p : autoguard.api.xhr;
            let defaultHeaders = (_r = (_q = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.defaultHeaders) === null || _q === void 0 ? void 0 : _q.slice()) !== null && _r !== void 0 ? _r : [];
            defaultHeaders.push(["Content-Type", "application/octet-stream"]);
            defaultHeaders.push(["Accept", "application/octet-stream"]);
            let raw = yield requestHandler(autoguard.api.finalizeRequest({ method, components, parameters, headers, payload }, defaultHeaders), clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.urlPrefix);
            {
                let status = raw.status;
                let headers = {};
                headers = Object.assign(Object.assign({}, headers), autoguard.api.decodeUndeclaredHeaders((_s = raw.headers) !== null && _s !== void 0 ? _s : {}, Object.keys(headers)));
                let payload = raw.payload;
                let guard = shared.Autoguard.Responses["getStaticContent"];
                let response = guard.as({ status, headers, payload }, "response");
                return new autoguard.api.ServerResponse(response, true);
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
function define(e,t,l){let n=define;function u(e){return require(e)}null==n.moduleStates&&(n.moduleStates=new Map),null==n.dependentsMap&&(n.dependentsMap=new Map);let d=n.moduleStates.get(e);if(null!=d)throw"Duplicate module found with name "+e+"!";d={callback:l,dependencies:t,module:null},n.moduleStates.set(e,d);for(let l of t){let t=n.dependentsMap.get(l);null==t&&(t=new Set,n.dependentsMap.set(l,t)),t.add(e)}!function e(t){let l=n.moduleStates.get(t);if(null==l||null!=l.module)return;let d=Array(),o={exports:{}};for(let e of l.dependencies){if("require"===e){d.push(u);continue}if("module"===e){d.push(o);continue}if("exports"===e){d.push(o.exports);continue}try{d.push(u(e));continue}catch(e){}let t=n.moduleStates.get(e);if(null==t||null==t.module)return;d.push(t.module.exports)}l.callback(...d),l.module=o;let p=n.dependentsMap.get(t);if(null!=p)for(let t of p)e(t)}(e)}