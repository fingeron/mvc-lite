(function(global) {

    global.App.Controller('test', './test/', function($scope, _update) {
        $scope.text = "TEST";

        setTimeout(function() {
            $scope.text = "UPDATED TEST";
            _update();
        }, 3000);
    });

})(Function('return this')());