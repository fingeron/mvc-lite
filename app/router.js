(function(global) {

    var appRoutes = [
        { path: '', redirect: 'home' },
        { path: 'home', controller: 'main-layout' }
    ];

    new global.App.Router(appRoutes);

})(Function('return this')());