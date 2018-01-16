(function(global) {

    var DateFuncs = {
        getCalanderDateString: function(dateObject, separator) {
            var day = dateObject.getDate()+1,
                month = dateObject.getMonth()+1,
                year = dateObject.getFullYear();

            if(day < 10) day = '0' + day;
            if(month < 10) month = '0' + month;
            if(typeof separator === "string")
                return day + separator + month + separator + year;
            else
                return '' + day + month + year;
        },
        getDateString: function(dateObject) {
            var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
                    "Sep", "Oct", "Nov", "Dec"];

            var month = dateObject.getMonth()+1,
                day = dateObject.getDay(),
                date = dateObject.getDate();

            return days[day] + ', ' + months[month-1] + ' ' + date;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Date = DateFuncs;

})(Function('return this')());