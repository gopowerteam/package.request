"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AxiosAdapter: () => AxiosAdapter,
  PluginLifecycle: () => PluginLifecycle,
  RequestMethod: () => RequestMethod,
  RequestService: () => RequestService,
  setup: () => setup
});
module.exports = __toCommonJS(src_exports);

// src/adapters/axios.adapter.ts
var import_axios = __toESM(require("axios"), 1);
var _AxiosAdapter = class {
  getAxiosInstance() {
    if (!_AxiosAdapter.axiosInstance) {
      _AxiosAdapter.axiosInstance = import_axios.default.create({
        timeout: RequestService.config.timeout,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    return _AxiosAdapter.axiosInstance;
  }
  request({
    baseURL,
    pathURL,
    headers,
    method,
    paramsQuery,
    paramsBody
  }) {
    const axiosInstance = this.getAxiosInstance();
    return axiosInstance.request({
      method,
      baseURL,
      headers,
      params: paramsQuery,
      data: paramsBody,
      url: pathURL
    });
  }
  transformResponse(response) {
    return {
      data: response.data,
      statusText: response.statusText,
      status: response.status,
      headers: response.headers
    };
  }
};
var AxiosAdapter = _AxiosAdapter;
__publicField(AxiosAdapter, "axiosInstance");

// src/interfaces/request-plugin.interface.ts
var PluginLifecycle = /* @__PURE__ */ ((PluginLifecycle2) => {
  PluginLifecycle2["before"] = "before";
  PluginLifecycle2["after"] = "after";
  PluginLifecycle2["catch"] = "catch";
  return PluginLifecycle2;
})(PluginLifecycle || {});

// src/request-service.ts
var _RequestService = class {
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    return new _RequestService();
  }
  getRequestAdapter() {
    if (typeof _RequestService.config.adapter === "string") {
      switch (_RequestService.config.adapter) {
        case "axios":
          return new AxiosAdapter();
      }
    }
    if (!_RequestService.config.adapter) {
      throw new Error("\u8BF7\u68C0\u67E5\u662F\u5426\u914D\u7F6E\u8BF7\u6C42Adatper");
    }
    return _RequestService.config.adapter;
  }
  execRequestPlugin(plugins = [], options) {
    _RequestService.config.plugins.forEach(
      (service) => service.before && service.before(options)
    );
    plugins.forEach((service) => service.before && service.before(options));
  }
  execResponsePlugin(leftcycle, plugins = [], options, response) {
    plugins.forEach(
      (plugin) => plugin[leftcycle] && plugin[leftcycle](response, options)
    );
    _RequestService.config.plugins.forEach(
      (plugin) => plugin[leftcycle] && plugin[leftcycle](response, options)
    );
  }
  parseRequestPath(path, paramsPath) {
    if (paramsPath) {
      return Object.entries(paramsPath).reduce(
        (r, [key, value]) => r.replace(`{${key}}`, value.toString()),
        path
      );
    } else {
      return path;
    }
  }
  startRequest(adapter, options) {
    return adapter.request({
      baseURL: _RequestService.config.gateway,
      pathURL: this.parseRequestPath(options.path, options.paramsPath),
      method: options.method,
      headers: options.headers || {},
      paramsQuery: options.paramsQuery,
      paramsBody: options.paramsBody
    });
  }
  execInterceptors(response, hasException = false) {
    var _a;
    const interceptors = (_a = _RequestService.config) == null ? void 0 : _a.interceptors;
    if (!(interceptors == null ? void 0 : interceptors.status) || !(interceptors == null ? void 0 : interceptors.error) || !(interceptors == null ? void 0 : interceptors.success) || !(interceptors == null ? void 0 : interceptors.exception)) {
      throw new Error("\u8BF7\u68C0\u67E5\u62E6\u622A\u5668\u914D\u7F6E");
    }
    const status = interceptors.status.exec(response) && !hasException;
    if (hasException) {
      interceptors.exception.exec(response);
    }
    if (status) {
      return Promise.resolve(interceptors.success.exec(response));
    } else {
      return Promise.reject(interceptors.error.exec(response));
    }
  }
  async send(options, plugins = []) {
    if (!_RequestService.config) {
      throw new Error("\u8BF7\u68C0\u67E5\u8BF7\u6C42\u914D\u7F6E\u662F\u5426\u5B8C\u6210");
    }
    let hasException = false;
    const adapter = this.getRequestAdapter();
    this.execRequestPlugin(plugins, options);
    const response = await this.startRequest(adapter, options).catch((...response2) => {
      hasException = true;
      return response2;
    }).then((response2) => adapter.transformResponse(response2));
    if (!hasException) {
      this.execResponsePlugin("after" /* after */, plugins, options, response);
    } else {
      this.execResponsePlugin("catch" /* catch */, plugins, options, response);
    }
    return this.execInterceptors(response, hasException);
  }
};
var RequestService = _RequestService;
__publicField(RequestService, "config");
__publicField(RequestService, "instance");

// src/request-setup.ts
function setup(config) {
  RequestService.config = config;
}

// src/interfaces/request-send.interface.ts
var RequestMethod = /* @__PURE__ */ ((RequestMethod2) => {
  RequestMethod2["Get"] = "GET";
  RequestMethod2["Post"] = "POST";
  RequestMethod2["Put"] = "PUT";
  RequestMethod2["Delete"] = "DELETE";
  RequestMethod2["Options"] = "OPTIONS";
  RequestMethod2["Head"] = "HEAD";
  RequestMethod2["Patch"] = "PATCH";
  return RequestMethod2;
})(RequestMethod || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AxiosAdapter,
  PluginLifecycle,
  RequestMethod,
  RequestService,
  setup
});
