/**
 * Copyright(c) 2015 JeremyWei <shuimuqingshu@gmail.com>
 *
 * OCR tests
 * 
 * MIT License
 */
var should = require('should');
var apikey = process.env.BAIDU_APIKEY;

if ( !apikey ) {
  console.log( 'Can not find  environment variable `BAIDU_APIKEY`, please run test like this:' );
  console.log( '$ BAIDU_APIKEY=xxxxxx make test' );
  process.exit();
}

var ocr = require('../.').create( apikey ),
  imagePath = __dirname + '/001.jpg',
  wrongTypeImagePath = __dirname + '/wrongType.png',
  wrongSizeImagePath = __dirname + '/wrongSize.jpg';

before( function( done ) {
  done();
});

describe( '#OCR', function() {
  before( function( done ) {
    done();
  });
  
  describe( 'LocateRecognize', function() {
    this.timeout(15000);
    it( 'should return `errNum` with 0, `word` with non empty string and `retData` with non empty array', function( done ) {
      ocr.scan( 'LocateRecognize', 'CHN_ENG', 2, imagePath, function( err, data ) {
        data.should.have.property( 'errNum', '0' );
        data.retData.length.should.above(0);
        /* jshint ignore:start */
        data.word.should.not.be.empty;
        /* jshint ignore:end */
        done();
      });
    });
  });
  
  describe( 'Locate', function() {
    this.timeout(15000);
    it( 'should return `errNum` with 0 and `retData` with non empty array', function( done ) {
      ocr.scan( 'Locate', 'CHN_ENG', 2, imagePath, function( err, data ) {
        data.should.have.property( 'errNum', '0' );
        data.retData.length.should.above(0);
        done();
      });
    });
  });
  
  
  describe( 'Recognize', function() {
    this.timeout(15000);
    it( 'should return `errNum` with 0 and `retData` with non empty array', function( done ) {
      ocr.scan( 'Recognize', 'CHN_ENG', 2, imagePath, function( err, data ) {
        data.should.have.property( 'errNum', '0' );
        data.retData.length.should.above(0);
        done();
      });
    });
  });
  
  describe( 'Wrong type image LocateRecognize', function() {
    this.timeout(15000);
    it( 'should return `errNum` with -1', function( done ) {
      ocr.scan( 'Recognize', 'CHN_ENG', 2, wrongTypeImagePath, function( err, data ) {
        err.should.have.property( 'errNum', -1 );
        should(data).be.exactly( null );
        done();
      });
    });
  });
  
  describe( 'Wrong size image LocateRecognize', function() {
    this.timeout(15000);
    it( 'should return `errNum` with -1', function( done ) {
      ocr.scan( 'Recognize', 'CHN_ENG', 2, wrongSizeImagePath, function( err, data ) {
        err.should.have.property( 'errNum', -1 );
        should(data).be.exactly( null );
        done();
      });
    });
  });
  
});