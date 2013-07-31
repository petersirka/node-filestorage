// Copyright Peter Širka, Web Site Design s.r.o. (www.petersirka.sk)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var fs = require('fs');
var util = require('util');
var path = require('path');
var utils = require('./utils');
var parser = require('url');
var http = require('http');
var https = require('https');
var events = require('events');

var LENGTH_DIRECTORY = 10;
var LENGTH_HEADER = 2048;
var FILENAME_DB = 'config';
var EXTENSION = '.data';
var EXTENSION_TMP = '.tmp';
var UNDEFINED = 'undefined';
var JPEG = 'image/jpeg';
var PNG = 'image/png';
var GIF = 'image/gif';
var ENCODING = 'utf8';
var NEWLINE = '\r\n';
var BOUNDARY = '----' + Math.random().toString(16).substring(2);
var NOTFOUND = 'File not found.';

function FileStorage(path) {

	this.path = path;
	this.cache = {};
	this.options = { index: 0, count: 0 };

	this.verification();
}

FileStorage.prototype = new events.EventEmitter();

FileStorage.prototype.verification = function() {

	var self = this;
	var options = self.options;

	self._mkdir(self.path, true);
	self._load();

	return self;
};

FileStorage.prototype._load = function() {

	var self = this;
	var options = self.options;
	var filename = path.join(self.path, FILENAME_DB);

	if (!fs.existsSync(filename))
		return self;

	var json = fs.readFileSync(filename, ENCODING).toString();
	if (json.length === 0)
		return self;

	var config = JSON.parse(json);

	options.index = config.index;
	options.count = config.count;
	options.size = config.size;

	return self;
};

FileStorage.prototype._save = function() {
	var self = this;
	var filename = path.join(self.path, FILENAME_DB);
	fs.writeFile(filename, JSON.stringify(self.options));
	return self;
};

FileStorage.prototype._append = function(directory, value, id, eventname) {

	var self = this;
	var filename = directory + '/' + FILENAME_DB;

	if (eventname === 'insert') {
		fs.appendFile(filename, id + '=' + JSON.stringify(value) + '\n');
		return self;
	}

	fs.readFile(filename, function(err, data) {

		var arr = err ? [] : data.toString('utf8').split('\n');
		var length = arr.length;
		var builder = [];
		var isHit = false;

		for (var i = 0; i < length; i++) {

			var line = arr[i];
			var index = line.indexOf('=');

			if (index === -1)
				continue;

			if (isHit) {
				builder.push(line);
				continue;
			}

			var id = line.substring(0, index);

			if (id === id) {
				if (eventname === 'update')
					builder.push(id + '=' + JSON.stringify(value));
				isHit = true;
			}
			else
				builder.push(line);
		}

		fs.writeFile(filename, builder.join('\n') + '\n');
	});

	return self;
};

FileStorage.prototype._writeHeader = function(id, filename, header, fnCallback, type, directory) {

	var self = this;

	fs.stat(filename +  EXTENSION_TMP, function(err, stats) {

		if (!err)
			header.length = stats.size;

		header.stamp = new Date().getTime();

		var json = JSON.stringify(header);
		json += new Array((LENGTH_HEADER - json.length) + 1).join(' ');

		var stream = fs.createWriteStream(filename + EXTENSION);

		stream.write(json);

		var read = fs.createReadStream(filename + EXTENSION_TMP);
		read.pipe(stream);

		setImmediate(function() {

			fs.unlink(filename + EXTENSION_TMP);

			if (fnCallback)
				fnCallback(null, id, header);

			self._append(directory, header, id.toString(), type);
			self.emit(type, id, header);

		});

	});

	return self;
};

FileStorage.prototype._directory_index = function(index) {
	return Math.floor(index / 1000) + 1;
};

FileStorage.prototype._directory = function(index, isDirectory) {
	var self = this;
	var options = self.options;
	var id = (isDirectory ? index : self._directory_index(index)).toString().padLeft(LENGTH_DIRECTORY, '0');
	return path.join(self.path, id);
};

