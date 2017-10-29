(function(global) {

    global.App.Controller('main-layout', '/main-layout/', function($scope, _update) {
        $scope.title = "Main Layout";

        $scope.buttonClicked = function(pageName) {
            global.App.Router().navigateTo(pageName);
        };
    });

})(Function('return this')());