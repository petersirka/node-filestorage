var FileStorage = require('../index');
var fs = require('fs');
var filestorage = FileStorage.create('/users/petersirka/desktop/filestorage/');
//var filestorage = FileStorage.create();

/*
filestorage.listing(function(err, data) {
	console.log(err, data);
});
*/

/*
filestorage.stat(1, function(err, stat) {
	console.log(err, stat);
});
*/

/*
setTimeout(function() {
	filestorage.read(1, function(err, stream, info) {
		stream.pipe(fs.createWriteStream('/users/petersirka/desktop/aaa.jpg'));
	});
}, 100);
*/

// console.log(filestorage.insert('čťčščšĎť.jpg', '/users/petersirka/desktop/levik-anna-maria.jpg'));
filestorage.insert('logo.jpg', '/users/petersirka/desktop/DSC00325.JPG');
//filestorage.insert('aaaa.gif', '/users/petersirka/desktop/aaaa.gif');
//filestorage.insert('6551260034.pdf', '/users/petersirka/desktop/6551260034.pdf');
//console.log(filestorage.insert('aaa.jpg', new Buffer(fs.readFileSync('/users/petersirka/desktop/DSC00325.JPG'))));
//filestorage.update(2, 'smadny-mnich.jpg', '/users/petersirka/desktop/smadny-mnich.jpg', { key: 'value' });
//filestorage.remove(2);