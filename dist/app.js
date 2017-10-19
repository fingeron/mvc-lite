(function(global) {

    global.App.Controller('app', './', function($scope, _update) {
        $scope.title = "App works!";

        $scope.buttonClicked = function(text) {
            console.log(text);
        };

        setTimeout(function() {
            $scope.title = "Hello World!";
            _update();
        }, 3000)
    });

})(Function('return this')());
(function(global) {

    global.App.Controller('test', './test/', function($scope, _update) {
        $scope.getInput('text');
    });

})(Function('return this')());