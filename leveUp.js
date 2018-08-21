const data = require("./data.json")

const responseData = data

function nextChildren(key, beforeKey, copy){
    for(next in key) {
        if(key[next] == null) {
            delete key[next]
        }
        if(next == beforeKey) {
            let nextChildren = Object.getOwnPropertyNames(copy)[0]
            key[nextChildren] = [];
            delete key[beforeKey]
            if(Array.isArray(key[nextChildren]) && !Array.isArray(copy[nextChildren])) {
                key[nextChildren].push(copy[nextChildren])
            }else if (Array.isArray(copy[nextChildren])){
                copy[nextChildren].map((item) => {
                    key[nextChildren].push(item)
                })
            }else{
                key[nextChildren] = copy[nextChildren]
            }


        }else if(typeof copy[next] === "object") {
            nextChildren(copy[next], beforeKey, copy)

        }else if (typeof key[next] === "object") {
            nextChildren(key[next], beforeKey, copy)
        }
    }
}

function levelUp(responseData, copy, beforeKey) {
    for(key in responseData) {
        if(key.includes("Lista")) {
            levelUp(responseData[key], copy, key)
            } else if (responseData[key] && Array.isArray(responseData[key])) { // children is array
                for(c in copy) {
                    if(typeof copy[c] === "object" && c.includes("Lista") && !Array.isArray(copy[c]) && copy[c][key]) { // transform object to array
                        copy[key] = []
                        copy[key].push(responseData[key])
                        delete copy[beforeKey]
                    } else if(Array.isArray(copy[c]) && typeof copy[c] === "object") { // loop next children
                        nextChildren(copy[c], beforeKey, responseData)
                    }
                }
                if(Array.isArray(responseData[key]) && responseData[key] &&  responseData[key].length > 0) {
                    responseData[key].map(item  => levelUp(item, copy))
                }else {
                    levelUp(responseData[key], copy)
                }
            } else if ((responseData[key]) && typeof responseData[key] === "object" && beforeKey) { // children is object
                for(c in copy) {
                    if(typeof copy[c] === "object" && c.includes("Lista") && !Array.isArray(copy[c]) && copy[c][key]) { // transform object to array
                        copy[key] = []
                        copy[key].push(responseData[key])
                        delete copy[beforeKey]
                    } else if(Array.isArray(copy[c]) && typeof copy[c] === "object") { // loop next children
                        nextChildren(copy[c], beforeKey, responseData)
                    }
                }
                levelUp(responseData[key], copy)
            } else if ((responseData[key]) && typeof responseData[key] === "object") {
                levelUp(responseData[key], copy)
            }

    }

    return copy
}


levelUp(responseData, responseData)

