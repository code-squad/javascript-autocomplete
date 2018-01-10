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
const acResponder = new __WEBPACK_IMPORTED_MODULE_0__src_app_js__["c" /* ACResponder */](domContainer, acResource, acRenderer, baseURL);

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
        this.searchButton = document.querySelector('.search-button');
        this.searchField = document.querySelector('#search-field');
        this.autoCompleteList = document.querySelector('.auto-complete-list');
        this.recentKeywordList = document.querySelector('.recent-keyword-list')
    }
    getHoveredItem() {
		return document.querySelector('.hover');
	}
}

class ACResource {
    constructor() {
        this.acData = this.getLocalStorageItem('acData', {});
        this.acDataLog = this.getLocalStorageItem('acDataLog', []);
        this.acDataSize = 100;
        this.recentData = this.getLocalStorageItem('recentData', []);
        this.recentDataSize = 5;
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
            const key = this.acDataLog.shift();
            delete this.acData[key];
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
        if(!key) {
            return;
        }
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
    checkValidation(keyword) {
        const expiredTime = 6 * 60 * 60 * 1000
        // const expiredTime =  5 * 1000
        if(this.acData.hasOwnProperty(keyword) && (Date.now() - this.acData[keyword].create) < expiredTime) {
            return true;
        }
        return false;
    }
}

class ACResponder {
    constructor(domContainer, acResource, acRenderer, apiURL) {
        this.domContainer = domContainer
        this.acResource = acResource
        this.acRenderer = acRenderer
        this.apiURL = apiURL

        this.domContainer.searchField.addEventListener('keydown', this.checkKeyCode.bind(this));
        this.domContainer.searchField.addEventListener('input', this.changeSearchText.bind(this));
        this.domContainer.searchField.addEventListener('focusin', this.clickSearchField.bind(this));
        this.domContainer.autoCompleteList.addEventListener('mouseover', this.mouseOver.bind(this));
        this.domContainer.autoCompleteList.addEventListener('click', this.clickItem.bind(this));
        this.domContainer.searchButton.addEventListener('click', this.clickSearchButton.bind(this));
        this.domContainer.recentKeywordList.addEventListener('click', this.clickRemoveButton.bind(this));

        this.acRenderer.updateRecentList(this.acResource.recentData)
    }
    checkKeyCode(e) {
		switch(e.keyCode){
			case 38: //ArrowUp
				this.acRenderer.pressUpKey()
				break;
			case 40: //ArrowDown
				this.acRenderer.pressDownKey()
				break;
			case 13: //Enter
				this.acRenderer.pressEnterKey()
                break;
		}
	}
    changeSearchText(e) {
		const keyword = e.target.value;
        if(!keyword) {
            this.acRenderer.updateACList()
            return;
        }
        if(this.acResource.checkValidation(keyword)) {
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
		const item = e.target;
		if(!item || item.nodeName !== 'LI') {
			return;
		}
		this.acRenderer.putSelectedItemToField(item.dataset.name);
	}
	clickSearchButton(e) {
        this.acResource.cacheRecentData(this.domContainer.searchField.value);
        this.acRenderer.updateRecentList(this.acResource.recentData)
		this.acRenderer.clearSearchWindow();
	}
    clickSearchField(e) {
        this.domContainer.recentKeywordList.style.display = "block";
    }
    clickRemoveButton(e) {
        const target = e.target;
        if(!target || target.nodeName !== "IMG") {
            return;
        }
        const parent = target.parentNode.parentNode;
        const index = Array.prototype.indexOf.call(parent.children, target.parentNode);
        this.acResource.removeRecentItem(index)
        this.acRenderer.updateRecentList(this.acResource.recentData)
    }
}

class ACRenderer {
    constructor(domContainer) {
        this.domContainer = domContainer
    }
    updateACList(keyword, autoComplete) {
		const listDom = this.domContainer.autoCompleteList;
        if(!keyword) {
            this.domContainer.recentKeywordList.style.display = "block";
        } else {
            this.domContainer.recentKeywordList.style.display = "none";
        }
		if(!autoComplete) {
			listDom.innerHTML = ""
			return false
		}
		let listDomHTML = "";
		autoComplete.forEach((item) => {
			const itemHTML = item[0].replace(keyword, `<span>${keyword}</span>`);
			const itemDom = `<li data-name='${item[0]}'>${itemHTML}</li>`;
			listDomHTML += itemDom;
		});

		listDom.innerHTML = listDomHTML;
	}
    updateRecentList(recentData) {
        let listDomHTML = "";
        recentData.forEach((data) => {
            const dataHTML = `<li>${data}<img></li>`
            listDomHTML += dataHTML
        })
        this.domContainer.recentKeywordList.innerHTML = listDomHTML
    }
    clearSearchWindow() {
		this.domContainer.autoCompleteList.innerHTML = "";
		this.domContainer.searchField.value = "";
	}
    pressUpKey() {
        const currHoveredItem = this.domContainer.getHoveredItem();
        if(!currHoveredItem) {
            return;
        }
        if(currHoveredItem.previousElementSibling) {
            currHoveredItem.previousElementSibling.classList.add('hover');
            currHoveredItem.classList.remove('hover');
        }
    }
    pressDownKey() {
        const currHoveredItem = this.domContainer.getHoveredItem();
        if(!currHoveredItem) {
            const autoCompleteList = this.domContainer.autoCompleteList;
            if(autoCompleteList.childNodes) {
                autoCompleteList.childNodes[0].classList.add('hover')
            }
            return;
        }
        if(currHoveredItem.nextElementSibling) {
            currHoveredItem.nextElementSibling.classList.add('hover');
            currHoveredItem.classList.remove('hover');
        }
    }
    pressEnterKey() {
        const currHoveredItem = this.domContainer.getHoveredItem();
        if(!currHoveredItem) {
            return;
        }

        this.putSelectedItemToField(currHoveredItem.dataset.name);
    }
    changeHoveredItem(item) {
        const currHoveredItem = this.domContainer.getHoveredItem();
		if(currHoveredItem) {
			currHoveredItem.classList.remove('hover');
		}
		item.classList.add('hover');
    }
    putSelectedItemToField(word) {
        const searchField = this.domContainer.searchField;
        searchField.value = word;

        this.domContainer.autoCompleteList.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
	const baseURL = "http://crong.codesquad.kr:8080/ac/";
    const domContainer = new DomContainer();
    const acResource = new ACResource();
    const acRenderer = new ACRenderer(domContainer);
    const acResponder = new ACResponder(domContainer, acResource, acRenderer, baseURL);
});



/***/ })
/******/ ]);