var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define("node_modules/@joelek/autoguard/dist/lib-shared/serialization", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageSerializer = exports.MessageGuardError = exports.MessageGuardBase = void 0;
    ;
    class MessageGuardBase {
        constructor() { }
        is(subject, path) {
            try {
                this.as(subject, path);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        decode(codec, buffer) {
            return this.as(codec.decode(buffer));
        }
        encode(codec, subject) {
            return codec.encode(this.as(subject));
        }
    }
    exports.MessageGuardBase = MessageGuardBase;
    ;
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
                        throw "Unknown message type \"" + String(type) + "\"!";
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
define("node_modules/@joelek/autoguard/dist/lib-shared/guards", ["require", "exports", "node_modules/@joelek/autoguard/dist/lib-shared/serialization"], function (require, exports, serialization) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Union = exports.UnionGuard = exports.Undefined = exports.UndefinedGuard = exports.Tuple = exports.TupleGuard = exports.StringLiteral = exports.StringLiteralGuard = exports.String = exports.StringGuard = exports.Reference = exports.ReferenceGuard = exports.Key = exports.KeyGuard = exports.Record = exports.RecordGuard = exports.Object = exports.ObjectGuard = exports.NumberLiteral = exports.NumberLiteralGuard = exports.Number = exports.NumberGuard = exports.Null = exports.NullGuard = exports.Intersection = exports.IntersectionGuard = exports.IntegerLiteral = exports.IntegerLiteralGuard = exports.Integer = exports.IntegerGuard = exports.Group = exports.GroupGuard = exports.BooleanLiteral = exports.BooleanLiteralGuard = exports.Boolean = exports.BooleanGuard = exports.Binary = exports.BinaryGuard = exports.BigInt = exports.BigIntGuard = exports.Array = exports.ArrayGuard = exports.Any = exports.AnyGuard = void 0;
    class AnyGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            return subject;
        }
        ts(eol = "\n") {
            return "any";
        }
    }
    exports.AnyGuard = AnyGuard;
    ;
    exports.Any = new AnyGuard();
    class ArrayGuard extends serialization.MessageGuardBase {
        constructor(guard) {
            super();
            this.guard = guard;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Array)) {
                for (let i = 0; i < subject.length; i++) {
                    this.guard.as(subject[i], path + "[" + i + "]");
                }
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `array<${this.guard.ts(eol)}>`;
        }
    }
    exports.ArrayGuard = ArrayGuard;
    ;
    exports.Array = {
        of(guard) {
            return new ArrayGuard(guard);
        }
    };
    class BigIntGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.BigInt)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "bigint";
        }
    }
    exports.BigIntGuard = BigIntGuard;
    ;
    exports.BigInt = new BigIntGuard();
    class BinaryGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if ((subject != null) && (subject instanceof Uint8Array)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "binary";
        }
    }
    exports.BinaryGuard = BinaryGuard;
    ;
    exports.Binary = new BinaryGuard();
    class BooleanGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Boolean)) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "boolean";
        }
    }
    exports.BooleanGuard = BooleanGuard;
    ;
    exports.Boolean = new BooleanGuard();
    class BooleanLiteralGuard extends serialization.MessageGuardBase {
        constructor(value) {
            super();
            this.value = value;
        }
        as(subject, path = "") {
            if (subject === this.value) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `${this.value}`;
        }
    }
    exports.BooleanLiteralGuard = BooleanLiteralGuard;
    ;
    exports.BooleanLiteral = {
        of(value) {
            return new BooleanLiteralGuard(value);
        }
    };
    class GroupGuard extends serialization.MessageGuardBase {
        constructor(guard, name) {
            super();
            this.guard = guard;
            this.name = name;
        }
        as(subject, path = "") {
            return this.guard.as(subject, path);
        }
        ts(eol = "\n") {
            var _a;
            return (_a = this.name) !== null && _a !== void 0 ? _a : this.guard.ts(eol);
        }
    }
    exports.GroupGuard = GroupGuard;
    ;
    exports.Group = {
        of(guard, name) {
            return new GroupGuard(guard, name);
        }
    };
    class IntegerGuard extends serialization.MessageGuardBase {
        constructor(min, max) {
            super();
            this.min = min;
            this.max = max;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Number) && globalThis.Number.isInteger(subject)) {
                let number = subject;
                if (this.min != null && number < this.min) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                if (this.max != null && number > this.max) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                return number;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            var _a, _b;
            if (this.min == null && this.max == null) {
                return "integer";
            }
            else {
                return `integer(${(_a = this.min) !== null && _a !== void 0 ? _a : "*"}, ${(_b = this.max) !== null && _b !== void 0 ? _b : "*"})`;
            }
        }
    }
    exports.IntegerGuard = IntegerGuard;
    ;
    exports.Integer = new IntegerGuard();
    class IntegerLiteralGuard extends serialization.MessageGuardBase {
        constructor(value) {
            super();
            this.value = value;
        }
        as(subject, path = "") {
            if (subject === this.value) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `${this.value}`;
        }
    }
    exports.IntegerLiteralGuard = IntegerLiteralGuard;
    ;
    exports.IntegerLiteral = {
        of(value) {
            return new IntegerLiteralGuard(value);
        }
    };
    class IntersectionGuard extends serialization.MessageGuardBase {
        constructor(...guards) {
            super();
            this.guards = guards;
        }
        as(subject, path = "") {
            for (let guard of this.guards) {
                guard.as(subject, path);
            }
            return subject;
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let guard of this.guards) {
                lines.push("\t" + guard.ts(eol + "\t"));
            }
            return lines.length === 0 ? "intersection<>" : "intersection<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.IntersectionGuard = IntersectionGuard;
    ;
    exports.Intersection = {
        of(...guards) {
            return new IntersectionGuard(...guards);
        }
    };
    class NullGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if (subject === null) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "null";
        }
    }
    exports.NullGuard = NullGuard;
    ;
    exports.Null = new NullGuard();
    class NumberGuard extends serialization.MessageGuardBase {
        constructor(min, max) {
            super();
            this.min = min;
            this.max = max;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Number)) {
                let number = subject;
                if (this.min != null && number < this.min) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                if (this.max != null && number > this.max) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                return number;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            var _a, _b;
            if (this.min == null && this.max == null) {
                return "number";
            }
            else {
                return `number(${(_a = this.min) !== null && _a !== void 0 ? _a : "*"}, ${(_b = this.max) !== null && _b !== void 0 ? _b : "*"})`;
            }
        }
    }
    exports.NumberGuard = NumberGuard;
    ;
    exports.Number = new NumberGuard();
    class NumberLiteralGuard extends serialization.MessageGuardBase {
        constructor(value) {
            super();
            this.value = value;
        }
        as(subject, path = "") {
            if (subject === this.value) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `${this.value}`;
        }
    }
    exports.NumberLiteralGuard = NumberLiteralGuard;
    ;
    exports.NumberLiteral = {
        of(value) {
            return new NumberLiteralGuard(value);
        }
    };
    class ObjectGuard extends serialization.MessageGuardBase {
        constructor(required, optional) {
            super();
            this.required = required;
            this.optional = optional;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Object)) {
                for (let key in this.required) {
                    this.required[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
                }
                for (let key in this.optional) {
                    if (key in subject && subject[key] !== undefined) {
                        this.optional[key].as(subject[key], path + (/^([a-z][a-z0-9_]*)$/isu.test(key) ? "." + key : "[\"" + key + "\"]"));
                    }
                }
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let [key, value] of globalThis.Object.entries(this.required)) {
                lines.push(`\t"${key}": ${value.ts(eol + "\t")}`);
            }
            for (let [key, value] of globalThis.Object.entries(this.optional)) {
                lines.push(`\t"${key}"?: ${value.ts(eol + "\t")}`);
            }
            return lines.length === 0 ? "object<>" : "object<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.ObjectGuard = ObjectGuard;
    ;
    exports.Object = {
        of(required, optional = {}) {
            return new ObjectGuard(required, optional);
        }
    };
    class RecordGuard extends serialization.MessageGuardBase {
        constructor(guard) {
            super();
            this.guard = guard;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Object)) {
                let wrapped = exports.Union.of(exports.Undefined, this.guard);
                for (let key of globalThis.Object.keys(subject)) {
                    wrapped.as(subject[key], path + "[\"" + key + "\"]");
                }
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `record<${this.guard.ts(eol)}>`;
        }
    }
    exports.RecordGuard = RecordGuard;
    ;
    exports.Record = {
        of(guard) {
            return new RecordGuard(guard);
        }
    };
    class KeyGuard extends serialization.MessageGuardBase {
        constructor(record) {
            super();
            this.record = record;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.String || subject.constructor === globalThis.Number)) {
                let string = subject;
                if (string in this.record) {
                    return string;
                }
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let key of globalThis.Object.keys(this.record)) {
                lines.push(`\t"${key}"`);
            }
            return lines.length === 0 ? "key<>" : "key<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.KeyGuard = KeyGuard;
    ;
    exports.Key = {
        of(record) {
            return new KeyGuard(record);
        }
    };
    class ReferenceGuard extends serialization.MessageGuardBase {
        constructor(guard) {
            super();
            this.guard = guard;
        }
        as(subject, path = "") {
            return this.guard().as(subject, path);
        }
        ts(eol = "\n") {
            return this.guard().ts(eol);
        }
    }
    exports.ReferenceGuard = ReferenceGuard;
    ;
    exports.Reference = {
        of(guard) {
            return new ReferenceGuard(guard);
        }
    };
    class StringGuard extends serialization.MessageGuardBase {
        constructor(pattern) {
            super();
            this.pattern = pattern;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.String)) {
                let string = subject;
                if (this.pattern != null && !this.pattern.test(string)) {
                    throw new serialization.MessageGuardError(this, subject, path);
                }
                return string;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            if (this.pattern == null) {
                return "string";
            }
            else {
                let pattern = this.pattern != null ? `"${this.pattern.source}"` : "*";
                return `string(${pattern})`;
            }
        }
    }
    exports.StringGuard = StringGuard;
    ;
    exports.String = new StringGuard();
    class StringLiteralGuard extends serialization.MessageGuardBase {
        constructor(value) {
            super();
            this.value = value;
        }
        as(subject, path = "") {
            if (subject === this.value) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return `"${this.value}"`;
        }
    }
    exports.StringLiteralGuard = StringLiteralGuard;
    ;
    exports.StringLiteral = {
        of(value) {
            return new StringLiteralGuard(value);
        }
    };
    class TupleGuard extends serialization.MessageGuardBase {
        constructor(...guards) {
            super();
            this.guards = guards;
        }
        as(subject, path = "") {
            if ((subject != null) && (subject.constructor === globalThis.Array)) {
                for (let i = 0; i < this.guards.length; i++) {
                    this.guards[i].as(subject[i], path + "[" + i + "]");
                }
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let guard of this.guards) {
                lines.push(`\t${guard.ts(eol + "\t")}`);
            }
            return lines.length === 0 ? "tuple<>" : "tuple<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.TupleGuard = TupleGuard;
    ;
    exports.Tuple = {
        of(...guards) {
            return new TupleGuard(...guards);
        }
    };
    class UndefinedGuard extends serialization.MessageGuardBase {
        constructor() {
            super();
        }
        as(subject, path = "") {
            if (subject === undefined) {
                return subject;
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            return "undefined";
        }
    }
    exports.UndefinedGuard = UndefinedGuard;
    ;
    exports.Undefined = new UndefinedGuard();
    class UnionGuard extends serialization.MessageGuardBase {
        constructor(...guards) {
            super();
            this.guards = guards;
        }
        as(subject, path = "") {
            for (let guard of this.guards) {
                try {
                    return guard.as(subject, path);
                }
                catch (error) { }
            }
            throw new serialization.MessageGuardError(this, subject, path);
        }
        ts(eol = "\n") {
            let lines = new globalThis.Array();
            for (let guard of this.guards) {
                lines.push("\t" + guard.ts(eol + "\t"));
            }
            return lines.length === 0 ? "union<>" : "union<" + eol + lines.join("," + eol) + eol + ">";
        }
    }
    exports.UnionGuard = UnionGuard;
    ;
    exports.Union = {
        of(...guards) {
            return new UnionGuard(...guards);
        }
    };
});
define("node_modules/@joelek/autoguard/dist/lib-shared/api", ["require", "exports", "node_modules/@joelek/autoguard/dist/lib-shared/guards"], function (require, exports, guards) {
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
    exports.wrapMessageGuard = exports.deserializePayload = exports.deserializeStringPayload = exports.compareArrays = exports.serializePayload = exports.serializeStringPayload = exports.collectPayload = exports.deserializeValue = exports.serializeValue = exports.Headers = exports.Options = exports.JSON = exports.Primitive = exports.Binary = exports.SyncBinary = exports.AsyncBinary = exports.decodeUndeclaredHeaders = exports.decodeHeaderValue = exports.decodeHeaderValues = exports.decodeUndeclaredParameters = exports.decodeParameterValue = exports.decodeParameterValues = exports.encodeUndeclaredParameterPairs = exports.encodeParameterPairs = exports.escapeParameterValue = exports.escapeParameterKey = exports.encodeComponents = exports.escapeComponent = exports.encodeUndeclaredHeaderPairs = exports.encodeHeaderPairs = exports.escapeHeaderValue = exports.escapeHeaderKey = exports.splitHeaders = exports.combineParameters = exports.splitParameters = exports.combineComponents = exports.splitComponents = exports.decodeURIComponent = void 0;
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
    function collectPayload(binary, maxByteLength) {
        var _a, binary_1, binary_1_1;
        var _b, e_1, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            maxByteLength = maxByteLength !== null && maxByteLength !== void 0 ? maxByteLength : Infinity;
            let chunks = new Array();
            let length = 0;
            try {
                for (_a = true, binary_1 = __asyncValues(binary); binary_1_1 = yield binary_1.next(), _b = binary_1_1.done, !_b;) {
                    _d = binary_1_1.value;
                    _a = false;
                    try {
                        let chunk = _d;
                        chunks.push(chunk);
                        length += chunk.length;
                        if (length > maxByteLength) {
                            throw `Expected payload to contain at most ${maxByteLength} bytes!`;
                        }
                    }
                    finally {
                        _a = true;
                    }
                }
            }
            catch (e_1_1) {
                e_1 = { error: e_1_1 };
            }
            finally {
                try {
                    if (!_a && !_b && (_c = binary_1.return))
                        yield _c.call(binary_1);
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
    function wrapMessageGuard(guard, log) {
        return Object.assign(Object.assign({}, guard), { as(subject, path) {
                if (log) {
                    console.log(subject);
                }
                return guard.as(subject, path);
            } });
    }
    exports.wrapMessageGuard = wrapMessageGuard;
    ;
});
define("node_modules/@joelek/stdlib/dist/lib/asserts/integer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegerAssert = void 0;
    class IntegerAssert {
        constructor() { }
        static atLeast(min, value) {
            this.integer(min);
            this.integer(value);
            if (value < min) {
                throw new Error(`Expected ${value} to be at least ${min}!`);
            }
            return value;
        }
        static atMost(max, value) {
            this.integer(value);
            this.integer(max);
            if (value > max) {
                throw new Error(`Expected ${value} to be at most ${max}!`);
            }
            return value;
        }
        static between(min, value, max) {
            this.integer(min);
            this.integer(value);
            this.integer(max);
            if (value < min || value > max) {
                throw new Error(`Expected ${value} to be between ${min} and ${max}!`);
            }
            return value;
        }
        static exactly(value, expected) {
            this.integer(expected);
            this.integer(value);
            if (value !== expected) {
                throw new Error(`Expected ${value} to be exactly ${expected}!`);
            }
            return value;
        }
        static integer(value) {
            if (!Number.isInteger(value)) {
                throw new Error(`Expected ${value} to be an integer!`);
            }
            return value;
        }
    }
    exports.IntegerAssert = IntegerAssert;
    ;
});
define("node_modules/@joelek/stdlib/dist/lib/data/chunk", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Chunk = void 0;
    class Chunk {
        constructor() { }
        static fromString(string, encoding) {
            if (encoding === "binary") {
                let bytes = new Array();
                for (let i = 0; i < string.length; i += 1) {
                    let code_unit = string.charCodeAt(i);
                    bytes.push(code_unit);
                }
                return Uint8Array.from(bytes);
            }
            if (encoding === "base64") {
                // @ts-ignore
                return Chunk.fromString(atob(string), "binary");
            }
            if (encoding === "base64url") {
                return Chunk.fromString(string.replaceAll("-", "+").replaceAll("_", "/"), "base64");
            }
            if (encoding === "hex") {
                if (string.length % 2 === 1) {
                    string = `0${string}`;
                }
                let bytes = new Array();
                for (let i = 0; i < string.length; i += 2) {
                    let part = string.slice(i, i + 2);
                    let byte = Number.parseInt(part, 16);
                    bytes.push(byte);
                }
                return Uint8Array.from(bytes);
            }
            if (encoding === "utf16be") {
                let bytes = new Array();
                for (let i = 0; i < string.length; i++) {
                    let code_unit = string.charCodeAt(i);
                    let hi = (code_unit >> 8) & 0xFF;
                    let lo = (code_unit >> 0) & 0xFF;
                    bytes.push(hi, lo);
                }
                return Uint8Array.from(bytes);
            }
            if (encoding === "utf16le") {
                let bytes = new Array();
                for (let i = 0; i < string.length; i++) {
                    let code_unit = string.charCodeAt(i);
                    let lo = (code_unit >> 8) & 0xFF;
                    let hi = (code_unit >> 0) & 0xFF;
                    bytes.push(hi, lo);
                }
                return Uint8Array.from(bytes);
            }
            // @ts-ignore
            return new TextEncoder().encode(string);
        }
        static toString(chunk, encoding) {
            if (encoding === "binary") {
                let parts = new Array();
                for (let byte of chunk) {
                    let part = String.fromCharCode(byte);
                    parts.push(part);
                }
                return parts.join("");
            }
            if (encoding === "base64") {
                // @ts-ignore
                return btoa(Chunk.toString(chunk, "binary"));
            }
            if (encoding === "base64url") {
                return Chunk.toString(chunk, "base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
            }
            if (encoding === "hex") {
                let parts = new Array();
                for (let byte of chunk) {
                    let part = byte.toString(16).toUpperCase().padStart(2, "0");
                    parts.push(part);
                }
                return parts.join("");
            }
            if (encoding === "utf16be") {
                let parts = new Array();
                for (let i = 0; i < chunk.length; i += 2) {
                    let hi = chunk[i + 0] || 0;
                    let lo = chunk[i + 1] || 0;
                    let code_unit = (hi << 8) | lo;
                    parts.push(String.fromCharCode(code_unit));
                }
                return parts.join("");
            }
            if (encoding === "utf16le") {
                let parts = new Array();
                for (let i = 0; i < chunk.length; i += 2) {
                    let lo = chunk[i + 0] || 0;
                    let hi = chunk[i + 1] || 0;
                    let code_unit = (hi << 8) | lo;
                    parts.push(String.fromCharCode(code_unit));
                }
                return parts.join("");
            }
            // @ts-ignore
            return new TextDecoder().decode(chunk);
        }
        static equals(one, two) {
            return this.comparePrefixes(one, two) === 0;
        }
        static comparePrefixes(one, two) {
            for (let i = 0; i < Math.min(one.length, two.length); i++) {
                let a = one[i];
                let b = two[i];
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
            }
            if (one.length < two.length) {
                return -1;
            }
            if (one.length > two.length) {
                return 1;
            }
            return 0;
        }
        static concat(buffers) {
            let length = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
            let result = new Uint8Array(length);
            let offset = 0;
            for (let buffer of buffers) {
                result.set(buffer, offset);
                offset += buffer.length;
            }
            return result;
        }
    }
    exports.Chunk = Chunk;
    ;
});
define("node_modules/@joelek/stdlib/dist/lib/data/parser", ["require", "exports", "node_modules/@joelek/stdlib/dist/lib/asserts/integer", "node_modules/@joelek/stdlib/dist/lib/data/chunk"], function (require, exports, integer_1, chunk_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Parser = void 0;
    class Parser {
        constructor(buffer, offset) {
            this.buffer = buffer;
            this.offset = offset !== null && offset !== void 0 ? offset : 0;
        }
        chunk(length) {
            length = length !== null && length !== void 0 ? length : this.buffer.length - this.offset;
            if (this.offset + length > this.buffer.length) {
                throw new Error(`Expected to read at least ${length} bytes!`);
            }
            let buffer = this.buffer.slice(this.offset, this.offset + length);
            this.offset += length;
            return buffer;
        }
        eof() {
            return this.offset >= this.buffer.length;
        }
        seek(offset) {
            if (offset > this.buffer.length) {
                throw new Error(`Expected a valid offset!`);
            }
            this.offset = offset;
        }
        signed(length, endian) {
            let value = this.unsigned(length, endian);
            let bias = Math.pow(2, (length * 8 - 1));
            if (value >= bias) {
                value -= bias + bias;
            }
            return value;
        }
        string(encoding, length) {
            if (length != null) {
                let chunk = this.chunk(length);
                return chunk_1.Chunk.toString(chunk, encoding);
            }
            let bytes = [];
            while (!this.eof()) {
                if (this.offset > this.buffer.length) {
                    throw new Error(`Expected to read at least 1 byte!`);
                }
                let byte = this.buffer[this.offset];
                this.offset += 1;
                if (byte === 0) {
                    break;
                }
                bytes.push(byte);
            }
            let chunk = Uint8Array.from(bytes);
            return chunk_1.Chunk.toString(chunk, encoding);
        }
        try(supplier) {
            let offset = this.offset;
            try {
                return supplier(this);
            }
            catch (error) {
                this.offset = offset;
                throw error;
            }
        }
        tryArray(suppliers) {
            let offset = this.offset;
            for (let supplier of suppliers) {
                try {
                    return supplier(this);
                }
                catch (error) {
                    this.offset = offset;
                }
            }
            throw new Error(`Expected one supplier to succeed!`);
        }
        unsigned(length, endian) {
            integer_1.IntegerAssert.between(1, length, 6);
            if (this.offset + length > this.buffer.length) {
                throw new Error(`Expected to read at least ${length} bytes!`);
            }
            if (endian === "little") {
                let value = 0;
                for (let i = length - 1; i >= 0; i--) {
                    value *= 256;
                    value += this.buffer[this.offset + i];
                }
                this.offset += length;
                return value;
            }
            else {
                let value = 0;
                for (let i = 0; i < length; i++) {
                    value *= 256;
                    value += this.buffer[this.offset + i];
                }
                this.offset += length;
                return value;
            }
        }
    }
    exports.Parser = Parser;
    ;
});
define("node_modules/@joelek/bedrock/dist/lib/utils", ["require", "exports", "node_modules/@joelek/stdlib/dist/lib/asserts/integer", "node_modules/@joelek/stdlib/dist/lib/data/parser", "node_modules/@joelek/stdlib/dist/lib/asserts/integer", "node_modules/@joelek/stdlib/dist/lib/data/chunk", "node_modules/@joelek/stdlib/dist/lib/data/parser"], function (require, exports, integer_1, parser_1, integer_2, chunk_1, parser_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VarLength = exports.VarInteger = exports.VarCategory = exports.Parser = exports.Chunk = exports.IntegerAssert = void 0;
    Object.defineProperty(exports, "IntegerAssert", { enumerable: true, get: function () { return integer_2.IntegerAssert; } });
    Object.defineProperty(exports, "Chunk", { enumerable: true, get: function () { return chunk_1.Chunk; } });
    Object.defineProperty(exports, "Parser", { enumerable: true, get: function () { return parser_2.Parser; } });
    class VarCategory {
        constructor() { }
        static decode(parser, maxBytes = 8) {
            parser = parser instanceof parser_1.Parser ? parser : new parser_1.Parser(parser);
            return parser.try((parser) => {
                let value = 0;
                for (let i = 0; i < maxBytes; i++) {
                    let byte = parser.unsigned(1);
                    let asis = (byte >> 7) & 0x01;
                    let cont = (byte >> 6) & 0x01;
                    if (asis === 0) {
                        let bits = ~byte & 0x3F;
                        value = value + bits;
                        if (cont === 1) {
                            value = value + 1;
                            value = 0 - value;
                            return value;
                        }
                        if (i === 0 && bits === 0) {
                            throw new Error(`Expected a distinguished encoding!`);
                        }
                    }
                    else {
                        let bits = byte & 0x3F;
                        value = value + bits;
                        if (cont === 0) {
                            return value;
                        }
                        if (i === 0 && bits === 0) {
                            throw new Error(`Expected a distinguished encoding!`);
                        }
                    }
                }
                throw new Error(`Expected to decode at most ${maxBytes} bytes!`);
            });
        }
        ;
        static encode(value, maxBytes = 8) {
            integer_1.IntegerAssert.integer(value);
            let bytes = new Array();
            if (value >= 0) {
                do {
                    let bits = value > 63 ? 63 : value;
                    value = value - bits;
                    bytes.push(128 + bits);
                } while (value > 0);
                for (let i = 0; i < bytes.length - 1; i++) {
                    bytes[i] += 64;
                }
            }
            else {
                value = 0 - value;
                value = value - 1;
                do {
                    let bits = value > 63 ? 63 : value;
                    value = value - bits;
                    bytes.push(~bits & 0x3F);
                } while (value > 0);
                bytes[bytes.length - 1] += 64;
            }
            if (bytes.length > maxBytes) {
                throw new Error(`Expected to encode at most ${maxBytes} bytes!`);
            }
            return Uint8Array.from(bytes);
        }
        ;
    }
    exports.VarCategory = VarCategory;
    ;
    class VarInteger {
        constructor() { }
        static decode(parser, maxBytes = 8) {
            parser = parser instanceof parser_1.Parser ? parser : new parser_1.Parser(parser);
            return parser.try((parser) => {
                let value = 0;
                for (let i = 0; i < maxBytes; i++) {
                    let byte = parser.unsigned(1);
                    let asis = (byte >> 7) & 0x01;
                    let cont = (byte >> 6) & 0x01;
                    if (asis === 0) {
                        let bits = ~byte & 0x3F;
                        value = (value * 64) + bits;
                        if (cont === 1) {
                            value = value + 1;
                            value = 0 - value;
                            return value;
                        }
                        if (i === 0 && bits === 0) {
                            throw new Error(`Expected a distinguished encoding!`);
                        }
                    }
                    else {
                        let bits = byte & 0x3F;
                        value = (value * 64) + bits;
                        if (cont === 0) {
                            return value;
                        }
                        if (i === 0 && bits === 0) {
                            throw new Error(`Expected a distinguished encoding!`);
                        }
                    }
                }
                throw new Error(`Expected to decode at most ${maxBytes} bytes!`);
            });
        }
        ;
        static encode(value, maxBytes = 8) {
            integer_1.IntegerAssert.integer(value);
            let bytes = new Array();
            if (value >= 0) {
                do {
                    let bits = value % 64;
                    value = Math.floor(value / 64);
                    bytes.push(128 + bits);
                } while (value > 0);
                bytes.reverse();
                for (let i = 0; i < bytes.length - 1; i++) {
                    bytes[i] += 64;
                }
            }
            else {
                value = 0 - value;
                value = value - 1;
                do {
                    let bits = value % 64;
                    value = Math.floor(value / 64);
                    bytes.push(128 + ~bits & 0x3F);
                } while (value > 0);
                bytes.reverse();
                bytes[bytes.length - 1] += 64;
            }
            if (bytes.length > maxBytes) {
                throw new Error(`Expected to encode at most ${maxBytes} bytes!`);
            }
            return Uint8Array.from(bytes);
        }
        ;
    }
    exports.VarInteger = VarInteger;
    ;
    class VarLength {
        constructor() { }
        static decode(parser, maxBytes = 8) {
            parser = parser instanceof parser_1.Parser ? parser : new parser_1.Parser(parser);
            return parser.try((parser) => {
                let value = 0;
                for (let i = 0; i < maxBytes; i++) {
                    let byte = parser.unsigned(1);
                    let cont = (byte >> 7) & 0x01;
                    let bits = (byte >> 0) & 0x7F;
                    value = (value * 128) + bits;
                    if (cont === 0) {
                        return value;
                    }
                    if (i === 0 && bits === 0) {
                        throw new Error(`Expected a distinguished encoding!`);
                    }
                }
                throw new Error(`Expected to decode at most ${maxBytes} bytes!`);
            });
        }
        ;
        static encode(value, maxBytes = 8) {
            integer_1.IntegerAssert.atLeast(0, value);
            let bytes = new Array();
            do {
                let bits = value % 128;
                value = Math.floor(value / 128);
                bytes.push(bits);
            } while (value > 0);
            bytes.reverse();
            for (let i = 0; i < bytes.length - 1; i++) {
                bytes[i] += 128;
            }
            if (bytes.length > maxBytes) {
                throw new Error(`Expected to encode at most ${maxBytes} bytes!`);
            }
            return Uint8Array.from(bytes);
        }
        ;
    }
    exports.VarLength = VarLength;
    ;
});
define("node_modules/@joelek/bedrock/dist/lib/codecs", ["require", "exports", "node_modules/@joelek/bedrock/dist/lib/utils"], function (require, exports, utils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BooleanLiteral = exports.BooleanLiteralCodec = exports.BigIntLiteral = exports.BigIntLiteralCodec = exports.NumberLiteral = exports.NumberLiteralCodec = exports.StringLiteral = exports.StringLiteralCodec = exports.Integer = exports.IntegerCodec = exports.Intersection = exports.IntersectionCodec = exports.Union = exports.UnionCodec = exports.Object = exports.ObjectCodec = exports.Tuple = exports.TupleCodec = exports.Record = exports.RecordCodec = exports.Array = exports.ArrayCodec = exports.Boolean = exports.BooleanCodec = exports.Unknown = exports.UnknownCodec = exports.UnknownValue = exports.Map = exports.MapCodec = exports.List = exports.ListCodec = exports.BigInt = exports.BigIntCodec = exports.Binary = exports.BinaryCodec = exports.String = exports.StringCodec = exports.Number = exports.NumberCodec = exports.True = exports.TrueCodec = exports.False = exports.FalseCodec = exports.Null = exports.NullCodec = exports.Any = exports.AnyCodec = exports.Codec = exports.Tag = exports.Packet = void 0;
    exports.IntegerLiteral = exports.IntegerLiteralCodec = void 0;
    class Packet {
        constructor() { }
        static decode(parser) {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                let length = utils.VarLength.decode(parser);
                let payload = parser.chunk(length);
                return payload;
            });
        }
        static encode(payload) {
            return utils.Chunk.concat([
                utils.VarLength.encode(payload.length),
                payload
            ]);
        }
    }
    exports.Packet = Packet;
    ;
    var Tag;
    (function (Tag) {
        Tag[Tag["NULL"] = 0] = "NULL";
        Tag[Tag["FALSE"] = 1] = "FALSE";
        Tag[Tag["TRUE"] = 2] = "TRUE";
        Tag[Tag["NUMBER"] = 3] = "NUMBER";
        Tag[Tag["STRING"] = 4] = "STRING";
        Tag[Tag["BINARY"] = 5] = "BINARY";
        Tag[Tag["BIGINT"] = 6] = "BIGINT";
        Tag[Tag["LIST"] = 7] = "LIST";
        Tag[Tag["MAP"] = 8] = "MAP";
    })(Tag = exports.Tag || (exports.Tag = {}));
    ;
    class Codec {
        constructor() { }
        decode(parser, path = "") {
            let payload = Packet.decode(parser);
            return this.decodePayload(payload, path);
        }
        encode(subject, path = "") {
            let payload = this.encodePayload(subject, path);
            return Packet.encode(payload);
        }
    }
    exports.Codec = Codec;
    ;
    class AnyCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.tryArray([
                (parser) => exports.Null.decodePayload(parser, path),
                (parser) => exports.False.decodePayload(parser, path),
                (parser) => exports.True.decodePayload(parser, path),
                (parser) => exports.Number.decodePayload(parser, path),
                (parser) => exports.String.decodePayload(parser, path),
                (parser) => exports.Binary.decodePayload(parser, path),
                (parser) => exports.BigInt.decodePayload(parser, path),
                (parser) => exports.List.decodePayload(parser, path),
                (parser) => exports.Map.decodePayload(parser, path),
                (parser) => exports.Unknown.decodePayload(parser, path)
            ]);
        }
        encodePayload(subject, path = "") {
            try {
                return exports.Null.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.False.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.True.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.Number.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.String.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.Binary.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.BigInt.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.List.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.Map.encodePayload(subject, path);
            }
            catch (error) { }
            try {
                return exports.Unknown.encodePayload(subject, path);
            }
            catch (error) { }
            throw new Error(`Expected subject to be encodable!`);
        }
    }
    exports.AnyCodec = AnyCodec;
    ;
    exports.Any = new AnyCodec();
    class NullCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.NULL) {
                    throw new Error(`Expected Null at ${path}!`);
                }
                return null;
            });
        }
        encodePayload(subject, path = "") {
            if (subject !== null) {
                throw new Error(`Expected Null at ${path}!`);
            }
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.NULL));
            return utils.Chunk.concat(chunks);
        }
    }
    exports.NullCodec = NullCodec;
    ;
    exports.Null = new NullCodec();
    class FalseCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.FALSE) {
                    throw new Error(`Expected False at ${path}!`);
                }
                return false;
            });
        }
        encodePayload(subject, path = "") {
            if (subject !== false) {
                throw new Error(`Expected False at ${path}!`);
            }
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.FALSE));
            return utils.Chunk.concat(chunks);
        }
    }
    exports.FalseCodec = FalseCodec;
    ;
    exports.False = new FalseCodec();
    class TrueCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.TRUE) {
                    throw new Error(`Expected True at ${path}!`);
                }
                return true;
            });
        }
        encodePayload(subject, path = "") {
            if (subject !== true) {
                throw new Error(`Expected True at ${path}!`);
            }
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.TRUE));
            return utils.Chunk.concat(chunks);
        }
    }
    exports.TrueCodec = TrueCodec;
    ;
    exports.True = new TrueCodec();
    class NumberCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.NUMBER) {
                    throw new Error(`Expected Number at ${path}!`);
                }
                let chunk = parser.chunk(8);
                if (((chunk[0] >> 7) & 0x01) === 0x01) {
                    chunk[0] ^= 0x80;
                    for (let i = 1; i < chunk.length; i++) {
                        chunk[i] ^= 0x00;
                    }
                }
                else {
                    chunk[0] ^= 0xFF;
                    for (let i = 1; i < chunk.length; i++) {
                        chunk[i] ^= 0xFF;
                    }
                }
                let value = new DataView(chunk.buffer).getFloat64(0, false);
                return value;
            });
        }
        encodePayload(subject, path = "") {
            if (subject == null || subject.constructor !== globalThis.Number) {
                throw new Error(`Expected Number at ${path}!`);
            }
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.NUMBER));
            let chunk = new Uint8Array(8);
            new DataView(chunk.buffer).setFloat64(0, subject, false);
            if (((chunk[0] >> 7) & 0x01) === 0x00) {
                chunk[0] ^= 0x80;
                for (let i = 1; i < chunk.length; i++) {
                    chunk[i] ^= 0x00;
                }
            }
            else {
                chunk[0] ^= 0xFF;
                for (let i = 1; i < chunk.length; i++) {
                    chunk[i] ^= 0xFF;
                }
            }
            chunks.push(chunk);
            return utils.Chunk.concat(chunks);
        }
    }
    exports.NumberCodec = NumberCodec;
    ;
    exports.Number = new NumberCodec();
    class StringCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.STRING) {
                    throw new Error(`Expected String at ${path}!`);
                }
                let value = utils.Chunk.toString(parser.chunk(), "utf-8");
                return value;
            });
        }
        encodePayload(subject, path = "") {
            if (subject == null || subject.constructor !== globalThis.String) {
                throw new Error(`Expected String at ${path}!`);
            }
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.STRING));
            chunks.push(utils.Chunk.fromString(subject, "utf-8"));
            return utils.Chunk.concat(chunks);
        }
    }
    exports.StringCodec = StringCodec;
    ;
    exports.String = new StringCodec();
    class BinaryCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.BINARY) {
                    throw new Error(`Expected Binary at ${path}!`);
                }
                let value = parser.chunk();
                return value;
            });
        }
        encodePayload(subject, path = "") {
            if (subject == null || !(subject instanceof globalThis.Uint8Array)) {
                throw new Error(`Expected Binary at ${path}!`);
            }
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.BINARY));
            chunks.push(subject);
            return utils.Chunk.concat(chunks);
        }
    }
    exports.BinaryCodec = BinaryCodec;
    ;
    exports.Binary = new BinaryCodec();
    class BigIntCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.BIGINT) {
                    throw new Error(`Expected BigInt at ${path}!`);
                }
                let category = utils.VarCategory.decode(parser);
                let value = 0n;
                if (category >= 0) {
                    let size = category + 1;
                    for (let i = 0; i < size; i++) {
                        let byte = globalThis.BigInt(parser.unsigned(1));
                        value = value << 8n;
                        value = value | byte;
                    }
                }
                else {
                    let size = 0 - category;
                    for (let i = 0; i < size; i++) {
                        let byte = globalThis.BigInt(~parser.unsigned(1) & 0xFF);
                        value = value << 8n;
                        value = value | byte;
                    }
                    value = value + 1n;
                    value = 0n - value;
                }
                return value;
            });
        }
        encodePayload(subject, path = "") {
            if (subject == null || subject.constructor !== globalThis.BigInt) {
                throw new Error(`Expected BigInt at ${path}!`);
            }
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.BIGINT));
            let bytes = [];
            let value = subject;
            if (value >= 0n) {
                do {
                    let byte = globalThis.Number(value & 0xffn);
                    value = value >> 8n;
                    bytes.push(byte);
                } while (value > 0n);
                let category = utils.VarCategory.encode(bytes.length - 1);
                chunks.push(category);
            }
            else {
                value = 0n - value;
                value = value - 1n;
                do {
                    let byte = ~globalThis.Number(value & 0xffn) & 0xFF;
                    value = value >> 8n;
                    bytes.push(byte);
                } while (value > 0n);
                let category = utils.VarCategory.encode(0 - bytes.length);
                chunks.push(category);
            }
            bytes.reverse();
            chunks.push(Uint8Array.from(bytes));
            return utils.Chunk.concat(chunks);
        }
    }
    exports.BigIntCodec = BigIntCodec;
    ;
    exports.BigInt = new BigIntCodec();
    class ListCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "", decode) {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.LIST) {
                    throw new Error(`Expected List at ${path}!`);
                }
                decode = decode ?? ((key, path, parser) => exports.Any.decode(parser, path));
                let value = [];
                let index = 0;
                while (!parser.eof()) {
                    let subpath = `${path}[${index}]`;
                    value.push(decode(index, subpath, parser));
                    index += 1;
                }
                return value;
            });
        }
        encodePayload(subject, path = "", encode) {
            if (subject == null || subject.constructor !== globalThis.Array) {
                throw new Error(`Expected List at ${path}!`);
            }
            encode = encode ?? ((key, path, subject) => exports.Any.encode(subject, path));
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.LIST));
            for (let index = 0; index < subject.length; index++) {
                let value = subject[index];
                if (value === undefined) {
                    value = null;
                }
                let subpath = `${path}[${index}]`;
                chunks.push(encode(index, subpath, value));
            }
            return utils.Chunk.concat(chunks);
        }
    }
    exports.ListCodec = ListCodec;
    ;
    exports.List = new ListCodec();
    class MapCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "", decode) {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                if (parser.unsigned(1) !== Tag.MAP) {
                    throw new Error(`Expected Map at ${path}!`);
                }
                decode = decode ?? ((key, path, parser) => exports.Any.decode(parser, path));
                let value = {};
                while (!parser.eof()) {
                    let key = exports.String.decode(parser);
                    let subpath = /^[a-z][a-z0-9_]*$/isu.test(key) ? `${path}.${key}` : `${path}["${key}"]`;
                    value[key] = decode(key, subpath, parser);
                }
                return value;
            });
        }
        encodePayload(subject, path = "", encode) {
            if (subject == null || subject.constructor !== globalThis.Object) {
                throw new Error(`Expected Map at ${path}!`);
            }
            encode = encode ?? ((key, path, subject) => exports.Any.encode(subject, path));
            let chunks = [];
            chunks.push(Uint8Array.of(Tag.MAP));
            let pairs = [];
            for (let key in subject) {
                let value = subject[key];
                if (value === undefined) {
                    continue;
                }
                let subpath = /^[a-z][a-z0-9_]*$/isu.test(key) ? `${path}.${key}` : `${path}["${key}"]`;
                pairs.push({
                    key: exports.String.encodePayload(key),
                    value: encode(key, subpath, value)
                });
            }
            pairs.sort((one, two) => utils.Chunk.comparePrefixes(one.key, two.key));
            for (let pair of pairs) {
                chunks.push(Packet.encode(pair.key));
                chunks.push(pair.value);
            }
            return utils.Chunk.concat(chunks);
        }
    }
    exports.MapCodec = MapCodec;
    ;
    exports.Map = new MapCodec();
    class UnknownValue {
        chunk;
        constructor(chunk) {
            utils.IntegerAssert.atLeast(1, chunk.length);
            if (chunk[0] in Tag) {
                throw new Error(`Expected tag ${Tag[chunk[0]]} to be unknown!`);
            }
            this.chunk = chunk;
        }
        getChunk() {
            return this.chunk;
        }
    }
    exports.UnknownValue = UnknownValue;
    ;
    class UnknownCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                let value = parser.chunk();
                return new UnknownValue(value);
            });
        }
        encodePayload(subject, path = "") {
            if (subject == null || subject.constructor !== UnknownValue) {
                throw new Error(`Expected Unknown at ${path}!`);
            }
            let chunks = [];
            chunks.push(subject.getChunk());
            return utils.Chunk.concat(chunks);
        }
    }
    exports.UnknownCodec = UnknownCodec;
    ;
    exports.Unknown = new UnknownCodec();
    class BooleanCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.tryArray([
                (parser) => exports.True.decodePayload(parser, path),
                (parser) => exports.False.decodePayload(parser, path)
            ]);
        }
        encodePayload(subject, path = "") {
            if (subject) {
                return exports.True.encodePayload(subject, path);
            }
            else {
                return exports.False.encodePayload(subject, path);
            }
        }
    }
    exports.BooleanCodec = BooleanCodec;
    ;
    exports.Boolean = new BooleanCodec();
    class ArrayCodec extends Codec {
        codec;
        constructor(codec) {
            super();
            this.codec = codec;
        }
        decodePayload(parser, path = "") {
            return exports.List.decodePayload(parser, path, (index, path, parser) => {
                return this.codec.decode(parser, path);
            });
        }
        encodePayload(subject, path = "") {
            return exports.List.encodePayload(subject, path, (index, path, subject) => {
                return this.codec.encode(subject, path);
            });
        }
    }
    exports.ArrayCodec = ArrayCodec;
    ;
    exports.Array = {
        of(codec) {
            return new ArrayCodec(codec);
        }
    };
    class RecordCodec extends Codec {
        codec;
        constructor(codec) {
            super();
            this.codec = codec;
        }
        decodePayload(parser, path = "") {
            return exports.Map.decodePayload(parser, path, (key, path, parser) => {
                return this.codec.decode(parser, path);
            });
        }
        encodePayload(subject, path = "") {
            return exports.Map.encodePayload(subject, path, (key, path, subject) => {
                return this.codec.encode(subject, path);
            });
        }
    }
    exports.RecordCodec = RecordCodec;
    ;
    exports.Record = {
        of(codec) {
            return new RecordCodec(codec);
        }
    };
    class TupleCodec extends Codec {
        codecs;
        constructor(...codecs) {
            super();
            this.codecs = codecs;
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                let indices = new globalThis.Set(this.codecs.keys());
                let subject = exports.List.decodePayload(parser, path, (index, path, parser) => {
                    indices.delete(index);
                    if (index in this.codecs) {
                        return this.codecs[index].decode(parser, path);
                    }
                    else {
                        return exports.Any.decode(parser, path);
                    }
                });
                if (indices.size !== 0) {
                    throw new Error(`Expected members ${globalThis.Array.from(indices)} to be decoded!`);
                }
                return subject;
            });
        }
        encodePayload(subject, path = "") {
            let indices = new globalThis.Set(this.codecs.keys());
            let payload = exports.List.encodePayload(subject, path, (index, path, subject) => {
                indices.delete(index);
                if (index in this.codecs) {
                    return this.codecs[index].encode(subject, path);
                }
                else {
                    return exports.Any.encode(subject, path);
                }
            });
            if (indices.size !== 0) {
                throw new Error(`Expected members ${globalThis.Array.from(indices)} to be encoded!`);
            }
            return payload;
        }
    }
    exports.TupleCodec = TupleCodec;
    ;
    exports.Tuple = {
        of(...codecs) {
            return new TupleCodec(...codecs);
        }
    };
    class ObjectCodec extends Codec {
        required;
        optional;
        constructor(required, optional) {
            super();
            this.required = required;
            this.optional = optional ?? {};
        }
        decodePayload(parser, path = "") {
            parser = parser instanceof utils.Parser ? parser : new utils.Parser(parser);
            return parser.try((parser) => {
                let keys = new Set(globalThis.Object.keys(this.required));
                let subject = exports.Map.decodePayload(parser, path, (key, path, parser) => {
                    keys.delete(key);
                    if (key in this.required) {
                        return this.required[key].decode(parser, path);
                    }
                    else if (key in this.optional) {
                        return this.optional[key].decode(parser, path);
                    }
                    else {
                        return exports.Any.decode(parser, path);
                    }
                });
                if (keys.size !== 0) {
                    throw new Error(`Expected members ${globalThis.Array.from(keys)} to be decoded!`);
                }
                return subject;
            });
        }
        encodePayload(subject, path = "") {
            let keys = new Set(globalThis.Object.keys(this.required));
            let payload = exports.Map.encodePayload(subject, path, (key, path, subject) => {
                keys.delete(key);
                if (key in this.required) {
                    return this.required[key].encode(subject, path);
                }
                else if (key in this.optional) {
                    return this.optional[key].encode(subject, path);
                }
                else {
                    return exports.Any.encode(subject, path);
                }
            });
            if (keys.size !== 0) {
                throw new Error(`Expected members ${globalThis.Array.from(keys)} to be encoded!`);
            }
            return payload;
        }
    }
    exports.ObjectCodec = ObjectCodec;
    ;
    exports.Object = {
        of(required, optional) {
            return new ObjectCodec(required, optional);
        }
    };
    class UnionCodec extends Codec {
        codecs;
        constructor(...codecs) {
            super();
            this.codecs = codecs;
        }
        decodePayload(parser, path = "") {
            for (let codec of this.codecs) {
                try {
                    return codec.decodePayload(parser, path);
                }
                catch (error) { }
            }
            throw new Error(`Expected subject to be decodable!`);
        }
        encodePayload(subject, path = "") {
            for (let codec of this.codecs) {
                try {
                    return codec.encodePayload(subject, path);
                }
                catch (error) { }
            }
            throw new Error(`Expected subject to be encodable!`);
        }
    }
    exports.UnionCodec = UnionCodec;
    ;
    exports.Union = {
        of(...codecs) {
            return new UnionCodec(...codecs);
        }
    };
    class IntersectionCodec extends Codec {
        codecs;
        constructor(...codecs) {
            super();
            this.codecs = codecs;
        }
        decodePayload(parser, path = "") {
            for (let codec of this.codecs) {
                codec.decodePayload(parser, path);
            }
            return exports.Any.decodePayload(parser, path);
        }
        encodePayload(subject, path = "") {
            for (let codec of this.codecs) {
                codec.encodePayload(subject, path);
            }
            return exports.Any.encodePayload(subject, path);
        }
    }
    exports.IntersectionCodec = IntersectionCodec;
    ;
    exports.Intersection = {
        of(...codecs) {
            return new IntersectionCodec(...codecs);
        }
    };
    class IntegerCodec extends Codec {
        constructor() {
            super();
        }
        decodePayload(parser, path = "") {
            let subject = exports.BigInt.decodePayload(parser, path);
            if (subject < globalThis.BigInt(globalThis.Number.MIN_SAFE_INTEGER)) {
                throw new Error(`Expected ${subject} at ${path} to be within safe range!`);
            }
            if (subject > globalThis.BigInt(globalThis.Number.MAX_SAFE_INTEGER)) {
                throw new Error(`Expected ${subject} at ${path} to be within safe range!`);
            }
            return globalThis.Number(subject);
        }
        encodePayload(subject, path = "") {
            return exports.BigInt.encodePayload(globalThis.BigInt(subject), path);
        }
    }
    exports.IntegerCodec = IntegerCodec;
    ;
    exports.Integer = new IntegerCodec();
    class StringLiteralCodec extends Codec {
        value;
        constructor(value) {
            super();
            this.value = value;
        }
        decodePayload(parser, path = "") {
            let subject = exports.String.decodePayload(parser, path);
            if (subject !== this.value) {
                throw new Error(`Expected "${this.value}" at ${path}!`);
            }
            return this.value;
        }
        encodePayload(subject, path = "") {
            if (subject !== this.value) {
                throw new Error(`Expected "${this.value}" at ${path}!`);
            }
            return exports.String.encodePayload(subject, path);
        }
    }
    exports.StringLiteralCodec = StringLiteralCodec;
    ;
    exports.StringLiteral = {
        of(value) {
            return new StringLiteralCodec(value);
        }
    };
    class NumberLiteralCodec extends Codec {
        value;
        constructor(value) {
            super();
            this.value = value;
        }
        decodePayload(parser, path = "") {
            let subject = exports.Number.decodePayload(parser, path);
            if (subject !== this.value) {
                throw new Error(`Expected ${this.value} at ${path}!`);
            }
            return this.value;
        }
        encodePayload(subject, path = "") {
            if (subject !== this.value) {
                throw new Error(`Expected ${this.value} at ${path}!`);
            }
            return exports.Number.encodePayload(subject, path);
        }
    }
    exports.NumberLiteralCodec = NumberLiteralCodec;
    ;
    exports.NumberLiteral = {
        of(value) {
            return new NumberLiteralCodec(value);
        }
    };
    class BigIntLiteralCodec extends Codec {
        value;
        constructor(value) {
            super();
            this.value = value;
        }
        decodePayload(parser, path = "") {
            let subject = exports.BigInt.decodePayload(parser, path);
            if (subject !== this.value) {
                throw new Error(`Expected ${this.value} at ${path}!`);
            }
            return this.value;
        }
        encodePayload(subject, path = "") {
            if (subject !== this.value) {
                throw new Error(`Expected ${this.value} at ${path}!`);
            }
            return exports.BigInt.encodePayload(subject, path);
        }
    }
    exports.BigIntLiteralCodec = BigIntLiteralCodec;
    ;
    exports.BigIntLiteral = {
        of(value) {
            return new BigIntLiteralCodec(value);
        }
    };
    class BooleanLiteralCodec extends Codec {
        value;
        constructor(value) {
            super();
            this.value = value;
        }
        decodePayload(parser, path = "") {
            let subject = exports.Boolean.decodePayload(parser, path);
            if (subject !== this.value) {
                throw new Error(`Expected ${this.value} at ${path}!`);
            }
            return this.value;
        }
        encodePayload(subject, path = "") {
            if (subject !== this.value) {
                throw new Error(`Expected ${this.value} at ${path}!`);
            }
            return exports.Boolean.encodePayload(subject, path);
        }
    }
    exports.BooleanLiteralCodec = BooleanLiteralCodec;
    ;
    exports.BooleanLiteral = {
        of(value) {
            return new BooleanLiteralCodec(value);
        }
    };
    class IntegerLiteralCodec extends Codec {
        value;
        constructor(value) {
            super();
            this.value = value;
        }
        decodePayload(parser, path = "") {
            let subject = exports.Integer.decodePayload(parser, path);
            if (subject !== this.value) {
                throw new Error(`Expected ${this.value} at ${path}!`);
            }
            return this.value;
        }
        encodePayload(subject, path = "") {
            if (subject !== this.value) {
                throw new Error(`Expected ${this.value} at ${path}!`);
            }
            return exports.Integer.encodePayload(subject, path);
        }
    }
    exports.IntegerLiteralCodec = IntegerLiteralCodec;
    ;
    exports.IntegerLiteral = {
        of(value) {
            return new IntegerLiteralCodec(value);
        }
    };
});
define("node_modules/@joelek/bedrock/dist/lib/index", ["require", "exports", "node_modules/@joelek/bedrock/dist/lib/codecs", "node_modules/@joelek/bedrock/dist/lib/utils"], function (require, exports, codecs, utils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.utils = exports.codecs = void 0;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.utils = exports.codecs = void 0;
    exports.codecs = codecs;
    exports.utils = utils;
});
define("node_modules/@joelek/autoguard/dist/lib-shared/codecs/bedrock", ["require", "exports", "node_modules/@joelek/bedrock/dist/lib/index"], function (require, exports, bedrock) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CODEC = exports.BedrockCodec = void 0;
    class BedrockCodec {
        constructor() { }
        decode(buffer) {
            return bedrock.codecs.Any.decode(buffer);
        }
        encode(subject) {
            return bedrock.codecs.Any.encode(subject);
        }
    }
    exports.BedrockCodec = BedrockCodec;
    ;
    exports.CODEC = new BedrockCodec();
});
define("node_modules/@joelek/autoguard/dist/lib-shared/codecs/json", ["require", "exports", "node_modules/@joelek/bedrock/dist/lib/index", "node_modules/@joelek/autoguard/dist/lib-shared/guards"], function (require, exports, bedrock, guards) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CODEC = exports.JSONCodec = void 0;
    const BIGINT_GUARD = guards.Object.of({
        type: guards.StringLiteral.of("@bigint"),
        data: guards.String
    });
    const BINARY_GUARD = guards.Object.of({
        type: guards.StringLiteral.of("@binary"),
        data: guards.String
    });
    class JSONCodec {
        constructor() { }
        decode(buffer) {
            let string = bedrock.utils.Chunk.toString(buffer, "utf-8");
            let subject = string.length === 0 ? undefined : JSON.parse(string, (key, subject) => {
                if (BIGINT_GUARD.is(subject)) {
                    return BigInt(subject.data);
                }
                if (BINARY_GUARD.is(subject)) {
                    return bedrock.utils.Chunk.fromString(subject.data, "base64url");
                }
                return subject;
            });
            return subject;
        }
        encode(subject) {
            let string = subject === undefined ? "" : JSON.stringify(subject, (key, subject) => {
                if (guards.BigInt.is(subject)) {
                    return {
                        type: "@bigint",
                        data: subject.toString()
                    };
                }
                if (guards.Binary.is(subject)) {
                    return {
                        type: "@binary",
                        data: bedrock.utils.Chunk.toString(subject, "base64url")
                    };
                }
                return subject;
            });
            let packet = bedrock.utils.Chunk.fromString(string, "utf-8");
            return packet;
        }
    }
    exports.JSONCodec = JSONCodec;
    ;
    exports.CODEC = new JSONCodec();
});
define("node_modules/@joelek/autoguard/dist/lib-shared/codecs/index", ["require", "exports", "node_modules/@joelek/autoguard/dist/lib-shared/codecs/bedrock", "node_modules/@joelek/autoguard/dist/lib-shared/codecs/json"], function (require, exports, bedrock, json) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.json = exports.bedrock = void 0;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.json = exports.bedrock = void 0;
    exports.bedrock = bedrock;
    exports.json = json;
});
define("node_modules/@joelek/autoguard/dist/lib-shared/tables", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createValueToKeyMap = exports.createKeyToValueMap = exports.createValues = exports.createKeys = void 0;
    function createKeys(entries) {
        return entries.map(({ key }) => key);
    }
    exports.createKeys = createKeys;
    ;
    function createValues(entries) {
        return entries.map(({ value }) => value);
    }
    exports.createValues = createValues;
    ;
    function createKeyToValueMap(entries) {
        return entries.reduce((record, { key, value }) => (Object.assign(Object.assign({}, record), { [key]: value })), {});
    }
    exports.createKeyToValueMap = createKeyToValueMap;
    ;
    function createValueToKeyMap(entries) {
        return entries.reduce((record, { key, value }) => (Object.assign(Object.assign({}, record), { [value]: key })), {});
    }
    exports.createValueToKeyMap = createValueToKeyMap;
    ;
});
define("node_modules/@joelek/autoguard/dist/lib-shared/index", ["require", "exports", "node_modules/@joelek/autoguard/dist/lib-shared/api", "node_modules/@joelek/autoguard/dist/lib-shared/codecs/index", "node_modules/@joelek/autoguard/dist/lib-shared/guards", "node_modules/@joelek/autoguard/dist/lib-shared/serialization", "node_modules/@joelek/autoguard/dist/lib-shared/tables"], function (require, exports, api, codecs, guards, serialization, tables) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tables = exports.serialization = exports.guards = exports.codecs = exports.api = void 0;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tables = exports.serialization = exports.guards = exports.codecs = exports.api = void 0;
    exports.api = api;
    exports.codecs = codecs;
    exports.guards = guards;
    exports.serialization = serialization;
    exports.tables = tables;
});
define("node_modules/@joelek/autoguard/dist/lib-server/api", ["require", "exports", "fs", "http", "https", "path", "node_modules/@joelek/autoguard/dist/lib-shared/index", "node_modules/@joelek/autoguard/dist/lib-shared/api"], function (require, exports, libfs, libhttp, libhttps, libpath, shared, api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function () { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
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
    var __asyncValues = (this && this.__asyncValues) || function (o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeReadStreamResponse = exports.makeDirectoryListing = exports.getContentTypeFromExtension = exports.parseRangeHeader = exports.route = exports.respond = exports.finalizeResponse = exports.acceptsMethod = exports.acceptsComponents = exports.makeNodeRequestHandler = exports.combineNodeRawHeaders = exports.DynamicRouteMatcher = exports.StaticRouteMatcher = exports.ClientRequest = exports.EndpointError = void 0;
    __exportStar(api_1, exports);
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
        payload(maxByteLength) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.collectedPayload !== undefined) {
                    return this.collectedPayload;
                }
                let payload = this.request.payload;
                let collectedPayload = (this.collect ? yield shared.api.collectPayload(payload, maxByteLength) : payload);
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
    ;
    class StaticRouteMatcher {
        constructor(string) {
            this.string = string;
            this.accepted = false;
        }
        acceptComponent(component, collect = true) {
            if (this.accepted) {
                return false;
            }
            if (component === this.string) {
                if (collect) {
                    this.accepted = true;
                }
                return true;
            }
            return false;
        }
        acceptsComponent(component) {
            return this.acceptComponent(component, false);
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
        acceptComponent(component, collect = true) {
            if (this.values.length >= this.maxOccurences) {
                return false;
            }
            try {
                let value = shared.api.deserializeValue(component, this.plain);
                if (this.guard.is(value)) {
                    if (collect) {
                        this.values.push(value);
                    }
                    return true;
                }
            }
            catch (error) { }
            return false;
        }
        acceptsComponent(component) {
            return this.acceptComponent(component, false);
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
    function combineNodeRawHeaders(raw) {
        let headers = new Array();
        for (let i = 0; i < raw.length; i += 2) {
            headers.push(`${raw[i + 0]}: ${raw[i + 1]}`);
        }
        return headers;
    }
    exports.combineNodeRawHeaders = combineNodeRawHeaders;
    ;
    function makeNodeRequestHandler(options) {
        return (raw, clientOptions, requestOptions) => {
            var _a;
            let urlPrefix = (_a = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.urlPrefix) !== null && _a !== void 0 ? _a : "";
            let lib = urlPrefix.startsWith("https:") ? libhttps : libhttp;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let payload = yield shared.api.collectPayload(raw.payload);
                let headers = {
                    "Content-Length": `${payload.length}`
                };
                for (let header of raw.headers) {
                    let key = header[0];
                    let value = header[1];
                    let values = headers[key];
                    if (values === undefined) {
                        headers[key] = value;
                    }
                    else if (Array.isArray(values)) {
                        values.push(value);
                    }
                    else {
                        headers[key] = [values, value];
                    }
                }
                let url = urlPrefix;
                url += shared.api.combineComponents(raw.components);
                url += shared.api.combineParameters(raw.parameters);
                let request = lib.request(url, Object.assign(Object.assign({}, options), { method: raw.method, headers: headers }), (response) => {
                    var _a;
                    let status = (_a = response.statusCode) !== null && _a !== void 0 ? _a : 200;
                    let headers = shared.api.splitHeaders(combineNodeRawHeaders(response.rawHeaders));
                    let payload = {
                        [Symbol.asyncIterator]: () => response[Symbol.asyncIterator]()
                    };
                    let raw = {
                        status,
                        headers,
                        payload
                    };
                    resolve(raw);
                });
                request.on("abort", reject);
                request.on("error", reject);
                request.write(payload);
                request.end();
            }));
        };
    }
    exports.makeNodeRequestHandler = makeNodeRequestHandler;
    ;
    function acceptsComponents(components, matchers) {
        let i = 0;
        for (let component of components) {
            let decoded = decodeURIComponent(component);
            if (decoded === undefined) {
                throw `Expected component to be properly encoded!`;
            }
            let accepted = false;
            for (let matcher of matchers.slice(i)) {
                if (matcher.isSatisfied()) {
                    if (!matcher.acceptsComponent(decoded)) {
                        i += 1;
                        continue;
                    }
                    if (i + 1 < matchers.length) {
                        let next_matcher = matchers[i + 1];
                        if (next_matcher.acceptsComponent(decoded)) {
                            i += 1;
                            continue;
                        }
                    }
                }
                if (!matcher.acceptsComponent(decoded)) {
                    return false;
                }
                matcher.acceptComponent(decoded);
                accepted = true;
                break;
            }
            if (!accepted) {
                return false;
            }
        }
        if (i !== matchers.length - 1) {
            return false;
        }
        if (!matchers[i].isSatisfied()) {
            return false;
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
    function finalizeResponse(raw, defaultHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            let payload = raw.payload;
            if (shared.api.SyncBinary.is(payload)) {
                let collectedPayload = yield shared.api.collectPayload(payload);
                defaultHeaders.push(["Content-Length", `${collectedPayload.length}`]);
                payload = [collectedPayload];
            }
            let headersToAppend = defaultHeaders.filter((defaultHeader) => {
                let found = raw.headers.find((header) => header[0].toLowerCase() === defaultHeader[0].toLowerCase());
                return found === undefined;
            });
            return Object.assign(Object.assign({}, raw), { headers: [
                    ...raw.headers,
                    ...headersToAppend
                ], payload });
        });
    }
    exports.finalizeResponse = finalizeResponse;
    ;
    function respond(httpResponse, raw, serverOptions) {
        var _a, e_1, _b, _c;
        var _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            let rawHeaders = new Array();
            for (let header of (_d = raw.headers) !== null && _d !== void 0 ? _d : []) {
                rawHeaders.push(...header);
            }
            httpResponse.writeHead((_e = raw.status) !== null && _e !== void 0 ? _e : 200, rawHeaders);
            try {
                for (var _g = true, _h = __asyncValues((_f = raw.payload) !== null && _f !== void 0 ? _f : []), _j; _j = yield _h.next(), _a = _j.done, !_a;) {
                    _c = _j.value;
                    _g = false;
                    try {
                        let chunk = _c;
                        if (!httpResponse.write(chunk)) {
                            yield new Promise((resolve, reject) => {
                                httpResponse.once("drain", resolve);
                            });
                        }
                    }
                    finally {
                        _g = true;
                    }
                }
            }
            catch (e_1_1) {
                e_1 = { error: e_1_1 };
            }
            finally {
                try {
                    if (!_g && !_a && (_b = _h.return))
                        yield _b.call(_h);
                }
                finally {
                    if (e_1)
                        throw e_1.error;
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
    function route(endpoints, httpRequest, httpResponse, serverOptions) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let urlPrefix = (_a = serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.urlPrefix) !== null && _a !== void 0 ? _a : "";
            let method = (_b = httpRequest.method) !== null && _b !== void 0 ? _b : "GET";
            let url = (_c = httpRequest.url) !== null && _c !== void 0 ? _c : "";
            if (!url.startsWith(urlPrefix)) {
                throw `Expected url "${url}" to have prefix "${urlPrefix}"!`;
            }
            url = url.slice(urlPrefix.length);
            try {
                let components = shared.api.splitComponents(url);
                let parameters = shared.api.splitParameters(url);
                let headers = shared.api.splitHeaders(combineNodeRawHeaders(httpRequest.rawHeaders));
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
                let allEndpoints = endpoints.map((endpoint) => endpoint(raw, auxillary));
                let endpointsAcceptingComponents = allEndpoints.filter((endpoint) => endpoint.acceptsComponents());
                if (endpointsAcceptingComponents.length === 0) {
                    return respond(httpResponse, {
                        status: 404
                    }, serverOptions);
                }
                let endpointsAcceptingComponentsAndMethod = endpointsAcceptingComponents.filter((endpoint) => endpoint.acceptsMethod());
                if (endpointsAcceptingComponentsAndMethod.length === 0) {
                    return respond(httpResponse, {
                        status: 405
                    }, serverOptions);
                }
                let endpoint = endpointsAcceptingComponentsAndMethod[0];
                let valid = yield endpoint.validateRequest();
                try {
                    let handled = yield valid.handleRequest();
                    try {
                        let raw = yield handled.validateResponse();
                        return yield respond(httpResponse, raw, serverOptions);
                    }
                    catch (error) {
                        return respond(httpResponse, {
                            status: 500,
                            payload: shared.api.serializeStringPayload(String(error))
                        }, serverOptions);
                    }
                }
                catch (error) {
                    if (typeof error === "number" && Number.isInteger(error) && error >= 100 && error <= 999) {
                        return respond(httpResponse, {
                            status: error
                        }, serverOptions);
                    }
                    if (error instanceof EndpointError) {
                        let raw = error.getResponse();
                        return respond(httpResponse, raw, serverOptions);
                    }
                    return respond(httpResponse, {
                        status: 500
                    }, serverOptions);
                }
            }
            catch (error) {
                return respond(httpResponse, {
                    status: 400,
                    payload: shared.api.serializeStringPayload(String(error))
                }, serverOptions);
            }
        });
    }
    exports.route = route;
    ;
    // TODO: Move to Nexus in v6.
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
    // TODO: Move to Nexus in v6.
    function getContentTypeFromExtension(extension) {
        let extensions = {
            ".aac": "audio/aac",
            ".bmp": "image/bmp",
            ".css": "text/css",
            ".csv": "text/csv",
            ".gif": "image/gif",
            ".htm": "text/html",
            ".html": "text/html",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".js": "text/javascript",
            ".json": "application/json",
            ".mid": "audio/midi",
            ".mp3": "audio/mpeg",
            ".mp4": "video/mp4",
            ".otf": "font/otf",
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".svg": "image/svg+xml",
            ".tif": "image/tiff",
            ".tiff": "image/tiff",
            ".ttf": "font/ttf",
            ".txt": "text/plain",
            ".wav": "audio/wav",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".xml": "text/xml"
        };
        return extensions[extension];
    }
    exports.getContentTypeFromExtension = getContentTypeFromExtension;
    ;
    // TODO: Move to Nexus in v6.
    function makeDirectoryListing(pathPrefix, pathSuffix, request) {
        let pathSuffixParts = libpath.normalize(pathSuffix).split(libpath.sep);
        if (pathSuffixParts[0] === "..") {
            throw 400;
        }
        if (pathSuffixParts[pathSuffixParts.length - 1] !== "") {
            pathSuffixParts.push("");
        }
        let fullPath = libpath.join(pathPrefix, ...pathSuffixParts);
        if (!libfs.existsSync(fullPath) || !libfs.statSync(fullPath).isDirectory()) {
            throw 404;
        }
        let directories = [];
        let files = [];
        let entries = libfs.readdirSync(fullPath);
        for (let entry of entries) {
            let stat = libfs.statSync(libpath.join(fullPath, entry));
            if (stat.isDirectory()) {
                directories.push({
                    name: entry
                });
                continue;
            }
            if (stat.isFile()) {
                files.push({
                    name: entry,
                    size: stat.size,
                    timestamp: stat.mtime.valueOf()
                });
                continue;
            }
        }
        directories.sort((one, two) => one.name.localeCompare(two.name));
        files.sort((one, two) => one.name.localeCompare(two.name));
        let components = pathSuffixParts;
        return {
            components,
            directories,
            files
        };
    }
    exports.makeDirectoryListing = makeDirectoryListing;
    ;
    // TODO: Move to Nexus in v6.
    function makeReadStreamResponse(pathPrefix, pathSuffix, request) {
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
        let stat = libfs.statSync(path);
        let range = parseRangeHeader(request.headers().range, stat.size);
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
                "Content-Type": getContentTypeFromExtension(libpath.extname(path)),
                "Last-Modified": stat.mtime.toUTCString()
            },
            payload: stream
        };
    }
    exports.makeReadStreamResponse = makeReadStreamResponse;
    ;
});
define("node_modules/@joelek/autoguard/dist/lib-server/index", ["require", "exports", "node_modules/@joelek/autoguard/dist/lib-shared/index", "node_modules/@joelek/autoguard/dist/lib-server/api"], function (require, exports, lib_shared_1, api) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.api = void 0;
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function () { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
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
define("build/shared/api/index", ["require", "exports", "node_modules/@joelek/autoguard/dist/lib-shared/index"], function (require, exports, autoguard) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file was auto-generated by @joelek/autoguard. Edit at own risk.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Autoguard = exports.Food = void 0;
    exports.Food = autoguard.guards.Object.of({
        "food_id": autoguard.guards.Number,
        "name": autoguard.guards.String
    }, {});
    var Autoguard;
    (function (Autoguard) {
        Autoguard.Guards = {
            "Food": autoguard.guards.Reference.of(() => exports.Food)
        };
        Autoguard.Requests = {
            "getFood": autoguard.guards.Object.of({
                "options": autoguard.guards.Intersection.of(autoguard.guards.Object.of({
                    "food_id": autoguard.guards.Number
                }, {}), autoguard.api.Options)
            }, {
                "headers": autoguard.guards.Intersection.of(autoguard.guards.Object.of({}, {}), autoguard.api.Headers),
                "payload": autoguard.api.Binary
            }),
            "getStaticContent": autoguard.guards.Object.of({}, {
                "options": autoguard.guards.Intersection.of(autoguard.guards.Object.of({}, {
                    "filename": autoguard.guards.Array.of(autoguard.guards.String)
                }), autoguard.api.Options),
                "headers": autoguard.guards.Intersection.of(autoguard.guards.Object.of({}, {}), autoguard.api.Headers),
                "payload": autoguard.api.Binary
            })
        };
        Autoguard.Responses = {
            "getFood": autoguard.guards.Object.of({
                "payload": autoguard.guards.Object.of({
                    "food": autoguard.guards.Reference.of(() => exports.Food)
                }, {})
            }, {
                "status": autoguard.guards.Integer,
                "headers": autoguard.guards.Intersection.of(autoguard.guards.Object.of({}, {}), autoguard.api.Headers)
            }),
            "getStaticContent": autoguard.guards.Object.of({}, {
                "status": autoguard.guards.Integer,
                "headers": autoguard.guards.Intersection.of(autoguard.guards.Object.of({}, {}), autoguard.api.Headers),
                "payload": autoguard.api.Binary
            })
        };
    })(Autoguard = exports.Autoguard || (exports.Autoguard = {}));
    ;
});
define("build/shared/api/server", ["require", "exports", "node_modules/@joelek/autoguard/dist/lib-server/index", "build/shared/api/index"], function (require, exports, autoguard, shared) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file was auto-generated by @joelek/autoguard. Edit at own risk.
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
    const makeServer = (routes, serverOptions) => {
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
                    let options = {};
                    options["food_id"] = matchers[1].getValue();
                    options = Object.assign(Object.assign({}, options), autoguard.api.decodeUndeclaredParameters(raw.parameters, Object.keys(options)));
                    let headers = {};
                    headers = Object.assign(Object.assign({}, headers), autoguard.api.decodeUndeclaredHeaders(raw.headers, Object.keys(headers)));
                    let payload = raw.payload;
                    let guard = autoguard.api.wrapMessageGuard(shared.Autoguard.Requests["getFood"], serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.debugMode);
                    let request = guard.as({ options, headers, payload }, "request");
                    return {
                        handleRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                            let response = yield routes["getFood"](new autoguard.api.ClientRequest(request, true, auxillary));
                            return {
                                validateResponse: () => __awaiter(void 0, void 0, void 0, function* () {
                                    var _a, _b, _c, _d;
                                    let guard = autoguard.api.wrapMessageGuard(shared.Autoguard.Responses["getFood"], serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.debugMode);
                                    guard.as(response, "response");
                                    let status = (_a = response.status) !== null && _a !== void 0 ? _a : 200;
                                    let headers = new Array();
                                    headers.push(...autoguard.api.encodeUndeclaredHeaderPairs((_b = response.headers) !== null && _b !== void 0 ? _b : {}, headers.map((header) => header[0])));
                                    let payload = autoguard.api.serializePayload(response.payload);
                                    let defaultHeaders = (_d = (_c = serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.defaultHeaders) === null || _c === void 0 ? void 0 : _c.slice()) !== null && _d !== void 0 ? _d : [];
                                    defaultHeaders.push(["Content-Type", "application/json; charset=utf-8"]);
                                    return autoguard.api.finalizeResponse({ status, headers, payload }, defaultHeaders);
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
            matchers.push(new autoguard.api.DynamicRouteMatcher(0, 255, true, autoguard.guards.String));
            return {
                acceptsComponents: () => autoguard.api.acceptsComponents(raw.components, matchers),
                acceptsMethod: () => autoguard.api.acceptsMethod(raw.method, method),
                validateRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                    let options = {};
                    options["filename"] = matchers[0].getValue();
                    options = Object.assign(Object.assign({}, options), autoguard.api.decodeUndeclaredParameters(raw.parameters, Object.keys(options)));
                    let headers = {};
                    headers = Object.assign(Object.assign({}, headers), autoguard.api.decodeUndeclaredHeaders(raw.headers, Object.keys(headers)));
                    let payload = raw.payload;
                    let guard = autoguard.api.wrapMessageGuard(shared.Autoguard.Requests["getStaticContent"], serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.debugMode);
                    let request = guard.as({ options, headers, payload }, "request");
                    return {
                        handleRequest: () => __awaiter(void 0, void 0, void 0, function* () {
                            let response = yield routes["getStaticContent"](new autoguard.api.ClientRequest(request, true, auxillary));
                            return {
                                validateResponse: () => __awaiter(void 0, void 0, void 0, function* () {
                                    var _a, _b, _c, _d, _e;
                                    let guard = autoguard.api.wrapMessageGuard(shared.Autoguard.Responses["getStaticContent"], serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.debugMode);
                                    guard.as(response, "response");
                                    let status = (_a = response.status) !== null && _a !== void 0 ? _a : 200;
                                    let headers = new Array();
                                    headers.push(...autoguard.api.encodeUndeclaredHeaderPairs((_b = response.headers) !== null && _b !== void 0 ? _b : {}, headers.map((header) => header[0])));
                                    let payload = (_c = response.payload) !== null && _c !== void 0 ? _c : [];
                                    let defaultHeaders = (_e = (_d = serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.defaultHeaders) === null || _d === void 0 ? void 0 : _d.slice()) !== null && _e !== void 0 ? _e : [];
                                    defaultHeaders.push(["Content-Type", "application/octet-stream"]);
                                    return autoguard.api.finalizeResponse({ status, headers, payload }, defaultHeaders);
                                })
                            };
                        })
                    };
                })
            };
        });
        return (request, response) => autoguard.api.route(endpoints, request, response, serverOptions);
    };
    exports.makeServer = makeServer;
});
define("build/server/index", ["require", "exports", "node_modules/@joelek/autoguard/dist/lib-server/index", "http", "build/shared/api/server"], function (require, exports, autoguard, libhttp, libserver) {
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
function define(e,t,n){let l=define;function u(e){return require(e)}null==l.moduleStates&&(l.moduleStates=new Map),null==l.dependentsMap&&(l.dependentsMap=new Map);let i=l.moduleStates.get(e);if(null!=i)throw new Error("Duplicate module found with name "+e+"!");i={initializer:n,dependencies:t,module:null},l.moduleStates.set(e,i);for(let n of t){let t=l.dependentsMap.get(n);null==t&&(t=new Set,l.dependentsMap.set(n,t)),t.add(e)}!function e(t){let n=l.moduleStates.get(t);if(null==n||null!=n.module)return;let i=Array(),o={exports:{}};for(let e of n.dependencies){if("require"===e){i.push(u);continue}if("module"===e){i.push(o);continue}if("exports"===e){i.push(o.exports);continue}try{i.push(u(e));continue}catch(e){}let t=l.moduleStates.get(e);if(null==t||null==t.module)return;i.push(t.module.exports)}"function"==typeof n.initializer?n.initializer(...i):o.exports=n.initializer,n.module=o;let d=l.dependentsMap.get(t);if(null!=d)for(let t of d)e(t)}(e)}