// dsh-media-workbench 0.1.4 — built from src/server. Do not edit; run npm run build.
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/yaml/dist/nodes/identity.js"(exports) {
    "use strict";
    var ALIAS = Symbol.for("yaml.alias");
    var DOC = Symbol.for("yaml.document");
    var MAP = Symbol.for("yaml.map");
    var PAIR = Symbol.for("yaml.pair");
    var SCALAR = Symbol.for("yaml.scalar");
    var SEQ = Symbol.for("yaml.seq");
    var NODE_TYPE = Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports.ALIAS = ALIAS;
    exports.DOC = DOC;
    exports.MAP = MAP;
    exports.NODE_TYPE = NODE_TYPE;
    exports.PAIR = PAIR;
    exports.SCALAR = SCALAR;
    exports.SEQ = SEQ;
    exports.hasAnchor = hasAnchor;
    exports.isAlias = isAlias;
    exports.isCollection = isCollection;
    exports.isDocument = isDocument;
    exports.isMap = isMap;
    exports.isNode = isNode;
    exports.isPair = isPair;
    exports.isScalar = isScalar;
    exports.isSeq = isSeq;
  }
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/yaml/dist/visit.js"(exports) {
    "use strict";
    var identity = require_identity();
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path13) {
      const ctrl = callVisitor(key, node, visitor, path13);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path13, ctrl);
        return visit_(key, ctrl, visitor, path13);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path13 = Object.freeze(path13.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = visit_(i, node.items[i], visitor, path13);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path13 = Object.freeze(path13.concat(node));
          const ck = visit_("key", node.key, visitor, path13);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path13);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path13) {
      const ctrl = await callVisitor(key, node, visitor, path13);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path13, ctrl);
        return visitAsync_(key, ctrl, visitor, path13);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path13 = Object.freeze(path13.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = await visitAsync_(i, node.items[i], visitor, path13);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path13 = Object.freeze(path13.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path13);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path13);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path13) {
      if (typeof visitor === "function")
        return visitor(key, node, path13);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path13);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path13);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path13);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path13);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path13);
      return void 0;
    }
    function replaceNode(key, path13, node) {
      const parent = path13[path13.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports.visit = visit;
    exports.visitAsync = visitAsync;
  }
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/yaml/dist/doc/directives.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name2 = parts.shift();
        switch (name2) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name2}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports.Directives = Directives;
  }
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/yaml/dist/doc/anchors.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name2 = `${prefix}${i}`;
        if (!exclude.has(name2))
          return name2;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          if (!prevAnchors)
            prevAnchors = anchorNames(doc);
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports.anchorIsValid = anchorIsValid;
    exports.anchorNames = anchorNames;
    exports.createNodeAnchors = createNodeAnchors;
    exports.findNewAnchor = findNewAnchor;
  }
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/yaml/dist/doc/applyReviver.js"(exports) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports.applyReviver = applyReviver;
  }
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/yaml/dist/nodes/toJS.js"(exports) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports.toJS = toJS;
  }
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/yaml/dist/nodes/Node.js"(exports) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports.NodeBase = NodeBase;
  }
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/yaml/dist/nodes/Alias.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc) {
        let found = void 0;
        visit.visit(doc, {
          Node: (_key, node) => {
            if (node === this)
              return visit.visit.BREAK;
            if (node.anchor === this.source)
              found = node;
          }
        });
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const { anchors: anchors2, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        let data = anchors2.get(source);
        if (!data) {
          toJS.toJS(source, null, ctx);
          data = anchors2.get(source);
        }
        if (!data || data.res === void 0) {
          const msg = "This should not happen: Alias anchor was not resolved?";
          throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
          data.count += 1;
          if (data.aliasCount === 0)
            data.aliasCount = getAliasCount(doc, source, anchors2);
          if (data.count * data.aliasCount > maxAliasCount) {
            const msg = "Excessive alias count indicates a resource exhaustion attack";
            throw new ReferenceError(msg);
          }
        }
        return data.res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports.Alias = Alias;
  }
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/yaml/dist/nodes/Scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports.Scalar = Scalar;
    exports.isScalarValue = isScalarValue;
  }
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/yaml/dist/doc/createNode.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          if (!ref.anchor)
            ref.anchor = onAnchor(value);
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports.createNode = createNode;
  }
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/yaml/dist/nodes/Collection.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path13, value) {
      let v = value;
      for (let i = path13.length - 1; i >= 0; --i) {
        const k = path13[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path13) => path13 == null || typeof path13 === "object" && !!path13[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path13, value) {
        if (isEmptyPath(path13))
          this.add(value);
        else {
          const [key, ...rest] = path13;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path13) {
        const [key, ...rest] = path13;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path13, keepScalar) {
        const [key, ...rest] = path13;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path13) {
        const [key, ...rest] = path13;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path13, value) {
        const [key, ...rest] = path13;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports.Collection = Collection;
    exports.collectionFromPath = collectionFromPath;
    exports.isEmptyPath = isEmptyPath;
  }
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyComment.js"(exports) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports.indentComment = indentComment;
    exports.lineComment = lineComment;
    exports.stringifyComment = stringifyComment;
  }
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/yaml/dist/stringify/foldFlowLines.js"(exports) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent) {
      let end = i;
      let start = i + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports.FOLD_BLOCK = FOLD_BLOCK;
    exports.FOLD_FLOW = FOLD_FLOW;
    exports.FOLD_QUOTED = FOLD_QUOTED;
    exports.foldFlowLines = foldFlowLines;
  }
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyString.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str += json.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str += json.slice(start, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str += json.slice(start, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str += "\n";
                  i += 2;
                }
                str += indent;
                if (json[i + 2] === " ")
                  str += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str = start ? str + json.slice(start) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body2 = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body2}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (!value || /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports.stringifyString = stringifyString;
  }
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/yaml/dist/stringify/stringify.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name2 = obj?.constructor?.name ?? typeof obj;
        throw new Error(`Tag not resolved for ${name2} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      if (!tagObj)
        tagObj = getTagObject(ctx.doc.schema.tags, node);
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports.createStringifyContext = createStringifyContext;
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyPair.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n")
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports.stringifyPair = stringifyPair;
  }
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/yaml/dist/log.js"(exports) {
    "use strict";
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof process !== "undefined" && process.emitWarning)
          process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports.debug = debug;
    exports.warn = warn;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      value = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
      if (identity.isSeq(value))
        for (const it of value.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(value))
        for (const it of value)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, value);
    }
    function mergeValue(ctx, map, value) {
      const source = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    exports.addMergeToJSMap = addMergeToJSMap;
    exports.isMergeKey = isMergeKey;
    exports.merge = merge;
  }
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/yaml/dist/nodes/Pair.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports.Pair = Pair;
    exports.createPair = createPair;
  }
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyCollection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        if (i < items.length - 1)
          str += ",";
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        if (!reqNewline && (lines.length > linesAtValue || str.includes("\n")))
          reqNewline = true;
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports.stringifyCollection = stringifyCollection;
  }
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLMap.js"(exports) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports.YAMLMap = YAMLMap;
    exports.findPair = findPair;
  }
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/yaml/dist/schema/common/map.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports.map = map;
  }
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLSeq.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports.YAMLSeq = YAMLSeq;
  }
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/yaml/dist/schema/common/seq.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports.seq = seq;
  }
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/yaml/dist/schema/common/string.js"(exports) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports.string = string;
  }
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/yaml/dist/schema/common/null.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports.nullTag = nullTag;
  }
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/yaml/dist/schema/core/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports.boolTag = boolTag;
  }
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyNumber.js"(exports) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num = typeof value === "number" ? value : Number(value);
      if (!isFinite(num))
        return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
      let n = JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports.stringifyNumber = stringifyNumber;
  }
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/yaml/dist/schema/core/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/yaml/dist/schema/core/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/yaml/dist/schema/core/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/yaml/dist/schema/json/schema.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof Buffer === "function") {
          return Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i = 0; i < str.length; ++i)
            buffer[i] = str.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        const buf = value;
        let str;
        if (typeof Buffer === "function") {
          str = buf instanceof Buffer ? buf.toString("base64") : Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        if (!type)
          type = Scalar.Scalar.BLOCK_LITERAL;
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str.substr(o, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports.binary = binary;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports.createPairs = createPairs;
    exports.pairs = pairs;
    exports.resolvePairs = resolvePairs;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports.YAMLOMap = YAMLOMap;
    exports.omap = omap;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports.falseTag = falseTag;
    exports.trueTag = trueTag;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intBin = intBin;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports.YAMLSet = YAMLSet;
    exports.set = set;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
      return sign === "-" ? num(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num = (n) => n;
      if (typeof value === "bigint")
        num = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num(-1);
      }
      const _60 = num(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value.toISOString().replace(/(T00:00:00)?\.000Z$/, "")
    };
    exports.floatTime = floatTime;
    exports.intTime = intTime;
    exports.timestamp = timestamp;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/yaml/dist/schema/tags.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports.coreKnownTags = coreKnownTags;
    exports.getTags = getTags;
  }
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/yaml/dist/schema/Schema.js"(exports) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema2 = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports.Schema = Schema2;
  }
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyDocument.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body2 = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body2 += stringifyComment.lineComment(body2, "", commentString(contentComment));
        if ((body2[0] === "|" || body2[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body2}`;
        } else
          lines.push(body2);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports.stringifyDocument = stringifyDocument;
  }
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/yaml/dist/doc/Document.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema2 = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path13, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path13, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name2) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name2 || prev.has(name2) ? anchors.findNewAnchor(name2 || "a", prev) : name2;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path13) {
        if (Collection.isEmptyPath(path13)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path13) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path13, keepScalar) {
        if (Collection.isEmptyPath(path13))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path13, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path13) {
        if (Collection.isEmptyPath(path13))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path13) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path13, value) {
        if (Collection.isEmptyPath(path13)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path13), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path13, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema2.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports.Document = Document;
  }
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/yaml/dist/errors.js"(exports) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name2, pos, code, message) {
        super();
        this.name = name2;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end && end.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports.YAMLError = YAMLError;
    exports.YAMLParseError = YAMLParseError;
    exports.YAMLWarning = YAMLWarning;
    exports.prettifyError = prettifyError;
  }
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/yaml/dist/compose/resolve-props.js"(exports) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            if (start === null)
              start = token.offset;
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            if (start === null)
              start = token.offset;
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports.resolveProps = resolveProps;
  }
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/yaml/dist/compose/util-contains-newline.js"(exports) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports.containsNewline = containsNewline;
  }
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/yaml/dist/compose/util-map-includes.js"(exports) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports.mapIncludes = mapIncludes;
  }
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-map.js"(exports) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-seq.js"(exports) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value && value.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/yaml/dist/compose/resolve-end.js"(exports) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports.resolveEnd = resolveEnd;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source && value.source[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce && ce.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name2 = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name2} must end with a ${expectedEnd}` : `${name2} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/yaml/dist/compose/compose-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt && kt.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt?.collection) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports.composeCollection = composeCollection;
  }
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines2(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines2(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return foldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return foldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function foldLines(source) {
      let first, line;
      try {
        first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
        line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
      } catch {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
      }
      let match = first.exec(source);
      if (!match)
        return source;
      let res = match[1];
      let sep = " ";
      let pos = first.lastIndex;
      line.lastIndex = pos;
      while (match = line.exec(source)) {
        if (match[1] === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + match[1];
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = { x: 2, u: 4, U: 8 }[next];
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      if (isNaN(code)) {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
      return String.fromCodePoint(code);
    }
    exports.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/yaml/dist/compose/compose-scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports.composeScalar = composeScalar;
  }
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        if (pos === null)
          pos = before.length;
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/yaml/dist/compose/compose-node.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          node = composeCollection.composeCollection(CN, ctx, token, props, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError);
          isSrcToken = false;
        }
      }
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports.composeEmptyNode = composeEmptyNode;
    exports.composeNode = composeNode;
  }
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/yaml/dist/compose/compose-doc.js"(exports) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports.composeDoc = composeDoc;
  }
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/yaml/dist/compose/composer.js"(exports) {
    "use strict";
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          Array.prototype.push.apply(doc.errors, this.errors);
          Array.prototype.push.apply(doc.warnings, this.warnings);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports.Composer = Composer;
  }
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/yaml/dist/parse/cst-scalar.js"(exports) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body2 = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body2 };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body2 = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body2;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body2 });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports.createScalarToken = createScalarToken;
    exports.resolveAsScalar = resolveAsScalar;
    exports.setScalarValue = setScalarValue;
  }
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/yaml/dist/parse/cst-stringify.js"(exports) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/yaml/dist/parse/cst-visit.js"(exports) {
    "use strict";
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path13) => {
      let item = cst;
      for (const [field, index] of path13) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path13) => {
      const parent = visit.itemAtPath(cst, path13.slice(0, -1));
      const field = path13[path13.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path13, item, visitor) {
      let ctrl = visitor(item, path13);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path13.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path13);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path13) : ctrl;
    }
    exports.visit = visit;
  }
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/yaml/dist/parse/cst.js"(exports) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports.createScalarToken = cstScalar.createScalarToken;
    exports.resolveAsScalar = cstScalar.resolveAsScalar;
    exports.setScalarValue = cstScalar.setScalarValue;
    exports.stringify = cstStringify.stringify;
    exports.visit = cstVisit.visit;
    exports.BOM = BOM;
    exports.DOCUMENT = DOCUMENT;
    exports.FLOW_END = FLOW_END;
    exports.SCALAR = SCALAR;
    exports.isCollection = isCollection;
    exports.isScalar = isScalar;
    exports.prettyToken = prettyToken;
    exports.tokenType = tokenType;
  }
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/yaml/dist/parse/lexer.js"(exports) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return yield* this.parseBlockStart();
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote2 = this.charAt(0);
        let end = this.buffer.indexOf(quote2, this.pos + 1);
        if (quote2 === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        switch (this.charAt(0)) {
          case "!":
            return (yield* this.pushTag()) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
          case "&":
            return (yield* this.pushUntil(isNotAnchorChar)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
          case "-":
          // this is an error
          case "?":
          // this is an error outside flow collections
          case ":": {
            const inFlow = this.flowLevel > 0;
            const ch1 = this.charAt(1);
            if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
              if (!inFlow)
                this.indentNext = this.indentValue + 1;
              else if (this.flowKey)
                this.flowKey = false;
              return (yield* this.pushCount(1)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
            }
          }
        }
        return 0;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports.Lexer = Lexer;
  }
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/yaml/dist/parse/line-counter.js"(exports) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports.LineCounter = LineCounter;
  }
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/yaml/dist/parse/parser.js"(exports) {
    "use strict";
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                Array.prototype.push.apply(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              Array.prototype.push.apply(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && (!top || top.type !== "doc-end")) {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  Array.prototype.push.apply(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (atMapIndent && bv.type !== "block-seq") {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  Array.prototype.push.apply(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top && top.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports.Parser = Parser;
  }
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/yaml/dist/public-api.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports.parse = parse;
    exports.parseAllDocuments = parseAllDocuments;
    exports.parseDocument = parseDocument;
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/yaml/dist/index.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema2 = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports.Composer = composer.Composer;
    exports.Document = Document.Document;
    exports.Schema = Schema2.Schema;
    exports.YAMLError = errors.YAMLError;
    exports.YAMLParseError = errors.YAMLParseError;
    exports.YAMLWarning = errors.YAMLWarning;
    exports.Alias = Alias.Alias;
    exports.isAlias = identity.isAlias;
    exports.isCollection = identity.isCollection;
    exports.isDocument = identity.isDocument;
    exports.isMap = identity.isMap;
    exports.isNode = identity.isNode;
    exports.isPair = identity.isPair;
    exports.isScalar = identity.isScalar;
    exports.isSeq = identity.isSeq;
    exports.Pair = Pair.Pair;
    exports.Scalar = Scalar.Scalar;
    exports.YAMLMap = YAMLMap.YAMLMap;
    exports.YAMLSeq = YAMLSeq.YAMLSeq;
    exports.CST = cst;
    exports.Lexer = lexer.Lexer;
    exports.LineCounter = lineCounter.LineCounter;
    exports.Parser = parser.Parser;
    exports.parse = publicApi.parse;
    exports.parseAllDocuments = publicApi.parseAllDocuments;
    exports.parseDocument = publicApi.parseDocument;
    exports.stringify = publicApi.stringify;
    exports.visit = visit.visit;
    exports.visitAsync = visit.visitAsync;
  }
});

// src/server/index.js
import Schema from "@deepseek-ai/schemastery";
import { readFile as readFile3 } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// src/server/lib/service.js
import { watch } from "node:fs";
import { readdir as readdir5, stat as stat4, mkdir as mkdir8, readFile as readFile2 } from "node:fs/promises";
import { spawn as spawn2 } from "node:child_process";
import path10 from "node:path";
import os2 from "node:os";

// src/server/lib/util.js
import { mkdir, readFile, rename, writeFile, stat, appendFile, realpath, lstat } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
var WorkbenchError = class extends Error {
  /** @param {string} message @param {number} [status] @param {string} [code] */
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
};
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var sha1 = (text) => createHash("sha1").update(text).digest("hex");
var shortId = (prefix = "") => prefix + randomBytes(5).toString("hex");
async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}
async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    if (error instanceof SyntaxError) throw new WorkbenchError(`\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u7684 JSON\uFF1A${path.basename(file)}`, 500, "BAD_JSON");
    throw error;
  }
}
async function writeAtomic(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(temp, data);
  try {
    await rename(temp, file);
  } catch (error) {
    if (error.code !== "EPERM" && error.code !== "EBUSY") throw error;
    await new Promise((resolve) => setTimeout(resolve, 80));
    await rename(temp, file);
  }
}
var writeJson = (file, value) => writeAtomic(file, JSON.stringify(value, null, 2) + "\n");
async function readText(file, fallback = null) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}
function inside(root, relative) {
  if (typeof relative !== "string" || relative.includes("\0")) throw new WorkbenchError("\u8DEF\u5F84\u65E0\u6548\u3002");
  const resolved = path.resolve(root, relative);
  const rel = path.relative(root, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) throw new WorkbenchError("\u53EA\u80FD\u8BBF\u95EE\u9879\u76EE\u6587\u4EF6\u5939\u5185\u7684\u6587\u4EF6\u3002", 403, "OUTSIDE_PROJECT");
  return resolved;
}
var toPosix = (p) => p.split(path.sep).join("/");
var relTo = (root, file) => toPosix(path.relative(root, file));
async function realDirectory(dir) {
  if (typeof dir !== "string" || !dir.trim()) throw new WorkbenchError("\u8BF7\u9009\u62E9\u9879\u76EE\u6587\u4EF6\u5939\u3002");
  let real;
  try {
    real = await realpath(dir);
  } catch {
    throw new WorkbenchError("\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u6216\u65E0\u6CD5\u8BBF\u95EE\u3002", 404, "NOT_FOUND");
  }
  const info = await lstat(real);
  if (!info.isDirectory()) throw new WorkbenchError("\u6240\u9009\u8DEF\u5F84\u4E0D\u662F\u6587\u4EF6\u5939\u3002");
  return real;
}
function createLocks() {
  const chains = /* @__PURE__ */ new Map();
  return function lock(key, task) {
    const previous = chains.get(key) || Promise.resolve();
    const next = previous.then(task, task);
    const settled = next.catch(() => {
    });
    chains.set(key, settled);
    settled.then(() => {
      if (chains.get(key) === settled) chains.delete(key);
    });
    return next;
  };
}
async function appendLog(root, entry) {
  try {
    const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const file = path.join(root, ".dsh", "log", `${day}.jsonl`);
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(file, JSON.stringify({ at: now(), ...entry }) + "\n");
  } catch {
  }
}
var round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;
var MEDIA_EXTENSIONS = /* @__PURE__ */ new Set([".mp4", ".mov", ".mts", ".m2ts", ".mxf", ".avi", ".mkv", ".m4v"]);

// src/server/lib/project.js
import { mkdir as mkdir3, readdir as readdir2 } from "node:fs/promises";
import path3 from "node:path";

// src/server/lib/layout.js
var LIBRARIES = [
  { key: "raw", dir: "\u539F\u59CB\u7D20\u6750\u5E93", label: "\u539F\u59CB\u7D20\u6750\u5E93", hint: "\u539F\u7247\uFF0C\u53EA\u8BFB" },
  { key: "output", dir: "\u8F93\u51FA\u7D20\u6750\u5E93", label: "\u8F93\u51FA\u7D20\u6750\u5E93", hint: "\u5207\u7247\u7D20\u6750\u4E0E\u6210\u7247" },
  { key: "creative", dir: "\u521B\u610F\u526A\u8F91", label: "\u521B\u610F\u526A\u8F91", hint: "\u6587\u6848\u3001\u5206\u955C\u3001\u526A\u8F91\u601D\u8DEF\u4E0E\u65F6\u95F4\u7EBF" }
];
var P = {
  raw: "\u539F\u59CB\u7D20\u6750\u5E93",
  output: "\u8F93\u51FA\u7D20\u6750\u5E93",
  clips: "\u8F93\u51FA\u7D20\u6750\u5E93/\u5207\u7247\u7D20\u6750",
  export: "\u8F93\u51FA\u7D20\u6750\u5E93/\u6210\u7247",
  tags: ".dsh/tags",
  dictionary: ".dsh/tags/\u6807\u7B7E\u5B57\u5178.yaml",
  cleanReport: ".dsh/tags/\u6E05\u6D17\u62A5\u544A.json",
  rejected: ".dsh/tags/\u4E22\u5F03\u767B\u8BB0",
  creative: "\u521B\u610F\u526A\u8F91",
  refs: "\u521B\u610F\u526A\u8F91/\u53C2\u8003\u8D44\u6599",
  editData: "\u521B\u610F\u526A\u8F91/\u526A\u8F91\u6570\u636E"
};
var PROJECT_DIRS = [P.raw, P.clips, P.export, P.tags, P.rejected, P.creative, P.refs, P.editData, ".dsh/log", ".dsh/cache"];
var LEGACY_TAGS_DIR = "\u6807\u7B7E\u7BA1\u7406";
var RESERVED_DIRS = /* @__PURE__ */ new Set([
  P.output,
  P.creative,
  LEGACY_TAGS_DIR,
  ".dsh",
  "_history",
  "node_modules",
  ".git",
  // v1 layout names, so an un-migrated or partially migrated project is never re-imported as raw footage.
  "01_creative",
  "03_clips",
  "04_generated",
  "05_edit",
  "06_export",
  "00_brief"
]);
var LAYOUT_VERSION = 3;

// src/server/lib/migrate.js
import { mkdir as mkdir2, readdir, rename as rename2, rmdir, stat as stat2 } from "node:fs/promises";
import path2 from "node:path";
async function migrateLayout(root, project, from = project.layout || 1) {
  const moved = [];
  const kept = [];
  const rawSources = [...project.rawSources || []];
  const abs = (rel) => path2.join(root, rel);
  for (const sub of PROJECT_DIRS) await mkdir2(abs(sub), { recursive: true });
  async function move(fromRel, toRel) {
    const from2 = abs(fromRel);
    const to = abs(toRel);
    if (!await exists(from2)) return false;
    if (await exists(to)) {
      kept.push(fromRel);
      return false;
    }
    await mkdir2(path2.dirname(to), { recursive: true });
    await rename2(from2, to);
    moved.push([fromRel, toRel]);
    return true;
  }
  async function list(rel) {
    try {
      return await readdir(abs(rel), { withFileTypes: true });
    } catch {
      return [];
    }
  }
  async function moveAll(fromDir, toDir, renameFn = (n) => n, filter = () => true) {
    for (const entry of await list(fromDir)) {
      if (!filter(entry)) continue;
      await move(`${fromDir}/${entry.name}`, `${toDir}/${renameFn(entry.name)}`);
    }
  }
  if (from < 2) await fromV1();
  const legacy = LEGACY_TAGS_DIR;
  await move(`${legacy}/\u6807\u7B7E\u5B57\u5178.yaml`, P.dictionary);
  await moveAll(`${legacy}/_history`, `${P.tags}/_history`, (n) => n, (e) => /^标签字典_v\d+/.test(e.name));
  await move(`${legacy}/\u6E05\u6D17\u62A5\u544A.json`, P.cleanReport);
  await moveAll(`${legacy}/\u4E22\u5F03\u767B\u8BB0`, P.rejected, (n) => n, (e) => e.isFile() && e.name.endsWith(".json"));
  for (const dir of [`${legacy}/\u4E22\u5F03\u767B\u8BB0`, `${legacy}/_history`, legacy]) await removeIfEmpty(abs(dir));
  await appendLog(root, { action: "project.migrateLayout", from, to: 3, moved: moved.length, kept });
  return { moved, kept, project: { rawSources } };
  async function fromV1() {
    for (const name2 of ["00_\u4E3B\u9898\u7B80\u62A5.md", "01_\u521B\u610F\u65B9\u5411.md", "02_\u6587\u6848.md", "03_\u5206\u955C\u811A\u672C.md"]) await move(`01_creative/${name2}`, `${P.creative}/${name2}`);
    await move("01_creative/04_\u6807\u7B7E\u5B57\u5178.yaml", P.dictionary);
    for (const entry of await list("01_creative/_history")) {
      if (entry.name.startsWith("04_\u6807\u7B7E\u5B57\u5178_")) await move(`01_creative/_history/${entry.name}`, `${P.tags}/_history/${entry.name.replace(/^04_标签字典_/, "\u6807\u7B7E\u5B57\u5178_")}`);
      else await move(`01_creative/_history/${entry.name}`, `${P.creative}/_history/${entry.name}`);
    }
    await moveAll("01_creative", P.creative, (n) => n, (e) => e.name !== "_history");
    await move("05_edit/\u526A\u8F91\u601D\u8DEF.md", `${P.creative}/\u526A\u8F91\u601D\u8DEF.md`);
    await move("05_edit/\u7F3A\u53E3\u6E05\u5355.md", `${P.creative}/\u7F3A\u53E3\u6E05\u5355.md`);
    await moveAll("05_edit/_history", `${P.creative}/_history`);
    await moveAll("05_edit", P.editData, (n) => n, (e) => e.name !== "_history");
    await move("03_clips/clean_report.json", P.cleanReport);
    await moveAll("03_clips/_rejected", P.rejected);
    await moveAll("03_clips", P.clips, (n) => n, (e) => e.name !== "_rejected");
    await moveAll("06_export", P.export);
    await moveAll("00_brief", P.refs);
    await moveAll("04_generated", `${P.output}/AI\u751F\u6210`);
    if ((await list("02_raw")).length && !rawSources.includes("02_raw")) rawSources.push("02_raw");
    const indexFile = abs(".dsh/index.json");
    const index = await readJson(indexFile, null);
    if (index?.clips) {
      for (const clip of Object.values(index.clips)) {
        if (typeof clip.proxy === "string" && clip.proxy.startsWith("03_clips/")) clip.proxy = `${P.clips}/${clip.proxy.slice("03_clips/".length)}`;
      }
      await writeJson(indexFile, index);
    }
    const metaFile2 = abs(".dsh/creative.json");
    const meta = await readJson(metaFile2, null);
    if (meta?.files?.["04_\u6807\u7B7E\u5B57\u5178.yaml"]) {
      meta.files["\u6807\u7B7E\u5B57\u5178.yaml"] ||= meta.files["04_\u6807\u7B7E\u5B57\u5178.yaml"];
      delete meta.files["04_\u6807\u7B7E\u5B57\u5178.yaml"];
      await writeJson(metaFile2, meta);
    }
    await move(".dsh/cache/creative/04_\u6807\u7B7E\u5B57\u5178.yaml", ".dsh/cache/creative/\u6807\u7B7E\u5B57\u5178.yaml");
    for (const dir of ["01_creative/_history", "01_creative", "05_edit/_history", "05_edit", "03_clips/_rejected", "03_clips", "06_export", "00_brief", "04_generated", "02_raw"]) {
      await removeIfEmpty(abs(dir));
    }
  }
}
async function removeIfEmpty(dir) {
  try {
    const info = await stat2(dir);
    if (!info.isDirectory()) return;
    if ((await readdir(dir)).length === 0) await rmdir(dir);
  } catch {
  }
}

