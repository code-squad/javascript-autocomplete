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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomContainer", function() { return DomContainer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ACResource", function() { return ACResource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ACResponder", function() { return ACResponder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ACRenderer", function() { return ACRenderer; });
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
        searchField.addEventListener('keydown', this.checkKeyCode.bind(this));
        searchField.addEventListener('input', this.changeSearchText.bind(this));
        searchField.addEventListener('focusin', this.focusInSearchField.bind(this));
		searchField.addEventListener('focusout', this.focusOutSearchField.bind(this));
        autoCompleteList.addEventListener('mouseover', this.mouseOver.bind(this));
        autoCompleteList.addEventListener('click', this.clickItem.bind(this));
        this.domContainer.searchButton.addEventListener('click', this.clickSearchButton.bind(this));
        this.domContainer.recentKeywordList.addEventListener('click', this.clickRemoveButton.bind(this));

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
		const item = e.target;
		if(!item || item.nodeName !== 'LI') {
			return;
		}
		this.acRenderer.putSelectedItemToField(item.dataset.name);
	}
	clickSearchButton(e) {
        const key = this.domContainer.searchField.value
        if(key) {
            this.acResource.cacheRecentData(key);
        }
        this.acRenderer.updateRecentList(this.acResource.recentData)
		this.acRenderer.clearSearchWindow();
	}
    focusInSearchField(e) {
    	if (this.domContainer.searchField.value) {
			this.acRenderer.setDisplay(this.domContainer.recentKeywordList, false);
			this.acRenderer.setDisplay(this.domContainer.autoCompleteList, true);
        	return;
		}
		this.acRenderer.setDisplay(this.domContainer.recentKeywordList, true);
    }
	focusOutSearchField(e) {
		setTimeout(function(){
			this.acRenderer.setDisplay(this.domContainer.recentKeywordList, false);
			this.acRenderer.setDisplay(this.domContainer.autoCompleteList, false);
			if (this.acRenderer.hoveredItem) {
				this.acRenderer.hoveredItem.classList.remove('hover');
				this.acRenderer.hoveredItem = "";
			}
		}.bind(this), 100);
	}
    clickRemoveButton(e) {
        const target = e.target;
        if(!target || target.nodeName !== "IMG") {
            return;
        }
        const parent = target.parentNode.parentNode;
        const index = Array.from(parent.children).indexOf(target.parentNode);
        this.acResource.removeRecentItem(index)
        this.acRenderer.updateRecentList(this.acResource.recentData)
    }
}

class ACRenderer {
    constructor(domContainer) {
        this.domContainer = domContainer
        this.hoveredItem = ""
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