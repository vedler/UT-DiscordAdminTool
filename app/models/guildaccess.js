// Load the lib
var mongoose = require('mongoose');

var guildAccessSchema = mongoose.Schema({
    guildId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    level: Number
}, { collection: 'GuildAccess' });

module.exports = mongoose.model('GuildAccess', guildAccessSchema);