// src/server/lib/project.js
var DEFAULT_CLEAN_RULES = {
  version: "clean-rules v1",
  sharpnessMin: 60,
  shakeVarianceMax: 3,
  minDuration: 1.5,
  blackLuma: 16,
  blackRatioMax: 0.9,
  duplicateSimilarity: 0.95
};
var DEFAULT_SPEC = { aspect: "16:9", width: 3840, height: 2160, fps: 25, targetDuration: null };
var projectFile = (root) => path3.join(root, ".dsh", "project.json");
function createRegistry(home) {
  const file = path3.join(home, "projects.json");
  const lock = createLocks();
  const read = async () => {
    const data = await readJson(file, { schema: 1, projects: [] });
    if (!Array.isArray(data.projects)) data.projects = [];
    return data;
  };
  const mutate = (fn) => lock("registry", async () => {
    const data = await read();
    const result = await fn(data);
    await writeJson(file, data);
    return result;
  });
  return {
    read,
    async list() {
      const data = await read();
      const items = [];
      for (const entry of data.projects) {
        const ok = await exists(projectFile(entry.path));
        items.push({ ...entry, missing: !ok });
      }
      return items.sort((a, b) => Number(Boolean(a.archived)) - Number(Boolean(b.archived)) || String(b.openedAt || "").localeCompare(String(a.openedAt || "")));
    },
    async get(id) {
      const data = await read();
      const entry = data.projects.find((item) => item.id === id);
      if (!entry) throw new WorkbenchError("\u9879\u76EE\u4E0D\u5B58\u5728\u6216\u5DF2\u4ECE\u5217\u8868\u79FB\u9664\u3002", 404, "NO_PROJECT");
      return entry;
    },
    async findByPath(dir) {
      const data = await read();
      const key = path3.resolve(dir).toLowerCase();
      return data.projects.find((item) => path3.resolve(item.path).toLowerCase() === key) || null;
    },
    upsert(entry) {
      return mutate((data) => {
        const index = data.projects.findIndex((item) => item.id === entry.id);
        if (index >= 0) data.projects[index] = { ...data.projects[index], ...entry };
        else data.projects.push(entry);
        return data.projects.find((item) => item.id === entry.id);
      });
    },
    patch(id, values) {
      return mutate((data) => {
        const entry = data.projects.find((item) => item.id === id);
        if (!entry) throw new WorkbenchError("\u9879\u76EE\u4E0D\u5B58\u5728\u3002", 404, "NO_PROJECT");
        Object.assign(entry, values);
        return entry;
      });
    },
    remove(id) {
      return mutate((data) => {
        data.projects = data.projects.filter((item) => item.id !== id);
      });
    }
  };
}
async function readProject(root) {
  const data = await readJson(projectFile(root), null);
  if (!data) throw new WorkbenchError("\u8FD9\u4E2A\u6587\u4EF6\u5939\u8FD8\u4E0D\u662F\u5A92\u4F53\u9879\u76EE\uFF08\u7F3A\u5C11 .dsh/project.json\uFF09\u3002", 404, "NOT_PROJECT");
  data.spec = { ...DEFAULT_SPEC, ...data.spec || {} };
  data.cleanRules = { ...DEFAULT_CLEAN_RULES, ...data.cleanRules || {} };
  data.rawSources = Array.isArray(data.rawSources) ? data.rawSources : [];
  data.eagle = { folderId: null, folderName: data.name, ...data.eagle || {} };
  return data;
}
var writeProject = (root, data) => writeJson(projectFile(root), { ...data, updatedAt: now() });
async function discoverRawSources(root) {
  const sources = [];
  const entries = await readdir2(root, { withFileTypes: true });
  if (entries.some((entry) => entry.isFile() && MEDIA_EXTENSIONS.has(path3.extname(entry.name).toLowerCase()))) sources.push(".");
  for (const entry of entries) {
    if (!entry.isDirectory() || RESERVED_DIRS.has(entry.name) || entry.name === P.raw || entry.name.startsWith(".")) continue;
    if (await containsMedia(path3.join(root, entry.name), 3)) sources.push(toPosix(entry.name));
  }
  return sources;
}
async function containsMedia(dir, depth) {
  if (depth < 0) return false;
  let entries;
  try {
    entries = await readdir2(dir, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const entry of entries) {
    if (entry.isFile() && MEDIA_EXTENSIONS.has(path3.extname(entry.name).toLowerCase())) return true;
  }
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".") && await containsMedia(path3.join(dir, entry.name), depth - 1)) return true;
  }
  return false;
}
async function initProject(dir, { name: name2, spec, template } = {}) {
  const root = await realDirectory(dir);
  const existing = await readJson(projectFile(root), null);
  if (existing) {
    await ensureLayout(root);
    return { root, project: await readProject(root), created: false };
  }
  const rawSources = await discoverRawSources(root);
  for (const sub of PROJECT_DIRS) await mkdir3(path3.join(root, sub), { recursive: true });
  const project = {
    schema: 1,
    layout: LAYOUT_VERSION,
    id: shortId("p_"),
    name: typeof name2 === "string" && name2.trim() || path3.basename(root),
    createdAt: now(),
    spec: { ...DEFAULT_SPEC, ...sanitizeSpec(spec) },
    template: typeof template === "string" && template ? template : "vlog-base",
    cleanRules: { ...DEFAULT_CLEAN_RULES },
    rawSources,
    eagle: { folderId: null, folderName: typeof name2 === "string" && name2.trim() || path3.basename(root) },
    jianyingDraftDir: ""
  };
  await writeProject(root, project);
  return { root, project, created: true };
}
function sanitizeSpec(spec) {
  if (!spec || typeof spec !== "object") return {};
  const out = {};
  if (["16:9", "9:16", "1:1", "4:3"].includes(spec.aspect)) out.aspect = spec.aspect;
  for (const key of ["width", "height"]) if (Number.isInteger(spec[key]) && spec[key] >= 160 && spec[key] <= 8192) out[key] = spec[key];
  if ([23.976, 24, 25, 29.97, 30, 50, 60].includes(Number(spec.fps))) out.fps = Number(spec.fps);
  if (Number.isFinite(Number(spec.targetDuration)) && spec.targetDuration > 0 && spec.targetDuration <= 7200) out.targetDuration = Number(spec.targetDuration);
  return out;
}
function sanitizeRules(rules) {
  const out = {};
  if (!rules || typeof rules !== "object") return out;
  const ranges = { sharpnessMin: [0, 100], shakeVarianceMax: [0, 100], minDuration: [0, 30], blackLuma: [0, 255], blackRatioMax: [0, 1], duplicateSimilarity: [0.5, 1] };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const n = Number(rules[key]);
    if (rules[key] !== void 0 && Number.isFinite(n) && n >= min && n <= max) out[key] = n;
  }
  return out;
}
var migrated = /* @__PURE__ */ new Map();
function ensureLayout(root) {
  if (!migrated.has(root)) {
    const task = (async () => {
      const project = await readJson(projectFile(root), null);
      if (!project) return null;
      if ((project.layout || 1) >= LAYOUT_VERSION) {
        for (const sub of PROJECT_DIRS) await mkdir3(path3.join(root, sub), { recursive: true });
        return null;
      }
      const report = await migrateLayout(root, project);
      await writeProject(root, { ...project, ...report.project, layout: LAYOUT_VERSION });
      return report;
    })();
    migrated.set(root, task);
    task.catch(() => migrated.delete(root));
  }
  return migrated.get(root);
}

// src/server/lib/creative.js
import { readdir as readdir3, mkdir as mkdir4, copyFile } from "node:fs/promises";
import path4 from "node:path";

// src/server/lib/diff.js
function diffLines(before, after) {
  const a = splitLines(before);
  const b = splitLines(after);
  if (a.length * b.length > 4e6) return [...a.map((text) => ({ type: "del", text })), ...b.map((text) => ({ type: "add", text }))];
  const n = a.length;
  const m = b.length;
  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i2 = n - 1; i2 >= 0; i2--) {
    for (let j2 = m - 1; j2 >= 0; j2--) {
      table[i2][j2] = a[i2] === b[j2] ? table[i2 + 1][j2 + 1] + 1 : Math.max(table[i2 + 1][j2], table[i2][j2 + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      out.push({ type: "del", text: a[i] });
      i++;
    } else {
      out.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) out.push({ type: "del", text: a[i++] });
  while (j < m) out.push({ type: "add", text: b[j++] });
  return out;
}
function countChanges(before, after) {
  let blocks = 0;
  let inside2 = false;
  for (const line of diffLines(before, after)) {
    if (line.type === "same") inside2 = false;
    else if (!inside2) {
      blocks++;
      inside2 = true;
    }
  }
  return blocks;
}
function splitLines(text) {
  if (!text) return [];
  return String(text).replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
}

// src/server/lib/creative.js
var DOCS = {
  "00_\u4E3B\u9898\u7B80\u62A5.md": "\u521B\u610F\u526A\u8F91/00_\u4E3B\u9898\u7B80\u62A5.md",
  "01_\u521B\u610F\u65B9\u5411.md": "\u521B\u610F\u526A\u8F91/01_\u521B\u610F\u65B9\u5411.md",
  "02_\u6587\u6848.md": "\u521B\u610F\u526A\u8F91/02_\u6587\u6848.md",
  "03_\u5206\u955C\u811A\u672C.md": "\u521B\u610F\u526A\u8F91/03_\u5206\u955C\u811A\u672C.md",
  "\u6807\u7B7E\u5B57\u5178.yaml": P.dictionary,
  "\u526A\u8F91\u601D\u8DEF.md": "\u521B\u610F\u526A\u8F91/\u526A\u8F91\u601D\u8DEF.md"
};
var EDIT_USE_DOCS = ["02_\u6587\u6848.md", "03_\u5206\u955C\u811A\u672C.md"];
var metaFile = (root) => path4.join(root, ".dsh", "creative.json");
var cacheFile = (root, key) => path4.join(root, ".dsh", "cache", "creative", key);
function resolveDocKey(input) {
  if (typeof input !== "string") throw new WorkbenchError("\u8BF7\u6307\u5B9A\u6587\u4EF6\u3002");
  let name2 = input.trim().replace(/\\/g, "/").split("/").pop();
  if (name2 === "04_\u6807\u7B7E\u5B57\u5178.yaml") name2 = "\u6807\u7B7E\u5B57\u5178.yaml";
  if (DOCS[name2]) return name2;
  const loose = Object.keys(DOCS).find((key) => key.replace(/^\d+_/, "").replace(/\.(md|yaml)$/, "") === name2.replace(/\.(md|yaml)$/, "") || key.startsWith(name2 + "_") || name2.length >= 2 && key.includes(name2));
  if (loose) return loose;
  throw new WorkbenchError(`\u4E0D\u652F\u6301\u7684\u521B\u610F\u6587\u4EF6\uFF1A${input}\u3002\u53EF\u7528\uFF1A${Object.keys(DOCS).join("\u3001")}`);
}
function historyPaths(root, key) {
  const rel = DOCS[key];
  const dir = path4.join(root, path4.dirname(rel), "_history");
  const ext = path4.extname(rel);
  const stem = path4.basename(rel, ext);
  return { dir, ext, stem };
}
var historyFile = (root, key, label) => {
  const { dir, ext, stem } = historyPaths(root, key);
  return path4.join(dir, `${stem}_${label}${ext}`);
};
function createCreativeStore({ lock }) {
  const readMeta = async (root) => {
    const meta = await readJson(metaFile(root), { files: {}, editUse: {} });
    meta.files ||= {};
    meta.editUse ||= {};
    return meta;
  };
  async function reconcile(root, meta, key) {
    const file = path4.join(root, DOCS[key]);
    const disk = await readText(file);
    const entry = meta.files[key];
    if (disk === null) {
      if (entry) entry.missing = true;
      return { changed: Boolean(entry && !entry.missing), content: null };
    }
    const hash = sha1(disk);
    if (!entry) {
      meta.files[key] = { version: 1, source: "external", generatedAt: now(), manualEdits: 0, hash };
      await writeAtomic(cacheFile(root, key), disk);
      return { changed: true, content: disk };
    }
    delete entry.missing;
    if (entry.hash === hash) return { changed: false, content: disk };
    const previous = await readText(cacheFile(root, key));
    if (previous !== null) {
      await mkdir4(historyPaths(root, key).dir, { recursive: true });
      const target = historyFile(root, key, `v${entry.version}`);
      if (!await exists(target)) await writeAtomic(target, previous);
    }
    entry.version += 1;
    entry.source = "external";
    entry.generatedAt = now();
    entry.manualEdits = 0;
    entry.hash = hash;
    delete entry.model;
    await writeAtomic(cacheFile(root, key), disk);
    await appendLog(root, { action: "creative.reconcile", file: key, version: entry.version, note: "\u68C0\u6D4B\u5230\u5916\u90E8\u4FEE\u6539\uFF0C\u65E7\u5185\u5BB9\u5DF2\u5B58\u5165 _history" });
    return { changed: true, content: disk };
  }
  async function reconcileAll(root) {
    return lock(`creative:${root}`, async () => {
      const meta = await readMeta(root);
      let changed = false;
      for (const key of Object.keys(DOCS)) changed = (await reconcile(root, meta, key)).changed || changed;
      if (changed) await writeJson(metaFile(root), meta);
      return meta;
    });
  }
  async function listHistory(root, key) {
    const { dir, ext, stem } = historyPaths(root, key);
    let names = [];
    try {
      names = await readdir3(dir);
    } catch {
      return [];
    }
    const pattern = new RegExp(`^${escapeRegExp(stem)}_v(\\d+)(_\u624B\u6539\u524D)?${escapeRegExp(ext)}$`);
    return names.map((name2) => {
      const match = name2.match(pattern);
      if (!match) return null;
      return { version: Number(match[1]), label: match[2] ? `v${match[1]} \u624B\u6539\u524D` : `v${match[1]}`, ref: match[2] ? `v${match[1]}_\u624B\u6539\u524D` : `v${match[1]}`, file: name2 };
    }).filter(Boolean).sort((a, b) => b.version - a.version || a.label.localeCompare(b.label));
  }
  return {
    reconcileAll,
    async list(root) {
      const meta = await reconcileAll(root);
      const out = [];
      for (const [key, rel] of Object.entries(DOCS)) {
        const entry = meta.files[key];
        out.push({
          key,
          path: rel,
          exists: Boolean(entry && !entry.missing),
          version: entry?.version ?? 0,
          source: entry?.source ?? null,
          model: entry?.model ?? null,
          generatedAt: entry?.generatedAt ?? null,
          manualEdits: entry?.manualEdits ?? 0,
          note: entry?.note ?? null,
          editUse: meta.editUse[key] ?? null,
          history: await listHistory(root, key)
        });
      }
      return out;
    },
    async read(root, keyInput, ref) {
      const key = resolveDocKey(keyInput);
      const meta = await reconcileAll(root);
      const entry = meta.files[key];
      if (ref === void 0 || ref === null || ref === "" || ref === "current" || entry && ref === `v${entry.version}` || entry && Number(ref) === entry.version) {
        const content2 = await readText(path4.join(root, DOCS[key]));
        return { key, path: DOCS[key], version: entry?.version ?? 0, current: true, content: content2 ?? "", exists: content2 !== null, meta: entry || null, editUse: meta.editUse[key] ?? null };
      }
      const label = typeof ref === "number" || /^\d+$/.test(String(ref)) ? `v${ref}` : String(ref);
      if (!/^v\d+(_手改前)?$/.test(label)) throw new WorkbenchError("\u7248\u672C\u53F7\u65E0\u6548\u3002");
      const content = await readText(historyFile(root, key, label));
      if (content === null) throw new WorkbenchError(`\u627E\u4E0D\u5230 ${key} \u7684 ${label}\u3002`, 404, "NO_VERSION");
      return { key, path: DOCS[key], version: Number(label.match(/\d+/)[0]), label, current: false, content, exists: true, meta: null };
    },
    /**
     * Versioned write. Agent writes (source chat) make a new version and move the
     * old one to _history (FR-12). Manual panel saves keep the version number,
     * archive the pre-edit original once, and count edited blocks (FR-11).
     */
    async write(root, keyInput, content, { source = "chat", model, note, expectedHash } = {}) {
      const key = resolveDocKey(keyInput);
      if (typeof content !== "string") throw new WorkbenchError("\u5185\u5BB9\u5FC5\u987B\u662F\u6587\u672C\u3002");
      if (content.length > 2e6) throw new WorkbenchError("\u5185\u5BB9\u8FC7\u5927\u3002", 413);
      return lock(`creative:${root}`, async () => {
        const meta = await readMeta(root);
        const { content: current } = await reconcile(root, meta, key);
        const file = path4.join(root, DOCS[key]);
        const entry = meta.files[key];
        if (expectedHash && current !== null && sha1(current) !== expectedHash) {
          await writeJson(metaFile(root), meta);
          throw new WorkbenchError("\u6587\u4EF6\u5DF2\u88AB\u5176\u4ED6\u4EBA\uFF08Agent \u6216\u5916\u90E8\u7F16\u8F91\u5668\uFF09\u4FEE\u6539\uFF0C\u8BF7\u5148\u67E5\u770B\u6700\u65B0\u5185\u5BB9\u518D\u4FDD\u5B58\u3002", 409, "CONFLICT");
        }
        if (current === content) {
          await writeJson(metaFile(root), meta);
          return { key, version: entry?.version ?? 1, unchanged: true };
        }
        await mkdir4(historyPaths(root, key).dir, { recursive: true });
        let result;
        if (current === null || !entry) {
          meta.files[key] = { version: 1, source, generatedAt: now(), manualEdits: 0, hash: sha1(content), ...model ? { model } : {}, ...note ? { note } : {} };
          result = { key, version: 1, created: true };
        } else if (source === "manual" || source === "system") {
          const original = historyFile(root, key, `v${entry.version}_\u624B\u6539\u524D`);
          if (!await exists(original)) await writeAtomic(original, current);
          if (source === "manual") entry.manualEdits = (entry.manualEdits || 0) + countChanges(current, content);
          entry.hash = sha1(content);
          entry.editedAt = now();
          result = { key, version: entry.version, manualEdits: entry.manualEdits };
        } else {
          await writeAtomic(historyFile(root, key, `v${entry.version}`), current);
          Object.assign(entry, { version: entry.version + 1, source, generatedAt: now(), manualEdits: 0, hash: sha1(content) });
          if (model) entry.model = model;
          else delete entry.model;
          if (note) entry.note = note;
          else delete entry.note;
          result = { key, version: entry.version, previous: entry.version - 1 };
        }
        await writeAtomic(file, content);
        await writeAtomic(cacheFile(root, key), content);
        await writeJson(metaFile(root), meta);
        await appendLog(root, { action: "creative.write", file: key, source, version: result.version, model: model || null });
        return result;
      });
    },
    async diff(root, keyInput, from, to) {
      const key = resolveDocKey(keyInput);
      const a = await this.read(root, key, from);
      const b = await this.read(root, key, to);
      return { key, from: a.label || `v${a.version}`, to: b.label || `v${b.version}`, lines: diffLines(a.content, b.content) };
    },
    async rollback(root, keyInput, ref) {
      const key = resolveDocKey(keyInput);
      const old = await this.read(root, key, ref);
      if (old.current) throw new WorkbenchError("\u5DF2\u7ECF\u662F\u5F53\u524D\u7248\u672C\u3002");
      return this.write(root, key, old.content, { source: "rollback", note: `\u56DE\u6EDA\u81EA ${old.label || "v" + old.version}` });
    },
    async setEditUse(root, keyInput, version) {
      const key = resolveDocKey(keyInput);
      if (!EDIT_USE_DOCS.includes(key)) throw new WorkbenchError("\u53EA\u6709\u6587\u6848\u548C\u5206\u955C\u811A\u672C\u53EF\u4EE5\u8BBE\u4E3A\u526A\u8F91\u4F7F\u7528\u7248\u672C\u3002");
      return lock(`creative:${root}`, async () => {
        const meta = await readMeta(root);
        await reconcile(root, meta, key);
        const entry = meta.files[key];
        if (!entry || entry.missing) throw new WorkbenchError(`${key} \u8FD8\u4E0D\u5B58\u5728\u3002`);
        const target = version === void 0 || version === null ? entry.version : Number(version);
        if (!Number.isInteger(target) || target < 1 || target > entry.version) throw new WorkbenchError("\u7248\u672C\u53F7\u65E0\u6548\u3002");
        if (target !== entry.version) throw new WorkbenchError("\u53EA\u80FD\u628A\u5F53\u524D\u7248\u672C\u8BBE\u4E3A\u526A\u8F91\u4F7F\u7528\u7248\u672C\uFF1B\u5982\u9700\u65E7\u7248\u672C\u8BF7\u5148\u56DE\u6EDA\u3002");
        meta.editUse[key] = target;
        await writeJson(metaFile(root), meta);
        await appendLog(root, { action: "creative.editUse", file: key, version: target });
        return { key, editUse: target };
      });
    },
    readMeta,
    /** Copy a file into _history without changing versions (used before destructive tag rewrites). */
    async snapshot(root, keyInput, label) {
      const key = resolveDocKey(keyInput);
      const src = path4.join(root, DOCS[key]);
      if (!await exists(src)) return null;
      await mkdir4(historyPaths(root, key).dir, { recursive: true });
      const target = historyFile(root, key, label);
      await copyFile(src, target);
      return target;
    }
  };
}
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// src/server/lib/store.js
import path5 from "node:path";
function createIndexStore({ lock }) {
  const file = (root) => path5.join(root, ".dsh", "index.json");
  const empty = () => ({ schema: 1, raws: {}, clips: {}, unsupported: [], updatedAt: null });
  const read = async (root) => {
    const data = await readJson(file(root), null);
    if (!data) return empty();
    data.raws ||= {};
    data.clips ||= {};
    data.unsupported ||= [];
    return data;
  };
  return {
    read,
    /** Serialized read-modify-write. `fn` may mutate the index and return a result. */
    update(root, fn) {
      return lock(`index:${root}`, async () => {
        const index = await read(root);
        const result = await fn(index);
        index.updatedAt = now();
        await writeJson(file(root), index);
        return result;
      });
    }
  };
}
function effectiveClipTags(clip, floor = 0.6) {
  if (clip.reviewed) return clip.tags || [];
  const low = new Set((clip.aiTags || []).filter((item) => (item.confidence ?? 1) < floor).map((item) => item.tag));
  return (clip.tags || []).filter((tag) => !low.has(tag));
}

// src/server/lib/jobs.js
import path6 from "node:path";
var JOB_LABELS = {
  import: "\u5BFC\u5165\u7D20\u6750",
  clean: "\u6E05\u6D17\u7D20\u6750",
  split: "\u955C\u5934\u5207\u7247",
  keyframes: "\u62BD\u53D6\u5173\u952E\u5E27",
  transcribe: "\u8BED\u97F3\u8F6C\u5199",
  "eagle-push": "\u540C\u6B65\u5230 Eagle",
  "eagle-pull": "\u4ECE Eagle \u62C9\u53D6",
  "render-preview": "FFmpeg \u7C97\u526A\u9884\u89C8",
  "render-final": "FFmpeg \u76F4\u51FA\u6210\u7247"
};
function createJobs({ onChange }) {
  const projects = /* @__PURE__ */ new Map();
  const state = (root) => {
    if (!projects.has(root)) projects.set(root, { running: null, queue: [], recent: [], loaded: false });
    return projects.get(root);
  };
  const file = (root) => path6.join(root, ".dsh", "jobs.json");
  async function load(root) {
    const s = state(root);
    if (s.loaded) return s;
    s.loaded = true;
    const saved = await readJson(file(root), { recent: [] }).catch(() => ({ recent: [] }));
    s.recent = (saved.recent || []).map((job) => ["running", "queued"].includes(job.status) ? { ...job, status: "interrupted", error: "\u5E94\u7528\u5173\u95ED\u6216\u91CD\u542F\u65F6\u4E2D\u65AD\uFF0C\u53EF\u91CD\u65B0\u8FD0\u884C\u4EE5\u7EED\u8DD1\uFF08\u5DF2\u5B8C\u6210\u7684\u6761\u76EE\u4F1A\u8DF3\u8FC7\uFF09\u3002" } : job).slice(0, 12);
    return s;
  }
  let persistTimer = null;
  const dirty = /* @__PURE__ */ new Set();
  function persist(root, immediate = false) {
    dirty.add(root);
    const flush = async () => {
      persistTimer = null;
      const roots = [...dirty];
      dirty.clear();
      for (const r of roots) {
        const s = state(r);
        const recent = [...s.running ? [view(s.running)] : [], ...s.queue.map(view), ...s.recent].slice(0, 12);
        await writeJson(file(r), { recent }).catch(() => {
        });
      }
    };
    if (immediate) {
      clearTimeout(persistTimer);
      return flush();
    }
    if (!persistTimer) persistTimer = setTimeout(flush, 500);
  }
  const view = (job) => {
    const { controller, run, resolve, reject, ...rest } = job;
    return rest;
  };
  async function pump(root) {
    const s = state(root);
    if (s.running || !s.queue.length) return;
    const job = s.queue.shift();
    s.running = job;
    job.status = "running";
    job.startedAt = now();
    onChange(root);
    persist(root);
    const progress = (done, total, current) => {
      if (typeof total === "number") job.total = total;
      if (typeof done === "number") job.done = done;
      if (current !== void 0) job.current = current;
      const elapsed = (Date.now() - Date.parse(job.startedAt)) / 1e3;
      job.etaSeconds = job.total && job.done ? Math.round(elapsed / job.done * (job.total - job.done)) : null;
      onChange(root);
      persist(root);
    };
    try {
      job.result = await job.run({ signal: job.controller.signal, progress });
      job.status = "done";
      job.resolve(view(job));
    } catch (error) {
      job.status = job.controller.signal.aborted ? "cancelled" : "failed";
      job.error = error?.message || String(error);
      job.reject(error);
    } finally {
      job.finishedAt = now();
      job.current = null;
      job.etaSeconds = null;
      s.running = null;
      s.recent = [view(job), ...s.recent].slice(0, 12);
      await appendLog(root, { action: `job.${job.kind}`, status: job.status, error: job.error || null, result: summarize(job.result) });
      onChange(root);
      await persist(root, true);
      pump(root);
    }
  }
  return {
    /**
     * Queue a job. Returns `{ job, done }` where `done` settles when it ends.
     * A second request of the same kind while one is queued/running joins it.
     */
    async start(root, kind, run, { params } = {}) {
      const s = await load(root);
      const same = [s.running, ...s.queue].find((job2) => job2 && job2.kind === kind && JSON.stringify(job2.params || null) === JSON.stringify(params || null));
      if (same) return { job: view(same), done: same.promise, joined: true };
      const job = { id: shortId("job_"), kind, label: JOB_LABELS[kind] || kind, status: "queued", total: 0, done: 0, current: null, createdAt: now(), params: params || null, controller: new AbortController(), run };
      job.promise = new Promise((resolve, reject) => {
        job.resolve = resolve;
        job.reject = reject;
      });
      job.promise.catch(() => {
      });
      s.queue.push(job);
      onChange(root);
      persist(root);
      queueMicrotask(() => pump(root));
      return { job: view(job), done: job.promise, joined: false };
    },
    cancel(root, id) {
      const s = state(root);
      if (s.running && (!id || s.running.id === id)) {
        s.running.controller.abort();
        return true;
      }
      const index = s.queue.findIndex((job) => job.id === id);
      if (index >= 0) {
        const [job] = s.queue.splice(index, 1);
        job.status = "cancelled";
        job.reject(new Error("\u4EFB\u52A1\u5DF2\u53D6\u6D88\u3002"));
        s.recent = [view(job), ...s.recent].slice(0, 12);
        onChange(root);
        persist(root);
        return true;
      }
      return false;
    },
    async list(root) {
      const s = await load(root);
      return { running: s.running ? view(s.running) : null, queue: s.queue.map(view), recent: s.recent };
    },
    async get(root, id) {
      const { running, queue, recent } = await this.list(root);
      return [running, ...queue, ...recent].find((job) => job && job.id === id) || null;
    },
    cancelAll() {
      for (const s of projects.values()) {
        s.running?.controller.abort();
        for (const job of s.queue) job.controller.abort();
      }
    }
  };
}
function summarize(result) {
  if (!result || typeof result !== "object") return result ?? null;
  const out = {};
  for (const [key, value] of Object.entries(result)) if (typeof value !== "object" || value === null) out[key] = value;
  return out;
}

// src/server/lib/ffmpeg.js
import { spawn } from "node:child_process";
function createFFmpeg(getPaths) {
  let probeCache = null;
  function run(bin, args, { signal, cwd, onStderr, stdoutLimit = 64 * 1024 * 1024, timeoutMs } = {}) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(abortError());
      let child;
      try {
        child = spawn(bin, args, { cwd, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      } catch (error) {
        return reject(new WorkbenchError(`\u65E0\u6CD5\u542F\u52A8 ${bin}\uFF1A${error.message}`, 500, "FFMPEG_MISSING"));
      }
      const out = [];
      let outLength = 0;
      let err = "";
      let timer;
      const kill = () => {
        try {
          child.kill("SIGKILL");
        } catch {
        }
      };
      const onAbort = () => {
        kill();
      };
      signal?.addEventListener("abort", onAbort, { once: true });
      if (timeoutMs) timer = setTimeout(kill, timeoutMs);
      child.stdout.on("data", (chunk) => {
        outLength += chunk.length;
        if (outLength > stdoutLimit) {
          kill();
          return;
        }
        out.push(chunk);
      });
      child.stderr.on("data", (chunk) => {
        const text = chunk.toString("utf8");
        err = (err + text).slice(-2e5);
        onStderr?.(text);
      });
      child.on("error", (error) => {
        signal?.removeEventListener("abort", onAbort);
        clearTimeout(timer);
        reject(error.code === "ENOENT" ? new WorkbenchError(`\u627E\u4E0D\u5230 ${bin}\u3002\u8BF7\u5B89\u88C5 FFmpeg \u5E76\u52A0\u5165 PATH\uFF0C\u6216\u5728\u5DE5\u4F5C\u53F0\u8BBE\u7F6E\u91CC\u586B\u5199\u8DEF\u5F84\u3002`, 424, "FFMPEG_MISSING") : new WorkbenchError(`${bin} \u8FD0\u884C\u5931\u8D25\uFF1A${error.message}`, 500, "FFMPEG_FAILED"));
      });
      child.on("close", (code) => {
        signal?.removeEventListener("abort", onAbort);
        clearTimeout(timer);
        if (signal?.aborted) return reject(abortError());
        resolve({ code, stdout: Buffer.concat(out), stderr: err });
      });
    });
  }
  async function ffmpeg(args, options) {
    const { ffmpeg: bin } = await getPaths();
    const result = await run(bin, ["-hide_banner", "-nostdin", "-y", ...args], options);
    if (result.code !== 0) throw new WorkbenchError(`FFmpeg \u5904\u7406\u5931\u8D25\uFF1A${lastLines(result.stderr)}`, 500, "FFMPEG_FAILED");
    return result;
  }
  return {
    run,
    ffmpeg,
    /** Availability and capability probe for the status chips (FR-04). */
    async detect(force = false) {
      if (probeCache && !force && Date.now() - probeCache.at < 6e4) return probeCache.value;
      const paths = await getPaths();
      const value = { ffmpeg: false, ffprobe: false, version: null, encoders: { h264: false, h265: false }, paths };
      try {
        const v = await run(paths.ffmpeg, ["-hide_banner", "-version"], { timeoutMs: 8e3 });
        value.ffmpeg = v.code === 0;
        value.version = v.stdout.toString("utf8").split("\n")[0].replace(/^ffmpeg version\s*/, "").split(" ")[0] || null;
        if (value.ffmpeg) {
          const enc = await run(paths.ffmpeg, ["-hide_banner", "-encoders"], { timeoutMs: 8e3 });
          const text = enc.stdout.toString("utf8");
          value.encoders.h264 = /\blibx264\b|\bh264_(nvenc|qsv|amf|videotoolbox|mf)\b/.test(text);
          value.encoders.h265 = /\blibx265\b|\bhevc_(nvenc|qsv|amf|videotoolbox|mf)\b/.test(text);
          value.encoders.list = ["libx264", "libx265", "h264_nvenc", "hevc_nvenc", "h264_qsv", "hevc_qsv", "h264_amf", "hevc_amf", "h264_videotoolbox", "hevc_videotoolbox", "h264_mf", "hevc_mf"].filter((name2) => new RegExp(`\\b${name2}\\b`).test(text));
        }
      } catch {
      }
      try {
        const p = await run(paths.ffprobe, ["-hide_banner", "-version"], { timeoutMs: 8e3 });
        value.ffprobe = p.code === 0;
      } catch {
      }
      probeCache = { at: Date.now(), value };
      return value;
    },
    async probe(file, signal) {
      const { ffprobe: bin } = await getPaths();
      const result = await run(bin, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], { signal, timeoutMs: 6e4 });
      if (result.code !== 0) return null;
      try {
        return JSON.parse(result.stdout.toString("utf8"));
      } catch {
        return null;
      }
    },
    /** Decode frames as 8-bit grayscale buffers for the cleaning metrics. */
    async grayFrames(file, { start = 0, duration, fps, width, height, signal }) {
      const args = [];
      if (start > 0) args.push("-ss", start.toFixed(3));
      if (duration) args.push("-t", duration.toFixed(3));
      args.push("-i", file, "-an", "-vf", `fps=${fps},scale=${width}:${height}:flags=area,format=gray`, "-f", "rawvideo", "-pix_fmt", "gray", "pipe:1");
      const { stdout } = await ffmpeg(args, { signal });
      const size = width * height;
      const frames = [];
      for (let offset = 0; offset + size <= stdout.length; offset += size) frames.push(new Uint8Array(stdout.buffer, stdout.byteOffset + offset, size));
      return frames;
    },
    async sceneCuts(file, threshold, signal, onProgress) {
      const cuts = [];
      const { ffmpeg: bin } = await getPaths();
      const result = await run(bin, ["-hide_banner", "-nostdin", "-i", file, "-an", "-sn", "-vf", `scale=320:-2,select='gt(scene,${threshold})',showinfo`, "-f", "null", "-"], {
        signal,
        onStderr: (text) => {
          for (const match of text.matchAll(/pts_time:([\d.]+)/g)) cuts.push(Number(match[1]));
          const time = text.match(/time=(\d+):(\d+):([\d.]+)/);
          if (time && onProgress) onProgress(Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]));
        }
      });
      if (result.code !== 0) throw new WorkbenchError(`\u955C\u5934\u68C0\u6D4B\u5931\u8D25\uFF1A${lastLines(result.stderr)}`, 500, "FFMPEG_FAILED");
      return [...new Set(cuts)].sort((a, b) => a - b);
    }
  };
}
function abortError() {
  return new WorkbenchError("\u4EFB\u52A1\u5DF2\u53D6\u6D88\u3002", 499, "ABORTED");
}
function lastLines(text, count = 3) {
  return String(text || "").trim().split("\n").filter((line) => !/^\s*(frame=|size=)/.test(line)).slice(-count).join(" / ").slice(0, 400);
}
function parseRate(rate) {
  if (!rate || rate === "0/0") return 0;
  const [a, b] = String(rate).split("/").map(Number);
  return b ? a / b : a;
}
function summarizeProbe(probe) {
  const video = probe?.streams?.find((stream) => stream.codec_type === "video" && stream.disposition?.attached_pic !== 1);
  if (!video) return null;
  const audio = probe.streams.find((stream) => stream.codec_type === "audio");
  const duration = Number(probe.format?.duration || video.duration || 0);
  let width = video.width;
  let height = video.height;
  const rotation = Number(video.tags?.rotate || video.side_data_list?.find((item) => item.rotation !== void 0)?.rotation || 0);
  if (Math.abs(rotation) % 180 === 90) [width, height] = [height, width];
  return {
    duration: Math.round(duration * 1e3) / 1e3,
    width,
    height,
    fps: Math.round(parseRate(video.avg_frame_rate || video.r_frame_rate) * 1e3) / 1e3,
    codec: video.codec_name,
    bitrate: Number(probe.format?.bit_rate || 0),
    hasAudio: Boolean(audio),
    shotAt: probe.format?.tags?.creation_time || video.tags?.creation_time || null
  };
}

