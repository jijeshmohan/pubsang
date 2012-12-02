var path = require('path'),
    mime = require('mime'),
    fs = require('fs'),
    exec = require('child_process').exec;


exports.generate_epub = function(req, res) {
    if (req.method == 'GET') {
        res.render('uploadform', {
            title: 'Express'
        });
    } else {
        file = req.files.the_file;
        var output_path = __dirname + "/../public/" + file.name + ".epub"
        var command = "pandoc  -o " + output_path + " " + file.path
        child = exec(command, function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
                res.end("ERROR: " + error);
            }
            var filename = path.basename(output_path);
            var mimetype = mime.lookup(output_path);
            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);
            var filestream = fs.createReadStream(output_path);

            filestream.on('data', function(chunk) {
                res.write(chunk);
            });
            filestream.on('end', function() {
                res.end();
            });
        });

    }
};
