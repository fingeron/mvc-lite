(function(global) {

    var String = {
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
        toDictionary: function(str, separator, equalizer) {
            if(typeof separator !== 'string')
                separator = ',';
            if(typeof equalizer !== 'string')
                equalizer = ':';
            var entries = str.split(separator),
                matchGroups,
                dic = {};
            entries.forEach(function(entry) {
                var regexp = new RegExp('([\\w-]+)' + equalizer + ' *(.+)');
                matchGroups = regexp.exec(entry.trim());
                if(Array.isArray(matchGroups) && matchGroups.length === 3)
                    dic[matchGroups[1]] = matchGroups[2];
            });
            return dic;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.String = String;

})(Function('return this')());