// src/server/lib/eagle.js
function createEagle(getBase) {
  async function call(pathname, { method = "GET", body: body2, timeoutMs = 6e3, query } = {}) {
    const base = await getBase();
    const url = new URL(pathname, base);
    for (const [key, value] of Object.entries(query || {})) if (value !== void 0 && value !== null) url.searchParams.set(key, String(value));
    let response;
    try {
      response = await fetch(url, {
        method,
        headers: body2 ? { "content-type": "application/json" } : void 0,
        body: body2 ? JSON.stringify(body2) : void 0,
        signal: AbortSignal.timeout(timeoutMs)
      });
    } catch {
      throw new WorkbenchError("Eagle \u672A\u8FDE\u63A5\uFF1A\u8BF7\u5148\u6253\u5F00 Eagle\uFF08\u672C\u5730\u63A5\u53E3\u7AEF\u53E3 41595\uFF09\u3002", 503, "EAGLE_OFFLINE");
    }
    let data = null;
    try {
      data = await response.json();
    } catch {
    }
    if (!response.ok || !data || data.status !== "success") {
      throw new WorkbenchError(`Eagle \u63A5\u53E3\u8FD4\u56DE\u9519\u8BEF\uFF1A${data?.message || data?.data || response.status}`, 502, "EAGLE_ERROR");
    }
    return data.data;
  }
  return {
    async info() {
      try {
        const data = await call("/api/application/info", { timeoutMs: 1500 });
        return { connected: true, version: data?.version || null, platform: data?.platform || null };
      } catch (error) {
        return { connected: false, error: error.message };
      }
    },
    async ensureFolder(name2, knownId) {
      const folders = await call("/api/folder/list");
      const flat = [];
      const walk2 = (list) => {
        for (const f of list || []) {
          flat.push(f);
          walk2(f.children);
        }
      };
      walk2(folders);
      if (knownId && flat.some((f) => f.id === knownId)) return knownId;
      const found = flat.find((f) => f.name === name2);
      if (found) return found.id;
      const created = await call("/api/folder/create", { method: "POST", body: { folderName: name2 } });
      return created.id;
    },
    addFromPaths(items, folderId) {
      return call("/api/item/addFromPaths", { method: "POST", body: { items, folderId }, timeoutMs: 6e4 });
    },
    async listFolder(folderId) {
      const out = [];
      for (let offset = 0; offset < 1e5; offset += 1) {
        const page = await call("/api/item/list", { query: { folders: folderId, limit: 1e3, offset }, timeoutMs: 2e4 });
        if (!Array.isArray(page) || !page.length) break;
        out.push(...page);
        if (page.length < 1e3) break;
      }
      return out;
    },
    update(id, values) {
      return call("/api/item/update", { method: "POST", body: { id, ...values } });
    }
  };
}

// src/server/lib/media.js
import { readdir as readdir4, stat as stat3, mkdir as mkdir5, rm } from "node:fs/promises";
import path7 from "node:path";

// src/server/lib/analyze.js
function laplacianVariance(frame, width, height) {
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    const row = y * width;
    for (let x = 1; x < width - 1; x++) {
      const i = row + x;
      const v = frame[i - 1] + frame[i + 1] + frame[i - width] + frame[i + width] - 4 * frame[i];
      sum += v;
      sumSq += v * v;
      count++;
    }
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}
var SHARPNESS_SCALE = 150;
function sharpnessScore(variance) {
  return Math.round(100 * (1 - Math.exp(-variance / SHARPNESS_SCALE)));
}
function meanLuma(frame) {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i];
  return sum / frame.length;
}
function lumaStdDev(frame) {
  const mean = meanLuma(frame);
  let sq = 0;
  for (let i = 0; i < frame.length; i++) sq += (frame[i] - mean) ** 2;
  return Math.sqrt(sq / frame.length);
}
function estimateShift(a, b, width, height, radius = 6) {
  const margin = radius + 4;
  const costAt = (dx, dy) => {
    let cost = 0;
    let n = 0;
    for (let y = margin; y < height - margin; y += 2) {
      const rowA = y * width;
      const rowB = (y + dy) * width;
      for (let x = margin; x < width - margin; x += 2) {
        cost += Math.abs(a[rowA + x] - b[rowB + x + dx]);
        n++;
      }
    }
    return cost / n;
  };
  const grid = /* @__PURE__ */ new Map();
  let best = { dx: 0, dy: 0, cost: Infinity };
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const cost = costAt(dx, dy);
      grid.set(`${dx},${dy}`, cost);
      if (cost < best.cost - 1e-9 || Math.abs(cost - best.cost) < 1e-9 && Math.abs(dx) + Math.abs(dy) < Math.abs(best.dx) + Math.abs(best.dy)) best = { dx, dy, cost };
    }
  }
  const refine = (minus, center, plus) => {
    if (minus === void 0 || plus === void 0) return 0;
    const denom = minus - 2 * center + plus;
    return denom > 1e-9 ? Math.max(-0.5, Math.min(0.5, (minus - plus) / (2 * denom))) : 0;
  };
  const fx = refine(grid.get(`${best.dx - 1},${best.dy}`), best.cost, grid.get(`${best.dx + 1},${best.dy}`));
  const fy = refine(grid.get(`${best.dx},${best.dy - 1}`), best.cost, grid.get(`${best.dx},${best.dy + 1}`));
  return { dx: best.dx + fx, dy: best.dy + fy, cost: best.cost };
}
var CUT_COST = 28;
function shakeVariance(frames, width, height) {
  if (frames.length < 4) return 0;
  const path13 = [{ x: 0, y: 0 }];
  for (let i = 1; i < frames.length; i++) {
    const shift = estimateShift(frames[i - 1], frames[i], width, height);
    const last = path13[path13.length - 1];
    const cut = shift.cost > CUT_COST;
    path13.push({ x: last.x + (cut ? 0 : shift.dx), y: last.y + (cut ? 0 : shift.dy) });
  }
  const window = 2;
  const residuals = [];
  for (let i = 0; i < path13.length; i++) {
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (let j = Math.max(0, i - window); j <= Math.min(path13.length - 1, i + window); j++) {
      sx += path13[j].x;
      sy += path13[j].y;
      n++;
    }
    residuals.push({ x: path13[i].x - sx / n, y: path13[i].y - sy / n });
  }
  const variance = (values) => {
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  };
  return variance(residuals.map((r) => r.x)) + variance(residuals.map((r) => r.y));
}
function dHash(frame, width, height) {
  const cols = 9;
  const rows = 8;
  const cells2 = new Float64Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    const y0 = Math.floor(r * height / rows);
    const y1 = Math.floor((r + 1) * height / rows);
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(c * width / cols);
      const x1 = Math.floor((c + 1) * width / cols);
      let sum = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        sum += frame[y * width + x];
        n++;
      }
      cells2[r * cols + c] = n ? sum / n : 0;
    }
  }
  let hash = 0n;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      hash = hash << 1n | (cells2[r * cols + c] > cells2[r * cols + c + 1] ? 1n : 0n);
    }
  }
  return hash;
}
function hashSimilarity(a, b) {
  let x = BigInt.asUintN(64, BigInt(a) ^ BigInt(b));
  let bits = 0;
  while (x) {
    bits += Number(x & 1n);
    x >>= 1n;
  }
  return 1 - bits / 64;
}
function fingerprintSimilarity(a, b) {
  if (!a?.length || !b?.length) return 0;
  const n = Math.min(a.length, b.length);
  let total = 0;
  for (let i = 0; i < n; i++) total += hashSimilarity(a[i], b[i]);
  return total / n;
}
function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// src/server/lib/tags.js
var import_yaml = __toESM(require_dist(), 1);
var DIMENSIONS = ["\u573A\u666F", "\u4E3B\u4F53", "\u666F\u522B", "\u8FD0\u955C", "\u60C5\u7EEA", "\u7528\u9014"];
var META_KEYS = /* @__PURE__ */ new Set(["\u7EE7\u627F", "\u5F85\u5BA1"]);
var BUILTIN_TEMPLATES = {
  "vlog-base": {
    label: "Vlog \u57FA\u7840",
    dims: {
      \u573A\u666F: [],
      \u4E3B\u4F53: ["\u4EBA\u7269", "\u81EA\u62CD", "\u98DF\u7269", "\u8857\u666F", "\u690D\u7269"],
      \u666F\u522B: ["\u8FDC\u666F", "\u5168\u666F", "\u4E2D\u666F", "\u8FD1\u666F", "\u7279\u5199"],
      \u8FD0\u955C: ["\u56FA\u5B9A", "\u63A8", "\u62C9", "\u6447", "\u79FB", "\u8DDF\u62CD", "\u73AF\u7ED5", "\u822A\u62CD", "\u5EF6\u65F6"],
      \u60C5\u7EEA: ["\u6CBB\u6108", "\u70ED\u95F9", "\u5B89\u9759", "\u6E29\u6696"],
      \u7528\u9014: ["\u5F00\u573A", "\u8F6C\u573A\u7A7A\u955C", "\u7ED3\u5C3E", "\u53E3\u64AD"]
    }
  },
  "product-ad": {
    label: "\u4EA7\u54C1\u5E7F\u544A",
    dims: {
      \u573A\u666F: ["\u68DA\u62CD", "\u684C\u9762", "\u6237\u5916", "\u5C45\u5BB6", "\u529E\u516C"],
      \u4E3B\u4F53: ["\u4EA7\u54C1\u6574\u4F53", "\u4EA7\u54C1\u7EC6\u8282", "Logo", "\u5305\u88C5", "\u624B\u90E8\u64CD\u4F5C", "\u4F7F\u7528\u8005"],
      \u666F\u522B: ["\u5168\u666F", "\u4E2D\u666F", "\u8FD1\u666F", "\u7279\u5199", "\u5FAE\u8DDD"],
      \u8FD0\u955C: ["\u56FA\u5B9A", "\u63A8", "\u62C9", "\u6447", "\u6ED1\u8F68", "\u73AF\u7ED5", "\u5347\u964D", "\u8F6C\u53F0"],
      \u60C5\u7EEA: ["\u9AD8\u7EA7", "\u79D1\u6280", "\u6D3B\u529B", "\u6E29\u6696"],
      \u7528\u9014: ["\u5F00\u573A", "\u5356\u70B9\u5C55\u793A", "\u529F\u80FD\u6F14\u793A", "\u8F6C\u573A\u7A7A\u955C", "\u7ED3\u5C3E", "\u53E3\u64AD", "\u4EF7\u683C\u4FE1\u606F"]
    }
  }
};
function parseDictionary(text) {
  const doc = import_yaml.default.parseDocument(text || "");
  if (doc.errors.length) throw new WorkbenchError(`\u6807\u7B7E\u5B57\u5178 YAML \u6709\u8BED\u6CD5\u9519\u8BEF\uFF1A${doc.errors[0].message.split("\n")[0]}`, 422, "BAD_YAML");
  const data = doc.toJS() || {};
  if (typeof data !== "object" || Array.isArray(data)) throw new WorkbenchError("\u6807\u7B7E\u5B57\u5178\u5FC5\u987B\u662F\u300C\u7EF4\u5EA6: [\u6807\u7B7E]\u300D\u7684\u7ED3\u6784\u3002", 422, "BAD_YAML");
  const dims = {};
  for (const [key, value] of Object.entries(data)) {
    if (META_KEYS.has(key)) continue;
    dims[key] = toList(value);
  }
  for (const dim of DIMENSIONS) dims[dim] ||= [];
  const rawPending = data["\u5F85\u5BA1"];
  const pendingDims = {};
  let pending;
  if (rawPending && typeof rawPending === "object" && !Array.isArray(rawPending)) {
    pending = [];
    for (const [tag, dim] of Object.entries(rawPending)) {
      const name2 = String(tag).trim();
      if (!name2 || pending.includes(name2)) continue;
      pending.push(name2);
      if (typeof dim === "string" && dim.trim()) pendingDims[name2] = dim.trim();
    }
  } else pending = toList(rawPending);
  return { inherit: typeof data["\u7EE7\u627F"] === "string" ? data["\u7EE7\u627F"] : null, dims, pending, pendingDims };
}
function toList(value) {
  if (value === null || value === void 0) return [];
  const list = Array.isArray(value) ? value : String(value).split(/[,，、]/);
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))];
}
function serializeDictionary({ inherit, dims, pending, pendingDims }, header = "# \u6807\u7B7E\u5B57\u5178\uFF08\u9879\u76EE\u7EA7\uFF09\xB7 \u6253\u6807\u53EA\u80FD\u4ECE\u8FD9\u91CC\u9009\uFF1B\u5F85\u5BA1\u533A\u662F AI \u5EFA\u8BAE\u7684\u65B0\u6807\u7B7E\uFF0C\u786E\u8BA4\u540E\u8F6C\u6B63\n") {
  const lines = [header.trimEnd()];
  if (inherit) lines.push(`\u7EE7\u627F: ${quote(inherit)}`);
  const order = [...DIMENSIONS, ...Object.keys(dims).filter((key) => !DIMENSIONS.includes(key))];
  for (const dim of order) lines.push(`${quote(dim)}: [${(dims[dim] || []).map(quote).join(", ")}]`);
  const list = pending || [];
  const hints = pendingDims || {};
  if (list.some((tag) => hints[tag])) lines.push(`\u5F85\u5BA1: {${list.map((tag) => `${quote(tag)}: ${hints[tag] ? quote(hints[tag]) : "null"}`).join(", ")}}`);
  else lines.push(`\u5F85\u5BA1: [${list.map(quote).join(", ")}]`);
  return lines.join("\n") + "\n";
}
var quote = (tag) => /^[\p{L}\p{N}_\- ·]+$/u.test(tag) && !/^\s|\s$/.test(tag) && !/^(true|false|null|yes|no|on|off|~|\d+(\.\d+)?)$/i.test(tag) ? tag : JSON.stringify(tag);
function effectiveDictionary(dictionary, templates = BUILTIN_TEMPLATES) {
  const template = dictionary.inherit && templates?.[dictionary.inherit];
  const dims = {};
  const seen = /* @__PURE__ */ new Set();
  const keys = [.../* @__PURE__ */ new Set([...DIMENSIONS, ...Object.keys(template?.dims || {}), ...Object.keys(dictionary.dims)])];
  for (const dim of keys) {
    dims[dim] = [];
    for (const tag of [...template?.dims?.[dim] || [], ...dictionary.dims[dim] || []]) {
      if (seen.has(tag)) continue;
      seen.add(tag);
      dims[dim].push(tag);
    }
  }
  return { inherit: dictionary.inherit, dims, pending: dictionary.pending, pendingDims: dictionary.pendingDims || {}, templateMissing: Boolean(dictionary.inherit && !template) };
}
function switchTemplate(dictionary, key, templates, usedTags = /* @__PURE__ */ new Set()) {
  const before = effectiveDictionary(dictionary, templates);
  const next = { ...cloneDictionary(dictionary), inherit: key };
  const after = effectiveDictionary(next, templates);
  const known = tagIndex(after);
  const kept = [];
  for (const [dim, tags] of Object.entries(before.dims)) {
    for (const tag of tags) {
      if (known.has(tag) || !usedTags.has(tag)) continue;
      next.dims[dim] ||= [];
      next.dims[dim].push(tag);
      kept.push(tag);
    }
  }
  const dropped = Object.values(before.dims).flat().filter((tag) => !known.has(tag) && !kept.includes(tag));
  const added = Object.values(after.dims).flat().filter((tag) => !tagIndex(before).has(tag));
  return { dictionary: next, kept, dropped, added };
}
var cloneDictionary = (dictionary) => ({
  inherit: dictionary.inherit,
  dims: Object.fromEntries(Object.entries(dictionary.dims).map(([k, v]) => [k, [...v]])),
  pending: [...dictionary.pending || []],
  pendingDims: { ...dictionary.pendingDims || {} }
});
function tagIndex(effective) {
  const map = /* @__PURE__ */ new Map();
  for (const [dim, tags] of Object.entries(effective.dims)) for (const tag of tags) if (!map.has(tag)) map.set(tag, dim);
  return map;
}
function defaultDictionaryText(template = "vlog-base") {
  return serializeDictionary({ inherit: typeof template === "string" && template ? template : "vlog-base", dims: Object.fromEntries(DIMENSIONS.map((dim) => [dim, []])), pending: [] });
}
function applyTagOperation(dictionary, op, templates = BUILTIN_TEMPLATES) {
  const next = cloneDictionary(dictionary);
  const tag = typeof op.tag === "string" ? op.tag.trim() : "";
  const to = typeof op.to === "string" ? op.to.trim() : "";
  const dim = typeof op.dim === "string" ? op.dim.trim() : "";
  const effective = effectiveDictionary(dictionary, templates);
  const known = tagIndex(effective);
  const dropPending = (name2) => {
    next.pending = next.pending.filter((item) => item !== name2);
    delete next.pendingDims[name2];
  };
  const removeEverywhere = (name2) => {
    for (const key of Object.keys(next.dims)) next.dims[key] = next.dims[key].filter((item) => item !== name2);
    dropPending(name2);
  };
  const isTemplateTag = (name2) => known.has(name2) && !(dictionary.dims[known.get(name2)] || []).includes(name2);
  if (op.op === "add-dim") {
    if (!dim) throw new WorkbenchError("\u8BF7\u586B\u5199\u7EF4\u5EA6\u540D\u79F0\u3002");
    if (dim === "\u7EE7\u627F" || dim === "\u5F85\u5BA1") throw new WorkbenchError("\u8FD9\u4E2A\u540D\u5B57\u662F\u4FDD\u7559\u5B57\uFF0C\u8BF7\u6362\u4E00\u4E2A\u3002");
    if (effective.dims[dim]) throw new WorkbenchError(`\u5DF2\u7ECF\u6709\u3010${dim}\u3011\u7EF4\u5EA6\u3002`);
    next.dims[dim] = [];
    return { dictionary: next, mapTags: (tags) => tags, affects: () => false, summary: `\u65B0\u589E\u7EF4\u5EA6\u3010${dim}\u3011` };
  }
  if (op.op === "delete-dim") {
    if (DIMENSIONS.includes(dim)) throw new WorkbenchError(`\u3010${dim}\u3011\u662F\u57FA\u7840\u7EF4\u5EA6\uFF0C\u4E0D\u80FD\u5220\u9664\u3002`);
    if (!effective.dims[dim]) throw new WorkbenchError(`\u6CA1\u6709\u3010${dim}\u3011\u7EF4\u5EA6\u3002`);
    if (effective.dims[dim].length) throw new WorkbenchError(`\u3010${dim}\u3011\u91CC\u8FD8\u6709\u6807\u7B7E\uFF0C\u5148\u5220\u9664\u6216\u79FB\u8D70\u8FD9\u4E9B\u6807\u7B7E\u3002`);
    delete next.dims[dim];
    return { dictionary: next, mapTags: (tags) => tags, affects: () => false, summary: `\u5220\u9664\u7EF4\u5EA6\u3010${dim}\u3011` };
  }
  if (!tag) throw new WorkbenchError("\u8BF7\u6307\u5B9A\u6807\u7B7E\u3002");
  switch (op.op) {
    case "suggest": {
      if (known.has(tag)) throw new WorkbenchError(`\u300C${tag}\u300D\u5DF2\u5728\u3010${known.get(tag)}\u3011\u7EF4\u5EA6\u3002`);
      if (!next.pending.includes(tag)) next.pending.push(tag);
      if (dim) next.pendingDims[tag] = dim;
      return { dictionary: next, mapTags: (tags) => tags, affects: () => false, summary: `\u5EFA\u8BAE\u65B0\u6807\u7B7E\u300C${tag}\u300D${dim ? `\uFF08${dim}\uFF09` : ""}\u8FDB\u5165\u5F85\u5BA1` };
    }
    case "move": {
      if (!dim) throw new WorkbenchError("\u8BF7\u6307\u5B9A\u8981\u79FB\u5230\u54EA\u4E2A\u7EF4\u5EA6\u3002");
      if (!known.has(tag)) throw new WorkbenchError(`\u5B57\u5178\u91CC\u6CA1\u6709\u300C${tag}\u300D\u3002`);
      if (known.get(tag) === dim) throw new WorkbenchError(`\u300C${tag}\u300D\u5DF2\u7ECF\u5728\u3010${dim}\u3011\u3002`);
      if (isTemplateTag(tag)) throw new WorkbenchError(`\u300C${tag}\u300D\u6765\u81EA\u6A21\u677F\uFF0C\u8BF7\u5728\u300C\u7F16\u8F91\u6A21\u677F\u300D\u91CC\u8C03\u6574\u5B83\u7684\u7EF4\u5EA6\u3002`);
      removeEverywhere(tag);
      next.dims[dim] ||= [];
      next.dims[dim].push(tag);
      return { dictionary: next, mapTags: (tags) => tags, affects: (clip) => clip.tags?.includes(tag), summary: `\u628A\u300C${tag}\u300D\u79FB\u5230\u3010${dim}\u3011`, retag: { tag, dim } };
    }
    case "add": {
      if (!dim) throw new WorkbenchError("\u65B0\u589E\u6807\u7B7E\u9700\u8981\u6307\u5B9A\u7EF4\u5EA6\u3002");
      if (known.has(tag)) throw new WorkbenchError(`\u300C${tag}\u300D\u5DF2\u5728\u3010${known.get(tag)}\u3011\u7EF4\u5EA6\u3002`);
      next.dims[dim] ||= [];
      next.dims[dim].push(tag);
      dropPending(tag);
      return { dictionary: next, mapTags: (tags) => tags, affects: () => false, summary: `\u5728\u3010${dim}\u3011\u65B0\u589E\u300C${tag}\u300D` };
    }
    case "approve": {
      if (!dim) throw new WorkbenchError("\u8F6C\u6B63\u5F85\u5BA1\u6807\u7B7E\u9700\u8981\u6307\u5B9A\u7EF4\u5EA6\u3002");
      if (!next.pending.includes(tag)) throw new WorkbenchError(`\u300C${tag}\u300D\u4E0D\u5728\u5F85\u5BA1\u533A\u3002`);
      if (known.has(tag)) throw new WorkbenchError(`\u300C${tag}\u300D\u5DF2\u5728\u3010${known.get(tag)}\u3011\u7EF4\u5EA6\uFF0C\u76F4\u63A5\u9A73\u56DE\u8FD9\u6761\u5F85\u5BA1\u5373\u53EF\u3002`);
      dropPending(tag);
      next.dims[dim] ||= [];
      if (!next.dims[dim].includes(tag)) next.dims[dim].push(tag);
      return { dictionary: next, approve: { tag, dim }, mapTags: (tags) => tags, affects: (clip) => clip.pendingTags?.some((item) => item.tag === tag), summary: `\u628A\u5F85\u5BA1\u6807\u7B7E\u300C${tag}\u300D\u8F6C\u6B63\u5230\u3010${dim}\u3011` };
    }
    case "reject": {
      if (!next.pending.includes(tag)) throw new WorkbenchError(`\u300C${tag}\u300D\u4E0D\u5728\u5F85\u5BA1\u533A\u3002`);
      dropPending(tag);
      return { dictionary: next, reject: tag, mapTags: (tags) => tags, affects: (clip) => clip.pendingTags?.some((item) => item.tag === tag), summary: `\u9A73\u56DE\u5F85\u5BA1\u6807\u7B7E\u300C${tag}\u300D` };
    }
    case "rename": {
      if (!to) throw new WorkbenchError("\u8BF7\u6307\u5B9A\u65B0\u540D\u79F0\u3002");
      if (!known.has(tag) && !next.pending.includes(tag)) throw new WorkbenchError(`\u5B57\u5178\u91CC\u6CA1\u6709\u300C${tag}\u300D\u3002`);
      if (known.has(to)) throw new WorkbenchError(`\u300C${to}\u300D\u5DF2\u5B58\u5728\uFF0C\u8BF7\u6539\u7528\u5408\u5E76\u3002`);
      const owner = known.get(tag);
      const fromTemplate = owner && !(dictionary.dims[owner] || []).includes(tag);
      for (const key of Object.keys(next.dims)) next.dims[key] = next.dims[key].map((item) => item === tag ? to : item);
      next.pending = next.pending.map((item) => item === tag ? to : item);
      if (next.pendingDims[tag]) {
        next.pendingDims[to] = next.pendingDims[tag];
        delete next.pendingDims[tag];
      }
      if (fromTemplate) (next.dims[owner] ||= []).push(to);
      return { dictionary: next, mapTags: (tags) => dedupe(tags.map((item) => item === tag ? to : item)), affects: (clip) => clip.tags?.includes(tag) || clip.aiTags?.some((item) => item.tag === tag), summary: `\u628A\u300C${tag}\u300D\u6539\u540D\u4E3A\u300C${to}\u300D` };
    }
    case "merge": {
      if (!to) throw new WorkbenchError("\u8BF7\u6307\u5B9A\u5408\u5E76\u5230\u54EA\u4E2A\u6807\u7B7E\u3002");
      if (!known.has(to)) throw new WorkbenchError(`\u76EE\u6807\u6807\u7B7E\u300C${to}\u300D\u4E0D\u5728\u5B57\u5178\u91CC\u3002`);
      if (tag === to) throw new WorkbenchError("\u4E0D\u80FD\u5408\u5E76\u5230\u81EA\u8EAB\u3002");
      removeEverywhere(tag);
      return { dictionary: next, mapTags: (tags) => dedupe(tags.map((item) => item === tag ? to : item)), affects: (clip) => clip.tags?.includes(tag) || clip.aiTags?.some((item) => item.tag === tag), summary: `\u628A\u300C${tag}\u300D\u5408\u5E76\u5230\u300C${to}\u300D` };
    }
    case "delete": {
      if (!known.has(tag) && !next.pending.includes(tag)) throw new WorkbenchError(`\u5B57\u5178\u91CC\u6CA1\u6709\u300C${tag}\u300D\u3002`);
      if (isTemplateTag(tag)) throw new WorkbenchError(`\u300C${tag}\u300D\u6765\u81EA\u6A21\u677F\uFF0C\u4E0D\u80FD\u53EA\u5728\u672C\u9879\u76EE\u5220\u9664\uFF1B\u53EF\u4EE5\u5728\u300C\u7F16\u8F91\u6A21\u677F\u300D\u91CC\u5220\uFF0C\u6216\u5408\u5E76\u5230\u522B\u7684\u6807\u7B7E\u3002`);
      removeEverywhere(tag);
      return { dictionary: next, mapTags: (tags) => tags.filter((item) => item !== tag), affects: (clip) => clip.tags?.includes(tag) || clip.aiTags?.some((item) => item.tag === tag), summary: `\u5220\u9664\u300C${tag}\u300D` };
    }
    default:
      throw new WorkbenchError("\u4E0D\u652F\u6301\u7684\u6807\u7B7E\u64CD\u4F5C\u3002\u53EF\u7528\uFF1Aadd / rename / merge / delete / move / approve / reject / suggest / add-dim / delete-dim");
  }
}
var dedupe = (list) => [...new Set(list)];

