/**
 * Initialises Keystone with the provided options
 */
const path = require('path');

const EXIT_ON_ERROR = {
	'TRUE': true,
	'FALSE': false
};

let default_options = {
	'wysiwyg additional options': { force_br_newlines: true, force_p_newlines: false, forced_root_block: false, verify_html: false, relative_urls: true, },
	'wysiwyg additional plugins': `table, anchor, autolink, autoresize, charactercount, charmap, hr, image, imagetools, insertdatetime, link, lists, preview, searchreplace, paste, textcolor, visualblocks, wordcount`,
	'wysiwyg menubar': true,
	'wysiwyg cloudinary images': true,
	'cloudinary secure': true,
	'cloudinary folders': true,
	'start_time': new Date().getTime(),
};

/**
 * Notifies an error and terminates the process
 * @param env - environment name
 * @param msg - error message
 * @param exit - if true (default) terminates the process
 * @private
 */
function _log_errore (env, msg, exit = true) {

	console.log(Array(msg.length+3).join("-") );
	console.log(' CONFIGURATION ERROR');
	console.log(' NODE_ENV=' + env);
	console.log(' ' + msg);
	console.log(Array(msg.length+3).join("-") );

	if (exit) {
		process.exit();
	}
}

/**
 * Creates and returns the function for session storing
 * @param mongo_connection_string
 * @param session
 * @private
 */
function _session_store (mongo_connection_string, session) {

	const mongodb_store = require('connect-mongodb-session');
	return new (mongodb_store(session))({
		uri: mongo_connection_string,
		collection: 'app_sessions',
	})
}

/**
 * Cycles the params list and applies them to Vincent
 * @param parameters
 * @private
 */
function _init (parameters) {

	for (let param in parameters) {
		if (parameters.hasOwnProperty(param)) {
			vincent.set(param, parameters[param]);
		}
	}

}

/**
 * Reads the configuration file and set Vincent's properties
 * @param vincent - a Vincent instance
 * @returns {*}
 */
function config(vincent) {
	let env = vincent.get('env');
	let conf_folder = 'config';
	let parameters = null;

	//  Check if exists the environment corrispondent config file in the config folder
	try {
		let conf_path = path.join( vincent.get('module root'), conf_folder, env.toLowerCase());
		parameters = require(conf_path);
	} catch (e) {
		_log_errore(env, `Can't load configuration file ${conf_folder}/${env}.js`, EXIT_ON_ERROR.TRUE);
	}

	//  Check if db configuration exists
	if (!parameters.db || !parameters.db.name) {
		_log_errore(env, `Database configuration for '${env}' missing or incorrect`, EXIT_ON_ERROR.TRUE)
	}

	//  MongoDB configuration
	const db = {
		name: parameters.db.name,
		port: parameters.db.port,
		host: parameters.db.host,
		user: parameters.db.user,
		pwd: parameters.db.pwd,
		dbAuth: parameters.db.dbAuth || 'admin',
	};

	if (parameters.db.user) {
		parameters.mongo = `mongodb://${parameters.db.user}:${parameters.db.pwd}@${parameters.db.host}:${parameters.db.port}/${parameters.db.name}?authSource=${db.dbAuth}`;
	} else {
		parameters.mongo = `mongodb://${parameters.db.host}:${parameters.db.port}/${parameters.db.name}`;
	}
	delete parameters.db;

	//  Check if connect-mongodb-session is installed
	//  if it is set the 'session store' parameter
	try {
		const connectMongoDBSession = require('connect-mongodb-session');
		parameters['session store'] = _session_store.bind(null, parameters.mongo);
	} catch (e) {
		_log_errore(env, 'Missing connect-mongodb-session package, can\'t setup a session store', EXIT_ON_ERROR.FALSE)
	}

	//  Merge default and environment options
	Object.assign(parameters, default_options);

	return parameters;
}

function init (options) {
	let params = Object.assign(options, config(this));
	this.options(params);
	return this;
}

module.exports = init;
