/**
 * 基于百度OCR的身份证识别
 * @authors Dophin (940101379@qq.com)
 * @date    2015-07-07 21:22:49
 * @version 1.0.0
 */

//配置
var OBVERSE = 'obverse';
var REVERSE = 'reverse';
var UNKNOWN_SIDE_MSG = '未识别出正反面';
var OBVERSE_SIDE_MSG = '识别成功，为正面';
var REVERSE_SIDE_MSG = '识别成功，为反面';

function IDCardOCR(apikey) {
    this.apikey = apikey;
}

/**
 * 扫描身份证，返回格式化数据，可在回调函数中处理
 * @param  {string}   idcard 身份证图片的路径
 * @param  {string}   side   身份证的正反面，正面为'obverse'，反面为'reverse'，除此之外皆看做自动识别正反面
 * @param  {Function} cb     回调函数，可对扫描结果进行进一步处理
 * @return {undefined}          
 */
IDCardOCR.prototype.scan = function(idcard, side, cb) {

    if (typeof cb !== 'function') { //容错处理
        cb = function() {}
    }

    var ocr = require('baidu-ocr').create(this.apikey);

    // detectType: `LocateRecognize`代表整图文字检测、识别,以行为单位（默认）  
    // languageType: `CHN_ENG`(中英)（默认）  
    // imageType: `2`代表图片原文件（只支持JPG，大小不能超过300K）
    // image: 图片路径  
    ocr.scan('LocateRecognize', 'CHN_ENG', 2, idcard, function(err, data) {
        if (err) {
            cb(retObj(-1, err.errMsg), null);
            return;
        }

        var word = Trim(data.word); //去掉字符串中的空白符
        word = deleteSpeChar(word); //去掉字符串中的特殊字符

        if (isSideValWrong(side)) { //自动识别
            side = recognizeSide(word);
            if (side === 'unknown') { //未识别出正反面
                cb(retObj(-1, UNKNOWN_SIDE_MSG), null);
                return;
            }
        }

        var retData = {};
        if (side === OBVERSE) { //正面
            retData.name = extractName(word);
            retData.sex = extractSex(word);
            retData.nation = extractNation(word);
            retData.birthday = extractBirthday(word);
            retData.residence = extractResidence(word);
            retData.idNum = extractIdNum(word);
            retData.side = 'obverse';
            cb(null, retObj(0, OBVERSE_SIDE_MSG, retData));
        } else { //反面
            retData.authority = extractAuthority(word);
            retData.validPeriod = extractValidPeriod(word);
            retData.side = 'reverse';
            cb(null, retObj(0, REVERSE_SIDE_MSG, retData));
        }
    });

}

exports.create = function(apikey) {
    return new IDCardOCR(apikey);
}

if (process.env.IN_TEST) {
    exports.extractValidPeriod = extractValidPeriod;
    exports.extractBirthday = extractBirthday;
}

/*================正则匹配================*/
function extractName(s) {
    var reg = /姓名(.*)性别/;
    var result = reg.exec(s);
    if (!result)
        return '';
    return result[1];
}

function extractSex(s) {
    var reg = /性别(.*)民族/;
    var result = reg.exec(s);
    if (!result)
        return '';
    return result[1];
}

function extractNation(s) {
    var reg = /民族(.*)出生/;
    var result = reg.exec(s);
    if (!result)
        return '';
    return result[1];
}

function extractBirthday(s) {
    var reg = /出生(.*)住址/;
    var result = reg.exec(s);
    if (!result)
        return '';
    var year,month,day;
    year = extractYear(result[1]);  //result[1]可能为空字符串
    month = extractMonth(result[1]);
    day = extractDay(result[1]);

    return year+'-'+month+'-'+day;

    function extractYear(s){
        var arr = /(\d*)年/.exec(s);
        if(!arr)
            return 'xxxx';
        if(isNaN(parseInt(arr[1]))) //如果不是数值
            return 'xxxx';
        return arr[1];
    }
    function extractMonth(s){
        var arr = /年(\d*)月/.exec(s);
        if(!arr)
            return 'xx';
        if(isNaN(parseInt(arr[1]))) {//如果不是数值
            return 'xx';
        }else{  //是数值
            if(parseInt(arr[1])<10)
                return '0'+arr[1];
        }
        return arr[1];
    }
    function extractDay(s){
        var arr = /月(\d*)日/.exec(s);
        if(!arr)
            return 'xx';
        if(isNaN(parseInt(arr[1]))) {//如果不是数值
            return 'xx';
        }else{  //是数值
            if(parseInt(arr[1])<10)
                return '0'+arr[1];
        }
        return arr[1];
    }
}

function extractResidence(s) {
    var reg = /住址(.*)公民身份/;
    var result = reg.exec(s);
    if (!result)
        return '';
    return result[1];
}

function extractIdNum(s) {
    var reg = /身份号码(.*)/;
    var result = reg.exec(s);
    if (!result)
        return '';
    reg = /\d/g;
    return result[1].match(reg).join('');
}

function extractAuthority(s) {
    var reg = /签发机关(.*)有效期限/;
    var result = reg.exec(s);
    if (!result)
        return '';
    return result[1];
}

function extractValidPeriod(s) {
    var reg = /有效期限(.*)/;
    var result = reg.exec(s);
    if (!result)
        return '';
    return dateFormat(result[1]); //

    function dateFormat(s) {
        var reg = /\d/g;
        s = s.match(reg).join(''); //取出数字部分
        if (s.length !== 16) {
            return s;
        }
        var start = s.substr(0, 8);
        var end = s.substr(8, 8);
        return (format(start) + '~' + format(end));

        function format(s) {
            var arr = s.split('');
            arr.splice(4, 0, '-');
            arr.splice(7, 0, '-');
            return arr.join('');
        }
    }
}

function retObj(errNum, errMsg, retData) {
    if (!retData)
        retData = '';
    return {
        errNum: errNum,
        errMsg: errMsg,
        retData: retData
    }
}

//识别正反面
function recognizeSide(s) {
    var obverse_arr = ['姓名', '性别', '民族', '出生', '住址', '号码']; //正面标识
    var reverse_arr = ['共和国', '居民身份证', '签发机关', '有效期限']; //反面标识
    var obverse_flag, reverse_flag;
    obverse_flag = obverse_arr.some(function(v) {
        if (s.indexOf(v) === -1) { //没找到
            return false;
        } else {
            return true;
        }
    });
    if (obverse_flag === true) { //如果为正面
        return OBVERSE;
    }

    reverse_flag = reverse_arr.some(function(v) {
        if (s.indexOf(v) === -1) { //没找到
            return false;
        } else {
            return true;
        }
    });
    if (reverse_flag === true) { //如果为反面
        return REVERSE;
    }
    return 'unknown';
}

function isSideValWrong(s) {
    if (s !== OBVERSE && s !== REVERSE) {
        return true;
    } else {
        return false;
    }
}

/*================辅助函数================*/
//去除字符串中的所有空白符
function Trim(s) {
    return s.replace(/\s/g, '');
}

//祛除字符串中的所有特殊字符
function deleteSpeChar(s){
    var set = '：·`:,.。‘~*-+=%$#@!;、&%．';
    var reg = new RegExp('[^'+set+']','g');
    return s.match(reg).join('');
}
