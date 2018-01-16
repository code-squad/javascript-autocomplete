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
    constructor(menuSlider, leftButton, rightButton, panelSize, panelNumber, transitionTime) {
        this.panelSize = panelSize
        this.panelNumber = panelNumber;
        this.position = -panelSize;
        this.menuSlider = menuSlider;
        this.leftButton = leftButton;
        this.rightButton = rightButton;
        this.transitionTime = transitionTime;

        menuSlider.addEventListener('transitionend', this.onTransitionEnd.bind(this));
        menuSlider.addEventListener('mouseover', this.onMenuMouseOver.bind(this));
        menuSlider.addEventListener('mouseout', this.onMenuMouseOut.bind(this)); 
        leftButton.addEventListener('click', this.onLeftButtonClick.bind(this));
        rightButton.addEventListener('click', this.onRightButtonClick.bind(this));

        this.menuSlider.style["transition"] = 'transform 0s ease-in-out';
        this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;

        this.setAutoSlide(); 
    }

    onMenuMouseOver(event) {
        if(!event.currentTarget) return; 

        this.stopAutoSlide(); 
    }

    onMenuMouseOut(event) {
        if(!event.currentTarget) return; 

        this.setAutoSlide();
    }

    setAutoSlide() {
        this.autoInterval = setInterval(() => {
            if(!this.rightButton.disabled && !this.leftButton.disabled) 
                this.onRightButtonClick();
        }, 3000);
    }

    stopAutoSlide() {
        clearInterval(this.autoInterval); 
    }

    onTransitionEnd() {
        this.stopAutoSlide(); 
        if(this.position > -this.panelSize) {
            this.position -= this.panelSize * this.panelNumber;
            this.menuSlider.style["transition"] = 'transform 5ms ease-in-out';
            this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;
        }
        // if last element
        else if(this.position <= -this.panelSize * (this.panelNumber + 1)) {
            this.position += this.panelSize * this.panelNumber;
            this.menuSlider.style["transition"] = 'transform 5ms ease-in-out';
            this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;
        }
        else
            this.setAutoSlide();

        this.lockButton(this.leftButton, false);
        this.lockButton(this.rightButton, false);
    }

    onLeftButtonClick() {
        this.lockButton(this.leftButton, true);
        this.position += this.panelSize;
        this.menuSlider.style["transition"] = `transform ${this.transitionTime}s ease-in-out`;
        this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;
    }

    onRightButtonClick() {
        this.lockButton(this.rightButton, true);
        this.position -= this.panelSize;
        this.menuSlider.style["transition"] = `transform ${this.transitionTime}s ease-in-out`;
        this.menuSlider.style["transform"] = `translate3d(${this.position}px, 0px, 0px)`;
    }

    lockButton(target, boolean) {
        if(boolean) {
            target.disabled = true;
        } else {
            target.disabled = false;
        }
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
        Util.$('#right_arrow'),
        parseInt(getComputedStyle(Util.$('.menu_view')).width),
        3,
        0.5);
});

export {EventHandler, AutoComplete, Networking, Cache, Util, MenuSlider}
