const assert = chai.assert; 

describe('Networking Test', function(){
	it('오징, shoul equal', function(done) {
		const ohJingExpected = ["오징어볶음"
			,"마른오징어"
			,"오징어무국"
			,"반건조오징어"
			,"군산오징어"
			,"오징어짬뽕"
			,"총알오징어"
			,"대왕오징어"
			,"오징어집"]
		var networking = new Networking();

		networking.sendAPIRequest("오징", function(data) {
			assert.deepEqual(data, ohJingExpected); 
			done();
		});
	}); 

	it('된장, should equal', function(done) {
		const dwenJangExpected = ["된장소스 방풍나물"
			,"구수한 된장시래기"
			,"얼갈이된장무침"
			,"차돌박이 된장찌개"
			,"시금치 된장국"
			,"강된장"]

		var networking = new Networking();

		networking.sendAPIRequest("된장", function(data) {
			assert.deepEqual(data, dwenJangExpected); 
			done(); 
		});
	});

	it('오징, should not equal', function(done) {
		const ohJingExpected = ["오징어볶음"
			,"젖은오징어"
			,"오징어무국"
			,"반건조오징어"
			,"군산오징어"
			,"오징어짬뽕"
			,"총알오징어"
			,"대왕오징어"
			,"오징어"]

		var networking = new Networking();

		var func = function(data) {
			assert.notDeepEqual(data, ohJingExpected);
			done(); 
		};

		networking.sendAPIRequest("오징", func);
	});

}); 

