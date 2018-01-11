import {EventHandler, AutoComplete, Networking, Cache, Util} from '../src/script.js'

const assert = chai.assert;

Util.redirect = function(param) {
	this.result = param;
}

describe('Networking Test', function(){
	let storage = new Cache()
	let networking = new Networking(storage, 100)
	it('오징, shoul equal', function(done) {
		const ohJingExpected = ["오징어볶음"
			,"마른오징어"
			,"오징어무국"
			,"반건조오징어"
			,"군산오징어"
			,"오징어짬뽕"
			,"총알오징어"
			,"대왕오징어"
			,"오징어집"];

		networking.sendAPIRequest("오징").then((data) => {
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
			,"강된장"];


		networking.sendAPIRequest("된장").then((data) => {
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
			,"오징어"];


		let func = function(data) {
			assert.notDeepEqual(data, ohJingExpected);
			done();
		};

		networking.sendAPIRequest("오징").then(func);
	});

});

describe('EventHandler', function(){
    let mockAuto = {
    	menuData: "",
		result: "",
		menuData: "",
		upKeyPressed: function() {
			this.result = "upkey";
		},
		downKeyPressed: function() {
			this.result = "downkey";
		},
		enterPressed: function() {
			this.result = "enter";
			return "enter";
		},
		close: function() {
			this.result = "close";
		},
		show: function(input) {
			this.result = input;
		},
		onSearchEvent: function() {
			this.result = "on search";
		}
	};

	let mockSearchBar = document.createElement("form");

	let mockInput = {
		value: "test"
	}

	let mockNetwork = {
		sendAPIRequest: function(query) {
			return new Promise((resolve) => {
				resolve(query);
			});
		}
	}

	let eventHandler = new EventHandler(mockNetwork,
									 mockAuto,
									  mockSearchBar,
									  mockInput,
									  "");

	it ('onKeyDown upkey Event Test', () => {
		let event = new Event("keydown");
		event.keyCode = 38;

		eventHandler.onKeyDown(event);

		assert.equal(mockAuto.result, "upkey");
	});

	it('onKeyDown downkey Event Test', () => {
		let event = new Event("keydown");
		event.keyCode = 40;

		eventHandler.onKeyDown(event);

		assert.equal(mockAuto.result, "downkey");
	});

	it('onKeyUp igonore cases Event Test', function() {
		let event = new Event("keyup");
		event.keyCode = 38;

		let temp = mockAuto.menuData;
		eventHandler.onKeyUp(event);
		assert.deepEqual(mockAuto.menuData, temp);

		event.keyCode = 40;
		eventHandler.onKeyUp(event);
		assert.deepEqual(mockAuto.menuData, temp);

		event.keyCode = 13;
		eventHandler.onKeyUp(event);
		assert.deepEqual(mockAuto.menuData, temp);
	});

	it('onKeyUp sendAPIRequest data available Event Test', function(done) {
		let event = new Event("keyup");
		event.keyCode = 65;  // 'a'

		eventHandler.inputText.value = 'test';
		eventHandler.onKeyUp(event);
		window.setTimeout(() => {
			assert.equal(mockAuto.menuData, 'test');
			assert.equal(mockAuto.result, 'test');
			done();
		}, 300);
	});

	it('onKeyUp sendAPIRequest data not available Event Test', function(done) {
		let event = new Event("keyup");
		event.keyCode = 65;  // 'a'

		eventHandler.inputText.value = '';
		eventHandler.onKeyUp(event);

		window.setTimeout(() => {
			assert.equal(eventHandler.autoComplete.result, 'close');
			done();
		}, 300);

	});

	it('searchButton Event Test', function() {
		let event = new Event("keyup");

		eventHandler.onSearchButtonClick(event);
		assert.equal(eventHandler.autoComplete.result, 'on search');
	});
});

describe('auto', function(){
    let resultListDom = document.createElement("div");
    resultListDom.classList.add('result_list');
   	let ul = document.createElement("ul");
   	resultListDom.appendChild(ul);

	let mockCache = {
		localData : {
			"recentCache" : []
		}
	}

    let auto = new AutoComplete(resultListDom, mockCache);
    auto.menuData.push("오징어볶음"
        ,"젖은오징어"
        ,"오징어무국"
        ,"반건조오징어"
        ,"군산오징어"
        ,"오징어짬뽕"
        ,"총알오징어"
        ,"대왕오징어"
        ,"오징어");

    it('show test', function(){
        auto.show('오징');
        let childList = resultListDom.childNodes[0].childNodes;
        assert.equal(resultListDom.style.display, "block");
        assert.equal(childList.length, auto.menuData.length);
        assert.include(childList[0].innerHTML, "<span>오징</span>");
    });

    it('close test', function() {
    	auto.close();

    	assert.equal(auto.selectedIndex, -1);
    	assert.equal(auto.resultListDOM.style.display, 'none');
    });

	it('enter pressed test', () => {
		auto.selectedIndex = 3;

		auto.onSearchEvent();

		assert.equal("?name=" + auto.menuData[3], Util.result);
	});

	it('upkey pressed test', function() {
		auto.show();
		auto.selectedIndex = 3;
		let childList = resultListDom.childNodes[0].children;
		childList[3].classList.add('selected');
		auto.upKeyPressed();

		assert.equal(auto.selectedIndex, 2);
		assert.notInclude(childList[3].className, "selected");
		assert.include(childList[2].className, "selected");
	});

	it('downkey pressed test', function() {
		auto.show();
		auto.selectedIndex = 4;
		let childList = resultListDom.childNodes[0].children;
		childList[4].classList.add('selected');
		auto.downKeyPressed();

		assert.equal(auto.selectedIndex, 5);
		assert.notInclude(childList[4].className, "selected");
		assert.include(childList[5].className, "selected");
	});
});
