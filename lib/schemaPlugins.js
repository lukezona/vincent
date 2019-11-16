exports.sortable = require('./schemaPlugins/sortable');
exports.autokey = require('./schemaPlugins/autokey');
exports.track = require('./schemaPlugins/track');
exports.history = require('./schemaPlugins/history');
exports.seo = require('./schemaPlugins/seo');

exports.methods = {
	getRelated: require('./schemaPlugins/methods/getRelated'),
	populateRelated: require('./schemaPlugins/methods/populateRelated'),
};

exports.options = {
	transform: require('./schemaPlugins/options/transform'),
};
