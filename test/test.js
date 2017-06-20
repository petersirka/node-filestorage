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
*
/*
setTimeout(function() {
    filestorage.pipe(1, fs.createWriteStream('/users/petersirka/desktop/output1.pdf'));
}, 100);
*/
/*
setTimeout(function() {
	filestorage.read(1, function(err, stream, info) {
		stream.pipe(fs.createWriteStream('/users/petersirka/desktop/output2.pdf'));
	});
}, 100);
*/
/*
filestorage.update('1', function(err, header) {
    header.name = 'invoice2.pdf'
    return header;
    //return null;
});*/

//filestorage.insert('invoice.pdf', '/users/petersirka/desktop/DATALAN logo CMYK 1+0.pdf');
// console.log(filestorage.insert('čťčščšĎť.jpg', '/users/petersirka/desktop/levik-anna-maria.jpg'));

// filestorage.insert('logo.jpg', '/users/petersirka/desktop/DSC00325.JPG');
//filestorage.insert('aaaa.gif', '/users/petersirka/desktop/aaaa.gif');
//filestorage.insert('6551260034.pdf', '/users/petersirka/desktop/6551260034.pdf');
//console.log(filestorage.insert('aaa.jpg', new Buffer(fs.readFileSync('/users/petersirka/desktop/DSC00325.JPG'))));
//filestorage.update(2, 'smadny-mnich.jpg', '/users/petersirka/desktop/smadny-mnich.jpg', { key: 'value' });
// filestorage.remove(2);

var id = filestorage.insert('test.txt', new Buffer('Hello World 2', 'utf8'));
setTimeout(function() {
	console.log(id);
	filestorage.remove(id);
	setTimeout(function() {
		id = filestorage.insert('test.txt', new Buffer('Hello World 2', 'utf8'));
		console.log(id);
	}, 100);
}, 100);

