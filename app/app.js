(function(global) {

    global.App.Controller('app', './', function($scope, _update) {
        $scope.title = "App works!";

        setTimeout(function() {
            $scope.title = "Hello World!";
            _update();
        }, 3000)
    });

})(Function('return this')());