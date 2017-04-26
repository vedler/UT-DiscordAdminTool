module.exports = function(app, Discord, bot) {

    bot.on("disconnected", function() {
        console.log("Bot disconnected!");
    });

    this.getDiscordBotServerList = function() {
        console.log("getservs");

        return Array.from(bot.guilds.values());
    }

    this.findClientGuild = function(id) {
        if (!bot.guilds.has(id)) {
            return null;
        }

        return bot.guilds.get(id);
    }

    bot.on("message", function(msg) {
        console.log(msg);
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