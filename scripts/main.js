/* Use JavaScript to retrieve and parse user data (list and details) from the PagerDuty demo account.  Then, populate the user list, and add behavior to populate the details on user click.

The following JS Frameworks are readily loaded and available:
* jQuery
* Handlebars
* PDJS API Library (https://github.com/PagerDuty/pdjs)

**You can use any libraries you wish, or none at all.  These are just here for assistance if desired**

Any framework/approach is acceptable, but the [PDJS](https://github.com/PagerDuty/pdjs) library is available and specifically designed to obtain our data.

Full documentation for the API is at https://developer.pagerduty.com/documentation/rest

Potentially helpful endpoints:
* GET /users
* GET /users/:id
* GET /users/:id?include[]=contact_methods

*/

/****** BEGIN HERE *******/

var PDJS = new PDJSobj({
    subdomain: 'webdemo',
    token: 'CkNpsqH9i6yTGus8VDzA',
});

$(document).ready(function() {

    PDJS.api({
        res: 'users',
        data: {
            limit: 20,
        },
        success: function (data) {
            var source = $("#entry-template").html();
            var template = Handlebars.compile(source);
            var context = {users: data.users};
            var html = template(context);
            $("#user__list").append(html);
        }
    });
});


$(document).on('click', '.user', function(e) {
    e.preventDefault();
    var id = $(this).attr('data-id');

    PDJS.api({
        res: 'users/' + id,
        success: function (data) {
            var source = $("#display-template").html();
            var template = Handlebars.compile(source);
            var context = data.user;
            var html = template(context);
            $(".updates").html(html);
        }
    });
});


