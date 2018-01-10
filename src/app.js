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
export {DomContainer, ACResource, ACResponder, ACRenderer}
