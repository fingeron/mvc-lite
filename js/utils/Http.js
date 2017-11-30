(function(global) {

    var permaParams = {};

    var Http = {
        get: function(url, data, callback) {
            var xhr = new XMLHttpRequest();

            if(typeof data.headers === 'object') {
                for(var header in data.headers) if(data.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, data.headers[header]);
                }
            }

            url += getParamString(permaParams, data.params);

            xhr.open('GET', url, true);

            xhr.onreadystatechange = function() {
                if(xhr.status === 200 && xhr.readyState === 4) {
                    callback(JSON.parse(xhr.responseText));
                }
            };
            xhr.send();
        },
        post: function(url, data, callback) {
            var xhr = new XMLHttpRequest();

            url += getParamString(permaParams, data.params);

            xhr.open('POST', url, true);

            // analyse request data
            if(typeof data.headers === 'object') {
                for(var header in data.headers) if(data.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, data.headers[header]);
                }
            }
            if(typeof data.body === 'object') {
                data = data.body;
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            xhr.onreadystatechange = function() {
                if(xhr.status === 200 && xhr.readyState === 4) {
                    callback(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(JSON.stringify(data));
        },
        updatePermaParam: function(key, value) {
            if(typeof value === 'undefined')
                delete permaParams[key];
            else
                permaParams[key] = value;
        }
    };

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