/**
 * Copyright(c) 2015 JeremyWei <shuimuqingshu@gmail.com>
 *
 * Baidu OCR
 *
 * MIT License
 */
var request = require('request'),
  fs = require('fs');

function OCR( apikey ) {
  this.apikey = apikey;
}

/**
 * ocr请求
 * http://apis.baidu.com/apistore/idlocr/ocr
 *
 * @param {String} detectType
    
    LocateRecognize: 整图文字检测、识别,以行为单位（默认）
    Locate:整图文字行定位
    Recognize:整图文字识别
    SingleCharRecognize:单字图像识别

 * @param {String} languageType

    CHN_ENG(中英)（默认）
    ENG（英文）
    JAP(日文)
    KOR(韩文)

 * @param {String} imageType

    图片资源类型：1.表示经过BASE64编码后的字串（默认）；2.图片原文件

 * @param {String} image 图片内容
 * @param {Function} cb
 * @api public
 */
OCR.prototype.scan = function scan( detectType, languageType, imageType, image, cb ) {
  
  var that = this;
  var formData = {
    fromdevice : 'node-baidu-ocr',
    clientip : '' || '10.10.10.0',
    detecttype : detectType,
    languagetype : languageType,
    imagetype : imageType,
    image : fs.createReadStream( image )
  };
  
  var options = {
    url: 'http://apis.baidu.com/apistore/idlocr/ocr',
    method: 'POST',
    formData: formData,
    headers: {
      'apikey': this.apikey
    }
  };
  
  request( options,  function ( err, res, body ) {
    if ( err ) {
      return cb( null, err );
    }
    
    // 处理请求结果
    var response = that._responseParse( detectType, body );
    
    // 出错
    if ( response.error ) {
      cb( response.data, null );
    } else {
      cb( null, response.data );
    }
  });
};

/**
 * 处理返回结果
 *
 * @param {Object} body
 * @api private
 */
OCR.prototype._responseParse = function( detectType, body ) {
  
  var data = JSON.parse( body );
  // 请求成功 
  if ( data.errNum && data.errNum === '0' ) {
    
    // 拼接成完整文字
    if ( detectType == 'LocateRecognize' ) {
      data.word = '';
      for ( var i = 0; i < data.retData.length; i++ ) {
        data.word += data.retData[i].word;
      }
    }
    
    return {
      error : false,
      data : data 
    };
    
  // 请求失败
  } else {
    return {
      error : true,
      data : {
        errNum : data.errNum, 
        errMsg : data.errMsg, 
        querySign : data.querySign
      }
    }
  }
};

module.exports.create = function( apikey ) {
  return new OCR( apikey );
};