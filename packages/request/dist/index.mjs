var Le = Object.defineProperty;
var je = (e, t, n) => t in e ? Le(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var I = (e, t, n) => (je(e, typeof t != "symbol" ? t + "" : t, n), n);
function he(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: pe } = Object.prototype, { getPrototypeOf: Y } = Object, G = ((e) => (t) => {
  const n = pe.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), x = (e) => (e = e.toLowerCase(), (t) => G(t) === e), H = (e) => (t) => typeof t === e, { isArray: j } = Array, K = H("undefined");
function _e(e) {
  return e !== null && !K(e) && e.constructor !== null && !K(e.constructor) && P(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const me = x("ArrayBuffer");
function Ie(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && me(e.buffer), t;
}
const ke = H("string"), P = H("function"), Ee = H("number"), we = (e) => e !== null && typeof e == "object", qe = (e) => e === !0 || e === !1, q = (e) => {
  if (G(e) !== "object")
    return !1;
  const t = Y(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}, Me = x("Date"), He = x("File"), ze = x("Blob"), Je = x("FileList"), Ve = (e) => we(e) && P(e.pipe), $e = (e) => {
  const t = "[object FormData]";
  return e && (typeof FormData == "function" && e instanceof FormData || pe.call(e) === t || P(e.toString) && e.toString() === t);
}, We = x("URLSearchParams"), Ke = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function z(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, s;
  if (typeof e != "object" && (e = [e]), j(e))
    for (r = 0, s = e.length; r < s; r++)
      t.call(null, e[r], r, e);
  else {
    const i = n ? Object.getOwnPropertyNames(e) : Object.keys(e), o = i.length;
    let c;
    for (r = 0; r < o; r++)
      c = i[r], t.call(null, e[c], c, e);
  }
}
function X() {
  const e = {}, t = (n, r) => {
    q(e[r]) && q(n) ? e[r] = X(e[r], n) : q(n) ? e[r] = X({}, n) : j(n) ? e[r] = n.slice() : e[r] = n;
  };
  for (let n = 0, r = arguments.length; n < r; n++)
    arguments[n] && z(arguments[n], t);
  return e;
}
const Xe = (e, t, n, { allOwnKeys: r } = {}) => (z(t, (s, i) => {
  n && P(s) ? e[i] = he(s, n) : e[i] = s;
}, { allOwnKeys: r }), e), Qe = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Ye = (e, t, n, r) => {
  e.prototype = Object.create(t.prototype, r), e.prototype.constructor = e, Object.defineProperty(e, "super", {
    value: t.prototype
  }), n && Object.assign(e.prototype, n);
}, Ge = (e, t, n, r) => {
  let s, i, o;
  const c = {};
  if (t = t || {}, e == null)
    return t;
  do {
    for (s = Object.getOwnPropertyNames(e), i = s.length; i-- > 0; )
      o = s[i], (!r || r(o, e, t)) && !c[o] && (t[o] = e[o], c[o] = !0);
    e = n !== !1 && Y(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, Ze = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, ve = (e) => {
  if (!e)
    return null;
  if (j(e))
    return e;
  let t = e.length;
  if (!Ee(t))
    return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, et = ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && Y(Uint8Array)), tt = (e, t) => {
  const r = (e && e[Symbol.iterator]).call(e);
  let s;
  for (; (s = r.next()) && !s.done; ) {
    const i = s.value;
    t.call(e, i[0], i[1]);
  }
}, nt = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, rt = x("HTMLFormElement"), st = (e) => e.toLowerCase().replace(
  /[_-\s]([a-z\d])(\w*)/g,
  function(n, r, s) {
    return r.toUpperCase() + s;
  }
), te = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), ot = x("RegExp"), ye = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  z(n, (s, i) => {
    t(s, i, e) !== !1 && (r[i] = s);
  }), Object.defineProperties(e, r);
}, it = (e) => {
  ye(e, (t, n) => {
    const r = e[n];
    if (!!P(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not read-only method '" + n + "'");
      });
    }
  });
}, at = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((i) => {
      n[i] = !0;
    });
  };
  return j(e) ? r(e) : r(String(e).split(t)), n;
}, ut = () => {
}, ct = (e, t) => (e = +e, Number.isFinite(e) ? e : t), a = {
  isArray: j,
  isArrayBuffer: me,
  isBuffer: _e,
  isFormData: $e,
  isArrayBufferView: Ie,
  isString: ke,
  isNumber: Ee,
  isBoolean: qe,
  isObject: we,
  isPlainObject: q,
  isUndefined: K,
  isDate: Me,
  isFile: He,
  isBlob: ze,
  isRegExp: ot,
  isFunction: P,
  isStream: Ve,
  isURLSearchParams: We,
  isTypedArray: et,
  isFileList: Je,
  forEach: z,
  merge: X,
  extend: Xe,
  trim: Ke,
  stripBOM: Qe,
  inherits: Ye,
  toFlatObject: Ge,
  kindOf: G,
  kindOfTest: x,
  endsWith: Ze,
  toArray: ve,
  forEachEntry: tt,
  matchAll: nt,
  isHTMLForm: rt,
  hasOwnProperty: te,
  hasOwnProp: te,
  reduceDescriptors: ye,
  freezeMethods: it,
  toObjectSet: at,
  toCamelCase: st,
  noop: ut,
  toFiniteNumber: ct
};
function h(e, t, n, r, s) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = e, this.name = "AxiosError", t && (this.code = t), n && (this.config = n), r && (this.request = r), s && (this.response = s);
}
a.inherits(h, Error, {
  toJSON: function() {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
const be = h.prototype, Re = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
].forEach((e) => {
  Re[e] = { value: e };
});
Object.defineProperties(h, Re);
Object.defineProperty(be, "isAxiosError", { value: !0 });
h.from = (e, t, n, r, s, i) => {
  const o = Object.create(be);
  return a.toFlatObject(e, o, function(l) {
    return l !== Error.prototype;
  }, (c) => c !== "isAxiosError"), h.call(o, e.message, t, n, r, s), o.cause = e, o.name = e.name, i && Object.assign(o, i), o;
};
var lt = typeof self == "object" ? self.FormData : window.FormData;
function Q(e) {
  return a.isPlainObject(e) || a.isArray(e);
}
function Oe(e) {
  return a.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function ne(e, t, n) {
  return e ? e.concat(t).map(function(s, i) {
    return s = Oe(s), !n && i ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function ft(e) {
  return a.isArray(e) && !e.some(Q);
}
const dt = a.toFlatObject(a, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function ht(e) {
  return e && a.isFunction(e.append) && e[Symbol.toStringTag] === "FormData" && e[Symbol.iterator];
}
function J(e, t, n) {
  if (!a.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new (lt || FormData)(), n = a.toFlatObject(n, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(E, A) {
    return !a.isUndefined(A[E]);
  });
  const r = n.metaTokens, s = n.visitor || p, i = n.dots, o = n.indexes, l = (n.Blob || typeof Blob < "u" && Blob) && ht(t);
  if (!a.isFunction(s))
    throw new TypeError("visitor must be a function");
  function u(f) {
    if (f === null)
      return "";
    if (a.isDate(f))
      return f.toISOString();
    if (!l && a.isBlob(f))
      throw new h("Blob is not supported. Use a Buffer instead.");
    return a.isArrayBuffer(f) || a.isTypedArray(f) ? l && typeof Blob == "function" ? new Blob([f]) : Buffer.from(f) : f;
  }
  function p(f, E, A) {
    let O = f;
    if (f && !A && typeof f == "object") {
      if (a.endsWith(E, "{}"))
        E = r ? E : E.slice(0, -2), f = JSON.stringify(f);
      else if (a.isArray(f) && ft(f) || a.isFileList(f) || a.endsWith(E, "[]") && (O = a.toArray(f)))
        return E = Oe(E), O.forEach(function(V, Ue) {
          !a.isUndefined(V) && t.append(
            o === !0 ? ne([E], Ue, i) : o === null ? E : E + "[]",
            u(V)
          );
        }), !1;
    }
    return Q(f) ? !0 : (t.append(ne(A, E, i), u(f)), !1);
  }
  const w = [], m = Object.assign(dt, {
    defaultVisitor: p,
    convertValue: u,
    isVisitable: Q
  });
  function d(f, E) {
    if (!a.isUndefined(f)) {
      if (w.indexOf(f) !== -1)
        throw Error("Circular reference detected in " + E.join("."));
      w.push(f), a.forEach(f, function(O, g) {
        (!a.isUndefined(O) && s.call(
          t,
          O,
          a.isString(g) ? g.trim() : g,
          E,
          m
        )) === !0 && d(O, E ? E.concat(g) : [g]);
      }), w.pop();
    }
  }
  if (!a.isObject(e))
    throw new TypeError("data must be an object");
  return d(e), t;
}
function re(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function(r) {
    return t[r];
  });
}
function Z(e, t) {
  this._pairs = [], e && J(e, this, t);
}
const Se = Z.prototype;
Se.append = function(t, n) {
  this._pairs.push([t, n]);
};
Se.toString = function(t) {
  const n = t ? function(r) {
    return t.call(this, r, re);
  } : re;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function pt(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function xe(e, t, n) {
  if (!t)
    return e;
  const r = e.indexOf("#");
  r !== -1 && (e = e.slice(0, r));
  const s = n && n.encode || pt, i = a.isURLSearchParams(t) ? t.toString() : new Z(t, n).toString(s);
  return i && (e += (e.indexOf("?") === -1 ? "?" : "&") + i), e;
}
class se {
  constructor() {
    this.handlers = [];
  }
  use(t, n, r) {
    return this.handlers.push({
      fulfilled: t,
      rejected: n,
      synchronous: r ? r.synchronous : !1,
      runWhen: r ? r.runWhen : null
    }), this.handlers.length - 1;
  }
  eject(t) {
    this.handlers[t] && (this.handlers[t] = null);
  }
  clear() {
    this.handlers && (this.handlers = []);
  }
  forEach(t) {
    a.forEach(this.handlers, function(r) {
      r !== null && t(r);
    });
  }
}
const Ae = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, mt = typeof URLSearchParams < "u" ? URLSearchParams : Z, Et = FormData, wt = (() => {
  let e;
  return typeof navigator < "u" && ((e = navigator.product) === "ReactNative" || e === "NativeScript" || e === "NS") ? !1 : typeof window < "u" && typeof document < "u";
})(), S = {
  isBrowser: !0,
  classes: {
    URLSearchParams: mt,
    FormData: Et,
    Blob
  },
  isStandardBrowserEnv: wt,
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
function yt(e, t) {
  return J(e, new S.classes.URLSearchParams(), Object.assign({
    visitor: function(n, r, s, i) {
      return S.isNode && a.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    }
  }, t));
}
function bt(e) {
  return a.matchAll(/\w+|\[(\w*)]/g, e).map((t) => t[0] === "[]" ? "" : t[1] || t[0]);
}
function Rt(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const s = n.length;
  let i;
  for (r = 0; r < s; r++)
    i = n[r], t[i] = e[i];
  return t;
}
function Te(e) {
  function t(n, r, s, i) {
    let o = n[i++];
    const c = Number.isFinite(+o), l = i >= n.length;
    return o = !o && a.isArray(s) ? s.length : o, l ? (a.hasOwnProp(s, o) ? s[o] = [s[o], r] : s[o] = r, !c) : ((!s[o] || !a.isObject(s[o])) && (s[o] = []), t(n, r, s[o], i) && a.isArray(s[o]) && (s[o] = Rt(s[o])), !c);
  }
  if (a.isFormData(e) && a.isFunction(e.entries)) {
    const n = {};
    return a.forEachEntry(e, (r, s) => {
      t(bt(r), s, n, 0);
    }), n;
  }
  return null;
}
function Ot(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new h(
    "Request failed with status code " + n.status,
    [h.ERR_BAD_REQUEST, h.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4],
    n.config,
    n.request,
    n
  ));
}
const St = S.isStandardBrowserEnv ? function() {
  return {
    write: function(n, r, s, i, o, c) {
      const l = [];
      l.push(n + "=" + encodeURIComponent(r)), a.isNumber(s) && l.push("expires=" + new Date(s).toGMTString()), a.isString(i) && l.push("path=" + i), a.isString(o) && l.push("domain=" + o), c === !0 && l.push("secure"), document.cookie = l.join("; ");
    },
    read: function(n) {
      const r = document.cookie.match(new RegExp("(^|;\\s*)(" + n + ")=([^;]*)"));
      return r ? decodeURIComponent(r[3]) : null;
    },
    remove: function(n) {
      this.write(n, "", Date.now() - 864e5);
    }
  };
}() : function() {
  return {
    write: function() {
    },
    read: function() {
      return null;
    },
    remove: function() {
    }
  };
}();
function xt(e) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function At(e, t) {
  return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function ge(e, t) {
  return e && !xt(t) ? At(e, t) : t;
}
const Tt = S.isStandardBrowserEnv ? function() {
  const t = /(msie|trident)/i.test(navigator.userAgent), n = document.createElement("a");
  let r;
  function s(i) {
    let o = i;
    return t && (n.setAttribute("href", o), o = n.href), n.setAttribute("href", o), {
      href: n.href,
      protocol: n.protocol ? n.protocol.replace(/:$/, "") : "",
      host: n.host,
      search: n.search ? n.search.replace(/^\?/, "") : "",
      hash: n.hash ? n.hash.replace(/^#/, "") : "",
      hostname: n.hostname,
      port: n.port,
      pathname: n.pathname.charAt(0) === "/" ? n.pathname : "/" + n.pathname
    };
  }
  return r = s(window.location.href), function(o) {
    const c = a.isString(o) ? s(o) : o;
    return c.protocol === r.protocol && c.host === r.host;
  };
}() : function() {
  return function() {
    return !0;
  };
}();
function _(e, t, n) {
  h.call(this, e == null ? "canceled" : e, h.ERR_CANCELED, t, n), this.name = "CanceledError";
}
a.inherits(_, h, {
  __CANCEL__: !0
});
function gt(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return t && t[1] || "";
}
const Ct = a.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), Nt = (e) => {
  const t = {};
  let n, r, s;
  return e && e.split(`
`).forEach(function(o) {
    s = o.indexOf(":"), n = o.substring(0, s).trim().toLowerCase(), r = o.substring(s + 1).trim(), !(!n || t[n] && Ct[n]) && (n === "set-cookie" ? t[n] ? t[n].push(r) : t[n] = [r] : t[n] = t[n] ? t[n] + ", " + r : r);
  }), t;
}, oe = Symbol("internals"), Ce = Symbol("defaults");
function B(e) {
  return e && String(e).trim().toLowerCase();
}
function k(e) {
  return e === !1 || e == null ? e : String(e);
}
function Pt(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
function ie(e, t, n, r) {
  if (a.isFunction(r))
    return r.call(this, t, n);
  if (!!a.isString(t)) {
    if (a.isString(r))
      return t.indexOf(r) !== -1;
    if (a.isRegExp(r))
      return r.test(t);
  }
}
function Ft(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function Dt(e, t) {
  const n = a.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      value: function(s, i, o) {
        return this[r].call(this, t, s, i, o);
      },
      configurable: !0
    });
  });
}
function D(e, t) {
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, s;
  for (; r-- > 0; )
    if (s = n[r], t === s.toLowerCase())
      return s;
  return null;
}
function R(e, t) {
  e && this.set(e), this[Ce] = t || null;
}
Object.assign(R.prototype, {
  set: function(e, t, n) {
    const r = this;
    function s(i, o, c) {
      const l = B(o);
      if (!l)
        throw new Error("header name must be a non-empty string");
      const u = D(r, l);
      u && c !== !0 && (r[u] === !1 || c === !1) || (a.isArray(i) ? i = i.map(k) : i = k(i), r[u || o] = i);
    }
    return a.isPlainObject(e) ? a.forEach(e, (i, o) => {
      s(i, o, t);
    }) : s(t, e, n), this;
  },
  get: function(e, t) {
    if (e = B(e), !e)
      return;
    const n = D(this, e);
    if (n) {
      const r = this[n];
      if (!t)
        return r;
      if (t === !0)
        return Pt(r);
      if (a.isFunction(t))
        return t.call(this, r, n);
      if (a.isRegExp(t))
        return t.exec(r);
      throw new TypeError("parser must be boolean|regexp|function");
    }
  },
  has: function(e, t) {
    if (e = B(e), e) {
      const n = D(this, e);
      return !!(n && (!t || ie(this, this[n], n, t)));
    }
    return !1;
  },
  delete: function(e, t) {
    const n = this;
    let r = !1;
    function s(i) {
      if (i = B(i), i) {
        const o = D(n, i);
        o && (!t || ie(n, n[o], o, t)) && (delete n[o], r = !0);
      }
    }
    return a.isArray(e) ? e.forEach(s) : s(e), r;
  },
  clear: function() {
    return Object.keys(this).forEach(this.delete.bind(this));
  },
  normalize: function(e) {
    const t = this, n = {};
    return a.forEach(this, (r, s) => {
      const i = D(n, s);
      if (i) {
        t[i] = k(r), delete t[s];
        return;
      }
      const o = e ? Ft(s) : String(s).trim();
      o !== s && delete t[s], t[o] = k(r), n[o] = !0;
    }), this;
  },
  toJSON: function() {
    const e = /* @__PURE__ */ Object.create(null);
    return a.forEach(
      Object.assign({}, this[Ce] || null, this),
      (t, n) => {
        t == null || t === !1 || (e[n] = a.isArray(t) ? t.join(", ") : t);
      }
    ), e;
  }
});
Object.assign(R, {
  from: function(e) {
    return a.isString(e) ? new this(Nt(e)) : e instanceof this ? e : new this(e);
  },
  accessor: function(e) {
    const n = (this[oe] = this[oe] = {
      accessors: {}
    }).accessors, r = this.prototype;
    function s(i) {
      const o = B(i);
      n[o] || (Dt(r, i), n[o] = !0);
    }
    return a.isArray(e) ? e.forEach(s) : s(e), this;
  }
});
R.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent"]);
a.freezeMethods(R.prototype);
a.freezeMethods(R);
function Bt(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let s = 0, i = 0, o;
  return t = t !== void 0 ? t : 1e3, function(l) {
    const u = Date.now(), p = r[i];
    o || (o = u), n[s] = l, r[s] = u;
    let w = i, m = 0;
    for (; w !== s; )
      m += n[w++], w = w % e;
    if (s = (s + 1) % e, s === i && (i = (i + 1) % e), u - o < t)
      return;
    const d = p && u - p;
    return d ? Math.round(m * 1e3 / d) : void 0;
  };
}
function ae(e, t) {
  let n = 0;
  const r = Bt(50, 250);
  return (s) => {
    const i = s.loaded, o = s.lengthComputable ? s.total : void 0, c = i - n, l = r(c), u = i <= o;
    n = i;
    const p = {
      loaded: i,
      total: o,
      progress: o ? i / o : void 0,
      bytes: c,
      rate: l || void 0,
      estimated: l && o && u ? (o - i) / l : void 0
    };
    p[t ? "download" : "upload"] = !0, e(p);
  };
}
function ue(e) {
  return new Promise(function(n, r) {
    let s = e.data;
    const i = R.from(e.headers).normalize(), o = e.responseType;
    let c;
    function l() {
      e.cancelToken && e.cancelToken.unsubscribe(c), e.signal && e.signal.removeEventListener("abort", c);
    }
    a.isFormData(s) && S.isStandardBrowserEnv && i.setContentType(!1);
    let u = new XMLHttpRequest();
    if (e.auth) {
      const d = e.auth.username || "", f = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : "";
      i.set("Authorization", "Basic " + btoa(d + ":" + f));
    }
    const p = ge(e.baseURL, e.url);
    u.open(e.method.toUpperCase(), xe(p, e.params, e.paramsSerializer), !0), u.timeout = e.timeout;
    function w() {
      if (!u)
        return;
      const d = R.from(
        "getAllResponseHeaders" in u && u.getAllResponseHeaders()
      ), E = {
        data: !o || o === "text" || o === "json" ? u.responseText : u.response,
        status: u.status,
        statusText: u.statusText,
        headers: d,
        config: e,
        request: u
      };
      Ot(function(O) {
        n(O), l();
      }, function(O) {
        r(O), l();
      }, E), u = null;
    }
    if ("onloadend" in u ? u.onloadend = w : u.onreadystatechange = function() {
      !u || u.readyState !== 4 || u.status === 0 && !(u.responseURL && u.responseURL.indexOf("file:") === 0) || setTimeout(w);
    }, u.onabort = function() {
      !u || (r(new h("Request aborted", h.ECONNABORTED, e, u)), u = null);
    }, u.onerror = function() {
      r(new h("Network Error", h.ERR_NETWORK, e, u)), u = null;
    }, u.ontimeout = function() {
      let f = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded";
      const E = e.transitional || Ae;
      e.timeoutErrorMessage && (f = e.timeoutErrorMessage), r(new h(
        f,
        E.clarifyTimeoutError ? h.ETIMEDOUT : h.ECONNABORTED,
        e,
        u
      )), u = null;
    }, S.isStandardBrowserEnv) {
      const d = (e.withCredentials || Tt(p)) && e.xsrfCookieName && St.read(e.xsrfCookieName);
      d && i.set(e.xsrfHeaderName, d);
    }
    s === void 0 && i.setContentType(null), "setRequestHeader" in u && a.forEach(i.toJSON(), function(f, E) {
      u.setRequestHeader(E, f);
    }), a.isUndefined(e.withCredentials) || (u.withCredentials = !!e.withCredentials), o && o !== "json" && (u.responseType = e.responseType), typeof e.onDownloadProgress == "function" && u.addEventListener("progress", ae(e.onDownloadProgress, !0)), typeof e.onUploadProgress == "function" && u.upload && u.upload.addEventListener("progress", ae(e.onUploadProgress)), (e.cancelToken || e.signal) && (c = (d) => {
      !u || (r(!d || d.type ? new _(null, e, u) : d), u.abort(), u = null);
    }, e.cancelToken && e.cancelToken.subscribe(c), e.signal && (e.signal.aborted ? c() : e.signal.addEventListener("abort", c)));
    const m = gt(p);
    if (m && S.protocols.indexOf(m) === -1) {
      r(new h("Unsupported protocol " + m + ":", h.ERR_BAD_REQUEST, e));
      return;
    }
    u.send(s || null);
  });
}
const ce = {
  http: ue,
  xhr: ue
}, le = {
  getAdapter: (e) => {
    if (a.isString(e)) {
      const t = ce[e];
      if (!e)
        throw Error(
          a.hasOwnProp(e) ? `Adapter '${e}' is not available in the build` : `Can not resolve adapter '${e}'`
        );
      return t;
    }
    if (!a.isFunction(e))
      throw new TypeError("adapter is not a function");
    return e;
  },
  adapters: ce
}, Ut = {
  "Content-Type": "application/x-www-form-urlencoded"
};
function Lt() {
  let e;
  return typeof XMLHttpRequest < "u" ? e = le.getAdapter("xhr") : typeof process < "u" && a.kindOf(process) === "process" && (e = le.getAdapter("http")), e;
}
function jt(e, t, n) {
  if (a.isString(e))
    try {
      return (t || JSON.parse)(e), a.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const F = {
  transitional: Ae,
  adapter: Lt(),
  transformRequest: [function(t, n) {
    const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, i = a.isObject(t);
    if (i && a.isHTMLForm(t) && (t = new FormData(t)), a.isFormData(t))
      return s && s ? JSON.stringify(Te(t)) : t;
    if (a.isArrayBuffer(t) || a.isBuffer(t) || a.isStream(t) || a.isFile(t) || a.isBlob(t))
      return t;
    if (a.isArrayBufferView(t))
      return t.buffer;
    if (a.isURLSearchParams(t))
      return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
    let c;
    if (i) {
      if (r.indexOf("application/x-www-form-urlencoded") > -1)
        return yt(t, this.formSerializer).toString();
      if ((c = a.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
        const l = this.env && this.env.FormData;
        return J(
          c ? { "files[]": t } : t,
          l && new l(),
          this.formSerializer
        );
      }
    }
    return i || s ? (n.setContentType("application/json", !1), jt(t)) : t;
  }],
  transformResponse: [function(t) {
    const n = this.transitional || F.transitional, r = n && n.forcedJSONParsing, s = this.responseType === "json";
    if (t && a.isString(t) && (r && !this.responseType || s)) {
      const o = !(n && n.silentJSONParsing) && s;
      try {
        return JSON.parse(t);
      } catch (c) {
        if (o)
          throw c.name === "SyntaxError" ? h.from(c, h.ERR_BAD_RESPONSE, this, null, this.response) : c;
      }
    }
    return t;
  }],
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: S.classes.FormData,
    Blob: S.classes.Blob
  },
  validateStatus: function(t) {
    return t >= 200 && t < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*"
    }
  }
};
a.forEach(["delete", "get", "head"], function(t) {
  F.headers[t] = {};
});
a.forEach(["post", "put", "patch"], function(t) {
  F.headers[t] = a.merge(Ut);
});
function $(e, t) {
  const n = this || F, r = t || n, s = R.from(r.headers);
  let i = r.data;
  return a.forEach(e, function(c) {
    i = c.call(n, i, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), i;
}
function Ne(e) {
  return !!(e && e.__CANCEL__);
}
function W(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new _();
}
function fe(e) {
  return W(e), e.headers = R.from(e.headers), e.data = $.call(
    e,
    e.transformRequest
  ), (e.adapter || F.adapter)(e).then(function(r) {
    return W(e), r.data = $.call(
      e,
      e.transformResponse,
      r
    ), r.headers = R.from(r.headers), r;
  }, function(r) {
    return Ne(r) || (W(e), r && r.response && (r.response.data = $.call(
      e,
      e.transformResponse,
      r.response
    ), r.response.headers = R.from(r.response.headers))), Promise.reject(r);
  });
}
function L(e, t) {
  t = t || {};
  const n = {};
  function r(u, p) {
    return a.isPlainObject(u) && a.isPlainObject(p) ? a.merge(u, p) : a.isPlainObject(p) ? a.merge({}, p) : a.isArray(p) ? p.slice() : p;
  }
  function s(u) {
    if (a.isUndefined(t[u])) {
      if (!a.isUndefined(e[u]))
        return r(void 0, e[u]);
    } else
      return r(e[u], t[u]);
  }
  function i(u) {
    if (!a.isUndefined(t[u]))
      return r(void 0, t[u]);
  }
  function o(u) {
    if (a.isUndefined(t[u])) {
      if (!a.isUndefined(e[u]))
        return r(void 0, e[u]);
    } else
      return r(void 0, t[u]);
  }
  function c(u) {
    if (u in t)
      return r(e[u], t[u]);
    if (u in e)
      return r(void 0, e[u]);
  }
  const l = {
    url: i,
    method: i,
    data: i,
    baseURL: o,
    transformRequest: o,
    transformResponse: o,
    paramsSerializer: o,
    timeout: o,
    timeoutMessage: o,
    withCredentials: o,
    adapter: o,
    responseType: o,
    xsrfCookieName: o,
    xsrfHeaderName: o,
    onUploadProgress: o,
    onDownloadProgress: o,
    decompress: o,
    maxContentLength: o,
    maxBodyLength: o,
    beforeRedirect: o,
    transport: o,
    httpAgent: o,
    httpsAgent: o,
    cancelToken: o,
    socketPath: o,
    responseEncoding: o,
    validateStatus: c
  };
  return a.forEach(Object.keys(e).concat(Object.keys(t)), function(p) {
    const w = l[p] || s, m = w(p);
    a.isUndefined(m) && w !== c || (n[p] = m);
  }), n;
}
const Pe = "1.1.2", v = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  v[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const de = {};
v.transitional = function(t, n, r) {
  function s(i, o) {
    return "[Axios v" + Pe + "] Transitional option '" + i + "'" + o + (r ? ". " + r : "");
  }
  return (i, o, c) => {
    if (t === !1)
      throw new h(
        s(o, " has been removed" + (n ? " in " + n : "")),
        h.ERR_DEPRECATED
      );
    return n && !de[o] && (de[o] = !0, console.warn(
      s(
        o,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(i, o, c) : !0;
  };
};
function _t(e, t, n) {
  if (typeof e != "object")
    throw new h("options must be an object", h.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const i = r[s], o = t[i];
    if (o) {
      const c = e[i], l = c === void 0 || o(c, i, e);
      if (l !== !0)
        throw new h("option " + i + " must be " + l, h.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0)
      throw new h("Unknown option " + i, h.ERR_BAD_OPTION);
  }
}
const Fe = {
  assertOptions: _t,
  validators: v
}, C = Fe.validators;
class T {
  constructor(t) {
    this.defaults = t, this.interceptors = {
      request: new se(),
      response: new se()
    };
  }
  request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = L(this.defaults, n);
    const r = n.transitional;
    r !== void 0 && Fe.assertOptions(r, {
      silentJSONParsing: C.transitional(C.boolean),
      forcedJSONParsing: C.transitional(C.boolean),
      clarifyTimeoutError: C.transitional(C.boolean)
    }, !1), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    const s = n.headers && a.merge(
      n.headers.common,
      n.headers[n.method]
    );
    s && a.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      function(d) {
        delete n.headers[d];
      }
    ), n.headers = new R(n.headers, s);
    const i = [];
    let o = !0;
    this.interceptors.request.forEach(function(d) {
      typeof d.runWhen == "function" && d.runWhen(n) === !1 || (o = o && d.synchronous, i.unshift(d.fulfilled, d.rejected));
    });
    const c = [];
    this.interceptors.response.forEach(function(d) {
      c.push(d.fulfilled, d.rejected);
    });
    let l, u = 0, p;
    if (!o) {
      const m = [fe.bind(this), void 0];
      for (m.unshift.apply(m, i), m.push.apply(m, c), p = m.length, l = Promise.resolve(n); u < p; )
        l = l.then(m[u++], m[u++]);
      return l;
    }
    p = i.length;
    let w = n;
    for (u = 0; u < p; ) {
      const m = i[u++], d = i[u++];
      try {
        w = m(w);
      } catch (f) {
        d.call(this, f);
        break;
      }
    }
    try {
      l = fe.call(this, w);
    } catch (m) {
      return Promise.reject(m);
    }
    for (u = 0, p = c.length; u < p; )
      l = l.then(c[u++], c[u++]);
    return l;
  }
  getUri(t) {
    t = L(this.defaults, t);
    const n = ge(t.baseURL, t.url);
    return xe(n, t.params, t.paramsSerializer);
  }
}
a.forEach(["delete", "get", "head", "options"], function(t) {
  T.prototype[t] = function(n, r) {
    return this.request(L(r || {}, {
      method: t,
      url: n,
      data: (r || {}).data
    }));
  };
});
a.forEach(["post", "put", "patch"], function(t) {
  function n(r) {
    return function(i, o, c) {
      return this.request(L(c || {}, {
        method: t,
        headers: r ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: i,
        data: o
      }));
    };
  }
  T.prototype[t] = n(), T.prototype[t + "Form"] = n(!0);
});
class ee {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function(i) {
      n = i;
    });
    const r = this;
    this.promise.then((s) => {
      if (!r._listeners)
        return;
      let i = r._listeners.length;
      for (; i-- > 0; )
        r._listeners[i](s);
      r._listeners = null;
    }), this.promise.then = (s) => {
      let i;
      const o = new Promise((c) => {
        r.subscribe(c), i = c;
      }).then(s);
      return o.cancel = function() {
        r.unsubscribe(i);
      }, o;
    }, t(function(i, o, c) {
      r.reason || (r.reason = new _(i, o, c), n(r.reason));
    });
  }
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : this._listeners = [t];
  }
  unsubscribe(t) {
    if (!this._listeners)
      return;
    const n = this._listeners.indexOf(t);
    n !== -1 && this._listeners.splice(n, 1);
  }
  static source() {
    let t;
    return {
      token: new ee(function(s) {
        t = s;
      }),
      cancel: t
    };
  }
}
function It(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function kt(e) {
  return a.isObject(e) && e.isAxiosError === !0;
}
function De(e) {
  const t = new T(e), n = he(T.prototype.request, t);
  return a.extend(n, T.prototype, t, { allOwnKeys: !0 }), a.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return De(L(e, s));
  }, n;
}
const y = De(F);
y.Axios = T;
y.CanceledError = _;
y.CancelToken = ee;
y.isCancel = Ne;
y.VERSION = Pe;
y.toFormData = J;
y.AxiosError = h;
y.Cancel = y.CanceledError;
y.all = function(t) {
  return Promise.all(t);
};
y.spread = It;
y.isAxiosError = kt;
y.formToJSON = (e) => Te(a.isHTMLForm(e) ? new FormData(e) : e);
const U = class {
  getAxiosInstance() {
    return U.axiosInstance || (U.axiosInstance = y.create({
      timeout: N.config.timeout,
      headers: {
        "Content-Type": "application/json"
      }
    })), U.axiosInstance;
  }
  request({
    baseURL: t,
    pathURL: n,
    headers: r,
    method: s,
    params: i,
    data: o
  }) {
    return this.getAxiosInstance().request({
      method: s,
      baseURL: t,
      headers: r,
      params: i,
      data: o,
      url: n
    });
  }
  transformResponse(t) {
    return {
      data: t.data,
      statusText: t.statusText,
      status: t.status,
      headers: t.headers
    };
  }
};
let M = U;
I(M, "axiosInstance");
var Be = /* @__PURE__ */ ((e) => (e.before = "before", e.after = "after", e.finally = "finally", e.catch = "catch", e))(Be || {});
const b = class {
  static getInstance() {
    return this.instance ? this.instance : new b();
  }
  getRequestAdapter() {
    if (typeof b.config.adapter == "string")
      switch (b.config.adapter) {
        case "axios":
          return new M();
      }
    if (!b.config.adapter)
      throw new Error("\u8BF7\u68C0\u67E5\u662F\u5426\u914D\u7F6E\u8BF7\u6C42Adatper");
    return b.config.adapter;
  }
  execRequestPlugin(t = [], n) {
    b.config.plugins.forEach(
      (r) => r.before && r.before(n)
    ), t.forEach((r) => r.before && r.before(n));
  }
  execResponsePlugin(t, n = [], r, s) {
    b.config.plugins.forEach(
      (i) => i[t] && i[t](s, r)
    ), n.forEach(
      (i) => i[t] && i[t](s, r)
    );
  }
  startRequest(t, n) {
    return t.request({
      baseURL: b.config.gateway,
      pathURL: n.path,
      params: n.params,
      data: n.data,
      headers: n.headers || {},
      method: n.method
    });
  }
  execInterceptors(t) {
    var s;
    const n = (s = b.config) == null ? void 0 : s.interceptors;
    if (!(n != null && n.status) || !(n != null && n.error) || !(n != null && n.success) || !(n != null && n.exception))
      throw new Error("\u8BF7\u68C0\u67E5\u62E6\u622A\u5668\u914D\u7F6E");
    return n.status.exec(t) ? n.status.exec(t) : n.error.exec(t);
  }
  async send(t, n = []) {
    if (!b.config)
      throw new Error("\u8BF7\u68C0\u67E5\u8BF7\u6C42\u914D\u7F6E\u662F\u5426\u5B8C\u6210");
    const r = this.getRequestAdapter();
    this.execRequestPlugin(n, t);
    const s = await this.startRequest(r, t).catch((i) => {
      var c, l;
      const o = (l = (c = b.config) == null ? void 0 : c.interceptors) == null ? void 0 : l.exception;
      return o && o.exec(r.transformResponse(i)), i;
    }).then(r.transformResponse);
    return this.execResponsePlugin(Be.after, n, t, s), this.execInterceptors(s);
  }
};
let N = b;
I(N, "config"), I(N, "instance");
function Mt(e) {
  N.config = e;
}
export {
  N as RequestService,
  Mt as setup
};
