

function processRename(schema, responseData){
    for(var key in schema.properties){
        let property = schema.properties[key];
        if(typeof(property.description) != 'undefined') { // Propriedades que tem SoapField
            let propertySoapKey = getSoapFieldValue(property.description);
            if((property.type != "object") && (property.type != "array") && typeof(responseData[propertySoapKey]) != 'undefined'){
                if(property.type == "integer" || property.type == "string" || property.type == "number"|| property.type == "boolean"){
                    renameProperty(responseData, propertySoapKey, key);
                    convertPropertyType(responseData, key, property);
                }
            }else if(property.type == "object"){ //Object que tem soapfield
                if(typeof(responseData[propertySoapKey]) != 'undefined'){
                    renameProperty(responseData, propertySoapKey, key);
                    processRename(property, responseData[key]);
                }
            }else if(property.type == "array"){ //Object que tem soapfield


                if((typeof responseData[propertySoapKey]) == 'object'){
                    renameProperty(responseData, propertySoapKey, key);
                    if(responseData[key].length>0){
                        for(var i =0;i<responseData[key].length;i++){
                            processRename(property.items, responseData[key][i])
                        }
                    }
                }
            }
        }else if(property.type == "object"){ //Object que não tem soapfield
            if(typeof(responseData[key]) != 'undefined'){
                processRename(property, responseData[key]);
            }
        }else if(property.type == "array"){ //Object que tem soapfield

            if(typeof(responseData) != 'undefined' && [key] && responseData[key].length>0){
                for(var i =0;i<responseData[key].length;i++){
                    processRename(property.items, responseData[key][i])
                }
            }

        }else{
            if(typeof(responseData[key]) != 'undefined'){
                convertPropertyType(responseData, key, property);
            }
        }

    }
 return responseData
}


function getSoapFieldValue(text){
    var re = /SoapField\[(.*?)\]/;
    var newtext = text.match(re);
    return newtext[1];
}

const swaggerParser = require('swagger-parser');

//If Object.create isn't already defined, we just do the simple shim, without the second argument,
//since that's all we need here
var object_create = Object.create;
if (typeof object_create !== 'function') {
    object_create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

/**
* Deep copy an object (make copies of all its object properties, sub-properties, etc.)
* An improved version of http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
* that doesn't break if the constructor has required parameters
*
 * It also borrows some code from http://stackoverflow.com/a/11621004/560114
*/
function deepCopy(src, /* INTERNAL */ _visited) {
    if(src == null || typeof(src) !== 'object'){
        return src;
    }

    // Initialize the visited objects array if needed
    // This is used to detect cyclic references
    if (_visited == undefined){
        _visited = [];
    }
    // Ensure src has not already been visited
    else {
        var i, len = _visited.length;
        for (i = 0; i < len; i++) {
            // If src was already visited, don't try to copy it, just return the reference
            if (src === _visited[i]) {
                return src;
            }
        }
    }

    // Add this object to the visited array
    _visited.push(src);

    //Honor native/custom clone methods
    if(typeof src.clone == 'function'){
        return src.clone(true);
    }

    //Special cases:
    //Array
    if (Object.prototype.toString.call(src) == '[object Array]') {
        //[].slice(0) would soft clone
        ret = src.slice();
        var i = ret.length;
        while (i--){
            ret[i] = deepCopy(ret[i], _visited);
        }
        return ret;
    }
    //Date
    if (src instanceof Date) {
        return new Date(src.getTime());
    }
    //RegExp
    if (src instanceof RegExp) {
        return new RegExp(src);
    }
    //DOM Element
    if (src.nodeType && typeof src.cloneNode == 'function') {
        return src.cloneNode(true);
    }

    //If we've reached here, we have a regular object, array, or function

    //make sure the returned object has the same prototype as the original
    var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src): src.__proto__);
    if (!proto) {
        proto = src.constructor.prototype; //this line would probably only be reached by very old browsers
    }
    var ret = object_create(proto);

    for(var key in src){
        //Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
        //For an example of how this could be modified to do so, see the singleMixin() function
        ret[key] = deepCopy(src[key], _visited);
    }
    return ret;
}

function renameProperty(obj, oldKey, newKey){
    if (oldKey !== newKey) {
        Object.defineProperty(obj, newKey,
            Object.getOwnPropertyDescriptor(obj, oldKey));
        delete obj[oldKey];
    }
}
function convertPropertyType(obj, key, schema){
    if(schema.type == "integer"){
        obj[key] = parseInt(obj[key])
    }else if(schema.type == "number"){
        obj[key] = parseFloat(obj[key])
    }
    else if(schema.type == "boolean"){
        obj[key] = obj[key] == "true" ? true : false
    }
    else {
        obj[key] = obj[key]
    }
}


function swaggerRef() {
  const ref = swaggerParser.dereference("./api/swagger/swagger.yaml").then(function (apiRef) {
    return apiRef
  })

  return ref;
}
