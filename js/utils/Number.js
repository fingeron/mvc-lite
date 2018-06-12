(function(global) {

    var Number = {
        random: function(from, to) {
            return from+(parseInt(Math.random()*(to-from+1)));
        },
        humanize: function(num, options) {
            var zeroes = 0,
                prefix = options.prefix || '',
                suffix;

            while(parseInt(num / 1000) !== 0) {
                num /= 1000;
                zeroes += 3;
            }
            if(zeroes === 3) suffix = options.shortSuffix ? 'K' : ' Thousands';
            else if(zeroes === 6) suffix = options.shortSuffix ? 'M' : ' Million';
            else if(zeroes === 9) suffix = options.shortSuffix ? 'B' : ' Billion';
            else suffix = '';

            return prefix + num + suffix;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Number = Number;

})(Function('return this')());