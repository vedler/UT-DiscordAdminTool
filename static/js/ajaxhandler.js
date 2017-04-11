$(function () {
    $('.discord-at-dynbutton').on('click', function (event) {
        // TODO: Possibly more data details, i.e. page context, button type, button detail data (nested json?)

        var state = {
            page_action: 'asd',
            data_context: $(event.target).data('context')
        };

        $.bbq.pushState(state);
    });

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
                pageAction: 'asd',
                dataContext: ''
            };
        } else {
            // Ajax request from params
            parameters = {
                pageAction: event.getState('page_action'),
                dataContext: event.getState('data_context')
            };
        }

        $.get('/ajax-get-menu', parameters, function (data) {
            $('.discordat-menubuttons-container').html(data);
        });

        $('.discordat-menu-loading').hide();
    })

    // Since the event is only triggered when the hash changes, we need to trigger
    // the event now, to handle the hash the page may have loaded with.
    $(window).trigger('hashchange');
});
