(function(global) {

    global.App.Pipe('split', function(value, data) {
        return value.split(data);
    });

})(Function('return this')());