(function(global) {

    global.App.Controller('app', './', function($scope, _update) {
        $scope.arr = [1, 2, 3, 4, 5];
        $scope.title = "Hello World!";
        $scope.bool = true;

        setTimeout(function() {
            $scope.title = "What's up";
            $scope.arr.push(7);
            console.log("UPDATE");
            _update();
        }, 7000);
    });

})(Function('return this')());