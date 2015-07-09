/**
 * Copyright(c) 2015 JeremyWei <shuimuqingshu@gmail.com>
 *
 * Baidu OCR
 *
 * MIT License
 */
var ocr = require('baidu-ocr').create( 'your api key' ),
  image = __dirname + '/001.jpg';

// detectType: LocateRecognize: 整图文字检测、识别,以行为单位（默认）
// languageType: CHN_ENG(中英)（默认）
// imageType: `2`代表图片原文件（只支持JPG，大小不能超过300K）
// image: 图片路径
ocr.scan( 'LocateRecognize', 'CHN_ENG', 2, image, function( err, data ) {
  if ( err ) {
    return console.error( err );
  }
  
  console.log( 'words:' );
  console.log( data.word );
});