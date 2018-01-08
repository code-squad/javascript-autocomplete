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

var Util = {
	$: function(ele) {
		return document.querySelector(ele);
	},
	getData: function(url, callback) {
		var openRequest = new XMLHttpRequest();
		openRequest.addEventListener("load", function (e) {
			var data = JSON.parse(openRequest.responseText);
			callback(data);
		}.bind(this));
		openRequest.open("GET", url);
		openRequest.send();
	}
}


function DomContainer() {
	this.appBar = Util.$('.app-bar');
	this.searchButton = Util.$('.search-button');
	this.searchBar = Util.$('.search-bar');
	this.searchField = Util.$('#search-field');
	this.autoCompleteList = Util.$('.auto-complete-list');
}

var domContainerObj = {
	getHoveredItem: function() {
		return Util.$('.hover');
	}
}

DomContainer.prototype = domContainerObj;

function SearchWindow(apiUrl, domContainer) {
	this.apiUrl = apiUrl;
	this.domContainer = domContainer;
	this.memo = {};
	this.memoLog = [];
	this.memoSize = 100;

	this.setFocusOutListener();
	this.setKeyboardListener();
	this.setSearchButtonListener();
	this.setSearchTextChangeListener();
	this.setAutoCompleteClickListener();
	this.setAutoCompleteHoverListener();
}

var searchWindowObj = {
	caching: function(word, returnData) {
		const key = word;
		const value = returnData[1];

		this.memo[key] = value;
		if (!this.memoLog.includes(key)) {
			this.memoLog.push(key);
		}
	},
	updateRendering: function(keyword, autoComplete) {
		const listDom = this.domContainer.autoCompleteList;
		if(!autoComplete){
			listDom.innerHTML = ""
			return false
		}

		let listDomHTML = "";
		autoComplete.forEach((item) => {
			const itemHTML = item[0].replace(keyword, "<span>" + keyword + "</span>");
			let itemDom = "<li data-name='" +item[0] + "'>" + itemHTML + "</li>";
			listDomHTML += itemDom;
		});

		listDom.innerHTML = listDomHTML;
	},
	getAutoCompleteList: function(word, callback) {
		if (!this.memo.hasOwnProperty(word)) {
			if (this.memoLog.length > this.memoSize) {
				let key = this.memoLog.shift();
				delete this.memo[key];
			}

			const url = this.apiUrl + word;
			Util.getData(url, function(returnData) {
				this.caching(word, returnData);
				callback(this.memo[word]);
			}.bind(this));
		} else {
			callback(this.memo[word]);
		}
	},
	launchSearchEvent: function(keyword) {
		window.location.reload();
	},
	setFocusOutListener: function() {
		const searchField = this.domContainer.searchField;

		searchField.addEventListener('focusout', function(e) {
			this.domContainer.autoCompleteList.innerHTML = '';
		}.bind(this));
	},
	setKeyboardListener: function() {
		const searchField = this.domContainer.searchField;

		searchField.addEventListener('keydown', function(e) {
			let currHoveredItem = this.domContainer.getHoveredItem();

			switch(e.keyCode){
				case 38: //ArrowUp
					if(!currHoveredItem) {
						return;
					}

					if(currHoveredItem.previousElementSibling) {
						currHoveredItem.previousElementSibling.classList.add('hover');
						currHoveredItem.classList.remove('hover');
					}
					break;

				case 40: //ArrowDown
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
					break;

				case 13: //Enter
					if(!currHoveredItem) {
						this.launchSearchEvent();
						return;
					}

					this.putSelectedItemToField(currHoveredItem.dataset.name);
			}
		}.bind(this));
	},
	setAutoCompleteHoverListener: function() {
		const autoCompleteList = this.domContainer.autoCompleteList;

		autoCompleteList.addEventListener('mouseover', function(e) {
			let listItem = e.target;

			if(!listItem || listItem.nodeName !== 'LI') {
				return;
			}

			let currHoveredItem = this.domContainer.getHoveredItem();

			if(currHoveredItem) {
				currHoveredItem.classList.remove('hover');
			}

			listItem.classList.add('hover');
		}.bind(this));
	},
	setAutoCompleteClickListener: function() {
		const autoCompleteList = this.domContainer.autoCompleteList;

		autoCompleteList.addEventListener('click', function(e) {
			let listItem = e.target;

			if(!listItem || listItem.nodeName !== 'LI') {
				return;
			}

			this.putSelectedItemToField(listItem.dataset.name);
		}.bind(this));
	},
	setSearchButtonListener: function() {
		const searchButton = this.domContainer.searchButton;

		searchButton.addEventListener('click', function(e) {

			this.launchSearchEvent();
		}.bind(this));
	},
	setSearchTextChangeListener: function() {
		this.domContainer.searchField.addEventListener('input', function(e) {
			const keyword = e.target.value;
			this.getAutoCompleteList(keyword, function(autoComplete) {
				this.updateRendering(keyword, autoComplete);
			}.bind(this));
		}.bind(this));
	},
	putSelectedItemToField: function(word) {
		const searchField = this.domContainer.searchField;
		searchField.value = word;

		this.domContainer.autoCompleteList.innerHTML = '';
	}
}

SearchWindow.prototype = searchWindowObj;

document.addEventListener('DOMContentLoaded', function () {
	const baseApiUrl = "http://crong.codesquad.kr:8080/ac/";
	const domContainer = new DomContainer();
	const searchWindow = new SearchWindow(baseApiUrl, domContainer);
});
