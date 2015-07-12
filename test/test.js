var should = require('should');
var idcardOCR = require('../lib/baidu-ocr-idcard').create(process.env.BAIDU_APIKEY);
var UNKNOWN_SIDE_MSG = "未识别出正反面";
var OBVERSE_SIDE_MSG = "识别成功，为正面";
var REVERSE_SIDE_MSG = "识别成功，为反面";

var unkonwnSideImg = __dirname+'/temp/unkonwnSideImg.jpg';
var obverseSideImg = __dirname+'/temp/obverse.jpg';
var reverseSideImg = __dirname+'/temp/reverse.jpg';

var OBVERSE_FORMAT = {
	name:'string',
	sex:'string',
	nation:'string',
	birthday:'string',
	residence:'string',
	idNum:'string',
	side:'string'
}

var REVERSE_FORMAT = {
	authority:'string',
	validPeriod:'string',
	side:'string'
}

describe('Scan', function() {
	describe('pass side as "obverse"', function() {
    	this.timeout(15000);
        it('should return `errNum` as 0, `errMsg` as OBVERSE_SIDE_MSG and `retData` as OBVERSE_FORMAT object', function(done) {
            idcardOCR.scan(unkonwnSideImg, 'obverse', function(err, data) {
            	var flag = isFitFormat(data.retData,OBVERSE_FORMAT);	//判断数据是否符合某种格式
                data.should.have.property('errNum', 0);
                data.should.have.property('errMsg', OBVERSE_SIDE_MSG);
                should(flag).be.true();
                done();
            });
        });
    });
    describe('pass side as "reverse"', function() {
    	this.timeout(15000);
        it('should return `errNum` as 0, `errMsg` as REVERSE_SIDE_MSG and `retData` as REVERSE_FORMAT object', function(done) {
            idcardOCR.scan(unkonwnSideImg, 'reverse', function(err, data) {
            	var flag = isFitFormat(data.retData,REVERSE_FORMAT);	//判断数据是否符合某种格式
                data.should.have.property('errNum', 0);
                data.should.have.property('errMsg', REVERSE_SIDE_MSG);
                should(flag).be.true();
                done();
            });
        });
    });
    describe('pass idcard as a false image & side as "auto"', function() {
    	this.timeout(15000);
        it('should return `errNum` as -1, `errMsg` as UNKNOWN_SIDE_MSG and `retData` as empty string', function(done) {
            idcardOCR.scan(unkonwnSideImg, 'auto', function(err, data) {
                err.should.have.property('errNum', -1);
                err.should.have.property('errMsg', UNKNOWN_SIDE_MSG);
                err.should.have.property('retData', '');
                done();
            });
        });
    });
    describe('pass idcard as a obverse idcard image & side as "auto"', function() {
    	this.timeout(15000);
        it('should return `errNum` as 0, `errMsg` as OBVERSE_SIDE_MSG and `retData` as OBVERSE_FORMAT object', function(done) {
            idcardOCR.scan(obverseSideImg, 'auto', function(err, data) {
            	var flag = isFitFormat(data.retData,OBVERSE_FORMAT);	//判断数据是否符合某种格式
                data.should.have.property('errNum', 0);
                data.should.have.property('errMsg', OBVERSE_SIDE_MSG);
                should(flag).be.true();
                done();
            });
        });
    });
    describe('pass idcard as a reverse idcard image & side as "auto"', function() {
    	this.timeout(15000);
        it('should return `errNum` as 0, `errMsg` as REVERSE_SIDE_MSG and `retData` as REVERSE_FORMAT object', function(done) {
            idcardOCR.scan(reverseSideImg, 'auto', function(err, data) {
            	var flag = isFitFormat(data.retData,REVERSE_FORMAT);	//判断数据是否符合某种格式
                data.should.have.property('errNum', 0);
                data.should.have.property('errMsg', REVERSE_SIDE_MSG);
                should(flag).be.true();
                done();
            });
        });
    });
});

//判断数据是否符合某种格式(format格式为:{'名':'类型'})
function isFitFormat(data,format){
	if(!isObj(data))
		return false;
	for(var k in format){
		if(typeof data[k] !== format[k])
			return false
	}
	return true;
}

//判断传入是否为对象
function isObj(o) {
    var type = /object\s(.*)]/.exec(Object.prototype.toString.call(o))[1];
    if (type === 'Object') {
        return true;
    }
    return false;
}

