(function(global) {

    global.App.Controller('app', './', function($scope, _update) {
        $scope.title = "App works!";

        $scope.buttonClicked = function(text) {
            console.log(text);
        };
    });

})(Function('return this')());
(function(global) {

    global.App.Model('User', function(dataCallback) {
        dataCallback(5);
    });

})(Function('return this')());