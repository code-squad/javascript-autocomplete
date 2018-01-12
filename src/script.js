import {Networking, Cache} from './networking.js'

class Util {
    static $(query) {
        return document.querySelector(query);
    }

    static redirect(param) {
        window.location.replace(param);
    }
}

class AutoComplete {
    constructor(resultList, storage) {
        this.menuData = [];
        this.resultListDOM = resultList;
        this.selectedIndex = -1;
        this.listDOM = this.resultListDOM.children[0];
        this.cache = storage.localData["recentCache"];
    }

    insertCacheData(query) {
        if (!query) return;

        if (this.cache.includes(query)) {
            this.cache.splice(this.cache.indexOf(query), 1);
        }
        if (this.cache.length >= 5) {
            this.cache.pop();
        }
        this.cache.unshift(query);
    }

    show(word) {
        if (!this.menuData) {
            return;
        }
        this.selectedIndex = -1;
        this.resultListDOM.style.display = 'block';

        this.listDOM.innerHTML = this.menuData.reduce((acc, curr) =>
                acc += `<li>${curr.replace(word, `<span>${word}</span>`)}</li>`, "");
    }

    close() {
        this.resultListDOM.style.display = 'none';
        this.selectedIndex = -1;
    }

    onSearchEvent(fieldValue) {
        let currData;
        if(this.selectedIndex === -1) {
            currData = fieldValue;
        } else {
            currData = this.menuData[this.selectedIndex];
        }
        this.insertCacheData(currData);

        Util.redirect("?name=" + currData);
    }

    upKeyPressed() {
        this.changeSelected(this.selectedIndex - 1);
    }

    downKeyPressed() {
        this.changeSelected(this.selectedIndex + 1);
    }

    changeSelected(index) {
        let list = this.listDOM.children;

        if (index >= list.length)
            index = list.length - 1;

        if (index < 0) {
            index = -1;
        }

        if (this.selectedIndex >  -1 && this.selectedIndex < list.length) {
            list[this.selectedIndex].classList.remove('selected')
            this.selectedIndex = index;
        }

        if (index >= 0 && index < list.length) {
            this.selectedIndex = index;
            list[this.selectedIndex].classList.add('selected')
        }


    }

    mouseHovered(item) {
        let index = Array.from(this.listDOM.children).indexOf(item);

        this.changeSelected(index);
    }
}

class EventHandler {
    constructor(networking, autoComplete, searchBar, inputBox, searchButton) {
        this.networking = networking;
        this.autoComplete = autoComplete
        this.inputText = inputBox;
        this.searchButton = searchButton;
        this.searchBar = searchBar;

    }

    init() {
        this.setInputParam();
        this.inputText.addEventListener('keydown', (e) =>
            this.onKeyDown(e));
        this.inputText.addEventListener('keyup', (e) =>
            this.onKeyUp(e));
        this.inputText.addEventListener('focusout', (e) =>
            this.onFocusout(e), true);
        this.inputText.addEventListener('focusin', (e) =>
            this.onFocusin(e));
        this.searchBar.addEventListener('submit', (e) => {
            e.preventDefault();
            this.autoComplete.onSearchEvent(this.inputText.value.trim());
        });
        this.searchButton.addEventListener('click', () =>
            this.onSearchButtonClick());
        this.autoComplete.listDOM.addEventListener('mouseover', (e) =>
            this.onMouseHover(e));
        this.autoComplete.listDOM.addEventListener('mousedown', (e) =>
            this.onMouseClick(e));
    }

    setInputParam() {
        const url = new URL(window.location);
        const name = new URLSearchParams(url.search)
        const searchKeyword = name.get("name");
        this.inputText.value = searchKeyword;
    }

    onFocusin(event) {
        if(event.target.value) return;
        this.autoComplete.menuData = this.autoComplete.cache;
        this.autoComplete.show();
    }

    onFocusout(event) {
        let target = event.target;
        if(!target) {
            return;
        }
        this.autoComplete.close();
    }

    onKeyDown(event) {
        let key = event.keyCode;
        if (key === 38) {
            this.autoComplete.upKeyPressed();
        } else if (key === 40) {
            this.autoComplete.downKeyPressed();
        }
    }

    onKeyUp(event) {
        let key = event.keyCode;
        if (key === 38 || key === 40 || key === 13) {
            return;
        }

        let afterDataRecv = (data) => {
            if (data) {
                this.autoComplete.menuData = data;
                this.autoComplete.show(this.inputText.value);
            } else {
                this.autoComplete.close();
            }
        }

        this.networking.sendAPIRequest(this.inputText.value.trim())
                        .then(afterDataRecv);
    }

    onSearchButtonClick() {
        this.autoComplete.onSearchEvent(this.inputText.value.trim());
    }

    onMouseHover(event) {
        let hoveredItem = event.target;
        if (!hoveredItem || hoveredItem.nodeName !== "LI") {
            return;
        }
        this.autoComplete.mouseHovered(hoveredItem);
    }

    onMouseClick(event) {
        this.autoComplete.onSearchEvent(this.inputText.value.trim());
    }
}

class MenuSlider {
    constructor(menuSlider, leftButton, rightButton) {
        this.position = -980 * 3; 
        this.menuSlider = menuSlider; 
        this.leftButton = leftButton; 
        this.rightButton = rightButton; 

        menuSlider.addEventListener('transitionend', () => this.onTransitionEnd());
        leftButton.addEventListener('click', () => this.onLeftButtonClick());
        rightButton.addEventListener('click', () => this.onRightButtonClick());

        this.menuSlider.style["transition"] = 'transform 0s ease-in-out';
        this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;
    }

    onTransitionEnd() {
        if(this.position > -980) {
            this.position -= 980 * 3;
            this.menuSlider.style["transition"] = 'transform 5ms ease-in-out';
            this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;
        }

        if(this.position <= -980 * 5) {
            this.position += 980 * 3;
            this.menuSlider.style["transition"] = 'transform 5ms ease-in-out';
            this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;
        }

        this.leftButton.disabled = false;  
        this.rightButton.disabled = false; 
    }

    onLeftButtonClick() {
        this.leftButton.disabled = true; 
        if(this.position > -980) {
            this.position -= 980 * 2;
        } else {
            this.position += 980;
        }
        this.menuSlider.style["transition"] = 'transform 0.5s ease-in-out';
        this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;   

    }

    onRightButtonClick() {
        this.rightButton.disabled = true; 
        if(this.position <= -980 * 5) {
            this.position += 980 * 2;    
        } else {
            this.position -= 980;
        }
        this.menuSlider.style["transition"] = 'transform 0.5s ease-in-out';
        this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const storage = new Cache();
    const autoComplete = new AutoComplete(Util.$('.result_list'), storage);

    const eventHandler = new EventHandler(new Networking(storage, 100),
        autoComplete,
        Util.$('#search_bar'),
        Util.$('#input_box'),
        Util.$('#search_button'));
    eventHandler.init()

    new MenuSlider(Util.$('.menu_slider'),
        Util.$('#left_arrow'), 
        Util.$('#right_arrow')); 
});

export {EventHandler, AutoComplete, Networking, Cache, Util}
