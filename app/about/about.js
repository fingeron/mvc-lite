(function(global) {

    global.App.Controller('about', '/about/', function($scope, _update) {
        $scope.buttonClicked = function(pageName) {
            global.App.Router().navigateTo(pageName);
        };
    });

})(Function('return this')());