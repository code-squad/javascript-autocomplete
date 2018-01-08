const assert = chai.assert;

describe('equal', function() {
	it('should not equal', function() {
		assert.equal(true, true);
	});
})

describe('add', function() {
	it('asdfasdf', function() {
		let sum = add(1, 2);
		assert.equal(sum, 4);
	});
})

describe('Util', function(){
	it('Util.getData', function(done) {
		var url = "http://crong.codesquad.kr:8080/ac/오징"
		var fn = function(result) {
			let testResult = ['오징',[['오징어볶음'], ['마른오징어'], ['오징어무국'], ['반건조오징어'], ['군산오징어'], ['오징어짬뽕'], ['총알오징어'], ['대왕오징어'], ['오징어집']]]
			assert.deepEqual(result, testResult);
			done();
		}
		Util.getData(url, fn)
	})
})

describe('SearchWindow', function(){
	it('SearchWindow.requestApi', function(done) {
		var url = "http://crong.codesquad.kr:8080/ac/";
		var word = "오징";

		var fn = function(result) {
			let testResult = ['오징',[['오징어볶음'], ['마른오징어'], ['오징어무국'], ['반건조오징어'], ['군산오징어'], ['오징어짬뽕'], ['총알오징어'], ['대왕오징어'], ['오징어집']]]
			assert.deepEqual(result, testResult);
			done();
		};

		SearchWindow.requestApi(word, fn)
	})
})