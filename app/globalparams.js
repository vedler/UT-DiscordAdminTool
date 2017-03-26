// app/globalparams.js
module.exports = function (app, passport, i18n) {

    // GLOBAL GET PARAM LOGIC
    app.use(function (req, res, next) {
        // do stuff here

        // Language - someurl.com/asd?lang=en
        if (req.query.lang) {
            // Check if this is a valid locale
            
            if (i18n.getLocales().indexOf(req.query.lang) != -1) {
                res.cookie('discord-at-language', req.query.lang);
                res.setLocale(req.query.lang);
            }
        }

        next();
    });

};