// src/server/lib/media.js
var SUPPORTED = /* @__PURE__ */ new Set([".mp4", ".mov", ".mts", ".m2ts", ".m4v"]);
var VIDEO_LIKE = /* @__PURE__ */ new Set([...SUPPORTED, ".avi", ".mkv", ".mxf", ".wmv", ".flv", ".3gp", ".webm", ".mpg", ".mpeg", ".r3d", ".braw", ".insv"]);
var SKIP_DIRS = RESERVED_DIRS;
var REASONS = {
  short: "\u65F6\u957F\u8FC7\u77ED",
  black: "\u9ED1\u5C4F/\u8BEF\u89E6\u62CD\u6444",
  blur: "\u753B\u9762\u6A21\u7CCA/\u5931\u7126",
  shake: "\u5267\u70C8\u6296\u52A8",
  duplicate: "\u91CD\u590D\u955C\u5934"
};
var rejectedMarker = (root, rawId) => path7.join(root, P.rejected, `${rawId}.json`);
async function walk(dir, depth, out) {
  if (depth < 0) return;
  let entries;
  try {
    entries = await readdir4(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path7.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(full, depth - 1, out);
    } else if (entry.isFile() && VIDEO_LIKE.has(path7.extname(entry.name).toLowerCase())) out.push(full);
  }
}
function rawIdFor(file, taken) {
  const base = path7.basename(file, path7.extname(file)).replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 60) || "clip";
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}_${n++}`;
  return id;
}
function createMedia({ ffmpeg, indexStore, creative, eagle, templates }) {
  async function importRaw({ root, project, signal, progress }) {
    const sources = [P.raw, ...project.rawSources.filter((s) => s !== P.raw)];
    const files = [];
    for (const source of sources) {
      const dir = inside(root, source);
      if (source === ".") {
        let entries = [];
        try {
          entries = await readdir4(dir, { withFileTypes: true });
        } catch {
        }
        for (const entry of entries) if (entry.isFile() && VIDEO_LIKE.has(path7.extname(entry.name).toLowerCase())) files.push(path7.join(dir, entry.name));
      } else await walk(dir, 6, files);
    }
    const unique = [...new Set(files)].sort((a, b) => a.localeCompare(b, "zh"));
    progress(0, unique.length, "\u626B\u63CF\u4E2D");
    const known = await indexStore.read(root);
    const byPath = new Map(Object.values(known.raws).map((raw) => [raw.path, raw]));
    let added = 0;
    let updated = 0;
    const unsupported = [];
    for (let i = 0; i < unique.length; i++) {
      signal.throwIfAborted();
      const file = unique[i];
      const rel = relTo(root, file);
      progress(i, unique.length, rel);
      const info = await stat3(file);
      const prior = byPath.get(rel);
      if (prior && prior.size === info.size && prior.mtimeMs === info.mtimeMs && prior.duration) continue;
      const ext = path7.extname(file).toLowerCase();
      const probe = SUPPORTED.has(ext) ? await ffmpeg.probe(file, signal) : null;
      const summary = probe && summarizeProbe(probe);
      if (!summary) {
        unsupported.push({ path: rel, reason: SUPPORTED.has(ext) ? "FFmpeg \u65E0\u6CD5\u8BFB\u53D6\u89C6\u9891\u6D41" : `\u4E0D\u652F\u6301\u7684\u683C\u5F0F ${ext}` });
        continue;
      }
      await indexStore.update(root, (index) => {
        const existing = Object.values(index.raws).find((raw) => raw.path === rel);
        if (existing) {
          Object.assign(existing, summary, { size: info.size, mtimeMs: info.mtimeMs, missing: false });
          updated++;
        } else {
          const id = rawIdFor(file, new Set(Object.keys(index.raws)));
          index.raws[id] = { id, path: rel, size: info.size, mtimeMs: info.mtimeMs, ...summary, status: "pending", importedAt: now() };
          added++;
        }
      });
    }
    const result = await indexStore.update(root, (index) => {
      const present = new Set(unique.map((file) => relTo(root, file)));
      let missing = 0;
      for (const raw of Object.values(index.raws)) {
        raw.missing = !present.has(raw.path);
        if (raw.missing) missing++;
      }
      const supportedPaths = new Set(Object.values(index.raws).map((raw) => raw.path));
      index.unsupported = unsupported.filter((item) => !supportedPaths.has(item.path));
      return { scanned: unique.length, added, updated, missing, unsupported: index.unsupported.length, total: Object.keys(index.raws).length };
    });
    progress(unique.length, unique.length, null);
    await writeReport(root, project);
    return result;
  }
  const analysisSize = (raw, long) => raw.height > raw.width ? { width: Math.round(long * 9 / 16), height: long } : { width: long, height: Math.round(long * 9 / 16) };
  async function analyzeRaw(root, raw, signal) {
    const file = inside(root, raw.path);
    const big = analysisSize(raw, 320);
    const count = Math.max(4, Math.min(16, Math.ceil(raw.duration)));
    const frames = await ffmpeg.grayFrames(file, { fps: round(count / Math.max(raw.duration, 0.1), 4), width: big.width, height: big.height, signal });
    if (!frames.length) throw new WorkbenchError(`\u65E0\u6CD5\u89E3\u7801 ${raw.path} \u7684\u753B\u9762\u3002`, 500, "DECODE_FAILED");
    const lumas = frames.map(meanLuma);
    const sharp = frames.map((f) => sharpnessScore(laplacianVariance(f, big.width, big.height)));
    const contrast = frames.map(lumaStdDev);
    const pick = (t) => frames[Math.min(frames.length - 1, Math.max(0, Math.round(t * (frames.length - 1))))];
    const fingerprint = [0.1, 0.5, 0.9].map((t) => dHash(pick(t), big.width, big.height).toString());
    const small = analysisSize(raw, 160);
    const window = Math.min(3, raw.duration);
    const start = Math.max(0, raw.duration / 2 - window / 2);
    const motion = await ffmpeg.grayFrames(file, { start, duration: window, fps: 10, width: small.width, height: small.height, signal });
    return {
      sharpness: Math.round(median(sharp.filter((_, i) => contrast[i] > 6)) || median(sharp)),
      lumaMean: round(median(lumas), 1),
      lumas,
      shakeVariance: round(shakeVariance(motion, small.width, small.height), 2),
      fingerprint
    };
  }
  async function clean({ root, project, signal, progress, force = false }) {
    const rules = project.cleanRules;
    const index = await indexStore.read(root);
    const raws = Object.values(index.raws).filter((raw) => !raw.missing).sort((a, b) => String(a.shotAt || a.path).localeCompare(String(b.shotAt || b.path)) || a.path.localeCompare(b.path));
    const todo = raws.filter((raw) => force ? !raw.restored : raw.status === "pending");
    progress(0, todo.length, null);
    let done = 0;
    for (const raw of todo) {
      signal.throwIfAborted();
      progress(done, todo.length, raw.path);
      const reasons = [];
      let metrics = null;
      if (raw.duration < rules.minDuration) {
        reasons.push({ code: "short", label: REASONS.short, evidence: `${round(raw.duration, 1)}s < ${rules.minDuration}s` });
      } else {
        metrics = await analyzeRaw(root, raw, signal);
        const blackRatio = metrics.lumas.filter((l) => l < rules.blackLuma).length / metrics.lumas.length;
        metrics.blackRatio = round(blackRatio, 2);
        delete metrics.lumas;
        if (blackRatio > rules.blackRatioMax) reasons.push({ code: "black", label: REASONS.black, evidence: `\u6697\u5E27\u5360\u6BD4 ${Math.round(blackRatio * 100)}% > ${Math.round(rules.blackRatioMax * 100)}%\uFF08\u4EAE\u5EA6 < ${rules.blackLuma}\uFF09` });
        else {
          if (metrics.sharpness < rules.sharpnessMin) reasons.push({ code: "blur", label: REASONS.blur, evidence: `\u6E05\u6670\u5EA6 ${metrics.sharpness} < \u9608\u503C ${rules.sharpnessMin}` });
          if (metrics.shakeVariance > rules.shakeVarianceMax) reasons.push({ code: "shake", label: REASONS.shake, evidence: `\u4F4D\u79FB\u65B9\u5DEE ${metrics.shakeVariance} > ${rules.shakeVarianceMax}` });
          if (!reasons.length) {
            const current = await indexStore.read(root);
            const earlier = Object.values(current.raws).filter((other) => other.id !== raw.id && other.status === "kept" && other.clean?.fingerprint);
            let best = null;
            for (const other of earlier) {
              const similarity = fingerprintSimilarity(metrics.fingerprint.map(BigInt), other.clean.fingerprint.map(BigInt));
              if (!best || similarity > best.similarity) best = { id: other.id, similarity };
            }
            if (best && best.similarity >= rules.duplicateSimilarity) {
              reasons.push({ code: "duplicate", label: REASONS.duplicate, evidence: `\u4E0E ${best.id} \u76F8\u4F3C\u5EA6 ${Math.round(best.similarity * 100)}% \u2265 ${Math.round(rules.duplicateSimilarity * 100)}%`, of: best.id });
            }
          }
        }
      }
      const status = reasons.length ? "rejected" : "kept";
      await indexStore.update(root, (index2) => {
        const entry = index2.raws[raw.id];
        if (!entry) return;
        entry.status = status;
        entry.clean = { ...metrics || {}, reasons, rulesVersion: rules.version, at: now() };
      });
      if (status === "rejected") {
        await writeJson(rejectedMarker(root, raw.id), { rawId: raw.id, original: raw.path, reasons, rulesVersion: rules.version, at: now(), note: "\u539F\u7247\u672A\u79FB\u52A8\uFF1B\u5728\u9762\u677F\u70B9\u300C\u6062\u590D\u300D\u5373\u53EF\u6062\u590D\u3002" });
      } else if (await exists(rejectedMarker(root, raw.id))) {
        await rm(rejectedMarker(root, raw.id), { force: true });
      }
      done++;
    }
    progress(done, todo.length, null);
    const report = await writeReport(root, project);
    return { analyzed: done, kept: report.kept, rejected: report.rejected, pending: report.pending };
  }
  async function restore(root, project, rawIds) {
    const ids = Array.isArray(rawIds) ? rawIds : [rawIds];
    const restored = await indexStore.update(root, (index) => {
      const out = [];
      for (const id of ids) {
        const raw = index.raws[id];
        if (!raw) throw new WorkbenchError(`\u627E\u4E0D\u5230\u539F\u7247 ${id}\u3002`, 404);
        if (raw.status !== "rejected") continue;
        raw.status = "kept";
        raw.restored = true;
        raw.restoredAt = now();
        out.push(id);
      }
      return out;
    });
    for (const id of restored) await rm(rejectedMarker(root, id), { force: true });
    await appendLog(root, { action: "media.restore", rawIds: restored });
    await writeReport(root, project);
    return { restored };
  }
  async function encoderArgs() {
    const caps = await ffmpeg.detect();
    const list = caps.encoders?.list || [];
    if (list.includes("libx264")) return ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p"];
    const hw = ["h264_nvenc", "h264_qsv", "h264_amf", "h264_videotoolbox", "h264_mf"].find((name2) => list.includes(name2));
    if (hw) return ["-c:v", hw, "-b:v", "8M", "-pix_fmt", "yuv420p"];
    return ["-c:v", "mpeg4", "-q:v", "4"];
  }
  async function split({ root, project, signal, progress, rawIds, threshold = 0.3, minClip = 1 }) {
    const index = await indexStore.read(root);
    const clipsByRaw = /* @__PURE__ */ new Map();
    for (const clip of Object.values(index.clips)) clipsByRaw.set(clip.rawId, (clipsByRaw.get(clip.rawId) || 0) + 1);
    const targets = Object.values(index.raws).filter((raw) => raw.status === "kept" && !raw.missing && (rawIds ? rawIds.includes(raw.id) : !clipsByRaw.get(raw.id)));
    const total = targets.reduce((sum, raw) => sum + raw.duration, 0) || 1;
    let doneSeconds = 0;
    const encoder = await encoderArgs();
    let created = 0;
    progress(0, Math.round(total), null);
    for (const raw of targets) {
      signal.throwIfAborted();
      const file = inside(root, raw.path);
      progress(Math.round(doneSeconds), Math.round(total), `${raw.path} \xB7 \u68C0\u6D4B\u955C\u5934`);
      const cuts = await ffmpeg.sceneCuts(file, threshold, signal, (t) => progress(Math.round(doneSeconds + t * 0.3), Math.round(total)));
      const points = [0, ...cuts.filter((t) => t > minClip && t < raw.duration - minClip), raw.duration];
      const segments = [];
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        if (segments.length && end - start < minClip) segments[segments.length - 1].end = end;
        else segments.push({ start, end });
      }
      if (segments.length > 1 && segments[0].end - segments[0].start < minClip) {
        segments[1].start = 0;
        segments.shift();
      }
      const dir = path7.join(root, P.clips, raw.id);
      await mkdir5(dir, { recursive: true });
      await mkdir5(path7.join(root, ".dsh", "cache", "thumbs"), { recursive: true });
      await indexStore.update(root, (idx) => {
        for (const [id, clip] of Object.entries(idx.clips)) if (clip.rawId === raw.id) delete idx.clips[id];
      });
      for (let i = 0; i < segments.length; i++) {
        signal.throwIfAborted();
        const seg = segments[i];
        const id = `${raw.id}_s${String(i + 1).padStart(2, "0")}`;
        const proxy = path7.join(dir, `${id}.mp4`);
        const thumb = path7.join(root, ".dsh", "cache", "thumbs", `${id}.jpg`);
        const duration = seg.end - seg.start;
        progress(Math.round(doneSeconds + raw.duration * 0.3 + seg.start / raw.duration * raw.duration * 0.7), Math.round(total), `${id}`);
        const scale = "scale='trunc(iw*min(1,1080/min(iw,ih))/2)*2':'trunc(ih*min(1,1080/min(iw,ih))/2)*2'";
        await ffmpeg.ffmpeg(["-ss", seg.start.toFixed(3), "-i", file, "-t", duration.toFixed(3), "-map", "0:v:0", "-map", "0:a:0?", "-vf", scale, ...encoder, "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", proxy], { signal });
        await ffmpeg.ffmpeg(["-ss", (duration / 2).toFixed(3), "-i", proxy, "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", thumb], { signal });
        await indexStore.update(root, (idx) => {
          idx.clips[id] = {
            id,
            rawId: raw.id,
            index: i + 1,
            start: round(seg.start, 3),
            end: round(seg.end, 3),
            duration: round(duration, 3),
            proxy: relTo(root, proxy),
            thumb: relTo(root, thumb),
            width: raw.width,
            height: raw.height,
            tags: [],
            aiTags: [],
            pendingTags: [],
            tagStatus: "untagged",
            reviewed: false,
            needsReview: false,
            createdAt: now()
          };
        });
        created++;
      }
      doneSeconds += raw.duration;
    }
    progress(Math.round(total), Math.round(total), null);
    await writeReport(root, project);
    return { raws: targets.length, clips: created };
  }
  async function contactSheet(src, { duration, width, height, start = 0 }, target, signal) {
    if (await exists(target)) return;
    const t = [0.2, 0.5, 0.8].map((p) => (start + duration * p).toFixed(3));
    const cell = height > width ? "270:480" : "480:270";
    const [cw, ch] = cell.split(":");
    const chain = [0, 1, 2].map((i) => `[${i}:v]scale=${cw}:${ch}:force_original_aspect_ratio=decrease,pad=${cw}:${ch}:(ow-iw)/2:(oh-ih)/2[v${i}]`).join(";");
    await ffmpeg.ffmpeg(["-ss", t[0], "-i", src, "-ss", t[1], "-i", src, "-ss", t[2], "-i", src, "-filter_complex", `${chain};[v0][v1][v2]hstack=inputs=3`, "-frames:v", "1", "-q:v", "4", target], { signal });
  }
  async function keyframes({ root, clipIds, signal, progress }) {
    const index = await indexStore.read(root);
    const out = [];
    const ids = clipIds?.length ? clipIds : Object.values(index.clips).filter((clip) => clip.tagStatus !== "tagged").map((clip) => clip.id);
    progress?.(0, ids.length, null);
    await mkdir5(path7.join(root, ".dsh", "cache", "keyframes"), { recursive: true });
    for (let i = 0; i < ids.length; i++) {
      signal?.throwIfAborted();
      const clip = index.clips[ids[i]];
      if (!clip) throw new WorkbenchError(`\u627E\u4E0D\u5230\u5207\u7247 ${ids[i]}\u3002`, 404);
      const target = path7.join(root, ".dsh", "cache", "keyframes", `${clip.id}.jpg`);
      await contactSheet(inside(root, clip.proxy), clip, target, signal);
      const raw = index.raws[clip.rawId];
      out.push({ clipId: clip.id, image: relTo(root, target), duration: clip.duration, raw: raw?.path, transcript: clip.transcript || null, currentTags: clip.tags });
      progress?.(i + 1, ids.length, clip.id);
    }
    return out;
  }
  async function samples({ root, limit = 16, signal }) {
    const index = await indexStore.read(root);
    const max = Math.min(Math.max(Number(limit) || 16, 1), 40);
    const spread = (list) => list.length <= max ? list : Array.from({ length: max }, (_, i) => list[Math.floor(i * list.length / max)]);
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === "kept").map((raw) => raw.id));
    const clips = Object.values(index.clips).filter((clip) => kept.has(clip.rawId));
    if (clips.length) return { kind: "clips", items: await keyframes({ root, clipIds: spread(clips).map((clip) => clip.id), signal }) };
    const raws = Object.values(index.raws).filter((raw) => !raw.missing && raw.status !== "rejected" && raw.duration > 0).sort((a, b) => Number(b.status === "kept") - Number(a.status === "kept") || a.id.localeCompare(b.id));
    if (!raws.length) return { kind: "none", items: [] };
    await mkdir5(path7.join(root, ".dsh", "cache", "keyframes"), { recursive: true });
    const out = [];
    for (const raw of spread(raws)) {
      signal?.throwIfAborted();
      const target = path7.join(root, ".dsh", "cache", "keyframes", `raw_${raw.id}.jpg`);
      try {
        await contactSheet(inside(root, raw.path), raw, target, signal);
        out.push({ rawId: raw.id, image: relTo(root, target), duration: raw.duration, raw: raw.path });
      } catch (error) {
        if (signal?.aborted) throw error;
        out.push({ rawId: raw.id, raw: raw.path, error: "\u65E0\u6CD5\u62BD\u5E27" });
      }
    }
    return { kind: "raws", items: out };
  }
  async function readDictionary(root) {
    const doc = await creative.read(root, "\u6807\u7B7E\u5B57\u5178.yaml").catch(() => null);
    const dictionary = parseDictionary(doc?.exists ? doc.content : "");
    const all = templates ? await templates.all() : void 0;
    return { dictionary, effective: effectiveDictionary(dictionary, all), exists: Boolean(doc?.exists), templates: all };
  }
  async function applyTags(root, items, { model, floor = 0.6 } = {}) {
    if (!Array.isArray(items) || !items.length) throw new WorkbenchError("\u8BF7\u63D0\u4F9B\u8981\u6253\u6807\u7684\u5207\u7247\u3002");
    const { dictionary, effective, exists: hasDictionary } = await readDictionary(root);
    if (!hasDictionary) throw new WorkbenchError("\u8FD8\u6CA1\u6709\u6807\u7B7E\u5B57\u5178\u3002\u8BF7\u5148\u5728\u300C\u6807\u7B7E\u300D\u9875\u9009\u597D\u6807\u7B7E\u6A21\u677F\uFF08\u6216\u8BA9 AI \u751F\u6210\u6807\u7B7E\u5B57\u5178\uFF09\uFF0C\u6253\u6807\u53EA\u80FD\u4ECE\u5B57\u5178\u91CC\u9009\u3002", 409, "NO_DICTIONARY");
    const known = tagIndex(effective);
    const newPending = /* @__PURE__ */ new Set();
    const pendingHints = {};
    const summary = await indexStore.update(root, (index) => {
      const result = { tagged: 0, pending: 0, lowConfidence: 0, skipped: [] };
      for (const item of items) {
        const clip = index.clips[item?.clipId];
        if (!clip) {
          result.skipped.push({ clipId: item?.clipId, reason: "\u5207\u7247\u4E0D\u5B58\u5728" });
          continue;
        }
        const accepted = [];
        const pending = [];
        for (const raw of item.tags || []) {
          const tag = typeof raw === "string" ? raw.trim() : String(raw?.tag || "").trim();
          if (!tag) continue;
          const confidence = typeof raw === "object" && Number.isFinite(Number(raw.confidence)) ? Math.max(0, Math.min(1, Number(raw.confidence))) : 0.8;
          if (known.has(tag)) accepted.push({ tag, dim: known.get(tag), confidence });
          else {
            const hint = typeof raw === "object" && raw.dim ? String(raw.dim) : null;
            pending.push({ tag, dim: hint, confidence });
            if (!dictionary.pending.includes(tag)) {
              newPending.add(tag);
              if (hint && !pendingHints[tag]) pendingHints[tag] = hint;
            }
          }
        }
        clip.aiTags = accepted;
        clip.tags = [...new Set(accepted.map((t) => t.tag))];
        clip.pendingTags = pending;
        clip.needsReview = accepted.some((t) => t.confidence < floor);
        clip.tagStatus = "tagged";
        clip.taggedAt = now();
        clip.tagModel = model || null;
        clip.reviewed = false;
        if (clip.eagle?.id) clip.eagle.dirty = true;
        if (typeof item.transcript === "string") clip.transcript = item.transcript;
        result.tagged++;
        result.pending += pending.length;
        if (clip.needsReview) result.lowConfidence++;
      }
      return result;
    });
    if (newPending.size) {
      const next = { ...dictionary, pending: [...dictionary.pending, ...newPending], pendingDims: { ...dictionary.pendingDims || {}, ...pendingHints } };
      await creative.write(root, "\u6807\u7B7E\u5B57\u5178.yaml", serializeDictionary(next), { source: "system", note: "AI \u5EFA\u8BAE\u7684\u65B0\u6807\u7B7E\u5DF2\u52A0\u5165\u5F85\u5BA1\u533A" });
    }
    await appendLog(root, { action: "media.tag", count: summary.tagged, pending: [...newPending], model: model || null });
    return { ...summary, newPendingTags: [...newPending] };
  }
  async function review(root, clipId, tags, { reviewed = true } = {}) {
    const { effective } = await readDictionary(root);
    const known = tagIndex(effective);
    const bad = (tags || []).filter((tag) => !known.has(tag));
    if (bad.length) throw new WorkbenchError(`\u8FD9\u4E9B\u6807\u7B7E\u4E0D\u5728\u5B57\u5178\u91CC\uFF1A${bad.join("\u3001")}\u3002\u8BF7\u5148\u52A0\u5165\u5B57\u5178\u3002`);
    return indexStore.update(root, (index) => {
      const clip = index.clips[clipId];
      if (!clip) throw new WorkbenchError(`\u627E\u4E0D\u5230\u5207\u7247 ${clipId}\u3002`, 404);
      clip.tags = [...new Set(tags)];
      clip.reviewed = Boolean(reviewed);
      clip.reviewedAt = now();
      clip.needsReview = false;
      if (clip.tagStatus === "untagged") clip.tagStatus = "manual";
      if (clip.eagle?.id) clip.eagle.dirty = true;
      return { clipId, tags: clip.tags, reviewed: clip.reviewed };
    });
  }
  async function eaglePush({ root, project, signal, progress, saveProject }) {
    const index = await indexStore.read(root);
    const status = await eagle.info();
    if (!status.connected) throw new WorkbenchError("Eagle \u672A\u8FDE\u63A5\uFF1A\u8BF7\u5148\u6253\u5F00 Eagle\uFF0C\u518D\u91CD\u65B0\u540C\u6B65\u3002", 503, "EAGLE_OFFLINE");
    const folderId = await eagle.ensureFolder(project.eagle.folderName || project.name, project.eagle.folderId);
    if (folderId !== project.eagle.folderId) await saveProject({ eagle: { ...project.eagle, folderId } });
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === "kept").map((raw) => raw.id));
    const clips = Object.values(index.clips).filter((clip) => kept.has(clip.rawId));
    const toAdd = clips.filter((clip) => !clip.eagle?.id || clip.eagle?.missing);
    const toUpdate = clips.filter((clip) => clip.eagle?.id && !clip.eagle?.missing && clip.eagle?.dirty);
    const total = toAdd.length + toUpdate.length;
    progress(0, total, null);
    let done = 0;
    const annotation = (clip) => {
      const raw = index.raws[clip.rawId];
      return [`\u539F\u7247\uFF1A${raw?.path || ""}`, `\u5165\u70B9\uFF1A${clip.start}s  \u51FA\u70B9\uFF1A${clip.end}s`, clip.transcript ? `\u8F6C\u5199\uFF1A${clip.transcript}` : ""].filter(Boolean).join("\n");
    };
    for (let i = 0; i < toAdd.length; i += 200) {
      signal.throwIfAborted();
      const batch = toAdd.slice(i, i + 200);
      await eagle.addFromPaths(batch.map((clip) => ({ path: inside(root, clip.proxy), name: clip.id, tags: effectiveClipTags(clip), annotation: annotation(clip) })), folderId);
      done += batch.length;
      progress(done, total, `\u5165\u5E93 ${done}/${toAdd.length}`);
    }
    let mapped = 0;
    if (toAdd.length) {
      for (let attempt = 0; attempt < 10; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, attempt ? 1500 : 800));
        const items = await eagle.listFolder(folderId);
        const byName = new Map(items.map((item) => [item.name, item.id]));
        mapped = await indexStore.update(root, (idx) => {
          let n = 0;
          for (const clip of toAdd) {
            const id = byName.get(clip.id);
            if (id && idx.clips[clip.id]) {
              idx.clips[clip.id].eagle = { id, syncedAt: now(), dirty: false, missing: false };
              n++;
            }
          }
          return n;
        });
        if (mapped >= toAdd.length) break;
      }
    }
    for (const clip of toUpdate) {
      signal.throwIfAborted();
      await eagle.update(clip.eagle.id, { tags: effectiveClipTags(clip), annotation: annotation(clip) });
      await indexStore.update(root, (idx) => {
        if (idx.clips[clip.id]?.eagle) Object.assign(idx.clips[clip.id].eagle, { dirty: false, syncedAt: now() });
      });
      done++;
      progress(done, total, clip.id);
    }
    await writeReport(root, project);
    return { added: toAdd.length, mapped, updated: toUpdate.length, folderId };
  }
  async function eaglePull({ root, project, signal, progress }) {
    if (!project.eagle.folderId) throw new WorkbenchError("\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u540C\u6B65\u8FC7 Eagle\u3002", 409);
    const status = await eagle.info();
    if (!status.connected) throw new WorkbenchError("Eagle \u672A\u8FDE\u63A5\uFF1A\u8BF7\u5148\u6253\u5F00 Eagle\u3002", 503, "EAGLE_OFFLINE");
    const { effective } = await readDictionary(root);
    const known = tagIndex(effective);
    const items = await eagle.listFolder(project.eagle.folderId);
    signal.throwIfAborted();
    const byId = new Map(items.map((item) => [item.id, item]));
    const result = await indexStore.update(root, (index) => {
      const out = { changed: 0, missing: 0, outsideDictionary: [] };
      for (const clip of Object.values(index.clips)) {
        if (!clip.eagle?.id) continue;
        const item = byId.get(clip.eagle.id);
        if (!item) {
          clip.eagle.missing = true;
          out.missing++;
          continue;
        }
        clip.eagle.missing = false;
        const tags = (item.tags || []).filter((tag) => known.has(tag));
        const outside = (item.tags || []).filter((tag) => !known.has(tag));
        for (const tag of outside) if (!out.outsideDictionary.includes(tag)) out.outsideDictionary.push(tag);
        const before = JSON.stringify([...clip.tags || []].sort());
        if (before !== JSON.stringify([...tags].sort())) {
          clip.tags = tags;
          clip.reviewed = true;
          clip.reviewedAt = now();
          clip.eagle.pulledAt = now();
          out.changed++;
        }
      }
      return out;
    });
    progress(1, 1, null);
    await writeReport(root, project);
    return result;
  }
  async function computeReport(root, project) {
    const index = await indexStore.read(root);
    const raws = Object.values(index.raws).filter((raw) => !raw.missing);
    const kept = raws.filter((raw) => raw.status === "kept");
    const rejected = raws.filter((raw) => raw.status === "rejected");
    const pending = raws.filter((raw) => raw.status === "pending");
    const reasons = Object.fromEntries(Object.keys(REASONS).map((code) => [code, 0]));
    const details = [];
    for (const raw of rejected) {
      const first = raw.clean?.reasons?.[0];
      if (first) reasons[first.code] = (reasons[first.code] || 0) + 1;
      details.push({ rawId: raw.id, file: raw.path, reason: first?.label || "\u672A\u77E5", code: first?.code || null, evidence: (raw.clean?.reasons || []).map((r) => r.evidence).join("\uFF1B"), duration: raw.duration });
    }
    const keptIds = new Set(kept.map((raw) => raw.id));
    const clips = Object.values(index.clips).filter((clip) => keptIds.has(clip.rawId));
    const reviewedClips = clips.filter((clip) => clip.reviewed && clip.aiTags?.length);
    let aiTotal = 0;
    let aiKept = 0;
    for (const clip of reviewedClips) {
      aiTotal += clip.aiTags.length;
      aiKept += clip.aiTags.filter((t) => clip.tags.includes(t.tag)).length;
    }
    const lastRun = raws.map((raw) => raw.clean?.at).filter(Boolean).sort().pop() || null;
    const balanced = kept.length + rejected.length + pending.length === raws.length;
    return {
      generatedAt: now(),
      lastCleanAt: lastRun,
      rulesVersion: project.cleanRules.version,
      rules: project.cleanRules,
      imported: raws.length,
      kept: kept.length,
      rejected: rejected.length,
      pending: pending.length,
      balanced,
      missing: Object.values(index.raws).filter((raw) => raw.missing).length,
      unsupported: index.unsupported,
      reasons,
      details,
      clips: clips.length,
      eagleSynced: clips.filter((clip) => clip.eagle?.id && !clip.eagle?.missing).length,
      eagleMissing: clips.filter((clip) => clip.eagle?.missing).length,
      eagleDirty: clips.filter((clip) => clip.eagle?.dirty).length,
      tagging: {
        tagged: clips.filter((clip) => clip.tagStatus === "tagged").length,
        untagged: clips.filter((clip) => clip.tagStatus === "untagged").length,
        needsReview: clips.filter((clip) => clip.needsReview).length,
        reviewed: clips.filter((clip) => clip.reviewed).length,
        aiTags: clips.reduce((sum, clip) => sum + (clip.aiTags?.length || 0), 0),
        adoption: aiTotal ? round(aiKept / aiTotal, 3) : null,
        adoptionSample: reviewedClips.length
      }
    };
  }
  async function writeReport(root, project) {
    const report = await computeReport(root, project);
    await writeJson(path7.join(root, P.cleanReport), report);
    return report;
  }
  async function tagSummary(root) {
    const { dictionary, effective, exists: hasDictionary, templates: all } = await readDictionary(root);
    const index = await indexStore.read(root);
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === "kept").map((raw) => raw.id));
    const counts = /* @__PURE__ */ new Map();
    const pendingCounts = /* @__PURE__ */ new Map();
    for (const clip of Object.values(index.clips)) {
      if (!kept.has(clip.rawId)) continue;
      for (const tag of clip.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
      for (const item of clip.pendingTags || []) pendingCounts.set(item.tag, (pendingCounts.get(item.tag) || 0) + 1);
    }
    const projectTags = new Set(Object.values(dictionary.dims).flat());
    return {
      exists: hasDictionary,
      inherit: dictionary.inherit,
      inheritLabel: all?.[dictionary.inherit]?.label || dictionary.inherit,
      templateMissing: effective.templateMissing,
      dims: Object.entries(effective.dims).map(([dim, tags]) => ({ dim, base: DIMENSIONS.includes(dim), tags: tags.map((tag) => ({ tag, count: counts.get(tag) || 0, fromTemplate: !projectTags.has(tag) })) })),
      pending: dictionary.pending.map((tag) => ({ tag, count: pendingCounts.get(tag) || 0, suggestedDim: dictionary.pendingDims?.[tag] || suggestedDim(index, tag) })),
      totalTags: Object.values(effective.dims).reduce((n, list) => n + list.length, 0),
      clips: Object.values(index.clips).filter((clip) => kept.has(clip.rawId)).length
    };
  }
  function suggestedDim(index, tag) {
    const votes = /* @__PURE__ */ new Map();
    for (const clip of Object.values(index.clips)) for (const item of clip.pendingTags || []) if (item.tag === tag && item.dim) votes.set(item.dim, (votes.get(item.dim) || 0) + 1);
    return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }
  async function listClips(root, { tag, filter, rawId, limit = 500, offset = 0 } = {}) {
    const index = await indexStore.read(root);
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === "kept").map((raw) => raw.id));
    let clips = Object.values(index.clips).filter((clip) => kept.has(clip.rawId));
    if (rawId) clips = clips.filter((clip) => clip.rawId === rawId);
    if (tag) clips = clips.filter((clip) => clip.tags?.includes(tag) || clip.pendingTags?.some((p) => p.tag === tag));
    if (filter === "review") clips = clips.filter((clip) => clip.needsReview || !clip.reviewed && clip.tagStatus === "tagged");
    if (filter === "untagged") clips = clips.filter((clip) => clip.tagStatus === "untagged");
    if (filter === "reviewed") clips = clips.filter((clip) => clip.reviewed);
    clips.sort((a, b) => a.id.localeCompare(b.id));
    return { total: clips.length, clips: clips.slice(offset, offset + limit).map((clip) => ({ ...clip, raw: index.raws[clip.rawId]?.path })) };
  }
  async function transcribeAvailable(runner) {
    try {
      const result = await runner("whisper", ["--help"], { timeoutMs: 15e3 });
      return result.code === 0;
    } catch {
      return false;
    }
  }
  async function transcribe({ root, signal, progress, clipIds, language = "zh", model = "small" }) {
    if (!await transcribeAvailable(ffmpeg.run)) throw new WorkbenchError("\u672A\u68C0\u6D4B\u5230\u672C\u5730 Whisper\uFF08\u547D\u4EE4 whisper\uFF09\u3002\u53EF\u4EE5\u7528 pip install -U openai-whisper \u5B89\u88C5\u540E\u91CD\u8BD5\uFF1B\u4E0D\u8F6C\u5199\u4E0D\u5F71\u54CD\u6253\u6807\u3002", 424, "WHISPER_MISSING");
    const index = await indexStore.read(root);
    const targets = Object.values(index.clips).filter((clip) => (clipIds ? clipIds.includes(clip.id) : !clip.transcript) && index.raws[clip.rawId]?.hasAudio);
    const outDir = path7.join(root, ".dsh", "cache", "transcripts");
    await mkdir5(outDir, { recursive: true });
    progress(0, targets.length, null);
    let done = 0;
    for (const clip of targets) {
      signal.throwIfAborted();
      progress(done, targets.length, clip.id);
      const result = await ffmpeg.run("whisper", [inside(root, clip.proxy), "--model", model, "--language", language, "--output_format", "json", "--output_dir", outDir, "--fp16", "False"], { signal });
      if (result.code === 0) {
        const json = await readJson(path7.join(outDir, `${clip.id}.json`), null);
        const text = (json?.text || "").trim();
        const segments = (json?.segments || []).map((s) => ({ start: round(s.start, 2), end: round(s.end, 2), text: s.text.trim() }));
        await indexStore.update(root, (idx) => {
          if (idx.clips[clip.id]) {
            idx.clips[clip.id].transcript = text;
            idx.clips[clip.id].transcriptSegments = segments;
          }
        });
      }
      done++;
    }
    progress(done, targets.length, null);
    return { transcribed: done };
  }
  return { importRaw, clean, restore, split, keyframes, samples, applyTags, review, eaglePush, eaglePull, computeReport, writeReport, tagSummary, listClips, readDictionary, transcribe };
}

// src/server/lib/edit.js
import { mkdir as mkdir6, rm as rm2, writeFile as writeFile2, access, constants } from "node:fs/promises";
import path8 from "node:path";
import os from "node:os";

// src/server/lib/storyboard.js
var COLUMNS = {
  no: ["\u955C\u53F7", "\u955C\u5934", "\u7F16\u53F7", "no", "shot"],
  duration: ["\u65F6\u957F", "\u79D2\u6570", "duration"],
  desc: ["\u753B\u9762\u63CF\u8FF0", "\u753B\u9762", "\u5185\u5BB9", "description"],
  line: ["\u53F0\u8BCD/\u65C1\u767D", "\u53F0\u8BCD", "\u65C1\u767D", "\u53E3\u64AD", "\u6587\u6848", "line"],
  tags: ["\u6240\u9700\u6807\u7B7E", "\u6807\u7B7E", "tags"],
  size: ["\u666F\u522B", "size"],
  move: ["\u8FD0\u955C", "camera", "move"],
  note: ["\u5907\u6CE8", "note"]
};
var EMPTY = /^(—|-|–|无|\/|n\/a)?$/i;
function cells(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}
function splitTags(text) {
  if (!text || EMPTY.test(text.trim())) return [];
  return [...new Set(text.split(/[,，、;；\s/]+/).map((item) => item.replace(/^#/, "").trim()).filter((item) => item && !EMPTY.test(item)))];
}
function parseDuration(text) {
  if (!text) return 0;
  const t = String(text).trim();
  const mmss = t.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);
  const n = t.match(/(\d+(?:\.\d+)?)/);
  return n ? Number(n[1]) : 0;
}
function parseStoryboard(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const shots = [];
  let header = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    const row = cells(line);
    if (row.every((cell) => /^:?-{2,}:?$/.test(cell) || cell === "")) continue;
    if (row.some((cell) => COLUMNS.no.includes(cell.toLowerCase()) || cell === "\u955C\u53F7")) {
      header = {};
      row.forEach((cell, index) => {
        const name2 = cell.toLowerCase();
        for (const [key, names] of Object.entries(COLUMNS)) {
          if (header[key] === void 0 && names.includes(name2)) header[key] = index;
        }
      });
      continue;
    }
    if (!header || header.no === void 0) continue;
    const no = row[header.no] || "";
    if (!/\d/.test(no)) continue;
    const get = (key) => header[key] === void 0 ? "" : row[header[key]] || "";
    const shot = {
      no: no.replace(/[^\dA-Za-z-]/g, "").padStart(2, "0"),
      duration: parseDuration(get("duration")),
      desc: get("desc"),
      line: EMPTY.test(get("line")) ? "" : get("line"),
      tags: splitTags(get("tags")),
      size: EMPTY.test(get("size")) ? "" : get("size"),
      move: EMPTY.test(get("move")) ? "" : get("move"),
      note: get("note"),
      warnings: []
    };
    if (header.tags === void 0 || !shot.tags.length) shot.warnings.push("\u7F3A\u5C11\u300C\u6240\u9700\u6807\u7B7E\u300D\uFF0C\u526A\u8F91\u65E0\u6CD5\u81EA\u52A8\u5339\u914D");
    if (!shot.duration) shot.warnings.push("\u7F3A\u5C11\u65F6\u957F");
    shots.push(shot);
  }
  const total = shots.reduce((sum, shot) => sum + shot.duration, 0);
  return { shots, total: Math.round(total * 100) / 100, hasTable: Boolean(header) };
}

// src/server/lib/edit.js
var RESOLUTIONS = {
  "3840x2160": { width: 3840, height: 2160, label: "3840\xD72160\uFF084K\uFF09", aspect: "16:9" },
  "1920x1080": { width: 1920, height: 1080, label: "1920\xD71080\uFF081080P\uFF09", aspect: "16:9" },
  "1080x1920": { width: 1080, height: 1920, label: "1080\xD71920\uFF08\u7AD6\u5C4F\uFF09", aspect: "9:16" },
  "2160x3840": { width: 2160, height: 3840, label: "2160\xD73840\uFF08\u7AD6\u5C4F 4K\uFF09", aspect: "9:16" },
  "1080x1080": { width: 1080, height: 1080, label: "1080\xD71080\uFF08\u65B9\u5F62\uFF09", aspect: "1:1" }
};
var FPS_OPTIONS = [24, 25, 30, 50, 60];
function defaultSpec(project) {
  const key = `${project.spec.width}x${project.spec.height}`;
  return {
    resolution: RESOLUTIONS[key] ? key : project.spec.aspect === "9:16" ? "1080x1920" : "3840x2160",
    fps: FPS_OPTIONS.includes(project.spec.fps) ? project.spec.fps : 25,
    codec: "h265",
    bitrateMbps: 40,
    targetDuration: Number(project.spec.targetDuration) > 0 ? Number(project.spec.targetDuration) : null,
    subtitles: "burn+srt",
    engine: "ffmpeg",
    transition: "cut"
  };
}
function sanitizeEditSpec(input, base) {
  const spec = { ...base };
  if (!input || typeof input !== "object") return spec;
  if (RESOLUTIONS[input.resolution]) spec.resolution = input.resolution;
  if (FPS_OPTIONS.includes(Number(input.fps))) spec.fps = Number(input.fps);
  if (["h264", "h265"].includes(input.codec)) spec.codec = input.codec;
  if (Number.isFinite(Number(input.bitrateMbps)) && input.bitrateMbps >= 1 && input.bitrateMbps <= 400) spec.bitrateMbps = Number(input.bitrateMbps);
  if (input.targetDuration === null || input.targetDuration === "" || input.targetDuration === 0) spec.targetDuration = null;
  else if (Number.isFinite(Number(input.targetDuration)) && input.targetDuration > 0 && input.targetDuration <= 7200) spec.targetDuration = Number(input.targetDuration);
  if (["burn+srt", "srt", "burn", "none"].includes(input.subtitles)) spec.subtitles = input.subtitles;
  if (["jianying", "ffmpeg", "both"].includes(input.engine)) spec.engine = input.engine;
  if (["cut", "dissolve"].includes(input.transition)) spec.transition = input.transition;
  return spec;
}
function jianyingDefaultDir() {
  if (process.platform === "win32") return path8.join(process.env.LOCALAPPDATA || path8.join(os.homedir(), "AppData", "Local"), "JianyingPro", "User Data", "Projects", "com.lveditor.draft");
  if (process.platform === "darwin") return path8.join(os.homedir(), "Movies", "JianyingPro", "User Data", "Projects", "com.lveditor.draft");
  return "";
}
async function jianyingStatus(dir) {
  const target = dir || jianyingDefaultDir();
  if (!target) return { ok: false, dir: null, reason: "\u5F53\u524D\u7CFB\u7EDF\u6CA1\u6709\u526A\u6620\u4E13\u4E1A\u7248" };
  try {
    await access(target, constants.W_OK);
    return { ok: true, dir: target };
  } catch {
    return { ok: false, dir: target, reason: "\u6CA1\u627E\u5230\u526A\u6620\u8349\u7A3F\u76EE\u5F55\uFF08\u672A\u5B89\u88C5\u526A\u6620\u4E13\u4E1A\u7248\u6216\u8DEF\u5F84\u4E0D\u540C\uFF0C\u53EF\u5728\u9879\u76EE\u8BBE\u7F6E\u91CC\u4FEE\u6539\uFF09" };
  }
}
var SRT_TIME = (t) => {
  const ms = Math.round(t * 1e3);
  const h = Math.floor(ms / 36e5);
  const m = Math.floor(ms % 36e5 / 6e4);
  const s = Math.floor(ms % 6e4 / 1e3);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1e3).padStart(3, "0")}`;
};
function toSrt(entries) {
  return entries.map((entry, i) => `${i + 1}
${SRT_TIME(entry.start)} --> ${SRT_TIME(entry.end)}
${entry.text}
`).join("\n");
}
function createEdit({ creative, indexStore, ffmpeg }) {
  const specFile = (root) => path8.join(root, P.editData, "edit_spec.json");
  const matchFile = (root) => path8.join(root, P.editData, "match.json");
  const timelineFile = (root) => path8.join(root, P.editData, "timeline.json");
  async function getSpec(root, project) {
    const saved = await readJson(specFile(root), null);
    return sanitizeEditSpec(saved, defaultSpec(project));
  }
  async function setSpec(root, project, input) {
    const spec = sanitizeEditSpec(input, await getSpec(root, project));
    await writeJson(specFile(root), { ...spec, updatedAt: now() });
    await appendLog(root, { action: "edit.spec.set", spec });
    return spec;
  }
  async function storyboardInUse(root) {
    const meta = await creative.readMeta(root);
    const use = meta.editUse["03_\u5206\u955C\u811A\u672C.md"];
    const current = await creative.read(root, "03_\u5206\u955C\u811A\u672C.md").catch(() => null);
    if (!current?.exists) return { version: 0, editUse: null, shots: [], total: 0, missing: true };
    const doc = use && use !== current.version ? await creative.read(root, "03_\u5206\u955C\u811A\u672C.md", use).catch(() => current) : current;
    const parsed = parseStoryboard(doc.content);
    return { version: doc.version, currentVersion: current.version, editUse: use ?? null, ...parsed };
  }
  async function match(root, { keepManual = true } = {}) {
    const board = await storyboardInUse(root);
    if (board.missing) throw new WorkbenchError("\u8FD8\u6CA1\u6709\u5206\u955C\u811A\u672C\uFF08\u521B\u610F\u526A\u8F91/03_\u5206\u955C\u811A\u672C.md\uFF09\uFF0C\u65E0\u6CD5\u5339\u914D\u3002", 409, "NO_STORYBOARD");
    if (!board.shots.length) throw new WorkbenchError("\u5206\u955C\u811A\u672C\u91CC\u6CA1\u6709\u627E\u5230\u8868\u683C\uFF08\u9700\u8981\u5305\u542B\u300C\u955C\u53F7\u300D\u5217\u7684 Markdown \u8868\u683C\uFF09\u3002", 422, "NO_SHOTS");
    const meta = await creative.readMeta(root);
    const index = await indexStore.read(root);
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === "kept").map((raw) => raw.id));
    const clips = Object.values(index.clips).filter((clip) => kept.has(clip.rawId));
    const previous = await readJson(matchFile(root), null);
    const used = /* @__PURE__ */ new Map();
    const shots = [];
    for (const shot of board.shots) {
      const wanted = [...shot.tags.map((tag) => ({ tag, weight: 1 })), ...shot.size ? [{ tag: shot.size, weight: 0.5 }] : [], ...shot.move ? [{ tag: shot.move, weight: 0.5 }] : []];
      const dedup = [...new Map(wanted.map((w) => [w.tag, w])).values()];
      const totalWeight = dedup.reduce((sum, w) => sum + w.weight, 0);
      const scored = [];
      if (totalWeight > 0) {
        for (const clip of clips) {
          const tags = new Set(effectiveClipTags(clip));
          const hit = dedup.filter((w) => tags.has(w.tag));
          if (!hit.length) continue;
          let score = hit.reduce((sum, w) => sum + w.weight, 0) / totalWeight;
          const short = shot.duration > 0 && clip.duration + 0.05 < shot.duration;
          if (short) score -= 0.1;
          if (used.has(clip.id)) score -= 0.15;
          if (clip.reviewed) score += 0.02;
          scored.push({ clipId: clip.id, score: round(Math.max(0, Math.min(1, score)), 2), duration: clip.duration, short, matched: hit.map((w) => w.tag), missing: dedup.filter((w) => !tags.has(w.tag)).map((w) => w.tag) });
        }
      }
      scored.sort((a, b) => b.score - a.score || Number(a.short) - Number(b.short) || b.duration - a.duration);
      const top = scored.slice(0, 3);
      const prior = keepManual ? previous?.shots?.find((s) => s.no === shot.no && s.manual && s.selected) : null;
      const priorValid = prior && clips.some((clip) => clip.id === prior.selected);
      let selected = priorValid ? prior.selected : shot.tags.length && top[0] && top[0].score >= 0.6 ? top[0].clipId : null;
      if (priorValid && !top.some((t) => t.clipId === prior.selected)) {
        const clip = index.clips[prior.selected];
        top.unshift({ clipId: clip.id, score: null, duration: clip.duration, short: shot.duration > 0 && clip.duration + 0.05 < shot.duration, matched: [], missing: [], manual: true });
      }
      if (selected) used.set(selected, (used.get(selected) || 0) + 1);
      const chosen = top.find((t) => t.clipId === selected);
      shots.push({
        no: shot.no,
        duration: shot.duration,
        desc: shot.desc,
        line: shot.line,
        required: dedup.map((w) => w.tag),
        size: shot.size,
        move: shot.move,
        warnings: shot.warnings,
        top,
        selected,
        manual: Boolean(priorValid),
        status: !selected ? "missing" : chosen?.short ? "short" : "matched",
        note: !selected ? !shot.tags.length ? "\u5206\u955C\u7F3A\u5C11\u300C\u6240\u9700\u6807\u7B7E\u300D\uFF0C\u4E0D\u81EA\u52A8\u5339\u914D" : top.length ? `\u6700\u9AD8\u5206 ${top[0].score} \u4F4E\u4E8E 0.6\uFF0C\u672A\u81EA\u52A8\u9009\u7528` : "\u7D20\u6750\u5E93\u4E2D\u672A\u627E\u5230\u5E26\u8FD9\u4E9B\u6807\u7B7E\u7684\u5207\u7247" : null
      });
    }
    const result = {
      at: now(),
      storyboardVersion: board.version,
      editUseStoryboard: board.editUse,
      scriptVersion: meta.files["02_\u6587\u6848.md"]?.version ?? null,
      editUseScript: meta.editUse["02_\u6587\u6848.md"] ?? null,
      total: shots.length,
      matched: shots.filter((s) => s.status !== "missing").length,
      shotsDuration: board.total,
      shots
    };
    await writeJson(matchFile(root), result);
    await appendLog(root, { action: "edit.match", matched: result.matched, total: result.total, storyboardVersion: board.version });
    return result;
  }
  async function select(root, no, clipId) {
    const data = await readJson(matchFile(root), null);
    if (!data) throw new WorkbenchError("\u8FD8\u6CA1\u6709\u5339\u914D\u7ED3\u679C\u3002", 409);
    const shot = data.shots.find((s) => s.no === no);
    if (!shot) throw new WorkbenchError(`\u627E\u4E0D\u5230\u955C\u5934 ${no}\u3002`, 404);
    const index = await indexStore.read(root);
    if (clipId && !index.clips[clipId]) throw new WorkbenchError(`\u627E\u4E0D\u5230\u5207\u7247 ${clipId}\u3002`, 404);
    shot.selected = clipId || null;
    shot.manual = true;
    const clip = clipId ? index.clips[clipId] : null;
    shot.status = !clip ? "missing" : shot.duration > 0 && clip.duration + 0.05 < shot.duration ? "short" : "matched";
    if (clip && !shot.top.some((t) => t.clipId === clipId)) shot.top.unshift({ clipId, score: null, duration: clip.duration, short: shot.status === "short", matched: [], missing: [], manual: true });
    data.matched = data.shots.filter((s) => s.status !== "missing").length;
    await writeJson(matchFile(root), data);
    return shot;
  }
  async function gaps(root) {
    const data = await readJson(matchFile(root), null);
    if (!data) throw new WorkbenchError("\u8BF7\u5148\u8FD0\u884C\u7D20\u6750\u5339\u914D\u3002", 409);
    const list = data.shots.filter((s) => s.status !== "matched").map((s) => ({ no: s.no, duration: s.duration, desc: s.desc, required: s.required, status: s.status === "short" ? "\u65F6\u957F\u4E0D\u8DB3" : "\u7F3A\u7D20\u6750", suggestion: s.status === "short" ? "\u8865\u62CD\u66F4\u957F\u7684\u955C\u5934\u6216\u7F29\u77ED\u8BE5\u955C" : "\u8865\u62CD\uFF0C\u6216\u7528 AI \u751F\u6210\u7A7A\u955C" }));
    const md = [
      "# \u7F3A\u53E3\u6E05\u5355",
      "",
      `\u751F\u6210\u4E8E ${now()} \xB7 \u5206\u955C v${data.storyboardVersion} \xB7 \u7F3A ${list.length} \u955C`,
      "",
      "| \u955C\u53F7 | \u65F6\u957F | \u753B\u9762\u63CF\u8FF0 | \u6240\u9700\u6807\u7B7E | \u95EE\u9898 | \u5EFA\u8BAE |",
      "|---|---|---|---|---|---|",
      ...list.map((g) => `| ${g.no} | ${g.duration}s | ${g.desc.replace(/\|/g, "/")} | ${g.required.join(" ")} | ${g.status} | ${g.suggestion} |`)
    ].join("\n") + "\n";
    await writeAtomic(path8.join(root, P.creative, "\u7F3A\u53E3\u6E05\u5355.md"), md);
    await writeJson(path8.join(root, P.editData, "gaps.json"), { at: now(), gaps: list });
    return { count: list.length, file: `${P.creative}/\u7F3A\u53E3\u6E05\u5355.md`, gaps: list };
  }
  async function buildTimeline(root, project) {
    const data = await readJson(matchFile(root), null);
    if (!data) throw new WorkbenchError("\u8BF7\u5148\u8FD0\u884C\u7D20\u6750\u5339\u914D\u3002", 409);
    const spec = await getSpec(root, project);
    const index = await indexStore.read(root);
    const video = [];
    const subtitles = [];
    const warnings = [];
    let cursor = 0;
    for (const shot of data.shots) {
      const clip = shot.selected && index.clips[shot.selected];
      if (!clip) {
        warnings.push(`\u955C ${shot.no} \u7F3A\u7D20\u6750\uFF0C\u5DF2\u8DF3\u8FC7`);
        continue;
      }
      const want = shot.duration > 0 ? shot.duration : clip.duration;
      const dur = Math.min(want, clip.duration);
      if (dur + 0.05 < want) warnings.push(`\u955C ${shot.no} \u7D20\u6750\u53EA\u6709 ${round(clip.duration, 2)}s\uFF0C\u77ED\u4E8E\u5206\u955C ${want}s`);
      const offset = Math.max(0, (clip.duration - dur) / 2);
      const raw = index.raws[clip.rawId];
      video.push({
        shot: shot.no,
        clipId: clip.id,
        start: round(cursor, 3),
        duration: round(dur, 3),
        source: { path: raw.path, in: round(clip.start + offset, 3), out: round(clip.start + offset + dur, 3), hasAudio: Boolean(raw.hasAudio), width: raw.width, height: raw.height },
        proxy: { path: clip.proxy, in: round(offset, 3), out: round(offset + dur, 3) },
        transitionIn: spec.transition === "dissolve" && video.length ? { type: "dissolve", duration: 0.5 } : { type: "cut" }
      });
      if (shot.line) subtitles.push({ start: round(cursor, 3), end: round(cursor + dur, 3), text: shot.line });
      cursor += dur;
    }
    if (!video.length) throw new WorkbenchError("\u6CA1\u6709\u4EFB\u4F55\u5DF2\u5339\u914D\u7684\u955C\u5934\uFF0C\u65E0\u6CD5\u751F\u6210\u65F6\u95F4\u7EBF\u3002", 409);
    const timeline = {
      schema: 1,
      at: now(),
      spec,
      source: { storyboardVersion: data.storyboardVersion, scriptVersion: data.scriptVersion, matchAt: data.at },
      duration: round(cursor, 3),
      expected: data.shotsDuration,
      tracks: { video, subtitles, voiceover: [], bgm: null },
      warnings
    };
    await writeJson(timelineFile(root), timeline);
    await writeAtomic(path8.join(root, P.editData, "subtitles.srt"), toSrt(subtitles));
    await appendLog(root, { action: "edit.timeline", segments: video.length, duration: timeline.duration });
    return timeline;
  }
  async function videoEncoder(codec) {
    const caps = await ffmpeg.detect();
    const list = caps.encoders?.list || [];
    if (codec === "h265") {
      if (list.includes("libx265")) return { args: ["-c:v", "libx265", "-preset", "medium", "-tag:v", "hvc1"], name: "libx265" };
      const hw2 = ["hevc_nvenc", "hevc_qsv", "hevc_amf", "hevc_videotoolbox", "hevc_mf"].find((n) => list.includes(n));
      if (hw2) return { args: ["-c:v", hw2, "-tag:v", "hvc1"], name: hw2 };
    }
    if (list.includes("libx264")) return { args: ["-c:v", "libx264", "-preset", "medium"], name: "libx264", fallback: codec === "h265" };
    const hw = ["h264_nvenc", "h264_qsv", "h264_amf", "h264_videotoolbox", "h264_mf"].find((n) => list.includes(n));
    if (hw) return { args: ["-c:v", hw], name: hw, fallback: codec === "h265" };
    return { args: ["-c:v", "mpeg4", "-q:v", "3"], name: "mpeg4", fallback: true };
  }
  async function render({ root, project, kind, signal, progress }) {
    const timeline = await readJson(timelineFile(root), null);
    if (!timeline) throw new WorkbenchError("\u8BF7\u5148\u751F\u6210\u65F6\u95F4\u7EBF\u3002", 409);
    const spec = await getSpec(root, project);
    const res = RESOLUTIONS[spec.resolution];
    const preview = kind === "preview";
    const W = preview ? res.width >= res.height ? 960 : Math.round(960 * res.width / res.height / 2) * 2 : res.width;
    const H = preview ? res.width >= res.height ? Math.round(960 * res.height / res.width / 2) * 2 : 960 : res.height;
    const enc = preview ? { args: ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "28"], name: "libx264" } : await videoEncoder(spec.codec);
    if (preview) {
      const caps = await ffmpeg.detect();
      if (!caps.encoders?.list?.includes("libx264")) Object.assign(enc, await videoEncoder("h264"));
    }
    const work = path8.join(root, ".dsh", "cache", "render", `${kind}-${Date.now()}`);
    await mkdir6(work, { recursive: true });
    const segments = timeline.tracks.video;
    const burn = spec.subtitles.includes("burn");
    const fontStyle = "FontName=Microsoft YaHei,FontSize=" + (preview ? 16 : 18) + ",Outline=1,Shadow=0,MarginV=24";
    const total = segments.reduce((sum, s) => sum + s.duration, 0);
    let done = 0;
    progress(0, Math.round(total), null);
    const files = [];
    try {
      for (let i = 0; i < segments.length; i++) {
        signal.throwIfAborted();
        const seg = segments[i];
        const src = preview ? seg.proxy : seg.source;
        const input = inside(root, src.path);
        const out = path8.join(work, `seg_${String(i).padStart(3, "0")}.mp4`);
        const sub = timeline.tracks.subtitles.find((s) => Math.abs(s.start - seg.start) < 0.01);
        let vf = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${spec.fps},format=yuv420p`;
        if (burn && sub) {
          await writeFile2(path8.join(work, `seg_${i}.srt`), toSrt([{ start: 0, end: seg.duration, text: sub.text }]));
          vf += `,subtitles=seg_${i}.srt:force_style='${fontStyle}'`;
        }
        const args = ["-ss", src.in.toFixed(3), "-i", input];
        const hasAudio = preview ? seg.source.hasAudio : src.hasAudio;
        if (!hasAudio) args.push("-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo");
        args.push("-t", seg.duration.toFixed(3), "-map", "0:v:0", "-map", hasAudio ? "0:a:0" : "1:a:0", "-vf", vf, ...enc.args);
        if (!preview && !enc.args.includes("-crf") && !enc.args.includes("-q:v")) args.push("-b:v", `${spec.bitrateMbps}M`, "-maxrate", `${Math.round(spec.bitrateMbps * 1.5)}M`, "-bufsize", `${spec.bitrateMbps * 2}M`);
        args.push("-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-shortest", out);
        progress(Math.round(done), Math.round(total), `\u955C ${seg.shot}`);
        await ffmpeg.ffmpeg(args, { signal, cwd: work });
        files.push(out);
        done += seg.duration;
      }
      const list = path8.join(work, "list.txt");
      await writeFile2(list, files.map((f) => `file '${path8.basename(f)}'`).join("\n") + "\n");
      await mkdir6(path8.join(root, P.export), { recursive: true });
      const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
      const safeName = project.name.replace(/[\\/:*?"<>|]+/g, "_");
      const output = path8.join(root, P.export, preview ? `${safeName}_\u7C97\u526A\u9884\u89C8_${stamp}.mp4` : `${safeName}_${spec.resolution}_${spec.fps}fps_${stamp}.mp4`);
      await ffmpeg.ffmpeg(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "-movflags", "+faststart", output], { signal, cwd: work });
      const probe = await ffmpeg.probe(output);
      const actual = Number(probe?.format?.duration || 0);
      const vstream = probe?.streams?.find((s) => s.codec_type === "video");
      let srt = null;
      if (spec.subtitles.includes("srt") && timeline.tracks.subtitles.length) {
        srt = output.replace(/\.mp4$/, ".srt");
        await writeAtomic(srt, toSrt(timeline.tracks.subtitles));
      }
      const meta = await creative.readMeta(root);
      const manifest = {
        output: relTo(root, output),
        kind,
        createdAt: now(),
        spec,
        encoder: enc.name,
        encoderFallback: Boolean(enc.fallback),
        actual: { duration: round(actual, 3), width: vstream?.width, height: vstream?.height, fps: vstream ? round(evalRate(vstream.r_frame_rate || vstream.avg_frame_rate), 3) : null, codec: vstream?.codec_name },
        expected: { timeline: timeline.duration, storyboard: timeline.expected },
        durationError: round(Math.abs(actual - timeline.duration), 3),
        versions: { script: meta.files["02_\u6587\u6848.md"]?.version ?? null, scriptEditUse: meta.editUse["02_\u6587\u6848.md"] ?? null, storyboard: timeline.source.storyboardVersion },
        subtitles: srt ? relTo(root, srt) : null,
        clips: segments.map((s) => ({ shot: s.shot, clipId: s.clipId, source: preview ? s.proxy.path : s.source.path, in: preview ? s.proxy.in : s.source.in, out: preview ? s.proxy.out : s.source.out })),
        notes: [
          ...enc.fallback ? ["\u5F53\u524D FFmpeg \u6CA1\u6709 H.265 \u7F16\u7801\u5668\uFF0C\u5DF2\u6539\u7528 H.264\u3002"] : [],
          ...spec.transition === "dissolve" ? ["FFmpeg \u51FA\u7247\u76EE\u524D\u6309\u786C\u5207\u5904\u7406\uFF1B\u53E0\u5316\u8F6C\u573A\u4FDD\u7559\u5728 timeline.json \u4E2D\u4F9B\u526A\u6620\u7CBE\u4FEE\u3002"] : [],
          ...timeline.warnings || []
        ]
      };
      const manifestFile = output.replace(/\.mp4$/, ".manifest.json");
      await writeJson(manifestFile, manifest);
      await writeJson(path8.join(root, P.export, "manifest.json"), manifest);
      progress(Math.round(total), Math.round(total), null);
      await appendLog(root, { action: `edit.render.${kind}`, output: manifest.output, duration: manifest.actual.duration });
      return manifest;
    } finally {
      await rm2(work, { recursive: true, force: true }).catch(() => {
      });
    }
  }
  async function capcutDraft(root, project) {
    const status = await jianyingStatus(project.jianyingDraftDir);
    const timeline = await exists(timelineFile(root));
    throw new WorkbenchError(
      `\u526A\u6620\u8349\u7A3F\u9002\u914D\u5668\u8FD8\u6CA1\u6709\u63A5\u5165\uFF1A\u526A\u6620\u8349\u7A3F\u683C\u5F0F\u662F\u793E\u533A\u9006\u5411\u7684\uFF0C\u9700\u8981\u5148\u5728\u4F60\u4F7F\u7528\u7684\u526A\u6620\u7248\u672C\u4E0A\u505A\u9A8C\u8BC1\uFF08\u65B9\u6848\u91CC\u7684 M0\uFF09\u3002${timeline ? "\u65F6\u95F4\u7EBF\uFF08\u521B\u610F\u526A\u8F91/\u526A\u8F91\u6570\u636E/timeline.json\uFF09\u5DF2\u5C31\u7EEA\uFF0C" : ""}\u73B0\u5728\u53EF\u4EE5\u7528\u300CFFmpeg \u7C97\u526A\u9884\u89C8\u300D\u6216\u300CFFmpeg \u76F4\u51FA\u300D\u51FA\u7247\u3002${status.ok ? `\u5DF2\u627E\u5230\u526A\u6620\u8349\u7A3F\u76EE\u5F55\uFF1A${status.dir}` : status.reason || ""}`,
      501,
      "CAPCUT_NOT_READY"
    );
  }
  return { getSpec, setSpec, storyboardInUse, match, select, gaps, buildTimeline, render, capcutDraft, readMatch: (root) => readJson(matchFile(root), null), readTimeline: (root) => readJson(timelineFile(root), null) };
}
function evalRate(rate) {
  const [a, b] = String(rate || "0/1").split("/").map(Number);
  return b ? a / b : a;
}

// src/server/lib/templates.js
import path9 from "node:path";
import { mkdir as mkdir7 } from "node:fs/promises";
function createTemplateStore(home) {
  const file = path9.join(home, "tag-templates.json");
  const lock = createLocks();
  const read = async () => {
    const data = await readJson(file, { schema: 1, templates: {} });
    if (!data.templates || typeof data.templates !== "object") data.templates = {};
    return data;
  };
  const write = async (data) => {
    await mkdir7(home, { recursive: true });
    await writeJson(file, data);
  };
  async function all() {
    const data = await read();
    const out = {};
    for (const [key, value] of Object.entries(BUILTIN_TEMPLATES)) {
      const override = data.templates[key];
      out[key] = { key, label: override?.label || value.label, dims: cleanDims(override?.dims || value.dims), builtin: true, edited: Boolean(override), updatedAt: override?.updatedAt || null };
    }
    for (const [key, value] of Object.entries(data.templates)) {
      if (BUILTIN_TEMPLATES[key] || !value || value.deleted) continue;
      out[key] = { key, label: value.label || key, dims: cleanDims(value.dims), builtin: false, edited: false, updatedAt: value.updatedAt || null, createdFrom: value.createdFrom || null };
    }
    return out;
  }
  return {
    all,
    async list() {
      return Object.values(await all());
    },
    async get(key) {
      const map = await all();
      return map[key] || null;
    },
    /** Replace a template's label and dimensions. */
    save(key, { label, dims }) {
      return lock("templates", async () => {
        const map = await all();
        if (!map[key]) throw new WorkbenchError("\u6A21\u677F\u4E0D\u5B58\u5728\u3002", 404, "NO_TEMPLATE");
        const data = await read();
        const nextLabel = typeof label === "string" && label.trim() ? label.trim().slice(0, 40) : map[key].label;
        assertUniqueLabel(map, nextLabel, key);
        data.templates[key] = { ...data.templates[key] || {}, label: nextLabel, dims: cleanDims(dims || map[key].dims), updatedAt: now() };
        await write(data);
        return (await all())[key];
      });
    },
    /** New custom template, e.g. saved from a project's current tags. */
    create({ label, dims, createdFrom }) {
      return lock("templates", async () => {
        const name2 = typeof label === "string" ? label.trim().slice(0, 40) : "";
        if (!name2) throw new WorkbenchError("\u8BF7\u7ED9\u6A21\u677F\u8D77\u4E2A\u540D\u5B57\u3002");
        const map = await all();
        assertUniqueLabel(map, name2);
        const data = await read();
        const key = shortId("tpl_");
        data.templates[key] = { label: name2, dims: cleanDims(dims), createdAt: now(), updatedAt: now(), ...createdFrom ? { createdFrom } : {} };
        await write(data);
        return (await all())[key];
      });
    },
    remove(key) {
      return lock("templates", async () => {
        if (BUILTIN_TEMPLATES[key]) throw new WorkbenchError("\u5185\u7F6E\u6A21\u677F\u4E0D\u80FD\u5220\u9664\uFF0C\u53EF\u4EE5\u300C\u6062\u590D\u9ED8\u8BA4\u300D\u3002");
        const data = await read();
        if (!data.templates[key]) throw new WorkbenchError("\u6A21\u677F\u4E0D\u5B58\u5728\u3002", 404, "NO_TEMPLATE");
        delete data.templates[key];
        await write(data);
        return { removed: key };
      });
    },
    /** Drop the user's edits to a built-in template. */
    reset(key) {
      return lock("templates", async () => {
        if (!BUILTIN_TEMPLATES[key]) throw new WorkbenchError("\u53EA\u6709\u5185\u7F6E\u6A21\u677F\u53EF\u4EE5\u6062\u590D\u9ED8\u8BA4\u3002");
        const data = await read();
        delete data.templates[key];
        await write(data);
        return (await all())[key];
      });
    }
  };
}
function assertUniqueLabel(map, label, self) {
  const clash = Object.values(map).find((t) => t.label === label && t.key !== self);
  if (clash) throw new WorkbenchError(`\u5DF2\u7ECF\u6709\u540D\u4E3A\u300C${label}\u300D\u7684\u6A21\u677F\u3002`);
}
function cleanDims(dims) {
  const out = {};
  const seen = /* @__PURE__ */ new Set();
  const source = dims && typeof dims === "object" ? dims : {};
  const order = [...DIMENSIONS, ...Object.keys(source).filter((k) => !DIMENSIONS.includes(k))];
  for (const dim of order) {
    const name2 = String(dim).trim().slice(0, 20);
    if (!name2 || name2 === "\u7EE7\u627F" || name2 === "\u5F85\u5BA1") continue;
    const list = Array.isArray(source[dim]) ? source[dim] : [];
    out[name2] = [];
    for (const raw of list) {
      const tag = String(raw ?? "").trim().slice(0, 30);
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);
      out[name2].push(tag);
    }
  }
  return out;
}

// src/server/lib/service.js
var BRIEF_TEMPLATE = (name2) => `# \u4E3B\u9898\u7B80\u62A5
\u9879\u76EE\uFF1A${name2}
\u5E73\u53F0\uFF1A
\u76EE\u6807\u65F6\u957F\uFF1A
\u53D7\u4F17\uFF1A
\u57FA\u8C03\uFF1A
\u62CD\u6444\u65E5\u671F\uFF1A
\u53C2\u8003\u8D44\u6599\uFF1A\uFF08\u653E\u5728 \u521B\u610F\u526A\u8F91/\u53C2\u8003\u8D44\u6599/ \u6587\u4EF6\u5939\uFF09
`;
var PREVIEWABLE = /\.(mp4|mov|m4v|webm|jpe?g|png|gif|webp|mp3|wav|m4a|aac|srt|json)$/i;
var readFileText = (file) => readFile2(file, "utf8");
function createService({ home, logger }) {
  const lock = createLocks();
  const registry = createRegistry(home);
  const settingsFile = path10.join(home, "settings.json");
  const revisions = /* @__PURE__ */ new Map();
  const watchers = /* @__PURE__ */ new Map();
  const contexts = /* @__PURE__ */ new Map();
  let disposed = false;
  const bump = (root) => revisions.set(root, (revisions.get(root) || 0) + 1);
  async function readSettings() {
    const saved = await readJson(settingsFile, {});
    return { ffmpegPath: "", ffprobePath: "", eaglePort: 41595, ...saved };
  }
  let resolvedPaths = null;
  async function ffmpegPaths() {
    const settings = await readSettings();
    if (settings.ffmpegPath) return { ffmpeg: settings.ffmpegPath, ffprobe: settings.ffprobePath || siblingProbe(settings.ffmpegPath) };
    if (resolvedPaths && Date.now() - resolvedPaths.at < 3e5) return resolvedPaths.value;
    const candidates = ["ffmpeg"];
    if (process.platform === "win32") {
      const local = process.env.LOCALAPPDATA || path10.join(os2.homedir(), "AppData", "Local");
      candidates.push(path10.join(local, "Microsoft", "WinGet", "Links", "ffmpeg.exe"), path10.join(os2.homedir(), "scoop", "shims", "ffmpeg.exe"), "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe", "C:\\ffmpeg\\bin\\ffmpeg.exe", "D:\\ffmpeg\\bin\\ffmpeg.exe");
    } else if (process.platform === "darwin") candidates.push("/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg");
    let value = { ffmpeg: "ffmpeg", ffprobe: "ffprobe" };
    for (const candidate of candidates) {
      if (candidate !== "ffmpeg" && !await exists(candidate)) continue;
      const ok = await new Promise((resolve) => {
        try {
          const child = spawn2(candidate, ["-version"], { windowsHide: true, stdio: "ignore" });
          child.on("error", () => resolve(false));
          child.on("close", (code) => resolve(code === 0));
        } catch {
          resolve(false);
        }
      });
      if (ok) {
        value = { ffmpeg: candidate, ffprobe: candidate === "ffmpeg" ? "ffprobe" : siblingProbe(candidate) };
        break;
      }
    }
    resolvedPaths = { at: Date.now(), value };
    return value;
  }
  const templates = createTemplateStore(home);
  const ffmpeg = createFFmpeg(ffmpegPaths);
  const eagle = createEagle(async () => `http://127.0.0.1:${(await readSettings()).eaglePort || 41595}`);
  const creative = createCreativeStore({ lock });
  const indexStore = createIndexStore({ lock });
  const jobs = createJobs({ onChange: bump });
  const media = createMedia({ ffmpeg, indexStore, creative, eagle, templates });
  const edit = createEdit({ creative, indexStore, ffmpeg });
  function startWatch(root) {
    if (watchers.has(root) || disposed) return;
    let timer = null;
    try {
      const watcher = watch(root, { recursive: true }, (_event, file) => {
        const name2 = String(file || "").replace(/\\/g, "/");
        if (/^\.dsh\/(cache|log|jobs\.json)/.test(name2) || name2.endsWith(".tmp")) return;
        clearTimeout(timer);
        timer = setTimeout(() => bump(root), 120);
      });
      watcher.on("error", () => {
        watchers.delete(root);
      });
      watchers.set(root, watcher);
    } catch (error) {
      logger?.warn?.("media-workbench: file watch unavailable for %s: %s", root, error?.message);
      watchers.set(root, null);
    }
  }
  async function open(projectId) {
    const entry = await registry.get(projectId);
    if (!await exists(path10.join(entry.path, ".dsh", "project.json"))) throw new WorkbenchError(`\u9879\u76EE\u8DEF\u5F84\u5931\u6548\uFF1A${entry.path}\u3002\u8BF7\u5728\u9879\u76EE\u5217\u8868\u91CC\u300C\u91CD\u65B0\u5B9A\u4F4D\u300D\u3002`, 410, "PATH_MISSING");
    await ensureLayout(entry.path);
    const project = await readProject(entry.path);
    startWatch(entry.path);
    return { root: entry.path, project, entry };
  }
  async function openByDirectory(cwd) {
    if (!cwd) throw new WorkbenchError("\u5F53\u524D\u4F1A\u8BDD\u6CA1\u6709\u5DE5\u4F5C\u76EE\u5F55\u3002\u8BF7\u5728\u5A92\u4F53\u5DE5\u4F5C\u53F0\u91CC\u4E3A\u9879\u76EE\u5F00\u59CB\u5BF9\u8BDD\u3002", 409, "NO_WORKSPACE");
    let dir = await realDirectory(cwd);
    for (let i = 0; i < 4; i++) {
      if (await exists(path10.join(dir, ".dsh", "project.json"))) break;
      const parent = path10.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    if (!await exists(path10.join(dir, ".dsh", "project.json"))) throw new WorkbenchError("\u5F53\u524D\u4F1A\u8BDD\u7684\u5DE5\u4F5C\u533A\u4E0D\u662F\u5A92\u4F53\u9879\u76EE\u3002\u8BF7\u5728\u5A92\u4F53\u5DE5\u4F5C\u53F0\u91CC\u65B0\u5EFA\u6216\u6253\u5F00\u9879\u76EE\uFF0C\u518D\u4ECE\u5DE5\u4F5C\u53F0\u5F00\u59CB\u5BF9\u8BDD\u3002", 409, "NOT_PROJECT");
    let entry = await registry.findByPath(dir);
    await ensureLayout(dir);
    const project = await readProject(dir);
    if (!entry) entry = await registry.upsert({ id: project.id, name: project.name, path: dir, createdAt: now(), openedAt: now() });
    startWatch(dir);
    return { root: dir, project, entry };
  }
  async function saveProject(root, values) {
    return lock(`project:${root}`, async () => {
      const project = await readProject(root);
      const next = { ...project, ...values };
      await writeProject(root, next);
      bump(root);
      return next;
    });
  }
  async function countMedia(root) {
    const index = await indexStore.read(root);
    return { raws: Object.keys(index.raws).length, clips: Object.keys(index.clips).length };
  }
  async function registerProject(root, project) {
    const counts = await countMedia(root);
    const existing = await registry.findByPath(root);
    return registry.upsert({ ...existing || {}, id: existing?.id || project.id, name: project.name, path: root, createdAt: existing?.createdAt || project.createdAt || now(), openedAt: now(), archived: false, counts });
  }
  async function seedProject(root, project) {
    const list = await creative.list(root);
    const has = (key) => list.find((item) => item.key === key)?.exists;
    if (!has("00_\u4E3B\u9898\u7B80\u62A5.md")) await creative.write(root, "00_\u4E3B\u9898\u7B80\u62A5.md", BRIEF_TEMPLATE(project.name), { source: "manual", note: "\u9879\u76EE\u521B\u5EFA\u65F6\u751F\u6210\u7684\u7A7A\u767D\u7B80\u62A5" });
    if (!has("\u6807\u7B7E\u5B57\u5178.yaml")) {
      const template = await templates.get(project.template);
      await creative.write(root, "\u6807\u7B7E\u5B57\u5178.yaml", defaultDictionaryText(project.template), { source: "system", note: `\u7EE7\u627F\u6807\u7B7E\u6A21\u677F\u300C${template?.label || project.template}\u300D` });
    }
  }
  async function tryEagleFolder(root, project) {
    try {
      const info = await eagle.info();
      if (!info.connected) return null;
      const folderId = await eagle.ensureFolder(project.eagle.folderName || project.name, project.eagle.folderId);
      if (folderId !== project.eagle.folderId) await saveProject(root, { eagle: { ...project.eagle, folderId } });
      return folderId;
    } catch (error) {
      logger?.info?.("media-workbench: eagle folder deferred: %s", error?.message);
      return null;
    }
  }
  async function status(root, project) {
    const [ff, eagleInfo, jy] = await Promise.all([ffmpeg.detect(), eagle.info(), jianyingStatus(project.jianyingDraftDir)]);
    return {
      folder: true,
      ffmpeg: { ok: ff.ffmpeg && ff.ffprobe, version: ff.version, h265: ff.encoders.h265, h264: ff.encoders.h264, path: ff.paths.ffmpeg },
      eagle: { connected: eagleInfo.connected, version: eagleInfo.version || null, folderId: project.eagle.folderId },
      jianying: jy
    };
  }
  async function exportsList(root) {
    const dir = path10.join(root, P.export);
    let names = [];
    try {
      names = await readdir5(dir);
    } catch {
      return [];
    }
    const out = [];
    for (const name2 of names) {
      if (!/\.mp4$/i.test(name2)) continue;
      const info = await stat4(path10.join(dir, name2));
      const manifest = await readJson(path10.join(dir, name2.replace(/\.mp4$/i, ".manifest.json")), null);
      out.push({ name: name2, path: `${P.export}/${name2}`, size: info.size, at: info.mtime.toISOString(), manifest: manifest ? { kind: manifest.kind, duration: manifest.actual?.duration, width: manifest.actual?.width, height: manifest.actual?.height, fps: manifest.actual?.fps, durationError: manifest.durationError, versions: manifest.versions, notes: manifest.notes } : null });
    }
    return out.sort((a, b) => b.at.localeCompare(a.at));
  }
  async function overview(projectId) {
    const { root, project, entry } = await open(projectId);
    const [docs, report, tags, spec, matchData, timeline, exportsInfo, jobList, st, board, meta] = await Promise.all([
      creative.list(root),
      media.computeReport(root, project),
      media.tagSummary(root),
      edit.getSpec(root, project),
      edit.readMatch(root),
      edit.readTimeline(root),
      exportsList(root),
      jobs.list(root),
      status(root, project),
      edit.storyboardInUse(root).catch(() => null),
      creative.readMeta(root)
    ]);
    const idea = await creative.read(root, "\u526A\u8F91\u601D\u8DEF.md").catch(() => null);
    const staleMatch = Boolean(matchData && board && !board.missing && matchData.storyboardVersion !== board.version);
    const counts = { raws: report.imported, clips: report.clips };
    if (JSON.stringify(entry.counts || {}) !== JSON.stringify(counts)) registry.patch(entry.id, { counts, updatedAt: now() }).catch(() => {
    });
    return {
      revision: revisions.get(root) || 0,
      project: { id: entry.id, name: project.name, path: root, spec: project.spec, template: project.template, cleanRules: project.cleanRules, eagle: project.eagle, jianyingDraftDir: project.jianyingDraftDir, rawSources: project.rawSources, sessionId: entry.sessionId || null, sessions: entry.sessions || {} },
      libraries: LIBRARIES,
      status: st,
      creative: { docs, editUse: meta.editUse },
      storyboard: board ? { version: board.version, currentVersion: board.currentVersion, editUse: board.editUse, total: board.total, count: board.shots?.length || 0, missing: Boolean(board.missing), hasTable: board.hasTable, warnings: (board.shots || []).filter((s) => s.warnings.length).map((s) => ({ no: s.no, warnings: s.warnings })) } : null,
      material: { report, tags },
      edit: {
        spec,
        options: { resolutions: RESOLUTIONS, fps: FPS_OPTIONS },
        idea: idea?.exists ? { content: idea.content, version: idea.version } : null,
        match: matchData,
        staleMatch,
        timeline: timeline ? { at: timeline.at, duration: timeline.duration, expected: timeline.expected, segments: timeline.tracks.video.length, warnings: timeline.warnings, source: timeline.source } : null,
        exports: exportsInfo
      },
      jobs: jobList,
      context: contexts.get(entry.id) || null,
      templates: (await templates.list()).map((t) => ({ key: t.key, label: t.label, builtin: t.builtin }))
    };
  }
  async function runStep(projectId, step, options = {}) {
    const { root, project } = await open(projectId);
    const common = { root, project };
    const steps = {
      import: (ctx) => media.importRaw({ ...common, ...ctx }),
      clean: (ctx) => media.clean({ ...common, ...ctx, force: Boolean(options.force) }),
      split: (ctx) => media.split({ ...common, ...ctx, rawIds: options.rawIds }),
      keyframes: (ctx) => media.keyframes({ ...common, ...ctx, clipIds: options.clipIds }),
      transcribe: (ctx) => media.transcribe({ ...common, ...ctx, clipIds: options.clipIds }),
      "eagle-push": (ctx) => media.eaglePush({ ...common, ...ctx, saveProject: (values) => saveProject(root, values) }),
      "eagle-pull": (ctx) => media.eaglePull({ ...common, ...ctx }),
      "render-preview": (ctx) => edit.render({ ...common, ...ctx, kind: "preview" }),
      "render-final": (ctx) => edit.render({ ...common, ...ctx, kind: "final" })
    };
    if (!steps[step]) throw new WorkbenchError(`\u672A\u77E5\u6B65\u9AA4\uFF1A${step}`);
    if (step.startsWith("render") || ["import", "clean", "split", "keyframes"].includes(step)) {
      const caps = await ffmpeg.detect();
      if (!caps.ffmpeg || !caps.ffprobe) throw new WorkbenchError("\u672A\u68C0\u6D4B\u5230 FFmpeg/ffprobe\u3002\u8BF7\u5B89\u88C5 FFmpeg \u5E76\u52A0\u5165 PATH\uFF08\u6216\u5728\u5DE5\u4F5C\u53F0\u8BBE\u7F6E\u91CC\u586B\u5199 ffmpeg.exe \u8DEF\u5F84\uFF09\uFF0C\u7136\u540E\u91CD\u8BD5\u3002", 424, "FFMPEG_MISSING");
    }
    return jobs.start(root, step, steps[step], { params: options.force || options.rawIds || options.clipIds ? { force: options.force, rawIds: options.rawIds, clipIds: options.clipIds } : null });
  }
  function planTagOps(dictionary, input, all) {
    const ops = Array.isArray(input?.ops) ? input.ops : [input];
    if (!ops.length) throw new WorkbenchError("\u6CA1\u6709\u8981\u6267\u884C\u7684\u6807\u7B7E\u64CD\u4F5C\u3002");
    if (ops.length > 200) throw new WorkbenchError("\u4E00\u6B21\u6700\u591A 200 \u4E2A\u6807\u7B7E\u64CD\u4F5C\u3002");
    let current = dictionary;
    const steps = [];
    for (const op of ops) {
      const applied = applyTagOperation(current, op, all);
      steps.push(applied);
      current = applied.dictionary;
    }
    const summary = steps.length === 1 ? steps[0].summary : `${steps.length} \u9879\u6807\u7B7E\u64CD\u4F5C\uFF08${steps.slice(0, 3).map((s) => s.summary).join("\uFF1B")}${steps.length > 3 ? "\u2026" : ""}\uFF09`;
    return { dictionary: current, steps, summary };
  }
  async function tagImpact(projectId, input) {
    const { root } = await open(projectId);
    const { dictionary, templates: all } = await media.readDictionary(root);
    const plan = planTagOps(dictionary, input, all);
    const index = await indexStore.read(root);
    const affected = Object.values(index.clips).filter((clip) => plan.steps.some((step) => step.affects(clip)));
    return { summary: plan.summary, clips: affected.length, eagle: affected.filter((clip) => clip.eagle?.id).length };
  }
  async function tagOperation(projectId, input, { source = "manual" } = {}) {
    const { root } = await open(projectId);
    const { dictionary, templates: all } = await media.readDictionary(root);
    const plan = planTagOps(dictionary, input, all);
    const changed = await indexStore.update(root, (index) => {
      let n = 0;
      for (const clip of Object.values(index.clips)) {
        let touched = false;
        for (const applied of plan.steps) {
          if (!applied.affects(clip)) continue;
          touched = true;
          if (applied.approve) {
            const moved = (clip.pendingTags || []).filter((p) => p.tag === applied.approve.tag);
            clip.pendingTags = (clip.pendingTags || []).filter((p) => p.tag !== applied.approve.tag);
            clip.tags = [.../* @__PURE__ */ new Set([...clip.tags || [], applied.approve.tag])];
            clip.aiTags = [...clip.aiTags || [], ...moved.map((p) => ({ tag: p.tag, dim: applied.approve.dim, confidence: p.confidence ?? 0.8 }))];
          } else if (applied.reject) {
            clip.pendingTags = (clip.pendingTags || []).filter((p) => p.tag !== applied.reject);
          } else if (applied.retag) {
            clip.aiTags = (clip.aiTags || []).map((t) => t.tag === applied.retag.tag ? { ...t, dim: applied.retag.dim } : t);
          } else {
            clip.tags = applied.mapTags(clip.tags || []);
            const seen = /* @__PURE__ */ new Set();
            clip.aiTags = (clip.aiTags || []).map((t) => ({ ...t, tag: applied.mapTags([t.tag])[0] })).filter((t) => t.tag && !seen.has(t.tag) && seen.add(t.tag));
          }
        }
        if (!touched) continue;
        if (clip.eagle?.id) clip.eagle.dirty = true;
        n++;
      }
      return n;
    });
    await creative.write(root, "\u6807\u7B7E\u5B57\u5178.yaml", serializeDictionary(plan.dictionary), { source: source === "manual" ? "tags-op" : "chat", note: plan.summary });
    await appendLog(root, { action: "tags.op", ops: Array.isArray(input?.ops) ? input.ops : [input], clips: changed, source });
    bump(root);
    return { summary: plan.summary, clips: changed };
  }
  async function suggestTags(projectId, items, { source = "chat" } = {}) {
    const { root } = await open(projectId);
    const { dictionary, templates: all } = await media.readDictionary(root);
    let current = dictionary;
    const added = [];
    const skipped = [];
    for (const item of Array.isArray(items) ? items : []) {
      const tag = typeof item === "string" ? item.trim() : String(item?.tag || "").trim();
      const dim = typeof item === "object" && item?.dim ? String(item.dim).trim() : "";
      if (!tag) continue;
      try {
        current = applyTagOperation(current, { op: "suggest", tag, dim }, all).dictionary;
        added.push(dim ? { tag, dim } : { tag });
      } catch (error) {
        skipped.push({ tag, reason: error.message });
      }
    }
    if (!added.length) return { added, skipped, pending: current.pending.length };
    await creative.write(root, "\u6807\u7B7E\u5B57\u5178.yaml", serializeDictionary(current), { source, note: `AI \u5EFA\u8BAE ${added.length} \u4E2A\u65B0\u6807\u7B7E\u8FDB\u5165\u5F85\u5BA1` });
    await appendLog(root, { action: "tags.suggest", tags: added.map((t) => t.tag), source });
    bump(root);
    return { added, skipped, pending: current.pending.length };
  }
  async function usedTags(root) {
    const index = await indexStore.read(root);
    const used = /* @__PURE__ */ new Set();
    for (const clip of Object.values(index.clips)) for (const tag of clip.tags || []) used.add(tag);
    return used;
  }
  async function switchProjectTemplate(projectId, key, { apply: apply2 = false } = {}) {
    const { root } = await open(projectId);
    const all = await templates.all();
    if (!all[key]) throw new WorkbenchError("\u6A21\u677F\u4E0D\u5B58\u5728\u3002", 404, "NO_TEMPLATE");
    const { dictionary } = await media.readDictionary(root);
    if (dictionary.inherit === key) throw new WorkbenchError(`\u5F53\u524D\u5DF2\u7ECF\u5728\u4F7F\u7528\u300C${all[key].label}\u300D\u3002`);
    const result = switchTemplate(dictionary, key, all, await usedTags(root));
    const summary = { from: all[dictionary.inherit]?.label || dictionary.inherit, to: all[key].label, added: result.added, dropped: result.dropped, kept: result.kept };
    if (!apply2) return summary;
    await creative.write(root, "\u6807\u7B7E\u5B57\u5178.yaml", serializeDictionary(result.dictionary), { source: "tags-op", note: `\u6807\u7B7E\u6A21\u677F\u4ECE\u300C${summary.from}\u300D\u6362\u6210\u300C${summary.to}\u300D` });
    await saveProject(root, { template: key });
    await appendLog(root, { action: "tags.template", from: dictionary.inherit, to: key, kept: result.kept });
    bump(root);
    return { ...summary, applied: true };
  }
  async function saveTemplate(key, values) {
    const before = await templates.all();
    if (!before[key]) throw new WorkbenchError("\u6A21\u677F\u4E0D\u5B58\u5728\u3002", 404, "NO_TEMPLATE");
    const saved = await templates.save(key, values);
    const after = await templates.all();
    const preserved = await preserveUsedTags(key, before, after);
    return { template: saved, preserved };
  }
  async function preserveUsedTags(key, before, after) {
    const out = [];
    for (const entry of await registry.list()) {
      if (entry.missing) continue;
      try {
        await ensureLayout(entry.path);
        const { dictionary } = await media.readDictionary(entry.path);
        if (dictionary.inherit !== key) continue;
        const used = await usedTags(entry.path);
        const known = tagIndex(effectiveDictionary(dictionary, after));
        const lost = [];
        for (const [dim, tags] of Object.entries(effectiveDictionary(dictionary, before).dims)) {
          for (const tag of tags) if (used.has(tag) && !known.has(tag)) lost.push([dim, tag]);
        }
        if (!lost.length) {
          bump(entry.path);
          continue;
        }
        const next = { ...dictionary, dims: Object.fromEntries(Object.entries(dictionary.dims).map(([k, v]) => [k, [...v]])) };
        for (const [dim, tag] of lost) (next.dims[dim] ||= []).push(tag);
        await creative.write(entry.path, "\u6807\u7B7E\u5B57\u5178.yaml", serializeDictionary(next), { source: "system", note: `\u6A21\u677F\u300C${after[key].label}\u300D\u6539\u52A8\u540E\uFF0C\u4FDD\u7559\u5207\u7247\u5728\u7528\u7684 ${lost.length} \u4E2A\u6807\u7B7E` });
        bump(entry.path);
        out.push({ project: entry.name, tags: lost.map(([, tag]) => tag) });
      } catch (error) {
        logger?.info?.("media-workbench: template sync skipped %s: %s", entry.path, error?.message);
      }
    }
    return out;
  }
  async function projectsUsingTemplate(key) {
    const names = [];
    for (const entry of await registry.list()) {
      if (entry.missing) continue;
      const project = await readJson(path10.join(entry.path, ".dsh", "project.json"), null);
      if (project?.template === key) names.push(entry.name);
    }
    return names;
  }
  return {
    registry,
    creative,
    media,
    edit,
    jobs,
    ffmpeg,
    eagle,
    indexStore,
    open,
    openByDirectory,
    overview,
    runStep,
    tagImpact,
    tagOperation,
    suggestTags,
    saveProject,
    status,
    templates,
    async listTemplates(projectId) {
      const list = await templates.list();
      let current = null;
      if (projectId) {
        try {
          current = (await media.readDictionary((await open(projectId)).root)).dictionary.inherit;
        } catch {
          current = null;
        }
      }
      return { templates: list, current };
    },
    switchProjectTemplate,
    saveTemplate,
    async createTemplate({ label, dims, fromProject, use }) {
      let source = dims;
      let createdFrom = null;
      let root = null;
      if (fromProject) {
        const opened = await open(fromProject);
        root = opened.root;
        const { effective } = await media.readDictionary(root);
        source = effective.dims;
        createdFrom = opened.project.name;
      }
      const template = await templates.create({ label, dims: cleanDims(source), createdFrom });
      let switched = null;
      if (fromProject && use) {
        const { dictionary } = await media.readDictionary(root);
        const next = { ...dictionary, inherit: template.key, dims: Object.fromEntries(Object.keys(dictionary.dims).map((dim) => [dim, []])) };
        await creative.write(root, "\u6807\u7B7E\u5B57\u5178.yaml", serializeDictionary(next), { source: "tags-op", note: `\u53E6\u5B58\u4E3A\u6A21\u677F\u300C${template.label}\u300D\u5E76\u6539\u7528\u5B83` });
        await saveProject(root, { template: template.key });
        bump(root);
        switched = template.key;
      }
      return { template, switched };
    },
    async removeTemplate(key) {
      const target = await templates.get(key);
      if (!target) throw new WorkbenchError("\u6A21\u677F\u4E0D\u5B58\u5728\u3002", 404, "NO_TEMPLATE");
      if (target.builtin) throw new WorkbenchError("\u5185\u7F6E\u6A21\u677F\u4E0D\u80FD\u5220\u9664\uFF0C\u53EF\u4EE5\u300C\u6062\u590D\u9ED8\u8BA4\u300D\u3002");
      const users = await projectsUsingTemplate(key);
      if (users.length) throw new WorkbenchError(`\u8FD8\u6709\u9879\u76EE\u5728\u7528\u8FD9\u4E2A\u6A21\u677F\uFF1A${users.slice(0, 5).join("\u3001")}${users.length > 5 ? " \u7B49" : ""}\u3002\u5148\u628A\u5B83\u4EEC\u6362\u6210\u522B\u7684\u6A21\u677F\u518D\u5220\u9664\u3002`, 409, "TEMPLATE_IN_USE");
      return templates.remove(key);
    },
    async resetTemplate(key) {
      const before = await templates.all();
      const template = await templates.reset(key);
      const preserved = await preserveUsedTags(key, before, await templates.all());
      return { template, preserved };
    },
    revision: (root) => revisions.get(root) || 0,
    bump,
    readSettings,
    async writeSettings(values) {
      const current = await readSettings();
      const next = { ...current };
      for (const key of ["ffmpegPath", "ffprobePath"]) if (typeof values?.[key] === "string") next[key] = values[key].trim();
      if (Number.isInteger(values?.eaglePort) && values.eaglePort > 0 && values.eaglePort < 65536) next.eaglePort = values.eaglePort;
      await mkdir8(home, { recursive: true });
      await writeJson(settingsFile, next);
      resolvedPaths = null;
      await ffmpeg.detect(true);
      return next;
    },
    setContext(projectId, context) {
      contexts.set(projectId, { ...context, at: now() });
    },
    getContext(projectId) {
      return contexts.get(projectId) || null;
    },
    async listProjects() {
      return registry.list();
    },
    async createProject({ path: dir, name: name2, spec, template }) {
      const known = await templates.get(template);
      const { root, project, created } = await initProject(dir, { name: name2, spec: sanitizeSpec(spec), template: known ? template : "vlog-base" });
      await seedProject(root, project);
      const entry = await registerProject(root, project);
      await tryEagleFolder(root, project);
      await appendLog(root, { action: created ? "project.create" : "project.open", name: project.name });
      startWatch(root);
      return { project: entry, created };
    },
    async relocate(projectId, dir) {
      const root = await realDirectory(dir);
      const project = await readProject(root);
      const entry = await registry.get(projectId);
      if (project.id !== entry.id && project.name !== entry.name) throw new WorkbenchError("\u8FD9\u4E2A\u6587\u4EF6\u5939\u91CC\u7684\u9879\u76EE\u548C\u539F\u9879\u76EE\u4E0D\u4E00\u81F4\u3002", 409);
      return registry.patch(projectId, { path: root, openedAt: now() });
    },
    async patchProject(projectId, values) {
      const { root, project, entry: entry0 } = await open(projectId);
      const update = {};
      if (typeof values.name === "string" && values.name.trim()) update.name = values.name.trim();
      if (values.spec) update.spec = { ...project.spec, ...sanitizeSpec(values.spec) };
      if (values.cleanRules) update.cleanRules = { ...project.cleanRules, ...sanitizeRules(values.cleanRules), version: `${project.cleanRules.version.replace(/ \(调整\)$/, "")} (\u8C03\u6574)` };
      if (typeof values.jianyingDraftDir === "string") update.jianyingDraftDir = values.jianyingDraftDir.trim();
      if (Object.keys(update).length) await saveProject(root, update);
      const entryValues = { openedAt: now() };
      if (update.name) entryValues.name = update.name;
      if (typeof values.archived === "boolean") entryValues.archived = values.archived;
      if (typeof values.sessionId === "string" || values.sessionId === null) {
        const library = typeof values.library === "string" && LIBRARIES.some((l) => l.dir === values.library) ? values.library : "";
        if (library) entryValues.sessions = { ...entry0.sessions || {}, [library]: values.sessionId };
        else entryValues.sessionId = values.sessionId;
      }
      return registry.patch(projectId, entryValues);
    },
    async removeProject(projectId) {
      await registry.remove(projectId);
      return { removed: true };
    },
    async fileFor(projectId, rel) {
      const { root } = await open(projectId);
      const norm = String(rel || "").replace(/\\/g, "/");
      const hidden = norm.startsWith(".dsh/") && !/^\.dsh\/cache\/(thumbs|keyframes)\/[^/]+\.jpg$/i.test(norm);
      if (hidden || !PREVIEWABLE.test(norm)) throw new WorkbenchError("\u4E0D\u5141\u8BB8\u8BFB\u53D6\u8BE5\u6587\u4EF6\u3002", 403);
      return inside(root, norm);
    },
    async reveal(projectId, rel) {
      const { root } = await open(projectId);
      const target = inside(root, rel || ".");
      if (!await exists(target)) throw new WorkbenchError("\u6587\u4EF6\u4E0D\u5B58\u5728\u3002", 404);
      const [cmd, args] = process.platform === "win32" ? ["explorer.exe", [`/select,${target}`]] : process.platform === "darwin" ? ["open", ["-R", target]] : ["xdg-open", [path10.dirname(target)]];
      spawn2(cmd, args, { detached: true, stdio: "ignore", windowsHide: false }).on("error", () => {
      }).unref();
      return { ok: true };
    },
    libraries: LIBRARIES,
    /** One level of the real project folder for the panel's file tree. */
    async listDir(projectId, rel = "") {
      const { root } = await open(projectId);
      const norm = String(rel || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
      if (norm === ".dsh" || norm.startsWith(".dsh/")) throw new WorkbenchError("\u4E0D\u5141\u8BB8\u6D4F\u89C8\u8BE5\u76EE\u5F55\u3002", 403);
      const dir = inside(root, norm || ".");
      let entries;
      try {
        entries = await readdir5(dir, { withFileTypes: true });
      } catch {
        throw new WorkbenchError("\u6587\u4EF6\u5939\u4E0D\u5B58\u5728\u6216\u65E0\u6CD5\u8BFB\u53D6\u3002", 404);
      }
      const docsByPath = new Map(Object.entries(DOCS).map(([key, rel2]) => [rel2, key]));
      const libOrder = new Map(LIBRARIES.map((l, i) => [l.dir, i]));
      const items = [];
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name.endsWith(".tmp")) continue;
        const relPath = norm ? `${norm}/${entry.name}` : entry.name;
        const isDir = entry.isDirectory();
        let size = null;
        let mtime = null;
        try {
          const info = await stat4(path10.join(dir, entry.name));
          size = isDir ? null : info.size;
          mtime = info.mtime.toISOString();
        } catch {
          continue;
        }
        items.push({ name: entry.name, path: relPath, type: isDir ? "dir" : "file", size, mtime, doc: docsByPath.get(relPath) || null, library: !norm && libOrder.has(entry.name) ? entry.name : null });
      }
      items.sort((a, b) => a.library !== null === (b.library !== null) ? a.library !== null ? libOrder.get(a.library) - libOrder.get(b.library) : a.type === b.type ? a.name.localeCompare(b.name, "zh") : a.type === "dir" ? -1 : 1 : a.library !== null ? -1 : 1);
      return { path: norm, items: items.slice(0, 2e3), truncated: items.length > 2e3 };
    },
    /** Read-only preview of a small text file anywhere in the project (not .dsh). */
    async readTextFile(projectId, rel) {
      const { root } = await open(projectId);
      const norm = String(rel || "").replace(/\\/g, "/");
      if (norm.startsWith(".dsh/") || !/\.(md|txt|ya?ml|json|jsonl|srt|csv|log|xml|html?)$/i.test(norm)) throw new WorkbenchError("\u53EA\u80FD\u9884\u89C8\u6587\u672C\u6587\u4EF6\u3002", 415);
      const file = inside(root, norm);
      const info = await stat4(file).catch(() => null);
      if (!info?.isFile()) throw new WorkbenchError("\u6587\u4EF6\u4E0D\u5B58\u5728\u3002", 404);
      if (info.size > 1024 * 1024) return { path: norm, size: info.size, truncated: true, content: (await readFileText(file)).slice(0, 2e5) };
      return { path: norm, size: info.size, truncated: false, content: await readFileText(file) };
    },
    docs: Object.keys(DOCS),
    parseDictionary,
    dispose() {
      disposed = true;
      jobs.cancelAll();
      for (const watcher of watchers.values()) watcher?.close();
      watchers.clear();
    }
  };
}
function siblingProbe(ffmpegPath) {
  const dir = path10.dirname(ffmpegPath);
  const ext = path10.extname(ffmpegPath);
  return dir === "." ? "ffprobe" : path10.join(dir, `ffprobe${ext}`);
}

// src/server/lib/routes.js
import { createReadStream } from "node:fs";
import { stat as stat5 } from "node:fs/promises";
import path11 from "node:path";
import { Readable } from "node:stream";
var API = "/api/dsh-media-workbench";
var NO_STORE = { "cache-control": "no-store" };
var MIME = { ".jpg": "image/jpeg", ".mp4": "video/mp4", ".mov": "video/quicktime", ".m4v": "video/mp4", ".srt": "text/plain; charset=utf-8", ".json": "application/json; charset=utf-8" };
async function body(request, limit = 4 * 1024 * 1024) {
  const text = await request.text();
  if (text.length > limit) throw new WorkbenchError("\u8BF7\u6C42\u8FC7\u5927\u3002", 413);
  if (!text) return {};
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("not an object");
    return value;
  } catch {
    throw new WorkbenchError("\u8BF7\u6C42\u4F53\u4E0D\u662F\u6709\u6548\u7684 JSON\u3002");
  }
}
function failure(error, logger) {
  const known = error instanceof WorkbenchError;
  if (!known) logger?.warn?.("media-workbench: request failed: %s", error?.stack || error);
  return Response.json({ error: known ? error.message : `\u5904\u7406\u5931\u8D25\uFF1A${error?.message || error}`, code: known ? error.code : "INTERNAL" }, { status: known ? error.status : 500, headers: NO_STORE });
}
function registerRoutes(ctx, service) {
  const logger = ctx.logger;
  const table = /* @__PURE__ */ new Map();
  const route = (method, sub, handler) => {
    const path13 = `${API}${sub}`;
    if (!table.has(path13)) table.set(path13, {});
    const methods = table.get(path13);
    if (methods[method]) throw new Error(`duplicate route ${method} ${path13}`);
    methods[method] = handler;
  };
  const flush = () => {
    for (const [path13, handlers] of table) {
      ctx.connection.fetch.register({
        path: path13,
        methods: Object.keys(handlers),
        requestBody: "buffered",
        async fetch(request) {
          try {
            const handler = handlers[request.method];
            if (!handler) return Response.json({ error: "Method not allowed" }, { status: 405, headers: NO_STORE });
            const url = new URL(request.url);
            const input = request.method === "GET" ? Object.fromEntries(url.searchParams) : await body(request);
            const result = await handler(input, request);
            if (result instanceof Response) return result;
            return Response.json(result ?? { ok: true }, { headers: NO_STORE });
          } catch (error) {
            return failure(error, logger);
          }
        }
      });
    }
  };
  const need = (value, label) => {
    if (typeof value !== "string" || !value) throw new WorkbenchError(`\u7F3A\u5C11\u53C2\u6570\uFF1A${label}`);
    return value;
  };
  const job = async (promise) => {
    const { job: job2, joined } = await promise;
    return { job: job2, joined };
  };
  const logged = async (projectId, action, fn) => {
    const result = await fn();
    try {
      const { root } = await service.open(projectId);
      await appendLog(root, { action, by: "panel" });
      service.bump(root);
    } catch {
    }
    return result;
  };
  route("GET", "/projects", async () => ({ projects: await service.listProjects() }));
  route("POST", "/projects/create", (input) => service.createProject({ path: need(input.path, "path"), name: input.name, spec: input.spec, template: input.template }));
  route("POST", "/projects/patch", (input) => service.patchProject(need(input.project, "project"), input));
  route("POST", "/projects/relocate", (input) => service.relocate(need(input.project, "project"), need(input.path, "path")));
  route("POST", "/projects/remove", (input) => service.removeProject(need(input.project, "project")));
  route("GET", "/revision", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    const jobs = await service.jobs.list(root);
    return { revision: service.revision(root), running: jobs.running };
  });
  route("GET", "/overview", (input) => service.overview(need(input.project, "project")));
  route("GET", "/tree", (input) => service.listDir(need(input.project, "project"), input.path || ""));
  route("GET", "/text", (input) => service.readTextFile(need(input.project, "project"), need(input.path, "path")));
  route("POST", "/context", async (input) => {
    service.setContext(need(input.project, "project"), { tab: input.tab, sessionId: input.sessionId || null });
    return { ok: true };
  });
  route("GET", "/doc", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    return service.creative.read(root, need(input.file, "file"), input.ref);
  });
  route("POST", "/doc/save", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    const result = await service.creative.write(root, need(input.file, "file"), input.content, { source: "manual", expectedHash: input.expectedHash });
    service.bump(root);
    return result;
  });
  route("GET", "/doc/diff", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    return service.creative.diff(root, need(input.file, "file"), need(input.from, "from"), input.to);
  });
  route("POST", "/doc/rollback", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    const r = await service.creative.rollback(root, need(input.file, "file"), need(input.ref, "ref"));
    service.bump(root);
    return r;
  });
  route("POST", "/doc/edit-use", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    const r = await service.creative.setEditUse(root, need(input.file, "file"));
    service.bump(root);
    return r;
  });
  route("GET", "/tags/impact", (input) => service.tagImpact(need(input.project, "project"), input));
  route("POST", "/tags/op", (input) => service.tagOperation(need(input.project, "project"), input, { source: "manual" }));
  route("GET", "/tags/history", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    const docs = await service.creative.list(root);
    return docs.find((d) => d.key === "\u6807\u7B7E\u5B57\u5178.yaml") || null;
  });
  route("GET", "/templates", (input) => service.listTemplates(input.project || null));
  route("POST", "/templates/switch", (input) => service.switchProjectTemplate(need(input.project, "project"), need(input.key, "key"), { apply: input.apply === true }));
  route("POST", "/templates/save", (input) => service.saveTemplate(need(input.key, "key"), { label: input.label, dims: input.dims }));
  route("POST", "/templates/create", (input) => service.createTemplate({ label: input.label, dims: input.dims, fromProject: input.fromProject || null, use: input.use === true }));
  route("POST", "/templates/remove", (input) => service.removeTemplate(need(input.key, "key")));
  route("POST", "/templates/reset", (input) => service.resetTemplate(need(input.key, "key")));
  route("GET", "/clips", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    return service.media.listClips(root, { tag: input.tag, filter: input.filter, rawId: input.raw, limit: Math.min(Number(input.limit) || 300, 2e3), offset: Number(input.offset) || 0 });
  });
  route("POST", "/clips/review", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    const r = await service.media.review(root, need(input.clipId, "clipId"), Array.isArray(input.tags) ? input.tags.map(String) : [], { reviewed: input.reviewed !== false });
    service.bump(root);
    return r;
  });
  route("POST", "/media/run", (input) => job(service.runStep(need(input.project, "project"), need(input.step, "step"), { force: input.force === true, rawIds: Array.isArray(input.rawIds) ? input.rawIds : void 0, clipIds: Array.isArray(input.clipIds) ? input.clipIds : void 0 })));
  route("POST", "/media/restore", async (input) => {
    const { root, project } = await service.open(need(input.project, "project"));
    const r = await service.media.restore(root, project, Array.isArray(input.rawIds) ? input.rawIds : [need(input.rawId, "rawId")]);
    service.bump(root);
    return r;
  });
  route("GET", "/jobs", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    return service.jobs.list(root);
  });
  route("POST", "/jobs/cancel", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    return { cancelled: service.jobs.cancel(root, input.jobId) };
  });
  route("POST", "/edit/spec", async (input) => {
    const { root, project } = await service.open(need(input.project, "project"));
    const r = await service.edit.setSpec(root, project, input.spec || {});
    service.bump(root);
    return r;
  });
  route("POST", "/edit/match", (input) => logged(input.project, "edit.match", async () => {
    const { root } = await service.open(need(input.project, "project"));
    return service.edit.match(root, { keepManual: input.keepManual !== false });
  }));
  route("POST", "/edit/select", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    const r = await service.edit.select(root, need(input.no, "no"), input.clipId || null);
    service.bump(root);
    return r;
  });
  route("POST", "/edit/gaps", async (input) => {
    const { root } = await service.open(need(input.project, "project"));
    const r = await service.edit.gaps(root);
    service.bump(root);
    return r;
  });
  route("POST", "/edit/timeline", async (input) => {
    const { root, project } = await service.open(need(input.project, "project"));
    const r = await service.edit.buildTimeline(root, project);
    service.bump(root);
    return { duration: r.duration, segments: r.tracks.video.length, warnings: r.warnings };
  });
  route("POST", "/edit/capcut", async (input) => {
    const { root, project } = await service.open(need(input.project, "project"));
    return service.edit.capcutDraft(root, project);
  });
  route("POST", "/reveal", (input) => service.reveal(need(input.project, "project"), input.path));
  route("GET", "/settings", async () => ({ settings: await service.readSettings(), ffmpeg: await service.ffmpeg.detect(), eagle: await service.eagle.info() }));
  route("POST", "/settings", async (input) => ({ settings: await service.writeSettings(input), ffmpeg: await service.ffmpeg.detect(), eagle: await service.eagle.info() }));
  flush();
  ctx.connection.fetch.register({
    path: `${API}/file`,
    methods: ["GET"],
    requestBody: "buffered",
    async fetch(request) {
      try {
        const url = new URL(request.url);
        const file = await service.fileFor(url.searchParams.get("project") || "", url.searchParams.get("path") || "");
        const info = await stat5(file);
        const type = MIME[path11.extname(file).toLowerCase()] || "application/octet-stream";
        const range = request.headers.get("range");
        const headers = { "content-type": type, "accept-ranges": "bytes", "cache-control": "no-cache" };
        if (range) {
          const match = range.match(/bytes=(\d*)-(\d*)/);
          let start = match?.[1] ? Number(match[1]) : 0;
          let end = match?.[2] ? Number(match[2]) : Math.min(info.size - 1, start + 8 * 1024 * 1024 - 1);
          if (!match?.[1] && match?.[2]) {
            start = Math.max(0, info.size - Number(match[2]));
            end = info.size - 1;
          }
          if (start >= info.size) return new Response(null, { status: 416, headers: { "content-range": `bytes */${info.size}` } });
          end = Math.min(end, info.size - 1);
          return new Response(Readable.toWeb(createReadStream(file, { start, end })), { status: 206, headers: { ...headers, "content-range": `bytes ${start}-${end}/${info.size}`, "content-length": String(end - start + 1) } });
        }
        return new Response(Readable.toWeb(createReadStream(file)), { headers: { ...headers, "content-length": String(info.size) } });
      } catch (error) {
        return failure(error, logger);
      }
    }
  });
}

