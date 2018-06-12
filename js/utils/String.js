(function(global) {

    if (typeof String.prototype.format !== 'function') {
        String.prototype.format = function () {
            var args = arguments[0] instanceof Array ? arguments[0] : arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }

    var _String = {
        // "name: Tal, city: Or Yehuda" ---> [{key: name, value: Tal}, {key: city, value: "Or Yehuda"}]
        toKeyValueArray: function(str, separator) {
            if(typeof separator !== 'string')
                separator = ',';
            var entries = str.split(separator),
                matchGroups,
                arr = [];
            entries.forEach(function(entry) {
                matchGroups = (/([\w-]+): *(.+)/g).exec(entry.trim());
                arr.push({
                    key: matchGroups[1],
                    value: matchGroups[2]
                });
            });
            return arr;
        },
        toDictionary: function(str, separator, equalizer, regexr) {
            if(typeof separator !== 'string')
                separator = ',';
            if(typeof equalizer !== 'string')
                equalizer = ':';

            var entries = regexr ? str.split(regexr) : str.split(separator),
                matchGroups,
                dic = {};

            // Clean empty default matches
            for(var e = 0; e < entries.length; e++) {
                if(entries[e].length === 0)
                    entries.splice(e--, 1);
                else
                    entries[e] = entries[e].trim();
            }

            entries.forEach(function(entry) {
                var regexp = new RegExp('([\\w-]+)' + equalizer + ' *(.+)');
                matchGroups = regexp.exec(entry.trim());
                if(Array.isArray(matchGroups) && matchGroups.length === 3)
                    dic[matchGroups[1]] = matchGroups[2];
            });
            return dic;
        },
        numberSeparator: function(value, separator) {
            var parts = value.toString().split('.'),
                number = parseInt(parts[0].replace(/[^\d]/g, ''));

            if(typeof separator === 'undefined')
                separator = ',';

            var reverseNumber = getReverseString(number.toString());

            var regexp = new RegExp(/(\d)(\d)(\d)(\d)/);

            while(regexp.test(reverseNumber))
                reverseNumber = reverseNumber.replace(regexp, appendComma);

            value = getReverseString(reverseNumber) + (parts.length > 1 ? '.' + parts[1] : '');

            return value;

            function appendComma(match, p1, p2, p3, p4) {
                return p1 + p2 + p3 + separator + p4;
            }

            function getReverseString(str) {
                var reverse = '';
                for(var i = str.length-1; i >= 0; i--)
                    reverse += str[i];
                return reverse;
            }
        }
    };

    var RegExr = {
        email: new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'),
    };

    global.Utils = global.Utils || {};
    global.Utils.String = _String;
    global.Utils.RegExp = RegExr;

})(Function('return this')());