class Cache {
    constructor() {
        this.localData = {
            "networkLog" : [], 
            "networkCache" : {},
            "recentCache" : []
        }
        
        this.loadStorage();
        window.addEventListener("beforeunload", () => this.saveCache());
    }

    loadStorage() {
        const cacheList = Object.keys(this.localData); 

        cacheList.forEach((key) => {
            const data = localStorage.getItem(key);
            if(data) {
                this.localData[key] = JSON.parse(data);
            }
        }); 
    }

    saveCache() {
        Object.keys(this.localData).forEach((key) => {
            window.localStorage.setItem(key, JSON.stringify(this.localData[key]));
        }); 
    }
}

class Networking {
    constructor(storage, cacheSize) {
        this.cacheSize = cacheSize; 
        this.log = storage.localData["networkLog"]; 
        this.cache = storage.localData["networkCache"];
    }

    insertCacheData(query, data) {
        while(Object.keys(this.cache).length >= this.cacheSize) {
            delete this.cache[this.log.shift()]; 
        }

        const time = Date.now();
        const value = { "data" : data,
                        "time" : time };

        this.cache[query] = value;
        this.log.push(query)
    }

    // timeLimit in ms. 
    isCacheInvalid(query, timeLimit) {
        if(!this.cache[query]) return true;

        const timeNow = Date.now();
        const timeCache = this.cache[query]["time"];
        const timeDiff = timeNow - timeCache;

        return timeDiff >= timeLimit
    }

    sendAPIRequest(query) {
        let promise;
        // 6 hours in ms. 
        const timeLimit = 1000 * 60 * 60 * 6; 

        if(this.isCacheInvalid(query)) {
            promise = new Promise((resolve, timeLimit) => {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("load", (e) => {
                    var data = this.convertData(xhr.responseText);
                    this.insertCacheData(query, data);
                    resolve(data);
                });
                xhr.open("GET", "http://crong.codesquad.kr:8080/ac/" + query);
                xhr.send();
            });
        } else {
            promise = new Promise((resolve) => {
                resolve(this.cache[query]["data"]);
            });
        }

        return promise;
    }

    convertData(data) {
        let result = [];
        let json = JSON.parse(data);
        if (!json[1]) {
            return
        }
        json[1].forEach(function (val) {
            result.push(val[0])
        });
        return result;
    }
}

export {Networking, Cache}
