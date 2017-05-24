$(function () {
    
    $('.dat-servaccess-form').submit(function (e) {
        // add script to ejs
        $.ajax({
            type: "POST",
            url: "/add-guild-access",
            data: $(this).serialize(),
            success: function (data) {

                if (data.hasOwnProperty('error')) {
                    alert("Error while trying to process perm grant: " + data.error);
                } else {
                    alert("User " + data.access.userId + " successfully added to Guild " + data.access.guildId + " with perm level " + data.access.level + ".");
                }
            }
        });

        e.preventDefault(); // avoid to execute the actual submit of the form.
    });
});