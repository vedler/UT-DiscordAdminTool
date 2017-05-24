// app/maincontentloader.js

module.exports = function (app, passport, path, fs) {

    this.getMainContentTemplate = function (pageAction, user) {

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

    this.getMainContentData = function (pageAction, dataContext, user, next) {

        // Based on pageAction and dataContext, load new data
        if (pageAction == 'joinChannel') {

            getUserGuildAccessLevel(user, dataContext, function (err, level) {
                if (err) {
                    console.error(err);
                    return next(null, returnEmptyPromise());
                } else {
                    if (user.globalAdmin || level > -1) {

                        return next(null, fetchMessages(dataContext));
                    } else {
                        return next(null, returnEmptyPromise());
                    }
                }
            });
        } else {
            return next(null, returnEmptyPromise());
        }
    }
}