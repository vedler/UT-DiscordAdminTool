// app/maincontentloader.js

module.exports = function (app, passport, path, fs) {

    this.getMainContentTemplate = function (pageAction) {

        switch (pageAction) {
            case 'joinChannel':
                return path.join(__dirname, '../', 'views/mains/textchat.ejs');
            default:
                return '';
        }
    }

    this.returnEmptyPromise = function () {
        return new Promise(function (resolve, reject) {
            resolve([]);
        });
    }

    this.getMainContentData = function (pageAction, dataContext) {

        // Based on pageAction and dataContext, load new data
        if (pageAction == 'joinChannel') {
            return fetchMessages(dataContext);
        } else {
            return returnEmptyPromise();
        }

        
        
        /*
        if (pageAction == 'joinChannel') {
            var data = new Object();
            var chatMessages = [];

            for (var i = 0; i < 8; i++) {
                chatMessages[i].sender = "vedler" + i;
                chatMessages[i].message = "See on üks hea pikk test message." + i;
            }

            data.chatMessages = chatMessages;
            return data;
        } else {
            return getDefaultMenuData();
        }*/

        
        /*var data = new Object();
        var menuMainButtons = [];

        switch (pageAction) {

            case 'joinServer':

                if (dataContext == '') {
                    // TODO: Could also append to data here
                    return getDefaultMenuData();
                }

                var guild = findClientGuild(dataContext);

                // Guild not found
                if (typeof guild === 'undefined') {
                    return getDefaultMenuData();
                }

                for (var [id, channel] of guild.channels.entries()) {

                    // Text only for now
                    if (channel.type != 'text') {
                        continue;
                    }

                    var button = new Object();

                    button.targetaction = "joinChannel";
                    button.datacontext = channel.id;
                    button.textcontent = "#" + channel.name;

                    menuMainButtons.push(button);
                }

                break;
            case 'joinChannel':
                // TODO
                return getDefaultMenuData();
            //break;

            default:
                // Unknown action
                return getDefaultMenuData();
        }


        data.menuMainButtons = menuMainButtons;
        return data;*/
    }
}