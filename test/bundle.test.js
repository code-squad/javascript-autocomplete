/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_app_js__ = __webpack_require__(1);
const assert = chai.assert;

const baseURL = "http://crong.codesquad.kr:8080/ac/";
const domContainer = new __WEBPACK_IMPORTED_MODULE_0__src_app_js__["d" /* DomContainer */]();
const acResource = new __WEBPACK_IMPORTED_MODULE_0__src_app_js__["b" /* ACResource */]();
const acRenderer = new __WEBPACK_IMPORTED_MODULE_0__src_app_js__["a" /* ACRenderer */](domContainer);
const acResponder = new __WEBPACK_IMPORTED_MODULE_0__src_app_js__["c" /* ACResponder */]({
	domContainer: domContainer,
	acResource: acResource,
	acRenderer: acRenderer,
	apiURL: baseURL
});
localStorage.clear();

describe('ACResource.getData', function(){
	it('"오징" 검색', function(done) {
		const word = '오징'
		const fn = function(result) {
			let testResult = ['오징',[['오징어볶음'], ['마른오징어'], ['오징어무국'], ['반건조오징어'], ['군산오징어'], ['오징어짬뽕'], ['총알오징어'], ['대왕오징어'], ['오징어집']]]
			assert.deepEqual(result, testResult);
			done();
		}
		acResource.getData(baseURL + word).then((data) => {
			fn(data);
		})
	})
})

describe('ACResource.cacheACData', function(){
	it('"오징" 한번 캐싱', function() {
		let word = '오징'
		let testResult = ['오징',[['오징어볶음'], ['마른오징어'], ['오징어무국'], ['반건조오징어'], ['군산오징어'], ['오징어짬뽕'], ['총알오징어'], ['대왕오징어'], ['오징어집']]]
		acResource.cacheACData(word, testResult[1])
		assert.deepEqual(JSON.parse(localStorage.getItem('acData'))[word].result, testResult[1])
	})
	it('"된장" 두번 캐싱', function() {
		let word = '된장'
		let word2 = '된장'
		acResource.cacheACData(word, [0, 0])
		acResource.cacheACData(word2, [0, 0])

		assert.deepEqual(JSON.parse(localStorage.getItem('acDataLog')), ['오징', '된장'])
	})
})

describe('ACResource.cacheRecentData', function(){
	it('검색어 "오징어볶음" 캐싱', function(done) {
		let word = '오징어볶음'
		acResource.cacheRecentData(word)
		assert.include(JSON.parse(localStorage.getItem('recentData')), word);
		done();
	})
	it('검색어 "마른오징어" 캐싱', function(done) {
		let word = '마른오징어'
		acResource.cacheRecentData(word)
		assert.include(JSON.parse(localStorage.getItem('recentData')), word);
		done();
	})
})


