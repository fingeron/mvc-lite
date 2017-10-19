(function(global) {

    global.App.Controller('test', './test/', function($scope, _update) {
        $scope.getInput('text');
    });

})(Function('return this')());