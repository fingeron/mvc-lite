(function(global) {

    global.App.Controller('app', './', function($scope, _update) {
        $scope.title = "App works!";

        setTimeout(function() {
            $scope.title = "Hello World!";
            _update();
        }, 3000)
    });

})(Function('return this')());
(function(global) {

    var appRoutes = [
        { path: '', redirect: 'home' },
        { path: 'home', controller: 'main-layout' },
        { path: 'about', controller: 'about' }
    ];

    new global.Core.Router(appRoutes);

})(Function('return this')());
(function(global) {

    global.App.Controller('about', '/about/', function($scope, _update) {
        $scope.buttonClicked = function(pageName) {
            global.Core.Router().navigateTo(pageName);
        };
    });

})(Function('return this')());
(function(global) {

    global.App.Controller('main-layout', '/main-layout/', function($scope, _update) {
        $scope.title = "Main Layout";

        $scope.buttonClicked = function(pageName) {
            global.Core.Router().navigateTo(pageName); 
        };
    });

})(Function('return this')());