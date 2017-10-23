(function(global) {

    var Http = {
        get: function(url, data, callback) {
            var xhr = new XMLHttpRequest();

            if(typeof data.headers === 'object') {
                for(var header in data.headers) if(data.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, data.headers[header]);
                }
            }
            if(typeof data.params === 'object') {
                var urlParams = '?';
                for(var param in data.params) if(data.params.hasOwnProperty(param)) {
                    urlParams += param + '=' + data.params[param] + '&';
                }
                url += urlParams;
            }

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
            xhr.open('POST', url, true);

            // analyse request data
            if(typeof data.headers === 'object') {
                for(var header in data.headers) if(data.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, data.headers[header]);
                }
            }

            if (typeof data.body === 'object') {
                data = data.body;
            }

            xhr.onreadystatechange = function() {
                if(xhr.status === 200 && xhr.readyState === 4) {
                    callback(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(JSON.stringify(data));
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Http = Http;

})(Function('return this')());