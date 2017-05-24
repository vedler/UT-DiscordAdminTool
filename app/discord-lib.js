module.exports = function(app, Discord, bot, io) {

    bot.on("disconnected", function() {
        console.log("Bot disconnected!");
    });

    this.getDiscordBotServerList = function() {
        console.log("getservs");

        return Array.from(bot.guilds.values());
    }

    this.findClientGuild = function(gId) {
        if (!bot.guilds.has(gId)) {
            return null;
        }

        return bot.guilds.get(gId);
    }

    this.findClientGuildChannel = function (chId) {

        // We need to get the channel from guilds, because we need the GuildChannel subclass object

        for (var [id, guild] of bot.guilds.entries()) {

            for (var [cid, channel] of guild.channels.entries()) {
                if (cid == chId && channel.type == 'text') {
                    return channel;
                }
            }
        }

        return null;
    }

    this.fetchMessages = function (channelId) {

        console.log("Fecthin channel messages: " + channelId);

        var channel = findClientGuildChannel(channelId);

        if (channel == null) {
            return returnEmptyPromise();
        }
        
        console.log("msg ch: " + channel);

        if (channel.type != 'text') {
            console.log("not txt ch");
            return returnEmptyPromise();
        }

        // return the message promise
        return channel.fetchMessages({ limit: 10 });
    }

    bot.on("message", function(msg) {

        console.log("sending message: " + msg.content);
        
        // Broadcast to all.
        io.sockets.emit('recMessage', msg.channel.id);
    });

    bot.on("messageUpdate", (oldMessage, newMessage) => {
        //checkMessageForCommand(newMessage, true);
    });

    //Log user status changes
    bot.on("presence", function(user, status, gameId) {
        //if(status === "online"){
        //console.log("presence update");
        console.log(user + " went " + status);
        //}
        /*try {
            if (status != 'offline') {
                if (messagebox.hasOwnProperty(user.id)) {
                    console.log("found message for " + user.id);
                    var message = messagebox[user.id];
                    var channel = bot.channels.get("id", message.channel);
                    delete messagebox[user.id];
                    updateMessagebox();
                    bot.sendMessage(channel, message.content);
                }
            }
        } catch (e) { }*/
    });

};