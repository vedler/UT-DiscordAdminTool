// app/globalparams.js

module.exports = function (app, passport, path, fs) {

	this.getMenuTemplate = function (pageAction) {
        
        switch (pageAction) {
            default:
                return path.join(__dirname, '../', 'views/menus/initialmenu.ejs');
        }
    }

    this.getDefaultMenuData = function() {
        var data = new Object();
        var menuMainButtons = [];

        console.log("getting list");

        var servers = getDiscordBotServerList();

        console.log("got list: " + servers);

        if (servers) {
            servers.forEach(function(server) {
                var button = new Object();

                button.targetaction = "joinServer";
                button.datacontext = server.id;
                button.textcontent = server.name;

                menuMainButtons.push(button);
            });
        }

        data.menuMainButtons = menuMainButtons;
        return data;
    }

    this.getMenuData = function (pageAction, dataContext) {

        // Based on pageAction and dataContext, load new data

		var data = new Object();
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
		return data;
	}
}