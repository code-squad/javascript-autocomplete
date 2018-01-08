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
	it('SearchWindow.caching', function() {
		let word = '오징'
		let testResult = ['오징',[['오징어볶음'], ['마른오징어'], ['오징어무국'], ['반건조오징어'], ['군산오징어'], ['오징어짬뽕'], ['총알오징어'], ['대왕오징어'], ['오징어집']]]
		searchWindow.caching(word, testResult)
		assert.deepEqual(searchWindow.memo, {[word]: testResult[1]})
	})
	it('SearchWindow.caching2', function() {
		let word = '된장'
		let word2 = '된장'
		searchWindow.caching(word, [0, 0])
		searchWindow.caching(word2, [0, 0])

		assert.deepEqual(searchWindow.memoLog, ['오징', '된장'])
	})
})
