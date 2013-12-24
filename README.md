Storage for storing files
=========================

- Best use with [www.partialjs.com](http://partialjs.com)
- perfect solution for web sites
- supports custom path
- supports insert, update and remove files
- supports reading files
- supports sending files via HTTP
- supports file listing
- supports changelog (insert, update, remove)
- __supports auto-pipe stream to response__
- __supports auto HTTP CACHING (via ETag)__
- supports adding custom attribute to each file
- supports file streaming via HTTP - Content Range
- supports custom handler executing before saving file to the storage
- __auto-read picture properties: width and height__
- auto-create directories and the good logic
- supports stat() and copy()
- 100% pure JavaScript
- MIT license
- [Example: Picture uploader via partial.js](https://github.com/petersirka/partial.js/tree/master/examples/upload-multipart-filestorage)


How to storage store files?
---------------------------

> Directory contains max 1000 files. Each file has .data extension and each file contains internal META information (2 kB). Each directory contains the config file with the informations about all files.

/your-path/000-000-001/000000001.data

> if directory contains more than 999 files then storage automatically create a new directory:

/your-path/000-000-002/000001000.data

> The benefit: querying by the file ID {Number} and auto-pipe to HttpResponse


***


```javascript

var storage = require('filestorage').create('/path/to/directory/');

// You can create more file storages
// EXAMPLE:
var storage_users = require('filestorage').create('/path/to/users/');
var storage_products = require('filestorage').create('/path/to/products/');
var storage_logs = require('filestorage').create('/path/to/logs/');


var storage_default = require('filestorage').create();

// default path: /process–directory/filestorage/

// ================================================
// FILESTORAGE INSERT
// ================================================

/*
	Insert a file
	@name {String}
	@buffer {String, Stream, Buffer}
	@custom {String, Object} :: optional
	@fnCallback {Function} :: optional, params: @err {Error}, @id {Number}, @stat {Object}
	@change {String} :: optional, changelog
	return {Number} :: file id
*/
storage.insert(name, buffer, [custom], [fnCallback], [changelog]);

// EXAMPLE:

storage.insert('logo.png', '/users/petersirka/desktop/logo.png', 'my custom data', function(err, id, stat) {

	console.log(id);
	console.log(stat);

	// stat.name        - file name
	// stat.extension   - file extension
	// stat.length      - file length
	// stat.type        - content type
	// stat.width       - picture width
	// stat.height      - picture height
	// stat.custom      - your custom value
	// stat.stamp       - date created ticks, new Date(stat.stamp)

}, 'new logo');

// OR

var id = storage.insert('logo.png', fs.createReadStream('/users/petersirka/desktop/logo.png'));
console.log(id);

// OR

var id = storage.insert('plaintext.txt', 'YW55IGNhcm5hbCBwbGVhc3VyZS4=');
console.log(id);

// OR

var id = storage.insert('plaintext.txt', new Buffer('YW55IGNhcm5hbCBwbGVhc3VyZS4=', 'base64'));
console.log(id);

// ================================================
// FILESTORAGE UPDATE
// ================================================

/*
	Update a file
	@id {String or Number}
	@name {String}
	@buffer {String, Stream, Buffer}
	@custom {String, Object} :: optional
	@fnCallback {Function} :: optional, params: @err {Error}, @id {Number}, @stat {Object}
	@change {String} :: optional, changelog
	return {Number}
*/
storage.update(id, name, buffer, [custom], [fnCallback], [change]);

// EXAMPLE:

storage.update(1, 'logo.jpg', '/users/petersirka/desktop/logo.jpg', function(err, id, stat) {

	console.log(id);
	console.log(stat);

	// stat.name        - file name
	// stat.extension   - file extension
	// stat.length      - file length
	// stat.type        - content type
	// stat.width       - picture width
	// stat.height      - picture height
	// stat.custom      - your custom value
	// stat.stamp       - date created ticks, new Date(stat.stamp)

}, 'update logo');

// OR

storage.update(1, 'plaintext.txt', new Buffer('YW55IGNhcm5hbCBwbGVhc3VyZS4=', 'base64'));

// ================================================
// FILESTORAGE REMOVE
// ================================================

/*
	Remove a file
	@id {String or Number}
	@fnCallback {Function} :: optional, params: @err {Error}
	@change {String} :: optional, changelog
	return {FileStorage}
*/
storage.remove(id, [fnCallback], [change]);

// EXAMPLE:

storage.remove(1, function(err) {

	// your code here

}, 'remove logo');

// OR

storage.remove(1);

// ================================================
// FILESTORAGE STAT
// ================================================

/*
	A file information
	@id {String or Number}
	@fnCallback {Function} :: params: @err {Error}, @stat {Object}
	return {FileStorage}
*/
storage.stat(id, fnCallback);

// EXAMPLE:

storage.stat(1, function(err, stat) {

	// stat.name        - file name
	// stat.extension   - file extension
	// stat.length      - file length
	// stat.type        - content type
	// stat.width       - picture width
	// stat.height      - picture height
	// stat.custom      - your custom value
	// stat.stamp       - date created ticks, new Date(stat.stamp)

});

// ================================================
// FILESTORAGE READ
// ================================================

/*
	Read a file
	@id {String or Number}
	@fnCallback {Function} :: params: @err {Error}, @stream {ReadStream}, @stat {Object}
	return {FileStorage}
*/
storage.read(id, fnCallback);

// EXAMPLE:

storage.read(1, function(err, stream, stat) {

	// stat.name        - file name
	// stat.extension   - file extension
	// stat.length      - file length
	// stat.type        - content type
	// stat.width       - picture width
	// stat.height      - picture height
	// stat.custom      - your custom value
	// stat.stamp       - date created ticks, new Date(stat.stamp)

	// stream.pipe(yourstream)

});

// ================================================
// FILESTORAGE PIPE
// ================================================

/*
	Pipe a stream to Stream or HttpResponse
	@id {String or Number}
	@req {HttpRequest} :: optional,
	@res {HttpResponse or Stream}
	@download {String or Boolean} :: optional, attachment - if string filename is download else if boolean filename will a stat.name
	return {FileStorage}
*/
storage.pipe(id, req, res, download);

// EXAMPLE:

storage.pipe(1, response, request, true);

// OR

storage.pipe(1, response, request, 'mynewlogo.jpg');

// OR

storage.pipe(1, mystream);

// ================================================
// FILESTORAGE SEND
// ================================================

/*
	Send a file through HTTP
	@id {String or Number}
	@url {String}
	@fnCallback {Function} :: optional, params: @err {Error}, @response {String}
	@headers {Object} :: optional, additional headers
	return {FileStorage}
*/
storage.send(id, url, [fnCallback], [headers]);

// EXAMPLE:

// <form method="POST" action="http://yoururladdress.com/upload/" enctype="multipart/form-data">
// <input type="file" name="File" />

storage.send(1, 'http://yoururladdress.com/upload/', function(err, response) {

	if (!err)
		console.log(response);

});

storage.send(1, 'http://yoururladdress.com/upload/');

// ================================================
// FILESTORAGE COPY
// ================================================

/*
	Copy file
	@id {String or Number}
	@directory {String}
	@fnCallback {Function} :: params: @err {Error}
	@name {String} :: optional, new filename
	return {FileStorage}
*/
storage.copy(id, directory, [fnCallback], [name]);

// EXAMPLE:

storage.copy(1, '/users/petersirka/desktop/');
storage.copy(1, '/users/petersirka/desktop/', 'mynewlogofromstorage.jpg');

storage.copy(1, '/users/petersirka/desktop/', function(err) {

});

// ================================================
// FILESTORAGE LISTING
// ================================================

/*
	Get all file names
	@fnCallback {Function} :: params: @err {Error}, @arr {String Array}
	return {FileStorage}
*/
storage.listing(fnCallback);

// EXAMPLE:

storage.listing(function(err, arr) {

	// Array contains JSON strings (not parsed)
	console.log(arr);

});

// ================================================
// FILESTORAGE CHANGELOG
// ================================================

/*
	Read the changelog
	@fnCallback {Function} :: params: @err {Error}, @changes {String Array}
	return {FileStorage}
*/
storage.changelog(fnCallback);

// EXAMPLE:

storage.changelog(function(err, changes) {
	console.log(changes);
});

// HOW TO REMOVE CHANGELOG?

storage.remove('changelog');

```

```javascript

// ================================================
// FILESTORAGE PROPERTIES
// ================================================

// {String}, readonly
storage.path;

// {Object}, readonly
storage.options;

// ================================================
// FILESTORAGE DELEGATES
// ================================================

//
/*
	Prepare file before store in storage
	@filename {String} :: path to TEMPORARY FILE in a storage, this file will be replaced
	@stat {Object}
	@next {Function}
*/
storage.onPrepare = function(filename, stat, next) {

	// stat.name        - file name
	// stat.extension   - file extension
	// stat.length      - file length
	// stat.type        - content type
	// stat.width       - picture width
	// stat.height      - picture height
	// stat.custom      - your custom value

	next();
};

// ================================================
// FILESTORAGE EVENTS
// ================================================

storage.on('error', function(err) {

});

storage.on('insert', function(id, stat) {

});

storage.on('update', function(id, stat) {

});

storage.on('remove', function(id) {

});

storage.on('send', function(id, stat, url) {

});

storage.on('copy', function(id, stat, stream, directory) {

});

storage.on('read', function(id, stat, stream) {

});

storage.on('pipe', function(id, stat, stream, req) {

});

storage.on('listing', function(arr) {

});

storage.on('changelog', function(arr) {

});

```
***

## The MIT License

Copyright (c) 2012-2013 Peter Širka <petersirka@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contact

[www.petersirka.sk](http://www.petersirka.sk) - <petersirka@gmail.com>
