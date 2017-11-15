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

    new global.App.Router(appRoutes);

})(Function('return this')());
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
(function(global) {

    global.App.Controller('main-layout', '/main-layout/', function($scope, _update) {
        $scope.title = "Main Layout";

        $scope.buttonClicked = function(pageName) {
            global.App.Router().navigateTo(pageName);
        };
    });

})(Function('return this')());