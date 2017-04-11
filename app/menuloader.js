// app/globalparams.js

module.exports = function (app, passport, path, fs) {

	this.getMenuTemplate = function (pageAction) {

        // TODO: Based on page action, load a new template

		return path.join(__dirname, '../', 'views/menus/initialmenu.ejs');
	}

    this.getMenuData = function (pageAction, dataContext) {

        // Based on pageAction and dataContext, load new data

		var data = new Object();
		var menuMainButtons = [];

		if (dataContext == '') {
            for (var i = 0; i < 5; i++) {

                var button = new Object();

                button.targetaction = "ASD";
                button.datacontext = i;
                button.textcontent = "lol" + i;

                menuMainButtons.push(button);
            }
		} else {

			var button = new Object();

            button.targetaction = "asd";
            button.datacontext = dataContext;
			button.textcontent = "lol"+dataContext;
			for (var i = 0; i < 8; i++) {
				menuMainButtons.push(button);
			}
		}


		data.menuMainButtons = menuMainButtons;
		return data;
	}
}