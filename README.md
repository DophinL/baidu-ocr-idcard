# baidu-ocr-idcard
基于[百度OCR](http://apistore.baidu.com/apiworks/servicedetail/146.html)的二代身份证识别,for node

# Functionality
扫描第二代身份证，返回格式化数据，可在回调函数中进一步处理

# Limit
上传身份证之前请先对身份证上的头像进行模糊处理，否则`百度ocr`无法识别，深感抱歉。
这个问题已经向百度反馈，如果迟迟没有响应，我可能会添加头像模糊处理的功能。

# Install
暂时没有上传到`npm`，所以无法通过`npm install`的方式进行安装。
不过如果您对`node`的`require`有一定的了解，相信您能轻易使用。

# Usage
```
var idcard = require('../lib/baidu-ocr-idcard.js').create('your baidu api key');
    idcard.scan(path, side, function(err, data) {
        if(err){
            res.json(err);
            return;
        }
        res.json(data);
    })
```

# Examples
[Examples]()