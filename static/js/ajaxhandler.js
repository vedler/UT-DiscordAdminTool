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

            var page_action = event.getState('page_action');
            var data_context = event.getState('data_context');

            if (!page_action || !data_context) {
                parameters = {
                    pageAction: 'asd',
                    dataContext: ''
                };
            } else {
                parameters = {
                    pageAction: event.getState('page_action'),
                    dataContext: event.getState('data_context')
                };
            }

            
        }

        var ajaxResult = new Object();

        $.get('/ajax-get-menu', parameters, function (result) {
            var html = ejs.render(result.template, result.data);

            $('.discordat-menubuttons-container').html(html);
        });

       /* $.get(ajaxResult.templatePath, function (template) {
            var html = ejs.render(template, ajaxResult.data);

            $('.discordat-menubuttons-container').html(html);
        });
        */
        /*$.ajax({
            type: 'GET',
            url: '/ajax-get-menu',
            success: function (result) {

                
                
                //var html = new EJS({ url: result.templatePath }).render(result.data);
                //$('.discordat-menubuttons-container').html(html);
            }
        });*/

        $('.discordat-menu-loading').hide();
    })

    // Since the event is only triggered when the hash changes, we need to trigger
    // the event now, to handle the hash the page may have loaded with.
    $(window).trigger('hashchange');
});
