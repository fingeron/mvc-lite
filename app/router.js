(function(global) {

    var appRoutes = [
        { path: '', redirect: 'home' },
        { path: 'home', controller: 'main-layout' },
        { path: 'about', controller: 'about' }
    ];

    new global.Core.Router(appRoutes);

})(Function('return this')());