(function(global) {

    var app = global.App.Bootstrap('app');

    var btn = document.getElementById('appButton');
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(app);
    })

})(Function('return this')());