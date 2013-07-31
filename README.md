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
- supports auto-pipe stream to response
- supports adding custom attribute to each file
- supports file streaming via HTTP - Content Range
- supports custom handler executing before saving file to the storage
- auto-read properties of picture: width and height
- auto-create directories and the good logic
- supports stat() and copy()
- 100% pure JavaScript
- MIT license

***

```javascript

var storage = require('filestorage').create('/path/to/directory/');

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
	return {FileStorage}
*/
storage.update(id, name, buffer, [custom], [fnCallback], [change]);

// EXAMPLE:

storage.update(1, 'logo.jpg', '/users/petersirka/desktop/logo.jpg', function(err, id, stat) {

	console.log(id);
	console.log(stat);

	// stat.name        - file name
	// stat.length      - file length
	// stat.type        - content type
	// stat.width       - picture width
	// stat.height      - picture height
	// stat.custom      - your custom value
	// stat.stamp       - date created ticks, new Date(stat.stamp)

});

```

***

## The MIT License

Copyright (c) 2012-2013 Peter Širka <petersirka@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contact

[www.petersirka.sk](http://www.petersirka.sk)