// src/server/lib/tools.js
import path12 from "node:path";
var DOC_KEYS = Object.keys(DOCS);
var WRITE_KEYS = DOC_KEYS.filter((key) => key !== "\u6807\u7B7E\u5B57\u5178.yaml");
var JSON_OUTPUT = { schema: { type: "json" }, render: (_args, value) => [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 1) }] };
var cwdOf = (exec) => exec?.agent?.session?.header?.cwd;
var modelOf = (exec) => {
  const header = exec?.agent?.session?.header;
  return header?.model?.name || header?.model || null;
};
function createTools(service) {
  const project = (exec) => service.openByDirectory(cwdOf(exec));
  async function waitJob(started, wait) {
    if (!wait) return { job: started.job, note: "\u4EFB\u52A1\u5DF2\u5728\u540E\u53F0\u8FD0\u884C\uFF0C\u53EF\u7528 media_job_status \u67E5\u770B\u8FDB\u5EA6\u3002" };
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 1e5));
    try {
      const finished = await Promise.race([started.done, timeout]);
      if (!finished) return { job: started.job, status: "running", note: "\u4EFB\u52A1\u4ECD\u5728\u540E\u53F0\u8FD0\u884C\uFF08\u8D85\u8FC7 100 \u79D2\uFF09\uFF0C\u7A0D\u540E\u7528 media_job_status \u67E5\u770B\u3002\u9762\u677F\u4E0A\u6709\u8FDB\u5EA6\u6761\u3002" };
      return { job: finished };
    } catch (error) {
      return { job: started.job, status: "failed", error: error?.message || String(error) };
    }
  }
  const tools = [
    {
      name: "media_context",
      description: 'Media workbench: read the current project state for this session (tag template and dictionary, target duration and output spec, which panel tab the user is looking at, creative file versions, footage cleaning/tagging counts, storyboard match status, running jobs, external tool status). Call this first in a media-workbench conversation, and whenever the request is ambiguous ("this", "here", "current tab").',
      parameters: {},
      async execute(_args, exec) {
        const { entry, root } = await project(exec);
        const o = await service.overview(entry.id);
        const rel = path12.relative(root, cwdOf(exec) || root).split(path12.sep).join("/");
        return {
          project: { name: o.project.name, folder: o.project.path },
          targetDuration: o.edit.spec.targetDuration ?? null,
          targetDurationNote: o.edit.spec.targetDuration ? void 0 : "\u76EE\u6807\u65F6\u957F\u672A\u8BBE\u7F6E\uFF1A\u5199\u6587\u6848/\u5206\u955C\u524D\u5148\u770B 00_\u4E3B\u9898\u7B80\u62A5.md \u91CC\u7684\u300C\u76EE\u6807\u65F6\u957F\u300D\uFF0C\u6CA1\u6709\u5C31\u95EE\u7528\u6237\uFF0C\u5E76\u53EF\u7528 media_edit_spec_set \u8BB0\u4E0B\u6765\u3002",
          tagTemplate: { key: o.material.tags.inherit, label: o.material.tags.inheritLabel },
          workingLibrary: rel && !rel.startsWith("..") ? rel.split("/")[0] : null,
          libraries: o.libraries.map((l) => `${l.dir}/ \u2014 ${l.hint}`),
          uiTab: o.context?.tab || null,
          creative: o.creative.docs.map((d) => ({ file: d.key, exists: d.exists, version: d.version, editUse: d.editUse, source: d.source, manualEdits: d.manualEdits })),
          storyboard: o.storyboard,
          footage: { imported: o.material.report.imported, kept: o.material.report.kept, rejected: o.material.report.rejected, pending: o.material.report.pending, clips: o.material.report.clips, tagging: o.material.report.tagging, eagleSynced: o.material.report.eagleSynced, unsupported: o.material.report.unsupported.length },
          dictionary: { dims: Object.fromEntries(o.material.tags.dims.map((d) => [d.dim, d.tags.map((t) => t.tag)])), pending: o.material.tags.pending.map((p) => p.suggestedDim ? `${p.tag}\uFF08${p.suggestedDim}\uFF09` : p.tag) },
          edit: { spec: o.edit.spec, matched: o.edit.match ? `${o.edit.match.matched}/${o.edit.match.total}` : null, staleMatch: o.edit.staleMatch, timeline: o.edit.timeline, exports: o.edit.exports.slice(0, 3).map((e) => e.path) },
          jobs: { running: o.jobs.running, queued: o.jobs.queue.length },
          tools: o.status
        };
      }
    },
    {
      name: "media_creative_read",
      description: `Media workbench: read a creative document. file is one of ${DOC_KEYS.join(", ")}. Optional version like "v1" reads an archived version from _history.`,
      parameters: { file: { type: "string", required: true, enum: DOC_KEYS }, version: { type: "string", description: "e.g. v1, v2_\u624B\u6539\u524D; omit for current" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        return service.creative.read(root, args.file, args.version);
      }
    },
    {
      name: "media_creative_write",
      description: `Media workbench: write a creative document with automatic versioning \u2014 the previous content moves to _history and the version number increases; the panel refreshes immediately. Always use this instead of generic file tools for ${WRITE_KEYS.join(", ")}. Write the COMPLETE file content. 03_\u5206\u955C\u811A\u672C.md must contain a markdown table with columns \u955C\u53F7|\u65F6\u957F|\u753B\u9762\u63CF\u8FF0|\u53F0\u8BCD/\u65C1\u767D|\u6240\u9700\u6807\u7B7E|\u666F\u522B|\u8FD0\u955C|\u5907\u6CE8; \u6240\u9700\u6807\u7B7E must use words from the tag dictionary (media_context \u2192 dictionary); for a needed word that is not in it, call media_tags_suggest. The tag dictionary itself is not written here: use media_tags_suggest (new ideas \u2192 \u5F85\u5BA1) or media_tags_update.`,
      parameters: { file: { type: "string", required: true, enum: WRITE_KEYS }, content: { type: "string", required: true }, note: { type: "string", description: "one-line change summary shown in the panel" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        if (args.file === "\u6807\u7B7E\u5B57\u5178.yaml" || String(args.file).includes("\u6807\u7B7E\u5B57\u5178")) throw new WorkbenchError("\u6807\u7B7E\u5B57\u5178\u4E0D\u80FD\u6574\u4EFD\u6539\u5199\uFF1A\u65B0\u6807\u7B7E\u8BF7\u7528 media_tags_suggest \u653E\u8FDB\u5F85\u5BA1\uFF0C\u7531\u7528\u6237\u5728\u300C\u6807\u7B7E\u300D\u9875\u8F6C\u6B63\uFF1B\u6539\u540D/\u5408\u5E76/\u5220\u9664\u7528 media_tags_update\u3002");
        const result = await service.creative.write(root, args.file, args.content, { source: "chat", model: modelOf(exec), note: args.note });
        service.bump(root);
        return result;
      }
    },
    {
      name: "media_creative_diff",
      description: 'Media workbench: line diff between two versions of a creative document (from, to like "v1", "v2"; to defaults to current).',
      parameters: { file: { type: "string", required: true, enum: DOC_KEYS }, from: { type: "string", required: true }, to: { type: "string" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        const diff = await service.creative.diff(root, args.file, args.from, args.to);
        return { ...diff, lines: diff.lines.filter((l) => l.type !== "same").slice(0, 400) };
      }
    },
    {
      name: "media_creative_rollback",
      description: "Media workbench: restore an archived version of a creative document as the new current version (nothing is deleted).",
      parameters: { file: { type: "string", required: true, enum: DOC_KEYS }, version: { type: "string", required: true } },
      async execute(args, exec) {
        const { root } = await project(exec);
        const result = await service.creative.rollback(root, args.file, args.version);
        service.bump(root);
        return result;
      }
    },
    {
      name: "media_creative_set_edit_version",
      description: "Media workbench: mark the CURRENT version of 02_\u6587\u6848.md or 03_\u5206\u955C\u811A\u672C.md as the version the edit module uses (\u526A\u8F91\u4F7F\u7528\u7248\u672C). The edit tab then asks to re-match when it changes.",
      parameters: { file: { type: "string", required: true, enum: ["02_\u6587\u6848.md", "03_\u5206\u955C\u811A\u672C.md"] } },
      async execute(args, exec) {
        const { root } = await project(exec);
        const result = await service.creative.setEditUse(root, args.file);
        service.bump(root);
        return result;
      }
    },
    {
      name: "media_tags_update",
      description: "Media workbench: change the tag dictionary when the USER asks for it, and propagate to every clip (and mark Eagle items for re-sync). op: add (tag + dim), rename (tag \u2192 to), merge (tag into to), delete (tag), move (tag to another dim), approve (move a \u5F85\u5BA1 tag into dim), reject (drop a \u5F85\u5BA1 tag), add-dim / delete-dim (dim). For your own ideas use media_tags_suggest instead. Requires user approval showing how many clips change.",
      parameters: { op: { type: "string", required: true, enum: ["add", "rename", "merge", "delete", "move", "approve", "reject", "add-dim", "delete-dim"] }, tag: { type: "string" }, to: { type: "string" }, dim: { type: "string", description: "\u573A\u666F/\u4E3B\u4F53/\u666F\u522B/\u8FD0\u955C/\u60C5\u7EEA/\u7528\u9014 or another dimension" } },
      async execute(args, exec) {
        const { entry } = await project(exec);
        return service.tagOperation(entry.id, args, { source: "chat" });
      }
    },
    {
      name: "media_tag_samples",
      description: "Media workbench: contact sheets (3 frames each) spread across the project footage \u2014 clips when the footage is already split, otherwise imported raw files \u2014 plus the current tag dictionary. Use it to look at the footage before suggesting tags; view each image with your image/file reading tool. Run media_import first if nothing has been imported.",
      parameters: { limit: { type: "integer", description: "number of samples (default 16, max 40)" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        const result = await service.media.samples({ root, limit: args.limit, signal: exec.signal });
        const { effective } = await service.media.readDictionary(root);
        if (result.kind === "none") return { samples: [], dictionary: effective.dims, note: "\u9879\u76EE\u91CC\u8FD8\u6CA1\u6709\u5BFC\u5165\u7D20\u6750\u3002\u5148\u7528 media_import \u5BFC\u5165\u539F\u59CB\u7D20\u6750\u5E93\u91CC\u7684\u89C6\u9891\uFF0C\u518D\u6765\u53D6\u6837\u3002" };
        return { kind: result.kind, samples: result.items, dictionary: effective.dims, pending: effective.pending, folder: root, note: "\u56FE\u7247\u8DEF\u5F84\u76F8\u5BF9\u4E8E\u9879\u76EE\u6839\u76EE\u5F55\u3002\u770B\u5B8C\u56FE\u540E\uFF0C\u628A\u5B57\u5178\u91CC\u8FD8\u6CA1\u6709\u3001\u4F46\u7D20\u6750\u91CC\u53CD\u590D\u51FA\u73B0\u4E14\u5BF9\u526A\u8F91\u68C0\u7D22\u6709\u7528\u7684\u8BCD\uFF0C\u7528 media_tags_suggest \u653E\u8FDB\u5F85\u5BA1\uFF0C\u5E76\u7ED9\u51FA\u5EFA\u8BAE\u7EF4\u5EA6\u3002" };
      }
    },
    {
      name: "media_tags_suggest",
      description: "Media workbench: propose NEW tags for the project dictionary. They go to the \u5F85\u5BA1 (pending) area with a suggested dimension; the user approves or rejects them in the \u6807\u7B7E tab. Use after looking at footage (media_tag_samples / media_keyframes) or from the brief/script/storyboard. Suggest concrete, reusable, searchable words (2\u20136 Chinese characters), one dimension each; skip words already in the dictionary or near-duplicates of them. Keep it to what you actually saw or what the script needs (usually 5\u201330 tags).",
      parameters: {
        items: { type: "array", required: true, items: { type: "object", additionalProperties: false, properties: { tag: { type: "string", required: true }, dim: { type: "string", description: "\u573A\u666F/\u4E3B\u4F53/\u666F\u522B/\u8FD0\u955C/\u60C5\u7EEA/\u7528\u9014 or an existing custom dimension" } } } }
      },
      async execute(args, exec) {
        const { entry } = await project(exec);
        const result = await service.suggestTags(entry.id, args.items, { source: "chat" });
        return { ...result, note: result.added.length ? "\u5DF2\u653E\u8FDB\u300C\u6807\u7B7E\u300D\u9875\u7684\u5F85\u5BA1\u533A\uFF0C\u8BF7\u7528\u6237\u786E\u8BA4\u8F6C\u6B63\u3002" : "\u6CA1\u6709\u65B0\u589E\u5F85\u5BA1\u6807\u7B7E\u3002" };
      }
    },
    {
      name: "media_import",
      description: "Media workbench: scan \u539F\u59CB\u7D20\u6750\u5E93 (and adopted source folders) and read duration/resolution/fps/shoot time with ffprobe. Read-only for the footage; updates the index.",
      parameters: { wait: { type: "boolean", description: "wait for completion (default true)" } },
      async execute(args, exec) {
        const { entry } = await project(exec);
        return waitJob(await service.runStep(entry.id, "import"), args.wait !== false);
      }
    },
    {
      name: "media_clean",
      description: "Media workbench: keep/discard each imported raw clip with quantified evidence (clarity score, shake variance, duration, black-frame ratio, duplicate similarity) using the project rules. Discards are only registered in the project discard register (shown in the \u7D20\u6750 tab); raw files are never moved or deleted. force=true re-evaluates all clips except ones the user restored.",
      parameters: { force: { type: "boolean" }, wait: { type: "boolean" } },
      async execute(args, exec) {
        const { entry } = await project(exec);
        return waitJob(await service.runStep(entry.id, "clean", { force: args.force === true }), args.wait !== false);
      }
    },
    {
      name: "media_restore",
      description: "Media workbench: restore discarded raw clips (by raw id such as C0031) so they are kept and can be split again.",
      parameters: { rawIds: { type: "array", items: { type: "string" }, required: true } },
      async execute(args, exec) {
        const { root, project: p } = await project(exec);
        const result = await service.media.restore(root, p, args.rawIds);
        service.bump(root);
        return result;
      }
    },
    {
      name: "media_split",
      description: "Media workbench: split kept raw clips into shots by scene detection, writing 1080p H.264 proxies to \u8F93\u51FA\u7D20\u6750\u5E93/\u5207\u7247\u7D20\u6750/<raw>/ and thumbnails. Only raws without clips are processed unless rawIds is given.",
      parameters: { rawIds: { type: "array", items: { type: "string" } }, wait: { type: "boolean" } },
      async execute(args, exec) {
        const { entry } = await project(exec);
        return waitJob(await service.runStep(entry.id, "split", { rawIds: args.rawIds?.length ? args.rawIds : void 0 }), args.wait !== false);
      }
    },
    {
      name: "media_transcribe",
      description: "Media workbench: transcribe clips that have audio with local Whisper (optional; reports clearly when Whisper is not installed).",
      parameters: { clipIds: { type: "array", items: { type: "string" } }, wait: { type: "boolean" } },
      async execute(args, exec) {
        const { entry } = await project(exec);
        return waitJob(await service.runStep(entry.id, "transcribe", { clipIds: args.clipIds?.length ? args.clipIds : void 0 }), args.wait !== false);
      }
    },
    {
      name: "media_keyframes",
      description: "Media workbench: make one 3-frame contact sheet (20%/50%/80%) per clip for tagging and return project-relative JPEG paths plus clip info and transcript. Omit clipIds to take up to `limit` untagged clips. Then view each image with your image/file reading tool and call media_tag_clips.",
      parameters: { clipIds: { type: "array", items: { type: "string" } }, limit: { type: "integer", description: "max clips when clipIds omitted (default 12, max 40)" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        let ids = args.clipIds;
        if (!ids?.length) {
          const { clips: clips2 } = await service.media.listClips(root, { filter: "untagged", limit: Math.min(Math.max(args.limit || 12, 1), 40) });
          ids = clips2.map((c) => c.id);
          if (!ids.length) return { clips: [], note: "\u6CA1\u6709\u672A\u6253\u6807\u7684\u5207\u7247\u3002" };
        }
        const clips = await service.media.keyframes({ root, clipIds: ids.slice(0, 40), signal: exec.signal });
        const { effective } = await service.media.readDictionary(root);
        return { clips, dictionary: effective.dims, folder: root, note: "\u56FE\u7247\u8DEF\u5F84\u76F8\u5BF9\u4E8E\u9879\u76EE\u6839\u76EE\u5F55\uFF08\u4F1A\u8BDD\u5DE5\u4F5C\u76EE\u5F55\uFF09\u3002\u53EA\u80FD\u4ECE dictionary \u91CC\u9009\u6807\u7B7E\uFF1B\u5B57\u5178\u5916\u7684\u8BCD\u4F1A\u8FDB\u5165\u5F85\u5BA1\u533A\u3002" };
      }
    },
    {
      name: "media_tag_clips",
      description: "Media workbench: save tags you chose for clips after viewing their keyframes. Only words in the tag dictionary are accepted; any other word goes to the \u5F85\u5BA1 (pending) area for the user. Give each tag a confidence 0\u20131; below 0.6 marks the clip \u5F85\u590D\u6838. Never invent tags you did not see evidence for.",
      parameters: {
        items: {
          type: "array",
          required: true,
          items: { type: "object", additionalProperties: false, properties: {
            clipId: { type: "string", required: true },
            tags: { type: "array", required: true, items: { type: "object", additionalProperties: false, properties: { tag: { type: "string", required: true }, confidence: { type: "number" }, dim: { type: "string" } } } },
            transcript: { type: "string" }
          } }
        }
      },
      async execute(args, exec) {
        const { root } = await project(exec);
        const result = await service.media.applyTags(root, args.items, { model: modelOf(exec) });
        service.bump(root);
        return result;
      }
    },
    {
      name: "media_clips",
      description: "Media workbench: list clips with their tags. filter: review (needs human review), untagged, reviewed; or tag to list clips carrying a tag.",
      parameters: { tag: { type: "string" }, filter: { type: "string", enum: ["review", "untagged", "reviewed"] }, limit: { type: "integer" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        const { total, clips } = await service.media.listClips(root, { tag: args.tag, filter: args.filter, limit: Math.min(args.limit || 50, 300) });
        return { total, clips: clips.map((c) => ({ id: c.id, raw: c.raw, duration: c.duration, tags: c.tags, pending: c.pendingTags?.map((p) => p.tag), needsReview: c.needsReview, reviewed: c.reviewed, transcript: c.transcript || void 0 })) };
      }
    },
    {
      name: "media_eagle_sync",
      description: "Media workbench: direction=push adds proxy clips with tags and notes (original path, in/out, transcript) into the project folder in Eagle and updates changed tags; direction=pull reads tag edits made in Eagle back into the project. Eagle must be running.",
      parameters: { direction: { type: "string", enum: ["push", "pull"], required: true }, wait: { type: "boolean" } },
      async execute(args, exec) {
        const { entry } = await project(exec);
        return waitJob(await service.runStep(entry.id, args.direction === "pull" ? "eagle-pull" : "eagle-push"), args.wait !== false);
      }
    },
    {
      name: "media_edit_spec_set",
      description: `Media workbench: set output spec saved to \u521B\u610F\u526A\u8F91/\u526A\u8F91\u6570\u636E/edit_spec.json. resolution: ${Object.keys(RESOLUTIONS).join(" | ")}; fps 24/25/30/50/60; codec h264|h265; bitrateMbps; targetDuration seconds; subtitles burn+srt|srt|burn|none; engine ffmpeg|jianying|both; transition cut|dissolve.`,
      parameters: { resolution: { type: "string", enum: Object.keys(RESOLUTIONS) }, fps: { type: "integer" }, codec: { type: "string", enum: ["h264", "h265"] }, bitrateMbps: { type: "number" }, targetDuration: { type: "number" }, subtitles: { type: "string", enum: ["burn+srt", "srt", "burn", "none"] }, engine: { type: "string", enum: ["ffmpeg", "jianying", "both"] }, transition: { type: "string", enum: ["cut", "dissolve"] } },
      async execute(args, exec) {
        const { root, project: p } = await project(exec);
        const spec = await service.edit.setSpec(root, p, args);
        service.bump(root);
        return spec;
      }
    },
    {
      name: "media_match",
      description: "Media workbench: match each storyboard shot (\u526A\u8F91\u4F7F\u7528\u7248\u672C of 03_\u5206\u955C\u811A\u672C.md) to clips by \u6240\u9700\u6807\u7B7E/\u666F\u522B/\u8FD0\u955C, saving Top3 candidates and the selection to \u521B\u610F\u526A\u8F91/\u526A\u8F91\u6570\u636E/match.json. Unmatched shots are reported as missing \u2014 never claim a match that is not in the result.",
      parameters: { keepManual: { type: "boolean", description: "keep shots the user picked by hand (default true)" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        const result = await service.edit.match(root, { keepManual: args.keepManual !== false });
        service.bump(root);
        return { matched: result.matched, total: result.total, storyboardVersion: result.storyboardVersion, shots: result.shots.map((s) => ({ no: s.no, status: s.status, selected: s.selected, top: s.top.map((t) => `${t.clipId}(${t.score ?? "\u624B\u9009"})`), required: s.required, note: s.note })) };
      }
    },
    {
      name: "media_edit_select",
      description: "Media workbench: choose a specific clip for a storyboard shot (or clipId empty to clear).",
      parameters: { no: { type: "string", required: true }, clipId: { type: "string" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        const result = await service.edit.select(root, args.no, args.clipId || null);
        service.bump(root);
        return result;
      }
    },
    {
      name: "media_gaps",
      description: "Media workbench: export the gap list (shots with no or too-short footage) to \u521B\u610F\u526A\u8F91/\u7F3A\u53E3\u6E05\u5355.md for reshoots or AI-generated b-roll.",
      parameters: {},
      async execute(_args, exec) {
        const { root } = await project(exec);
        const result = await service.edit.gaps(root);
        service.bump(root);
        return result;
      }
    },
    {
      name: "media_timeline_build",
      description: "Media workbench: build the engine-independent \u521B\u610F\u526A\u8F91/\u526A\u8F91\u6570\u636E/timeline.json (shot order, original paths, in/out points, subtitles from \u53F0\u8BCD) and \u521B\u610F\u526A\u8F91/\u526A\u8F91\u6570\u636E/subtitles.srt from the current match.",
      parameters: {},
      async execute(_args, exec) {
        const { root, project: p } = await project(exec);
        const t = await service.edit.buildTimeline(root, p);
        service.bump(root);
        return { duration: t.duration, expected: t.expected, segments: t.tracks.video.length, subtitles: t.tracks.subtitles.length, warnings: t.warnings };
      }
    },
    {
      name: "media_render",
      description: "Media workbench: kind=preview renders a fast low-res rough cut from proxies; kind=final renders the film from original footage at the output spec into \u8F93\u51FA\u7D20\u6750\u5E93/\u6210\u7247 with a manifest.json (versions + clip list). Build the timeline first.",
      parameters: { kind: { type: "string", enum: ["preview", "final"], required: true }, wait: { type: "boolean" } },
      async execute(args, exec) {
        const { entry } = await project(exec);
        return waitJob(await service.runStep(entry.id, args.kind === "final" ? "render-final" : "render-preview"), args.wait !== false);
      }
    },
    {
      name: "media_capcut_draft",
      description: "Media workbench: generate a JianYing (\u526A\u6620) draft from timeline.json. Currently reports that the adapter is not yet verified and offers the FFmpeg fallback.",
      parameters: {},
      async execute(_args, exec) {
        const { root, project: p } = await project(exec);
        return service.edit.capcutDraft(root, p);
      }
    },
    {
      name: "media_job_status",
      description: "Media workbench: progress of background jobs (import, clean, split, eagle sync, render). Pass cancel=true with jobId to cancel.",
      parameters: { jobId: { type: "string" }, cancel: { type: "boolean" } },
      async execute(args, exec) {
        const { root } = await project(exec);
        if (args.cancel) return { cancelled: service.jobs.cancel(root, args.jobId) };
        return args.jobId ? await service.jobs.get(root, args.jobId) || { error: "\u627E\u4E0D\u5230\u8BE5\u4EFB\u52A1" } : service.jobs.list(root);
      }
    }
  ];
  return tools;
}
async function approvalFor(service, exec) {
  const args = exec.arguments || {};
  const p = () => service.openByDirectory(cwdOf(exec));
  switch (exec.name) {
    case "media_creative_write": {
      const { root } = await p();
      const current = await service.creative.read(root, args.file).catch(() => null);
      if (!current?.exists || current.content === args.content) return null;
      return `\u8986\u76D6 ${current.key}\uFF08v${current.version} \u2192 v${current.version + 1}\uFF09\uFF0C\u65E7\u7248\u672C\u81EA\u52A8\u5B58\u5165 _history\uFF0C\u53EF\u968F\u65F6\u56DE\u6EDA`;
    }
    case "media_creative_rollback": {
      const { root } = await p();
      const current = await service.creative.read(root, args.file).catch(() => null);
      return `\u628A ${args.file} \u56DE\u6EDA\u5230 ${args.version}\uFF08\u5F53\u524D v${current?.version ?? "?"} \u4F1A\u5B58\u5165 _history\uFF09`;
    }
    case "media_tags_update": {
      const { entry } = await p();
      const impact = await service.tagImpact(entry.id, args);
      return `${impact.summary}\uFF1A\u66F4\u65B0 ${impact.clips} \u6761\u5207\u7247\u6807\u7B7E${impact.eagle ? `\uFF0C\u5176\u4E2D ${impact.eagle} \u6761\u9700\u8981\u540C\u6B65\u5230 Eagle` : ""}`;
    }
    case "media_clean": {
      const { root } = await p();
      const index = await service.indexStore.read(root);
      const raws = Object.values(index.raws).filter((r) => !r.missing);
      const n = args.force ? raws.filter((r) => !r.restored).length : raws.filter((r) => r.status === "pending").length;
      if (!n) return null;
      return `\u6E05\u6D17 ${n} \u6761\u539F\u7247\uFF1A\u5224\u5B9A\u4E22\u5F03\u7684\u53EA\u505A\u767B\u8BB0\uFF08\u539F\u7247\u4E0D\u79FB\u52A8\u3001\u4E0D\u5220\u9664\uFF0C\u53EF\u5728\u7D20\u6750\u9875\u4E00\u952E\u6062\u590D\uFF09${args.force ? "\uFF1B\u4F1A\u91CD\u65B0\u8BC4\u4F30\u5DF2\u6E05\u6D17\u8FC7\u7684\u539F\u7247" : ""}`;
    }
    case "media_restore":
      return `\u6062\u590D ${(args.rawIds || []).length} \u6761\u88AB\u4E22\u5F03\u7684\u539F\u7247\uFF08${(args.rawIds || []).slice(0, 5).join("\u3001")}\uFF09\uFF0C\u6062\u590D\u540E\u9700\u8981\u91CD\u65B0\u5207\u7247`;
    case "media_tag_clips": {
      const { root } = await p();
      const index = await service.indexStore.read(root);
      const ids = (args.items || []).map((i) => i?.clipId);
      const reviewed = ids.filter((id) => index.clips[id]?.reviewed).length;
      const tagged = ids.filter((id) => index.clips[id]?.tagStatus === "tagged" || index.clips[id]?.tagStatus === "manual").length;
      if (!tagged && !reviewed) return null;
      return `\u91CD\u65B0\u6253\u6807\u4F1A\u8986\u76D6 ${tagged} \u6761\u5207\u7247\u7684\u73B0\u6709\u6807\u7B7E${reviewed ? `\uFF08\u5176\u4E2D ${reviewed} \u6761\u5DF2\u4EBA\u5DE5\u590D\u6838\uFF09` : ""}`;
    }
    case "media_eagle_sync": {
      const { root } = await p();
      const index = await service.indexStore.read(root);
      const clips = Object.values(index.clips);
      if (args.direction === "pull") return `\u4ECE Eagle \u62C9\u53D6\u6807\u7B7E\uFF0C\u53EF\u80FD\u6539\u5199\u672C\u5730 ${clips.filter((c) => c.eagle?.id).length} \u6761\u5DF2\u5165\u5E93\u5207\u7247\u7684\u6807\u7B7E`;
      const add = clips.filter((c) => !c.eagle?.id || c.eagle?.missing).length;
      const upd = clips.filter((c) => c.eagle?.id && c.eagle?.dirty).length;
      return `\u540C\u6B65 Eagle\uFF1A\u65B0\u589E ${add} \u6761\u4EE3\u7406\u5207\u7247\uFF08\u590D\u5236\u8FDB Eagle \u8D44\u6599\u5E93\uFF09\uFF0C\u66F4\u65B0 ${upd} \u6761\u6807\u7B7E`;
    }
    case "media_render": {
      if (args.kind !== "final") return null;
      const { root, project: proj } = await p();
      const spec = await service.edit.getSpec(root, proj);
      const timeline = await service.edit.readTimeline(root);
      return `\u6B63\u5F0F\u6E32\u67D3\uFF1A${spec.resolution} \xB7 ${spec.fps}fps \xB7 ${spec.codec.toUpperCase()} ${spec.bitrateMbps}Mbps\uFF0C\u65F6\u957F\u7EA6 ${timeline?.duration ?? "?"} \u79D2\uFF0C\u8F93\u51FA\u5230 \u8F93\u51FA\u7D20\u6750\u5E93/\u6210\u7247`;
    }
    default:
      return null;
  }
}
var TOOL_NAMES = /* @__PURE__ */ new Set(["media_context", "media_creative_read", "media_creative_write", "media_creative_diff", "media_creative_rollback", "media_creative_set_edit_version", "media_tags_update", "media_tag_samples", "media_tags_suggest", "media_import", "media_clean", "media_restore", "media_split", "media_transcribe", "media_keyframes", "media_tag_clips", "media_clips", "media_eagle_sync", "media_edit_spec_set", "media_match", "media_edit_select", "media_gaps", "media_timeline_build", "media_render", "media_capcut_draft", "media_job_status"]);

// src/server/index.js
var name = "dsh-media-workbench";
var inject = ["connection"];
var Config = Schema.object({
  root: Schema.string().required().description("\u5DE5\u4F5C\u53F0\u81EA\u5DF1\u7684\u6570\u636E\u76EE\u5F55\uFF08\u9879\u76EE\u5217\u8868\u3001\u8BBE\u7F6E\uFF09\u3002\u9879\u76EE\u6587\u4EF6\u90FD\u5728\u5404\u81EA\u7684\u9879\u76EE\u6587\u4EF6\u5939\u91CC\u3002")
});
var PROMPT_SECTION = "tool:dsh-media-workbench";
var PROMPT_TEXT = "Media workbench (\u5A92\u4F53\u81EA\u52A8\u5316\u526A\u8F91\u5DE5\u4F5C\u53F0): when the session workspace (or one of its parent folders) contains .dsh/project.json it is a video project; the workspace may be one of its libraries \u539F\u59CB\u7D20\u6750\u5E93 / \u8F93\u51FA\u7D20\u6750\u5E93 / \u521B\u610F\u526A\u8F91 (tags live in the panel \u6807\u7B7E tab, not in a folder). Load the media-workbench Skill, call media_context first, and use the media_* tools for creative files, footage cleaning, tagging, Eagle, matching and rendering. Never modify or delete files in \u539F\u59CB\u7D20\u6750\u5E93. Write creative files only with media_creative_write so versions are kept. New tag ideas go to \u5F85\u5BA1 via media_tags_suggest; never write the tag dictionary file directly. Never invent footage matches: report shots without footage as missing.";
function apply(ctx, config) {
  const service = createService({ home: config.root, logger: ctx.logger });
  ctx.effect(() => () => service.dispose(), "media-workbench: service");
  registerRoutes(ctx, service);
  ctx.inject(["tools"], async (ctx2) => {
    let defineTool;
    try {
      ({ defineTool } = await import("@deepseek-ai/dsh-tools"));
    } catch (error) {
      ctx2.logger?.warn?.("media-workbench: @deepseek-ai/dsh-tools unavailable, agent tools disabled: %s", error?.message);
      return;
    }
    for (const tool of createTools(service)) {
      ctx2.tools.register(defineTool({ ...tool, output: JSON_OUTPUT, timeoutMs: 12e4, isConcurrencySafe: () => tool.name === "media_context" || tool.name === "media_creative_read" || tool.name === "media_clips" }));
    }
    ctx2.on("tools/pre-execute", async (exec, next) => {
      const decision = await next();
      if (decision?.kind !== "allow" || !TOOL_NAMES.has(exec.name)) return decision;
      let reason = null;
      try {
        reason = await approvalFor(service, exec);
      } catch (error) {
        reason = null;
        ctx2.logger?.info?.("media-workbench: approval impact unavailable: %s", error?.message);
      }
      if (!reason) return decision;
      return { kind: "ask", reason, displayReason: { en: reason, zh: reason, "zh-CN": reason } };
    });
  });
  ctx.inject(["skills"], async (ctx2) => {
    const locator = new URL("../skills/media-workbench/SKILL.md", import.meta.url);
    let rank = 0;
    try {
      ({ BUNDLED_SKILL_RANK: rank } = await import("@deepseek-ai/dsh-skill"));
    } catch {
      rank = 0;
    }
    const candidate = {
      name: "media-workbench",
      description: "Run the media workbench pipeline: creative docs (brief, directions, script, storyboard, tag dictionary), footage import/clean/split/tag/review/Eagle, storyboard matching, timeline and FFmpeg rendering.",
      invocation: { modelInvocable: true, userInvocable: true },
      provider: name,
      source: "bundled",
      rank,
      locator,
      resourceBase: { kind: "directory", path: fileURLToPath(new URL(".", locator)) }
    };
    ctx2.skills.registerProvider(() => ({
      name,
      list: async () => [candidate],
      get: async (selected) => selected.name === candidate.name ? { ...candidate, content: (await readFile3(locator, "utf8")).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, "").trim() } : void 0
    }));
  });
  ctx.inject(["systemPrompt"], (ctx2) => {
    ctx2.systemPrompt.section({ name: PROMPT_SECTION, order: 116, text: PROMPT_TEXT });
  });
}
export {
  Config,
  PROMPT_SECTION,
  PROMPT_TEXT,
  apply,
  inject,
  name
};
