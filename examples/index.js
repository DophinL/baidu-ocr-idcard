var express = require('express')
var app = express();
var formidable = require('formidable');

app.engine('.html', require('ejs').__express);

app.set('views', './views');

app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index');
})

app.post('/idcard', function(req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = './temp';
    form.multiples = false; //不允许多文件上传
    form.keepExtensions = true; //保留扩展名
    form.parse(req, function(err, fields, files) {
        var side = fields['side'];
        var path = files['idcard'].path;
        var idcard = require('../lib/baidu-ocr-idcard.js').create('your baidu api key');
        idcard.scan(path, side, function(err, data) {
            if(err){
                res.json(err);
                return;
            }
            res.json(data);
        })
    });
})

app.listen(8888)
