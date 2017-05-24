$(function () {
    // UNUSED
    $('.discord-at-dynbutton').on('click', function (event) {
        // TODO: Possibly more data details, i.e. page context, button type, button detail data (nested json?)

        var hashstuff = $.deparam(event.fragment, true);
        console.log(hashstuff);

        var state = {
            page_action: hashstuff.page_action,
            data_context: hashstuff.data_context,
            context_additional: $(event.target).data('context')
        };

        $.bbq.pushState(state);
    });

    //$('.dat-input-button').on('click', function (event) {
    //    var text = $('.dat-input-button').val();

    //    console.log("ayy: " + text);
    //});

    $('.dat-servmsg-form').submit(function (e) {

        $.ajax({
            type: "POST",
            url: "/send-chat-message",
            data: $(this).serialize(),
            success: function (data) {

                /*if (data.hasOwnProperty('error')) {
                    //alert("Error while sending msg: " + data.error);
                } else {
                    alert("Message sent!");
                }*/
                console.log(data);
            }
        });
        //e.stopImmediatePropagation();
        //e.preventDefault(); // avoid to execute the actual submit of the form.

        var parameters = {
            pageAction: sessionStorage['contextPageAction'],
            dataContext: sessionStorage['contextDataContext']
        };

        //UpdateMessages(parameters);

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

    // Bind an event to window.onhashchange that, when the history state changes,
    // gets the url from the hash and displays either our cached content or fetches
    // new content to be displayed.
    $(window).bind('hashchange', function (event) {

        // Get the hash (fragment) as a string, with any leading # removed.
        var hashParams = event.fragment;

        $('.discordat-menu-loading').show();

        var parameters = {};

        // Load the defaults
        if (hashParams == '') {
            parameters = {
                pageAction: '',
                dataContext: ''
            };
        } else {
            // Ajax request from params

            var page_action = event.getState('page_action');
            var data_context = event.getState('data_context');

            if (!page_action || !data_context) {
                parameters = {
                    pageAction: '',
                    dataContext: ''
                };
            } else {
                parameters = {
                    pageAction: event.getState('page_action'),
                    dataContext: event.getState('data_context')
                };
            }
        }

        sessionStorage['contextPageAction'] = parameters.pageAction;
        sessionStorage['contextDataContext'] = parameters.dataContext;

        $.get('/ajax-get-menu', parameters, function (result) {
            var html = ejs.render(result.template, result.data);

            $('.discordat-menubuttons-container').html(html);
        });

        UpdateMessages(parameters);

        $('.discordat-menu-loading').hide();
    })

    var socket = io.connect('http://utdiscord.localhost:8000');

    socket.on('connect', function () {
        console.log('socket connected');
    });

    socket.on('recMessage', function (channelId) {
        console.log("rec: " + channelId);
        console.log("ses: " + sessionStorage['contextPageAction']);
        console.log("ses: " + sessionStorage['contextDataContext']);
        
        if (sessionStorage['contextPageAction'] && sessionStorage['contextDataContext'] &&
            sessionStorage['contextPageAction'] == 'joinChannel' &&
            sessionStorage['contextDataContext'] == channelId) {

            var parameters = {
                pageAction: sessionStorage['contextPageAction'],
                dataContext: sessionStorage['contextDataContext']
            };

            UpdateMessages(parameters);
        }
    });

    // Since the event is only triggered when the hash changes, we need to trigger
    // the event now, to handle the hash the page may have loaded with.
    $(window).trigger('hashchange');
});