FileStorage.prototype._mkdir = function(directory, noPath) {

	var self = this;
	var cache = self.cache;

	if (!noPath)
		directory = path.join(self.path, directory);

	var key = 'directory-' + directory;

	if (cache[key])
		return true;

	if (!fs.existsSync(directory))
		fs.mkdirSync(directory);

	cache[key] = true;
	return true;
};

/*
	Insert a file
	@name {String}
	@buffer {String, Stream, Buffer}
	@custom {String, Object} :: optional
	@fnCallback {Function} :: optional, params: @err {Error}, @id {Number}, @stat {Object}
	return {FileStorage}
*/
FileStorage.prototype.insert = function(name, buffer, custom, fnCallback, id) {

	var self = this;
	var options = self.options;

	if (typeof(custom) === 'function') {
		var tmp = fnCallback;
		fnCallback = custom;
		custom = fnCallback;
	}

	var index = 0;
	var eventname = 'update';

	if (typeof(id) === UNDEFINED) {
		options.index++;
		index = options.index;
		eventname = 'insert';
		options.count++;
	} else
		index = utils.parseIndex(id);

	var directory = self._directory(index);

	self._mkdir(directory, true);

	var filename = directory + '/' + index.toString().padLeft(LENGTH_DIRECTORY, '0');
	var stream = fs.createWriteStream(filename + EXTENSION_TMP);

	self._save();

	var header = {
		name: name,
		type: utils.contentType(name),
		width: 0,
		height: 0,
		length: 0,
		custom: custom
	};

	if (typeof(buffer) === 'string') {
		if (buffer.length % 4 === 0 && buffer.match(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/) !== null)
			buffer = new Buffer(buffer, 'base64');
		else
			buffer = fs.createReadStream(buffer);
	}

	var isBuffer = typeof(stream.pipe) === UNDEFINED;

	if (isBuffer) {

		var size;

		if (header.type === JPEG) {
			size = utils.dimensionJPG(buffer);
			header.width = size.width;
			header.height = size.height;
		} else if (header.type === PNG) {
			size = utils.dimensionPNG(buffer);
			header.width = size.width;
			header.height = size.height;
		} else if (header.type === GIF) {
			size = utils.dimensionGIF(chunk);
			header.width = size.width;
			header.height = size.height;
		}

		stream.end(buffer);
		self._writeHeader(index, filename, header, fnCallback, eventname, directory);

	}
	else {

		buffer.pipe(stream);

		if (header.type === JPEG || header.type === PNG || header.type === GIF) {
			buffer.once('data', function(chunk) {

				var size;

				if (header.type === JPEG) {
					size = utils.dimensionJPG(chunk);
					header.width = size.width;
					header.height = size.height;
				} else if (header.type === PNG) {
					size = utils.dimensionPNG(chunk);
					header.width = size.width;
					header.height = size.height;
				} else if (header.type === GIF) {
					size = utils.dimensionGIF(chunk);
					header.width = size.width;
					header.height = size.height;
				}

			});
		}

		buffer.on('end', function() {
			self._writeHeader(index, filename, header, fnCallback, eventname, directory);
		});

	}

	return index;
};

/*
	Update a file
	@id {String or Number}
	@name {String}
	@buffer {String, Stream, Buffer}
	@custom {String, Object} :: optional
	@fnCallback {Function} :: optional, params: @err {Error}, @id {Number}, @stat {Object}
	return {FileStorage}
*/
FileStorage.prototype.update = function(id, name, buffer, custom, fnCallback) {
	return this.insert(name, buffer, fnCallback, custom, id);
};

/*
	Remove a file
	@id {String or Number}
	@fnCallback {Function} :: optional, params: @err {Error}
	return {FileStorage}
*/
FileStorage.prototype.remove = function(id, fnCallback) {

	var self = this;
	var index = utils.parseIndex(id.toString());
	var directory = self._directory(index);
	var filename = directory + '/' + index.toString().padLeft(LENGTH_DIRECTORY, '0') + EXTENSION;

	fs.unlink(filename, function(err) {

		if (!err) {
			self.options.count--;
			self.emit('remove', id);
			self._append(directory, null, index.toString(), 'remove');
			self._save();
		} else
			self.emit('error', err);

		if (fnCallback)
			fnCallback(err !== null ? err.errno === 34 ? new Error(NOTFOUND) : err : null);

	});

	return self;
};

