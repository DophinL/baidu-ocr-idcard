
Baidu-ocr
===========

[百度OCR文字识别](http://apistore.baidu.com/apiworks/servicedetail/146.html)API For Node

Install
===========

	npm install baidu-ocr

Test
===========

	BAIDU_APIKEY='your api key' make test
	
How to use
===========

    var ocr = require('baidu-ocr').create( 'your api key' ),
      image = __dirname + '/love-letter.jpg';

    // detectType: `LocateRecognize`代表整图文字检测、识别,以行为单位（默认）  
    // languageType: `CHN_ENG`(中英)（默认）  
    // imageType: `2`代表图片原文件（只支持JPG，大小不能超过300K）
    // image: 图片路径  
    ocr.scan( 'LocateRecognize', 'CHN_ENG', 2, image, function( err, data ) {
      if ( err ) {
        return console.error( err );
      }

      console.log( 'words:' );
      console.log( data.word );
    });

实测
===========

识别率几乎100%

![启示录](https://github.com/JeremyWei/baidu-ocr/blob/master/test/001.jpg)

```
一、中央官制  
（一）汉初的丞相制
汉初的官制，大体因袭秦代，中央政府的高级官吏，仍
以丞相、太尉御史大夫为主，汉人称之为“三公”。丞相仍
是全国官吏的最高首长，掌理国家的大政；其他重要官员的
职掌也与秦时没有多大出入。所不同的，只是有若干官名
更动，并且新添了一些职官而已。

高祖即帝位后，以萧何为丞相，末年改丞相为相国，仍
以萧任之惠帝时，曹参继任相国。惠帝五年（前1，90)参
死，汉取消相国，改置左右丞相，名次以右丞相居先。文帝
二年（前178）撤销左右丞相，改置丞相一人；其后直至哀
帝时，始改名为大司徒。丞相金印紫绶，秩万石。其重要僚
属有丞相司直—人（武帝时始设，秩二千石）司佐丞相纠
不法；丞相长史二人（秩举相征事、丞千石）司领导群僚；其下
又有丞相相史等。丞相史原为十五人，武帝时增至二十人
```

LICENSE
===========
The MIT License (MIT)
Copyright (c) 2014 Jeremy Wei

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
