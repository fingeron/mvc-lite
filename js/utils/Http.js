(function(global) {

    var permaParams = {}, paramSubscriptions = {};

    var Http = {
        get: function(url, data, callback, errCallback) {
            var xhr = new XMLHttpRequest(),
                options = data.options || {};

            if(typeof data.headers === 'object') {
                for(var header in data.headers) if(data.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, data.headers[header]);
                }
            }

            url += getParamString((data.clean ? {} : permaParams), data.params);

            xhr.open('GET', url, true);

            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4) {
                    if(xhr.status === 200)
                        handleResponse(options.plainText ? xhr.responseText : JSON.parse(xhr.responseText), callback);
                    else if(typeof errCallback === 'function')
                        errCallback(xhr.responseText);
                }
            };
            xhr.send();
        },
        post: function(url, data, callback, errCallback) {
            var xhr = new XMLHttpRequest();

            url += getParamString(permaParams, data.params);

            xhr.open('POST', url, true);

            // analyse request data
            if(typeof data.headers === 'object') {
                for(var header in data.headers) if(data.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, data.headers[header]);
                }
            }

            // analyse request body
            data = data.body;

            if(typeof data === 'object')
                xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4) {
                    var response = JSON.parse(xhr.responseText);
                    if(xhr.status === 200)
                        handleResponse(response, callback);
                    else if(typeof errCallback === 'function')
                        errCallback(response);
                }
            };
            xhr.send(JSON.stringify(data));
        },

        updatePermaParam: function(key, value) {
            if(typeof value === 'undefined')
                delete permaParams[key];
            else
                permaParams[key] = value;
        },

        subscribeToResponseParam: function(param, listener) {
            if(!(paramSubscriptions[param] instanceof global.Utils.Observable))
                paramSubscriptions[param] = new global.Utils.Observable();

            return paramSubscriptions[param].subscribe(listener);
        }
    };

    function handleResponse(response, callback) {
        for(var param in paramSubscriptions)
            if(paramSubscriptions.hasOwnProperty(param))
                if(response.hasOwnProperty(param))
                    paramSubscriptions[param].next(response[param]);
        callback(response);
    }

    function getParamString() {
        var params = {};
        for(var i = 0; i < arguments.length; i++) {
            var paramsObj = arguments[i];
            for(var p in paramsObj) if(paramsObj.hasOwnProperty(p))
                params[p] = paramsObj[p];
        }

        var paramString;
        for(var param in params) if(params.hasOwnProperty(param)) {
            if(!paramString) paramString = '?';
            switch(typeof params[param]) {
                case 'object':
                    if(Array.isArray(params[param]))
                        for(var a = 0; a < params[param].length; a++)
                            paramString += (param + '=' + params[param][a] + '&');
                    break;
                default:
                    paramString += (param + '=' + params[param] + '&');
                    break;
            }
        }

        return (paramString && paramString.substr(0, paramString.length-1) || '');
    }

    global.Utils = global.Utils || {};
    global.Utils.Http = Http;

})(Function('return this')());