/*
	A file information
	@id {String or Number}
	@fnCallback {Function} :: params: @err {Error}, @stat {Object}
	return {FileStorage}
*/
FileStorage.prototype.stat = function(id, fnCallback) {

	var self = this;

	var index = utils.parseIndex(id.toString());
	var directory = self._directory(index);
	var filename = directory + '/' + index.toString().padLeft(LENGTH_DIRECTORY, '0') + EXTENSION;

	var stream = fs.createReadStream(filename, { start: 0, end: LENGTH_HEADER - 1 });

	stream.once('data', function(chunk) {
		fnCallback(null, JSON.parse(chunk.toString(ENCODING)), filename);
	});

	stream.once('error', function(err) {
		self.emit('error', err);
		fnCallback(err.errno === 34 ? new Error(NOTFOUND) : err, null);
	});

	return self;
};

/*
	Send a file
	@id {String or Number}
	@url {String}
	@fnCallback {Function} :: optional, params: @err {Error}, @response {String}
	@headers {Object} :: optional, additional headers
	return {FileStorage}
*/
FileStorage.prototype.send = function(id, url, fnCallback, headers) {

	var self = this;

	if (typeof(fnCallback) === 'object') {
		var tmp = headers;
		fnCallback = headers;
		headers = tmp;
	}

	self.stat(id, function(err, stat, filename) {

		if (err) {
			self.emit('error', err);
			fnCallback(err, null);
			return;
		}

		var h = {};

		if (headers)
			util._extend(h, headers);

		h['Cache-Control'] = 'max-age=0';
		h['Content-Type'] = 'multipart/form-data; boundary=' + BOUNDARY;

		var options = parser.parse(url);

		options.agent = false;
		options.method = 'POST';
		options.headers = h;

		var response = function(res) {
			res.body = '';

			res.on('data', function(chunk) {
				this.body += chunk.toString(ENCODING);
			});

			res.on('end', function() {
				fnCallback(null, res.body);
				self.emit('send', id, stat, url);
			});
		};

		var connection = options.protocol === 'https:' ? https : http;
		var req = connection.request(options, response);

		req.on('error', function(err) {
			self.emit('error', err);
			fnCallback(err, null);
		});

		var header = NEWLINE + NEWLINE + '--' + BOUNDARY + NEWLINE + 'Content-Disposition: form-data; name="File"; filename="' + stat.name + '"' + NEWLINE + 'Content-Type: ' + stat.type + NEWLINE + NEWLINE;
		req.write(header);

		var stream = fs.createReadStream(filename, { start: LENGTH_HEADER });

		stream.on('end', function() {
			req.end(NEWLINE + NEWLINE + '--' + BOUNDARY + '--');
		});

		stream.pipe(req, { end: false });
	});

	return self;
};

/*
	Copy
	@id {String or Number}
	@directory {String}
	@fnCallback {Function} :: params: @err {Error}
	@name {String} :: optional, new filename
	return {FileStorage}
*/
FileStorage.prototype.copy = function(id, directory, fnCallback, name) {

	var self = this;
	self.stat(id, function(err, stat, filename) {

		if (err) {
			self.emit('error', err);
			fnCallback(err);
			return;
		}

		if (typeof(name) === UNDEFINED)
			name = stat.name;

		var stream = fs.createReadStream(filename, { start: LENGTH_HEADER });
		self.emit('copy', id, stat, stream, directory);

		stream.pipe(fs.createWriteStream(path.join(directory, name)));

		if (!fnCallback)
			return;

		stream.on('end', function() {
			fnCallback(null);
		});
	});

	return self;
};

