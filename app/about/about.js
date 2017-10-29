(function(global) {

    global.App.Controller('about', '/about/', function($scope, _update) {
        $scope.buttonClicked = function(pageName) {
            global.Core.Router().navigateTo(pageName);
        };
    });

})(Function('return this')());