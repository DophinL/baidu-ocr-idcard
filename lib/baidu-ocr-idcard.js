/**
 * 基于百度OCR的身份证识别
 * @authors Dophin (940101379@qq.com)
 * @date    2015-07-07 21:22:49
 * @version 0.1.0
 */

//依赖
var formidable = require('formidable');
var fs = require('fs');
var os = require('os');

//全局变量
var OBVERSE = 'obverse';
var REVERSE = 'reverse';
var IDCARD = 'idcard'; //身份证对应的input的name值
var SIDE = 'side'; //身份证正反面对应的input的name值

function IDCardRecog(apikey) {
    this.apikey = apikey;
    this.uploadDir = os.tmpDir(); //默认图片存储路径
    this.manual = false; //默认自动识别正反面
}

/**
 * 对传入的身份证进行扫描，并返回格式化的识别数据
 * @param  {PlainObject} obj [req:可为原生req，也可以为express框架下的req;success:识别成功后的回调函数;error:识别失败后的回调函数]
 * @return {undefined}
 */
IDCardRecog.prototype.scan = function(obj) {
    var self = this;
    var req = obj.req,
        success_cb = obj.success,
        error_cb = obj.error;

    if (!req) {
        req = {}
    }
    if (typeof success_cb !== 'function') {
        success_cb = function() {}
    }
    if (typeof error_cb !== 'function') {
        error_cb = function() {}
    }

    var form = new formidable.IncomingForm();
    form.uploadDir = this.uploadDir;
    form.multiples = false; //不允许多文件上传
    form.keepExtensions = true; //保留扩展名

    form.parse(req, function(err, fields, files) {
        var ocr, image;
        var side = fields[SIDE]; //身份证的面(正反)

        if (err) {
            error_cb({
                errNum: -1,
                errMsg: err,
                retData: {}
            });
            return;
        }
        if (files[IDCARD].size === 0) {
            error_cb({
                errNum: -1,
                errMsg: '您还没上传身份证图片!',
                retData: {}
            });
            return;
        }

        var ocr = require('baidu-ocr').create(self.apikey);
        image = files[IDCARD].path;

        // detectType: `LocateRecognize`代表整图文字检测、识别,以行为单位（默认）  
        // languageType: `CHN_ENG`(中英)（默认）  
        // imageType: `2`代表图片原文件（只支持JPG，大小不能超过300K）
        // image: 图片路径  
        ocr.scan('LocateRecognize', 'CHN_ENG', 2, image, function(err, data) {
            if (err) {
                error_cb({
                    errNum: err.errNum,
                    errMsg: err.errMsg,
                    retData: {}
                });
                return;
            }
            success_cb(process(data, self.manual, side)); //返回加工后的数据
        });
    });
}



function process(data, flag, side) {
    var ret = {};
    var word = Trim(data.word); //去掉所有空白符
    data.errNum = parseInt(data.errNum);
    ret.retData = {};

    if (flag === false) { //自动识别
        side = recognizeSide(word);
        if (side === 'unknown') { //未识别出正反面
            ret.errNum = -1;
            ret.errMsg = '未识别出正反面';
            return ret;
        }
    } else { //手动识别
        // 若side值不存在或错误，则改用自动识别
        if (isSideUndefinedOrWrong(side)) {
            side = recognizeSide(word);
            if (side === 'unknown') { //未识别出正反面
                ret.errNum = -1;
                ret.errMsg = '未识别出正反面';
                return ret;
            }
        }
    }

    if (data.errNum === 0) { //识别成功
        if (Trim(data.word) === '') { //识别为空串
            ret.errNum = -1;
            ret.errMsg = '识别为空字符串';
        } else {
            ret.errNum = 0;
            ret.errMsg = data.errMsg;
            if (side === OBVERSE) { //正面
                ret.retData.name = faultTolerantProcessing(/姓名(.*)性别/, word);
                ret.retData.sex = faultTolerantProcessing(/性别(.*)民族/, word);
                ret.retData.nation = faultTolerantProcessing(/民族(.*)出生/, word);
                ret.retData.birthday = faultTolerantProcessing(/出生(.*)住址/, word);
                ret.retData.residence = faultTolerantProcessing(/住址(.*)公民身份号码/, word);
                ret.retData.idNum = faultTolerantProcessing(/公民身份号码(.*)/, word);
            } else { //反面
                ret.retData.authority = faultTolerantProcessing(/签发机关(.*)有效期限/, word);
                if (isFit(ret.retData.authority[0])) {
                    ret.retData.authority = ret.retData.authority.substr(1);
                }
                ret.retData.valid_period = dateFormat(faultTolerantProcessing(/有效期限(.*)/, word));
            }
        }
    } else { //识别出错
        ret.errNum = data.errNum;
        ret.errMsg = data.errMsg;
    }

    return ret;

    /*================辅助函数================*/
    //看该字符是否满足要求
    function isFit(c) {
        var fit_arr = ['-', '一', '·', '.'];
        return fit_arr.some(function(v) {
            return (v === c);
        })
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
        })
        if (obverse_flag === true) { //如果为正面
            return 'obverse';
        }

        reverse_flag = reverse_arr.some(function(v) {
            if (s.indexOf(v) === -1) { //没找到
                return false;
            } else {
                return true;
            }
        })
        if (reverse_flag === true) { //如果为反面
            return 'reverse';
        }
        return 'unknown';
    }

    //正则表达式容错处理
    function faultTolerantProcessing(reg, s) {
        var ret;
        try {
            ret = reg.exec(s)[1];
        } catch (e) {
            ret = '';
        }
        return ret;
    }

    function isSideUndefinedOrWrong(s) {
        if (s === undefined || (s !== OBVERSE && s !== REVERSE)) {
            return true;
        } else {
            return false;
        }
    }

    function dateFormat(s) {
        if (s.length < 16) {
            return s;
        }
        var start = s.substr(0, 8);
        var end = s.substr(-8, 8);
        return (filter(start) + '-' + filter(end));

        function filter(s) {
            debugger;
            var arr = s.split('');
            arr.splice(4, 0, '.');
            arr.splice(7, 0, '.');
            return arr.join('');
        }
    }

    function Trim(s) {
        return s.replace(/\s/g, '');
    }

}

exports.create = function(apikey) {
    return new IDCardRecog(apikey);
}
