const assert = chai.assert;

describe('ACResource.getData', function(){
	it('"오징" 검색', function(done) {
		let word = '오징'
		var fn = function(result) {
			let testResult = ['오징',[['오징어볶음'], ['마른오징어'], ['오징어무국'], ['반건조오징어'], ['군산오징어'], ['오징어짬뽕'], ['총알오징어'], ['대왕오징어'], ['오징어집']]]
			assert.deepEqual(result, testResult);
			done();
		}
		acResource.getData(baseURL + word, fn)
	})
})

describe('ACResource.caching', function(){
	it('"오징" 한번 캐싱', function() {
		let word = '오징'
		let testResult = ['오징',[['오징어볶음'], ['마른오징어'], ['오징어무국'], ['반건조오징어'], ['군산오징어'], ['오징어짬뽕'], ['총알오징어'], ['대왕오징어'], ['오징어집']]]
		acResource.caching(word, testResult[1])
		assert.deepEqual(acResource.memo, {[word]: testResult[1]})
	})
	it('"된장" 두번 캐싱', function() {
		let word = '된장'
		let word2 = '된장'
		acResource.caching(word, [0, 0])
		acResource.caching(word2, [0, 0])

		assert.deepEqual(acResource.memoLog, ['오징', '된장'])
	})
})

describe('searchField keydown', function(){
	it('화살표 아래로', function() {
		domContainer.autoCompleteList.innerHTML += "<li data-name='0'>0</li>"
		domContainer.autoCompleteList.innerHTML += "<li data-name='1'>1</li>"
		domContainer.autoCompleteList.innerHTML += "<li data-name='2'>2</li>"

		const evt = new Event('keydown');
		evt.keyCode = 40;
		domContainer.searchField.dispatchEvent(evt);
		domContainer.searchField.dispatchEvent(evt);

		assert.equal(domContainer.autoCompleteList.childNodes[1].className, "hover");
	})
	it('화살표 위로', function() {
		const evt = new Event('keydown');
		evt.keyCode = 38;
		domContainer.searchField.dispatchEvent(evt);

		assert.equal(domContainer.autoCompleteList.childNodes[1].className, "");
		assert.equal(domContainer.autoCompleteList.childNodes[0].className, "hover");
	})
	it('엔터', function() {
		const evt = new Event('keydown');
		evt.keyCode = 13;
		domContainer.searchField.dispatchEvent(evt);

		assert.equal(domContainer.searchField.value, "0");
	})
})

describe('searchField input', function() {
	it('키워드 "오징" 입력', function () {
		domContainer.autoCompleteList.innerHTML = ""

		const evt = new Event('input', {
			bubbles: true,
			cancelable: true
		});
		domContainer.searchField.value = "오징";
		domContainer.searchField.dispatchEvent(evt);

		console.log(domContainer.autoCompleteList.childNodes);
		assert.equal(domContainer.autoCompleteList.childNodes.length, 9);
	})
})

describe('autoCompleteList mouseover', function() {
	it('"오징어무국" 아이템 위에 마우스 올리기', function () {
		const evt = new Event('mouseover', {
			bubbles: true,
			cancelable: true
		});
		domContainer.autoCompleteList.childNodes[2].dispatchEvent(evt);

		assert.equal(domContainer.autoCompleteList.childNodes[2].className, "hover");
	})
})

describe('autoCompleteList click', function() {
	it('"오징어무국" 아이템 선택', function () {
		const evt = new MouseEvent("click", {
			bubbles: true
		});
		domContainer.autoCompleteList.childNodes[2].dispatchEvent(evt);

		assert.equal(domContainer.searchField.value, "오징어무국");
	})
})

describe('searchButton click', function() {
	it('검색버튼 선택', function () {
		const evt = new MouseEvent("click");
		domContainer.searchButton.dispatchEvent(evt);

		assert.equal(domContainer.autoCompleteList.innerHTML, "");
		assert.equal(domContainer.searchField.value, "");
	})
})