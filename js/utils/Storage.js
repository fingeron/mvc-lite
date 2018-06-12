(function (global) {

    var Storage = function store(key, value) {
        var data, support;

        function storageAvailable(type) {
            // Use try catch to allow storage to work on private mode
            try {
                var storage = window[type],
                    x = '__storage_test__';
                storage.setItem(x, x);
                storage.removeItem(x);
                return type;
            }
            catch (e) {
                return 'cookie';
            }
        }

        support = storageAvailable('localStorage');
        if (support.localeCompare('cookie') === 0) {
            support = storageAvailable('sessionStorage');
        }
        // If value is detected, set new or modify store
        if (typeof value !== "undefined" && value !== null) {
            // Convert object values to JSON
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            // Set the store
            if (support.localeCompare('localStorage') === 0) {
                localStorage.setItem(key, value);
            } else if (support.localeCompare('sessionStorage') === 0) {
                sessionStorage.setItem(key, value);
            } else {
                createCookie(key, value, 30);
            }
        }

        // No value supplied, return value
        if (typeof value === "undefined") {
            if (support.localeCompare('localStorage') === 0) {
                data = localStorage.getItem(key);
            } else if (support.localeCompare('sessionStorage') === 0) {
                data = sessionStorage.getItem(key);
            } else {
                data = readCookie(key);
            }
            try {
                return JSON.parse(data);
            }
            catch (e) {
                return data;
            }
        }

        // Null specified, remove store
        if (value === null) {
            if (support.localeCompare('localStorage') === 0) {
                setTimeout(function () {
                    localStorage.removeItem(key);
                }, 90);
            } else if (support.localeCompare('sessionStorage') === 0) {
                setTimeout(function () {
                    sessionStorage.removeItem(key);
                }, 90);
            } else {
                createCookie(key, '', -1);
            }
        }

        function createCookie(key, value, exp) {
            var date = new Date();
            date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
            document.cookie = key + "=" + value + expires + "; path=/";
        }

        function readCookie(key) {
            var nameEQ = key + "=";
            var ca = document.cookie.split(';');
            for (var i = 0, max = ca.length; i < max; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Storage = Storage;

})(Function('return this')());