
module.exports = function (app, passport, path, fs) {

    this.getOverlayTemplate = function (pageAction) {

        switch (pageAction) {
            case 'options':
                return path.join(__dirname, '../', 'views/overlays/options.ejs');

            default:
                return path.join(__dirname, '../', 'views/overlays/options.ejs');
        }
    }

    this.getMenuData = function (pageAction, dataContext) {
        var data = new Object();

        return data;
    }
};