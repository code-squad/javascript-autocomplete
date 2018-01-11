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

        console.log(Util.redirect)
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
        if (this.selectedIndex !== -1) {
            list[this.selectedIndex].classList.remove('selected')
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
        this.inputText.addEventListener('focusin', (e) =>
            this.onFocusin(e));
        this.inputText.addEventListener('keydown', (e) =>
            this.onKeyDown(e));
        this.inputText.addEventListener('keyup', (e) =>
            this.onKeyUp(e));
        this.inputText.addEventListener('focusout', (e) =>
            this.onFocusout(e), true);
        this.searchBar.addEventListener('submit', (e) => {
            e.preventDefault();
            window.history.back();
            this.autoComplete.onSearchEvent(this.inputText.value);
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
        if(event.target.value !== "") return;
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

        let afterDataRevc = (data) => {
            if (data) {
                this.autoComplete.menuData = data;
                this.autoComplete.show(this.inputText.value);
            } else {
                this.autoComplete.close();
            }
        }

        this.networking.sendAPIRequest(this.inputText.value)
                        .then(afterDataRevc);
    }

    onSearchButtonClick() {
        this.autoComplete.onSearchEvent(this.inputText.value);
    }

    onMouseHover(event) {
        let hoveredItem = event.target;
        if (!hoveredItem || hoveredItem.nodeName !== "LI") {
            return;
        }
        this.autoComplete.mouseHovered(hoveredItem);
    }

    onMouseClick(event) {
        this.autoComplete.onSearchEvent(this.inputText.value);
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
});

export {EventHandler, AutoComplete, Networking, Cache, Util}
