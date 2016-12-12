// see https://github.com/eurica/pdjs for docs and examples
(function() {
  window.PDJSobj = (function() {
    PDJSobj.version = "PDJS-0.5.0";

    PDJSobj.prototype.logg = function(str) {
      if (this.logging) {
        return console.log(str);
      }
    };

    PDJSobj.prototype.req = function() {
      return this.req_count++;
    };

    function PDJSobj(params) {
      var _ref;
      if (params == null) {
        params = {};
      }
      this.subdomain = params.subdomain;
      this.async = (_ref = params.async === false) != null ? _ref : {
        "false": true
      };
      this.token = params.token;
      this.refresh = params.refresh || 60;
      this.refresh_in_ms = this.refresh * 1000;
      this.protocol = params.protocol || "https";
      this.server = params.server || "pagerduty.com";
      this.logging = params.logging || false;
      this.req_count = 1;
      this.api_version = "v1";
      this.logg("Initializing PDJSobj");
    }

    PDJSobj.prototype.no_success_function = function(json, callerparams) {
      this.logg("no success function defined for " + callerparams.res);
      return this.logg(json);
    };

    PDJSobj.prototype.error_function = function(err, callerparams) {
      var anyerror, error_detail;
      console.log("Error for " + callerparams.res);
      console.log(err.status);
      error_detail = err.responseText;
      try {
        error_detail = JSON.parse(error_detail);
      } catch (_error) {
        anyerror = _error;
        this.logg("Not an JSON error");
      }
      return console.log(error_detail);
    };

    PDJSobj.prototype.api = function(params) {
      if (params == null) {
        params = {};
      }
      this.logg("Call to API: " + params.res);
      params.url = params.url || this.protocol + "://" + this.subdomain + "." + this.server + "/api/" + this.api_version + "/" + params.res;
      params.attempt = params.attempt || 0;
      params.async = params.async || this.async;
      params.headers = params.headers || {};
      params.contentType = "application/json; charset=utf-8";
      params.dataType = "json";
      params.data = params.data || {};
      params.data.PDJSversion = PDJSobj.version;
      params.data.request_count = this.req();
      params.data.attempt = params.attempt++;
      this.logg("params.data:");
      this.logg(params.data);
      params.type = (params.type || "GET").toUpperCase();
      if (params.type === "POST" || params.type === "PUT") {
        params.data = JSON.stringify(params.data);
      }
      params.headers.Authorization = 'Token token=' + this.token;
      params.error = params.error || (function(_this) {
        return function(err) {
          return _this.error_function(err, params);
        };
      })(this);
      params.success = params.success || (function(_this) {
        return function(data) {
          return _this.no_success_function(data, params);
        };
      })(this);
      this.logg(params);
      return $.ajax(params);
    };

    PDJSobj.prototype.api_all = function(params, datasofar) {
      if (params == null) {
        params = {};
      }
      if (datasofar == null) {
        datasofar = [];
      }
      params.data = params.data || {};
      params.data.limit = 100;
      params.data.offset = params.data.offset || 0;
      params.final_success = params.final_success || (function(_this) {
        return function(data) {
          return _this.no_success_function(data, params);
        };
      })(this);
      params.incremental_success = params.incremental_success || (function(_this) {
        return function(data) {
          return 0;
        };
      })(this);
      params.success = (function(_this) {
        return function(data) {
          data.res = params.res;
          params.incremental_success(data[params.res]);
          datasofar = datasofar.concat(data[params.res]);
          window.datasofar = datasofar;
          window.d = data;
          if (data.total > data.limit + data.offset) {
            _this.logg("Getting more");
            params.data.offset += params.data.limit;
            return _this.api_all(params, datasofar);
          } else {
            _this.logg("All done");
            _this.logg(params);
            data[params.res] = datasofar;
            data.res = params.res;
            data.offset = 0;
            data.limit = data.total;
            _this.logg(data);
            return params.final_success(data);
          }
        };
      })(this);
      this.logg(params);
      return this.api(params);
    };

    PDJSobj.prototype.event = function(params) {
      if (params == null) {
        params = {};
      }
      this.logg("Create an event");
      params.type = "POST";
      params.url = params.url || this.protocol + "://events." + this.server + "/generic/2010-04-15/create_event.json";
      params.data = params.data || {};
      params.data.service_key = params.data.service_key || params.service_key || this.logg("No service key");
      params.data.event_type = params.data.event_type || params.event_type || "trigger";
      params.data.incident_key = params.data.incident_key || params.incident_key || "Please specify an incident_key";
      if (params.client) {
        params.data.client = params.data.client || params.client;
      }
      if (params.client_url) {
        params.data.client_url = params.data.client_url || params.client_url;
      }
      params.data.description = params.data.description || params.description || "No description provided";
      params.data.details = params.data.details || params.details || {};
      params.data.contexts = params.data.contexts || params.contexts || {};
      params.data = JSON.stringify(params.data);
      params.contentType = "application/json; charset=utf-8";
      params.dataType = "json";
      params.error = params.error || (function(_this) {
        return function(err) {
          return _this.error_function(err, params);
        };
      })(this);
      params.success = params.success || (function(_this) {
        return function(data) {
          return _this.no_success_function(data, params);
        };
      })(this);
      return $.ajax(params);
    };

    PDJSobj.prototype.trigger = function(params) {
      if (params == null) {
        params = {};
      }
      params.event_type = "trigger";
      return this.event(params);
    };

    PDJSobj.prototype.acknowledge = function(params) {
      if (params == null) {
        params = {};
      }
      params.event_type = "acknowledge";
      return this.event(params);
    };

    PDJSobj.prototype.resolve = function(params) {
      if (params == null) {
        params = {};
      }
      params.event_type = "resolve";
      return this.event(params);
    };

    return PDJSobj;

  })();

}).call(this);
