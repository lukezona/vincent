module.exports = function initViewEngine (keystone, app) {
	// Allow usage of custom view engines
	if (keystone.get('custom engine')) {
		app.engine(keystone.get('view engine'), keystone.get('custom engine'));
	}

	// Set location of view templates and view engine
	app.set('views', keystone.getPath('views') || 'views');
	app.set('view engine', keystone.get('view engine'));
	
	if (keystone.get('view engine') === 'pug') {
		
		try {
			app.locals.plugins = app.locals.plugins || [];
			app.locals.plugins.push(require('pug-bem'));
		} catch (e) {
			// nulla
		}
		
	}
	
	var customView = keystone.get('view');
	if (customView) {
		app.set('view', customView);
	}
};
