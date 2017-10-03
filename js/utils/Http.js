(function(global) {

    var Http = {
        get: function(url, params, callback) {
            if(typeof params === 'object') {
                var urlParams = '?';
                for(var param in params) if(params.hasOwnProperty(param)) {
                    urlParams += param + '=' + params[param] + '&';
                }
                url += urlParams;
            }

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if(xhr.status === 200 && xhr.readyState === 4) {
                    callback(JSON.parse(xhr.responseText));
                }
            };
            xhr.send();
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Http = Http;

})(Function('return this')());