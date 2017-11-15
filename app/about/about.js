(function(global) {

    global.App.Controller('about', '/about/', function($scope, _update) {
        $scope.arr = [];

        var arr = $scope.arr, i, random;

        var interval = function() {
            random = Math.random()*100;
            for(i = 0; i < parseInt(random); i++)
                arr[i] = Math.random();
            if(i < arr.length)
                arr.splice(i, arr.length);
            _update();
            setTimeout(interval, 0);
        };

        interval();
    });

})(Function('return this')());