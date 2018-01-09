//ployfill
if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement /*, fromIndex*/) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.includes called on null or undefined');
        }

        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1], 10) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {
                k = 0;
            }
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement
                	&& currentElement !== currentElement)) { // NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}

class DomContainer {
    constructor() {
        this.appBar = document.querySelector('.app-bar');
        this.searchButton = document.querySelector('.search-button');
        this.searchBar = document.querySelector('.search-bar');
        this.searchField = document.querySelector('#search-field');
        this.autoCompleteList = document.querySelector('.auto-complete-list');
    }
    getHoveredItem() {
		return document.querySelector('.hover');
	}
}

class ACResource {
    constructor() {
        this.memo = {};
        this.memoLog = [];
        this.memoSize = 100;
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
    caching(key, value) {
        if (this.memo.hasOwnProperty(key)) {
            return;
        }

        if (this.memoLog.length > this.memoSize) {
            const key = this.memoLog.shift();
            delete this.memo[key];
        }

        this.memo[key] = value;
        this.memoLog.push(key);
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
        this.domContainer.autoCompleteList.addEventListener('mouseover', this.mouseOver.bind(this));
        this.domContainer.autoCompleteList.addEventListener('click', this.clickedItem.bind(this));
        this.domContainer.searchButton.addEventListener('click', this.clickedSearchButton.bind(this));
    }
    checkKeyCode(e) {
		switch(e.keyCode){
			case 38: //ArrowUp
				this.acRenderer.pressedUpKey()
				break;
			case 40: //ArrowDown
				this.acRenderer.pressedDownKey()
				break;
			case 13: //Enter
				this.acRenderer.pressedEnterKey()
                break;
		}
	}
    changeSearchText(e) {
		const keyword = e.target.value;
		if (this.acResource.memo.hasOwnProperty(keyword)) {
			this.acRenderer.updateRendering(keyword, this.acResource.memo[keyword]);
			return;
		}

		const url = this.apiURL + keyword;
		this.acResource.getData(url).then((data) => {
            this.acResource.caching(keyword, data[1]);
    		this.acRenderer.updateRendering(keyword, this.acResource.memo[keyword]);
        })
	}
    mouseOver(e) {
		const item = e.target;
		if(!item || item.nodeName !== 'LI') {
			return;
		}
        this.acRenderer.changeHoveredItem(item)
	}
	clickedItem(e) {
		const item = e.target;
		if(!item || item.nodeName !== 'LI') {
			return;
		}
		this.acRenderer.putSelectedItemToField(item.dataset.name);
	}
	clickedSearchButton(e) {
		this.acRenderer.launchSearchEvent();
	}
}

class ACRenderer {
    constructor(domContainer) {
        this.domContainer = domContainer
    }
    updateRendering(keyword, autoComplete) {
		const listDom = this.domContainer.autoCompleteList;
		if(!autoComplete){
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
    launchSearchEvent(keyword) {
		this.domContainer.autoCompleteList.innerHTML = "";
		this.domContainer.searchField.value = "";
	}
    pressedUpKey() {
        const currHoveredItem = this.domContainer.getHoveredItem();
        if(!currHoveredItem) {
            return;
        }
        if(currHoveredItem.previousElementSibling) {
            currHoveredItem.previousElementSibling.classList.add('hover');
            currHoveredItem.classList.remove('hover');
        }
    }
    pressedDownKey() {
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
    pressedEnterKey() {
        const currHoveredItem = this.domContainer.getHoveredItem();
        if(!currHoveredItem) {
            this.launchSearchEvent();
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

// document.addEventListener('DOMContentLoaded', function () {
	const baseURL = "http://crong.codesquad.kr:8080/ac/";
    const domContainer = new DomContainer();
    const acResource = new ACResource();
    const acRenderer = new ACRenderer(domContainer);
    const acResponder = new ACResponder(domContainer, acResource, acRenderer, baseURL);
// });
