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
        if (this.acDataLog.length > this.acDataSize) {
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

	getLocalStorageItem(key, defaultValue) {
		if (!localStorage.hasOwnProperty(key)) {
			return defaultValue;
		}
		return JSON.parse(localStorage.getItem(key));
	}
	setLocalStorageItem(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
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
        if(!keyword) {
            this.acRenderer.updateRendering()
            return;
        }
        if(this.acResource.checkValidation(keyword)) {
            this.acRenderer.updateRendering(keyword, this.acResource.acData[keyword].result);
            return
        }
		const url = this.apiURL + keyword;
		this.acResource.getData(url).then((data) => {
            this.acResource.caching(keyword, data[1]);
    		this.acRenderer.updateRendering(keyword, this.acResource.acData[keyword].result);
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
		this.acRenderer.launchSearchEvent();
	}
    clickSearchField(e) {
        this.domContainer.recentKeywordList.style.display = "block";
    }
}

class ACRenderer {
    constructor(domContainer) {
        this.domContainer = domContainer
    }
    updateRendering(keyword, autoComplete) {
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

document.addEventListener('DOMContentLoaded', function () {
	const baseURL = "http://crong.codesquad.kr:8080/ac/";
    const domContainer = new DomContainer();
    const acResource = new ACResource();
    const acRenderer = new ACRenderer(domContainer);
    const acResponder = new ACResponder(domContainer, acResource, acRenderer, baseURL);
    console.log('까꿍')
});
