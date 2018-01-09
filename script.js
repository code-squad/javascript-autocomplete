function $(query) {
    return document.querySelector(query);
}

function Networking() {

}

Networking.prototype = {
    sendAPIRequest: function(query, callback) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function(e) {
            var data = this.convertData(xhr.responseText);
            callback(data);
        }.bind(this));
        xhr.open("GET", "http://crong.codesquad.kr:8080/ac/" + query);
        xhr.send();
    },
    convertData: function(data) {
        let result = []
        let json = JSON.parse(data)
        if(!json[1]) {
            return
        }
        json[1].forEach(function(val) {
            result.push(val[0])
        })
        return result
    }
}

function AutoComplete(resultList) {
    this.menuData = [];
    this.resultListDOM = resultList;
    this.selectedIndex = -1;
}

AutoComplete.prototype = {
    show: function(word) {
        if(!this.menuData) {
            return;
        }
        this.selectedIndex = -1;
        this.resultListDOM.style.display = 'block';
        let html = "<ul>"
        this.menuData.forEach(function(data) {
            let specialWord = data.replace(word, "<span>" + word + "</span>");
            html += "<li>" + specialWord + "</li>"
        })
        this.resultListDOM.innerHTML = html + "</ul>"
    },
    close: function() {
        this.resultListDOM.style.display = 'none';
        this.selectedIndex = -1;
    },
    enterPressed: function() {
        var currData = this.menuData[this.selectedIndex];
        this.close();
        return currData;
    },
    upKeyPressed: function() {
        let listDOM = this.resultListDOM.childNodes[0].children;
        if (this.selectedIndex == -1) {
            return;
        }
        listDOM[this.selectedIndex].classList.remove('selected')
        this.selectedIndex--;
        if(this.selectedIndex >= 0) {
            listDOM[this.selectedIndex].classList.add('selected')
        }
    },
    downKeyPressed: function() {
        let listDOM = this.resultListDOM.childNodes[0].children;
        if (this.selectedIndex >= this.menuData.length - 1) {
            return;
        }
        if(this.selectedIndex > -1) {
            listDOM[this.selectedIndex].classList.remove('selected');
        }
        this.selectedIndex++;
        listDOM[this.selectedIndex].classList.add('selected');
    }
}

function EventHandler(networking, autoComplete, inputBox, searchButton) {
    this.networking = networking;
    this.autoComplete = autoComplete
    this.inputText = inputBox;
    this.searchButton = searchButton;
}

EventHandler.prototype = {
    init: function() {
        this.inputText.addEventListener('keydown', this.onKeyDown.bind(this));
        this.inputText.addEventListener('keyup', this.onKeyUp.bind(this));
        this.searchButton.addEventListener('click', this.onSearchButtonClick());
    },
    onKeyDown: function(event) {
        let key = event.keyCode;
        if (key === 38) {
            this.autoComplete.upKeyPressed();
        } else if(key === 40) {
            this.autoComplete.downKeyPressed();
        } else if(key === 13) {
            this.inputText.value = this.autoComplete.enterPressed();
        }
    },
    onKeyUp: function(event) {
        let key = event.keyCode;
        if(key === 38 || key === 40 || key === 13) {
            return;
        }

        this.networking.sendAPIRequest(this.inputText.value, function(data) {
            if(data) {
                this.autoComplete.menuData = data;
                this.autoComplete.show(this.inputText.value);
            } else { 
                this.autoComplete.close(); 
            }
        }.bind(this));
    },
    onSearchButtonClick: function() {
        this.autoComplete.close();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var autoComplete = new AutoComplete($('.result_list'));

    var eventHandler = new EventHandler(new Networking(),
        autoComplete,
        $('#input_box'),
        $('#search_button'));
    eventHandler.init()
});
