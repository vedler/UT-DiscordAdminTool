$(function () {
    $('.dat-servmsg-form').submit(function (e) {

        try {
            $.ajax({
                type: "POST",
                url: "/send-chat-message",
                data: $(this).serialize(),
                success: function (data) {
                    console.log(data);
                }
            });

            var parameters = {
                pageAction: sessionStorage['contextPageAction'],
                dataContext: sessionStorage['contextDataContext']
            };

            UpdateMessages(parameters);
        } catch (ex) {
            alert('An unexpected error occured: ' + ex);
        }

        return false;
    });

    var UpdateMessages = function (parameters) {
        $.get('/ajax-get-maincontent', parameters, function (result) {

            if (result.template == '') {
                $('#dat-chat-text-ajax').html('');
                return;
            }

            var html = ejs.render(result.template, result.data);

            $('#dat-chat-text-ajax').html(html);
            $("#dat-text-scroller").stop().animate({
                scrollTop: $("#dat-text-scroller")[0].scrollHeight
            }, 800);
        });
    }
});