describe('searchField keydown', function(){
	it('화살표 아래로', function() {
		domContainer.autoCompleteList.innerHTML = "<li data-name='0'>0</li>"
		domContainer.autoCompleteList.innerHTML += "<li data-name='1'>1</li>"
		domContainer.autoCompleteList.innerHTML += "<li data-name='2'>2</li>"

		const evt = new Event('keydown');
		evt.keyCode = 40;
		domContainer.searchField.dispatchEvent(evt);

		assert.equal(domContainer.autoCompleteList.childNodes[0].className, "hover");
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


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return DomContainer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return ACResource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return ACResponder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ACRenderer; });
class DomContainer {
    constructor() {
        this.searchBar = document.querySelector('.search-bar');
        this.searchButton = document.querySelector('.search-button');
        this.searchField = document.querySelector('#search-field');
        this.autoCompleteList = document.querySelector('.auto-complete-list');
        this.recentKeywordList = document.querySelector('.recent-keyword-list')
    }
}

class ACResource {
    constructor() {
        this.acData = this.getLocalStorageItem('acData', {});
        this.acDataLog = this.getLocalStorageItem('acDataLog', []);
        this.acDataSize = 100;
        this.recentData = this.getLocalStorageItem('recentData', []);
        this.recentDataSize = 5;
        this.expiredTime = 6 * 60 * 60 * 1000
    }
    getData(url) {
        return fetch(url)
        .then(response => response.json()
            .then(data => data)
        )
        .catch((err) => {
            console.log("error: ", err);
        })
    }
    cacheACData(key, value) {
        if (this.acDataLog.length >= this.acDataSize) {
            const firstKey = this.acDataLog.shift();
            delete this.acData[firstKey];
        }

		const index = this.acDataLog.indexOf(key)
		if(index !== -1) {
			this.acDataLog.splice(index, 1)
		}
        this.acData[key] = {
            result: value,
            create: Date.now()
        }
		this.acDataLog.push(key);

        this.setLocalStorageItem('acData', this.acData);
        this.setLocalStorageItem('acDataLog', this.acDataLog);
    }
    cacheRecentData(key) {
        const index = this.recentData.indexOf(key)
        if(index !== -1) {
            this.recentData.splice(index, 1)
        }
		if (this.recentData.length >= this.recentDataSize) {
			this.recentData.pop();
		}

		this.recentData.unshift(key);
		this.setLocalStorageItem('recentData', this.recentData);
	}
	getLocalStorageItem(key, defaultValue) {
		if (!localStorage.hasOwnProperty(key)) {
			return defaultValue;
		}
		return JSON.parse(localStorage.getItem(key));
	}
	setLocalStorageItem(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}
    removeRecentItem(index) {
        this.recentData.splice(index, 1);
        this.setLocalStorageItem('recentData', this.recentData);
    }
    isExpired(keyword) {
        const elapsedTime = Date.now() - this.acData[keyword].create
        if(elapsedTime < this.expiredTime) {
            return false;
        }
        return true;
    }
}

class ACResponder {
    constructor(parameter) {
		this.domContainer = parameter['domContainer'];
		this.acResource = parameter['acResource'];
		this.acRenderer = parameter['acRenderer'];
		this.apiURL = parameter['apiURL'];
        this.keyboardMap = {
            38: this.acRenderer.pressUpKey.bind(this.acRenderer),
            40: this.acRenderer.pressDownKey.bind(this.acRenderer),
            13: this.acRenderer.pressEnterKey.bind(this.acRenderer)
        }

        const searchField = this.domContainer.searchField
        const autoCompleteList = this.domContainer.autoCompleteList
		const recentKeywordList = this.domContainer.recentKeywordList
        searchField.addEventListener('keydown', this.checkKeyCode.bind(this));
        searchField.addEventListener('input', this.changeSearchText.bind(this));
        searchField.addEventListener('focusin', this.focusInSearchField.bind(this));
		searchField.addEventListener('focusout', this.focusOutSearchField.bind(this));
        autoCompleteList.addEventListener('mouseover', this.mouseOver.bind(this));
        autoCompleteList.addEventListener('click', this.clickItem.bind(this));
        autoCompleteList.addEventListener('mousedown', this.mouseDownItem.bind(this));
		recentKeywordList.addEventListener('click', this.clickItem.bind(this));
		recentKeywordList.addEventListener('mousedown', this.mouseDownItem.bind(this));
        this.domContainer.searchButton.addEventListener('click', this.clickSearchButton.bind(this));
        this.acRenderer.updateRecentList(this.acResource.recentData)
    }
    checkKeyCode(e) {
        if(this.keyboardMap[e.keyCode]) {
            this.keyboardMap[e.keyCode]()
        }
	}
    changeSearchText(e) {
		const keyword = e.target.value;
		const recentKeywordList = this.domContainer.recentKeywordList;
		const autoCompleteList = this.domContainer.autoCompleteList;
        if(!keyword) {
            this.acRenderer.updateACList()
			this.acRenderer.setDisplay(recentKeywordList, true);
			this.acRenderer.setDisplay(autoCompleteList, false);
            return;
        }
		this.acRenderer.setDisplay(recentKeywordList, false);
		this.acRenderer.setDisplay(autoCompleteList, true);

        if(this.acResource.acData.hasOwnProperty(keyword) && !this.acResource.isExpired(keyword)) {
            this.acRenderer.updateACList(keyword, this.acResource.acData[keyword].result);
            return
        }
		const url = this.apiURL + keyword;
		this.acResource.getData(url).then((data) => {
            this.acResource.cacheACData(keyword, data[1]);
    		this.acRenderer.updateACList(keyword, this.acResource.acData[keyword].result);
        })
	}
    mouseOver(e) {
		const item = e.target;
		if(!item || item.nodeName !== 'LI') {
			return;
		}
        this.acRenderer.changeHoveredItem(item)
	}
	clickItem(e) {
		this.acRenderer.isMouseDown = false;
		const item = e.target;
		if(!item || (item.nodeName !== 'LI' && item.nodeName !== "IMG")) {
			return;
		}
		if (item.nodeName === 'LI') {
			this.acRenderer.putSelectedItemToField(item.dataset.name);
			this.acRenderer.setDisplay(this.domContainer.recentKeywordList, false);
			this.acRenderer.setDisplay(this.domContainer.autoCompleteList, false);
		}
		if (item.nodeName === 'IMG') {
			const parent = item.parentNode.parentNode;
			const index = Array.from(parent.children).indexOf(item.parentNode);
			this.acResource.removeRecentItem(index)
			this.acRenderer.updateRecentList(this.acResource.recentData)
			this.domContainer.searchField.focus();
		}
	}
	mouseDownItem(e) {
		this.acRenderer.isMouseDown = true;
	}
	clickSearchButton(e) {
        const key = this.domContainer.searchField.value
        if(key.trim()) {
            this.acResource.cacheRecentData(key);
        }
        this.acRenderer.updateRecentList(this.acResource.recentData)
		this.acRenderer.clearSearchWindow();
	}
    focusInSearchField(e) {
		this.acRenderer.isMouseDown = false;
    	if (this.domContainer.searchField.value) {
			this.acRenderer.setDisplay(this.domContainer.recentKeywordList, false);
			this.acRenderer.setDisplay(this.domContainer.autoCompleteList, true);
        	return;
		}
		this.acRenderer.setDisplay(this.domContainer.recentKeywordList, true);
    }
	focusOutSearchField(e) {
    	if (this.acRenderer.isMouseDown) return;

		this.acRenderer.setDisplay(this.domContainer.recentKeywordList, false);
		this.acRenderer.setDisplay(this.domContainer.autoCompleteList, false);
		if (this.acRenderer.hoveredItem) {
			this.acRenderer.hoveredItem.classList.remove('hover');
			this.acRenderer.hoveredItem = "";
		}
	}
}

class ACRenderer {
    constructor(domContainer) {
        this.domContainer = domContainer
        this.hoveredItem = ""
		this.isMouseDown = false
    }
    updateACList(keyword, autoComplete) {
		const autoCompleteList = this.domContainer.autoCompleteList;
		if(!autoComplete) {
			autoCompleteList.innerHTML = ""
			this.hoveredItem = "";
			return false
		}
		let listDomHTML = "";
		autoComplete.forEach((item) => {
			const itemHTML = item[0].replace(keyword, `<span>${keyword}</span>`);
			const itemDom = `<li data-name='${item[0]}'>${itemHTML}</li>`;
			listDomHTML += itemDom;
		});

		autoCompleteList.innerHTML = listDomHTML;
	}
    updateRecentList(recentData) {
        let listDomHTML = "";
        recentData.forEach((data) => {
            const dataHTML = `<li data-name='${data}'>${data}<img></li>`
            listDomHTML += dataHTML
        })
        this.domContainer.recentKeywordList.innerHTML = listDomHTML
    }
    clearSearchWindow() {
		this.domContainer.autoCompleteList.innerHTML = "";
		this.domContainer.searchField.value = "";
	}
    pressUpKey() {
        if(!this.hoveredItem) {
            return;
        }

		const previousSibling = this.hoveredItem.previousElementSibling;
        if(previousSibling) {
			previousSibling.classList.add('hover');
            this.hoveredItem.classList.remove('hover');
            this.hoveredItem = previousSibling
        }
    }
    pressDownKey() {
        if(!this.hoveredItem) {
            const autoCompleteList = this.domContainer.autoCompleteList;
            if(autoCompleteList.childNodes) {
                autoCompleteList.childNodes[0].classList.add('hover')
                this.hoveredItem = autoCompleteList.childNodes[0]
            }
            return;
        }

		const nextSibling = this.hoveredItem.nextElementSibling;
        if(nextSibling) {
			nextSibling.classList.add('hover');
            this.hoveredItem.classList.remove('hover');
            this.hoveredItem = nextSibling
        }
    }
    pressEnterKey() {
        if(!this.hoveredItem) {
            return;
        }
        this.putSelectedItemToField(this.hoveredItem.dataset.name);
    }
    changeHoveredItem(item) {
		if(this.hoveredItem) {
			this.hoveredItem.classList.remove('hover');
		}
		item.classList.add('hover');
        this.hoveredItem = item
    }
    putSelectedItemToField(word) {
        const searchField = this.domContainer.searchField;
        searchField.value = word;
        this.domContainer.autoCompleteList.innerHTML = '';
        this.hoveredItem = "";
    }
    setDisplay(dom, isShow) {
		dom.style.display = (isShow) ? 'block' : 'none';
	}
}

document.addEventListener('DOMContentLoaded', function () {
	const baseURL = "http://crong.codesquad.kr:8080/ac/";
    const domContainer = new DomContainer();
    const acResource = new ACResource();
    const acRenderer = new ACRenderer(domContainer);
    const acResponder = new ACResponder({
		domContainer: domContainer,
		acResource: acResource,
		acRenderer: acRenderer,
		apiURL: baseURL
	});
});



/***/ })
/******/ ]);