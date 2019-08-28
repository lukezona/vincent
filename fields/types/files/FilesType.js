var _ = require('lodash');
var async = require('async');
var FieldType = require('../Type');
var util = require('util');
var utils = require('keystone-utils');

var debug = require('debug')('keystone:fields:file');

/**
 * File FieldType Constructor
 */
function files (list, path, options) {
	this._underscoreMethods = ['format', 'upload', 'remove', 'reset'];
	this._fixedSize = 'full';
	
	if (!options.storage) {
		throw new Error('Invalid Configuration\n\n'
			+ 'File fields (' + list.key + '.' + path + ') require storage to be provided.');
	}
	this.storage = options.storage;
	
	files.super_.call(this, list, path, options);
}
files.properName = 'Files';
util.inherits(files, FieldType);

/**
 * Registers the field on the List's Mongoose Schema.
 */
files.prototype.addToSchema = function (schema) {
	
	var field = this;
	
	this.paths = {};
	// add field paths from the storage schema
	Object.keys(this.storage.schema).forEach(function (path) {
		field.paths[path] = field.path + '.' + path;
	});
	
	// Trasformato in Array
	var schemaPaths = this._path.addTo({}, [this.storage.schema]);
	schema.add(schemaPaths);
	
	this.bindUnderscoreMethods();
};

/**
 * Uploads a new file
 */
files.prototype.upload = function (file, callback) {
	var field = this;
	// TODO; Validate there is actuall a file to upload
	// debug('[%s.%s] Uploading file for item %s:', this.list.key, this.path, item.id, file);
	this.storage.uploadFile(file, function (err, result) {
		if (err) return callback(err);
		// debug('[%s.%s] Uploaded file for item %s with result:', field.list.key, field.path, item.id, result);
		callback(null, result);
	});
};

/**
 * Resets the field value
 */
files.prototype.reset = function (item) {
	var value = {};
	Object.keys(this.storage.schema).forEach(function (path) {
		value[path] = null;
	});
	item.set(this.path, value);
};

/**
 * Deletes the stored file and resets the field value
 */
// TODO: Should we accept a callback here? Seems like a good idea.
files.prototype.remove = function (item) {
	this.storage.removeFile(item.get(this.path));
	this.reset();
};

/**
 * Formats the field value
 */
files.prototype.format = function (item) {
	var value = item.get(this.path);
	if (value) return value.filename || '';
	return '';
};

/**
 * Detects whether the field has been modified
 */
files.prototype.isModified = function (item) {
	var modified = false;
	var paths = this.paths;
	Object.keys(this.storageSchema).forEach(function (path) {
		if (item.isModified(paths[path])) modified = true;
	});
	return modified;
};


function validateInput (value) {
	
	return true;
	// undefined, null and empty values are always valid
	if (value === undefined || value === null || value === '') return true;
	// If a string is provided, check it is an upload or delete instruction
	if (typeof value === 'string' && /^(upload\:)|(delete$)/.test(value)) return true;
	// If the value is an object with a filename property, it is a stored value
	// TODO: Need to actually check a dynamic path based on the adapter
	//	Test
	if (Array.isArray(value)) {
		return true;
	}
	if (typeof value === 'object' && value.filename) return true;
	return false;
}

/**
 * Validates that a value for this field has been provided in a data object
 */
files.prototype.validateInput = function (data, callback) {
	var value = this.getValueFromData(data);
	debug('[%s.%s] Validating input: ', this.list.key, this.path, value);
	var result = validateInput(value);
	debug('[%s.%s] Validation result: ', this.list.key, this.path, result);
	utils.defer(callback, result);
};

/**
 * Validates that input has been provided
 */
files.prototype.validateRequiredInput = function (item, data, callback) {
	// TODO: We need to also get the `files` argument, so we can check for
	// uploaded files. without it, this will return false negatives so we
	// can't actually validate required input at the moment.
	var result = true;
	// debug('[%s.%s] Validating required input: ', this.list.key, this.path, value);
	// TODO: Need to actually check a dynamic path based on the adapter
	// TODO: This incorrectly allows empty values in the object to pass validation
	// debug('[%s.%s] Validation result: ', this.list.key, this.path, result);
	utils.defer(callback, result);
};

/**
 * Updates the value for this field in the item from a data object
 * TODO: It is not possible to remove an existing value and upload a new fiel
 * in the same action, this should be supported
 */
files.prototype.updateItem = function (item, data, files, callback) {
	// Process arguments
	if (typeof files === 'function') {
		callback = files;
		files = {};
	}
	if (!files) {
		files = {};
	}
	let self = this;
	// Prepare values
	var values = this.getValueFromData(data);
	values = Array.isArray(values) ? values : [values];
	var uploadedFile;
	
	values = values.map(value => {
		
		// Find an uploaded file in the files argument, either referenced in the
		// data argument or named with the field path / field_upload path + suffix
		if (typeof value === 'string' && value.substr(0, 7) === 'upload:') {
			uploadedFile = files[value.substr(7)];
			return uploadedFile;
		}
		
		if (value === null || value === '' || (typeof value === 'oject' && !Object.keys(value).length)) {
			return undefined;
		}
		
		try {
			var j = JSON.parse(value);
			return j;
		} catch (e) {
			return undefined;
		}
		
	}).filter(v => v);
	
	values = _.flattenDeep(values);
	
	async.map(values, (value, next) => {
		
		if (typeof value === 'object' && value.path) {
			// upload
			return this.upload(value, function (err, result) {
				if (err) return utils.defer(next, err);
				return utils.defer(next, null, result);
			});
		} if (typeof value === 'object' && 'filename' in value) {
			// easy
			return next(null, value);
		} else {
			// boh?
			return next();
		}
		
	}, (err, result) => {
		
		if (err) {
			return utils.defer(callback, err);
		}
		
		item.set(this.path, result);
		return utils.defer(callback);;
	})
};

/* Export Field Type */
module.exports = files;