const assert = chai.assert;

describe('equal', function() {
	it('should not equal', function() {
		assert.equal(true, true);
	});
})

describe('add', function() {
	it('add', function() {
		let sum = add(1, 2);
		assert.equal(sum, 4);
	});
})
