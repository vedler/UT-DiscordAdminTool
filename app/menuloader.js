// app/globalparams.js

module.exports = function (app, passport, path, fs) {

	this.getMenuTemplate = function (pageAction, user) {
        
        switch (pageAction) {
            default:
                return path.join(__dirname, '../', 'views/menus/initialmenu.ejs');
        }
    }

    this.getDefaultMenuData = function(user, next) {
        var data = new Object();
        var menuMainButtons = [];

        console.log("getting list");

        var servers = getDiscordBotServerList();

        console.log("got list: " + servers);

        if (servers) {
            getUserGuilds(user, function (error, guilds) {

                console.log("Got user guilds: " + JSON.stringify(guilds));
                console.log("User stats: " + user);
                console.log("GA: " + user.globalAdmin);

                if (error) {
                    console.error(error);

                    data.menuMainButtons = menuMainButtons;
                    return next(error, data);
                } else {
                    servers.forEach(function (server) {
                        var button = new Object();

                        // Check if user has access to the Guild
                        if (user.globalAdmin || (guilds.hasOwnProperty(server.id) && guilds[server.id] > -1)) {
                            button.targetaction = "joinServer";
                            button.datacontext = server.id;
                            button.textcontent = server.name;

                            menuMainButtons.push(button);
                        }
                    });

                    data.menuMainButtons = menuMainButtons;
                    return next(null, data);
                }
            });
        }
        

        data.menuMainButtons = menuMainButtons;
        return data;
    }

    this.getMenuData = function (pageAction, dataContext, user, next) {

        // TODO: IMPLEMENT ASYNC BEHAVIOUR!!!!

        // Based on pageAction and dataContext, load new data

		var data = new Object();
        var menuMainButtons = [];
        
        switch (pageAction) {

            case 'joinServer':

                if (dataContext == '') {
                    // TODO: Could also append to data here
                    return getDefaultMenuData(user, next);
                }

                var guild = findClientGuild(dataContext);

                console.log("Serv data: " + JSON.stringify(guild));

                // Guild not found
                if (typeof guild === 'undefined') {
                    return getDefaultMenuData(user, next);
                }

                // Check if user has access to this guild
                getUserGuildAccessLevel(user, guild.id, function (err, level) {
                    if (err) {
                        console.error(err);
                        return getDefaultMenuData(user, next)
                    } else {
                        if (user.globalAdmin || level > -1) {
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

                            data.menuMainButtons = menuMainButtons;
                            return next(null, data);
                        } else {
                            return getDefaultMenuData(user, next);
                        }
                    }
                });

                break;
            case 'joinChannel':

                if (dataContext == '') {
                    // TODO: Could also append to data here
                    return getDefaultMenuData(user, next);
                }

                var channel = findClientGuildChannel(dataContext);

                // Guild not found
                if (!channel || channel == undefined) {
                    console.log("Channel " + dataContext + " not found.");
                    return getDefaultMenuData(user, next);
                }

                // Check if user has access to this guild
                getUserGuildAccessLevel(user, channel.guild.id, function (err, level) {
                    if (err) {
                        console.error(err);
                        return getDefaultMenuData(user, next);
                    } else {
                        if (user.globalAdmin || level > -1) {
                            for (var [id, parentChannel] of channel.guild.channels.entries()) {

                                // Text only for now
                                if (parentChannel.type != 'text') {
                                    continue;
                                }

                                var button = new Object();

                                button.targetaction = "joinChannel";
                                button.datacontext = parentChannel.id;

                                // Make the current active channel be bold
                                if (parentChannel.id == channel.id) {
                                    button.textcontent = "<b>#" + parentChannel.name + "</b>";
                                } else {
                                    button.textcontent = "#" + parentChannel.name;
                                }

                                menuMainButtons.push(button);
                            }

                            data.menuMainButtons = menuMainButtons;
                            return next(null, data);
                        } else {
                            return getDefaultMenuData(user, next);
                        }
                    }
                });

                break;
            
            default:
                // Unknown action
                return getDefaultMenuData(user, next);
        }
        
        
		//data.menuMainButtons = menuMainButtons;
		//return data;
	}
}