/*
	Read a file
	@id {String or Number}
	@fnCallback {Function} :: params: @err {Error}, @stream {ReadStream}, @stat {Object}
	return {FileStorage}
*/
FileStorage.prototype.read = function(id, fnCallback) {

	var self = this;

	self.stat(id, function(err, stat, filename) {

		if (err) {
			self.emit('error', err);
			fnCallback(err, null);
			return;
		}

		var stream = fs.createReadStream(filename, { start: LENGTH_HEADER });
		self.emit('read', id, stat, stream);
		fnCallback(null, stream, stat);

	});

	return self;
};

/*
	Get all file names
	@fnCallback {Function} :: params: @err {Error}, @arr {String Array}
	return {FileStorage}
*/
FileStorage.prototype.listing = function(fnCallback) {

	var self = this;
	var max = self._directory_index(self.options.index);
	var directory = [];
	var builder = [];

	for (var i = 1; i < max; i++)
		directory.push(self._directory(i, true));

	function config() {

		var filename = directory.shift();

		if (typeof(filename) === UNDEFINED) {
			self.emit('listing', builder);
			fnCallback(null, builder);
			return;
		}

		fs.readFile(filename + FILENAME_DB, function(err, data) {

			if (err) {
				self.emit('error', err);
			else
				builder.push(data.toString('utf8'));

			config();
		});
	}

	config();
	return self;
};

/*
	Pipe a stream to Stream or HttpResponse
	@id {String or Number}
	@res {HttpResponse or Stream}
	@req {HttpRequest} :: optional,
	@download {String or Boolean} :: optional, attachment - if string filename is download else if boolean filename will a stat.name
	return {FileStorage}
*/
FileStorage.prototype.pipe = function(id, res, req, download) {

	var self = this;
	self.stat(id, function(err, stat, filename) {

		var isResponse = typeof(res.writeHead) === UNDEFINED;

		if (err) {

			if (isResponse) {
				res.success = true;
				res.writeHead(404, { 'Content-Type': 'text/plain' });
				res.end(NOTFOUND);
				return;
			}

			throw err;
		}

		if (!isResponse) {
			self.emit('pipe', id, stat, fs.createReadStream(filename, { start: LENGTH_HEADER }).pipe(res));
			return;
		}

		var beg = 0;
		var end = 0;
		var length = stat.length;
		var isRange = false;

		if (req) {

			if (req.headers['if-none-match'] === stat.stamp.toString()) {
				res.success = true;
				res.writeHead(304);
				res.end();
				return;
			}

			var range = req.headers['range'] || '';

			if (range.length > 0) {

				var arr = range.replace(/bytes=/, '').split('-');
				beg = parseInt(arr[0] || '0', 10);
				end = parseInt(arr[1] || '0', 10);
				isRange = true;

				if (end === 0)
					end = length - 1;

				if (beg > end) {
					beg = 0;
					end = length - 1;
				}

				length = (end - beg) + 1;
			}
		}

		var expires = new Date();
		expires.setMonth(expires.getMonth() + 2);

		var headers = { 'Content-Type': stat.type,
						'Content-Length': length,
						'Etag': stat.stamp,
						'Last-Modified': new Date(stat.stamp).toUTCString(),
						'Accept-Ranges': 'bytes',
						'Cache-Control': 'public',
						'Expires': expires,
						'X-Powered-By': 'node.js FileStorage',
						'Vary': 'Accept-Encoding'
					};

		if (typeof(download) === 'string')
			headers['Content-Disposition'] = 'attachment; filename=' + download;
		else if (download === true)
			headers['Content-Disposition'] = 'attachment; filename=' + stat.name;

		var options = { start: LENGTH_HEADER };

		if (beg > 0)
			options.start += beg;

		if (end > 0)
			options.end = end;

		if (beg > 0 || end > 0)
			headers['Content-Range'] = 'bytes ' + beg + '-' + end + '/' + stat.length;

		res.writeHead(isRange ? 206 : 200, headers);
		self.emit('pipe', id, stat, fs.createReadStream(filename, options).pipe(res));

	});

	return self;
};