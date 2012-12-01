
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mime = require('mime')
  , fs = require('fs')
  , exec = require('child_process').exec;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir: __dirname + '/uploaded',keepExtensions: true}));
  app.use(express.limit('5mb'));
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.all('/genpub',function(req,res){
   if(req.method=='GET'){
      res.render('uploadform', { title: 'Express' });
   }else{
    file = req.files.the_file;
    // console.log(file.name);
    // console.log(file.type);
    // console.log(file.path);

    var output_path = __dirname +"/public/" + file.name + ".epub"
    var command = "pandoc  -o " + output_path + " " + file.path

    child = exec(command,
      function (error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
          res.end("ERROR: "+ error);
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
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
