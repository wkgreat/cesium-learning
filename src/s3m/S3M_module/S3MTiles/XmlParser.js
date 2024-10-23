function XMLParser(){
}

XMLParser.read = function(text){
    let index = text.indexOf('<');
    if(index > 0) {
        text = text.substring(index);
    }

    if (DOMParser) {
        if(!XMLParser.xmldom) {
            XMLParser.xmldom = new DOMParser();
        }

        return  XMLParser.xmldom.parseFromString(text, 'text/xml');
    }

    if(!XMLParser.xmldom) {
        XMLParser.xmldom = new ActiveXObject("Microsoft.XMLDOM");
    }

    return XMLParser.xmldom.loadXML(text);
};

XMLParser.getElementsByTagNameNS = function(node, uri, name){
    let elements = [];
    if(node.getElementsByTagNameNS) {
        elements = node.getElementsByTagNameNS(uri, name);
    } else {
        // brute force method
        let allNodes = node.getElementsByTagName("*");
        let potentialNode, fullName;
        for(let i=0, len=allNodes.length; i<len; ++i) {
            potentialNode = allNodes[i];
            fullName = (potentialNode.prefix) ?
                (potentialNode.prefix + ":" + name) : name;
            if((name === "*") || (fullName === potentialNode.nodeName)) {
                if((uri === "*") || (uri === potentialNode.namespaceURI)) {
                    elements.push(potentialNode);
                }
            }
        }
    }

    return elements;
};

XMLParser.getAttributeNodeNS = function(node, uri, name){
    let attributeNode = null;
    if(node.getAttributeNodeNS) {
        attributeNode = node.getAttributeNodeNS(uri, name);
    } else {
        let attributes = node.attributes;
        let potentialNode, fullName;
        for(let i=0, len=attributes.length; i<len; ++i) {
            potentialNode = attributes[i];
            if(potentialNode.namespaceURI === uri) {
                fullName = (potentialNode.prefix) ?
                    (potentialNode.prefix + ":" + name) : name;
                if(fullName === potentialNode.nodeName) {
                    attributeNode = potentialNode;
                    break;
                }
            }
        }
    }
    return attributeNode;
};

XMLParser.getChildValue = function(node, def) {
    let value = def || "";
    if(node) {
        for(let child=node.firstChild; child; child=child.nextSibling) {
            switch(child.nodeType) {
                case 3: // text node
                case 4: // cdata section
                    value += child.nodeValue;
            }
        }
    }
    return value;
};

XMLParser.queryNumericAttribute = function(node, attributeName) {
    if (!node) {
        return undefined;
    }

    let value = node.getAttribute(attributeName);
    if (value !== null) {
        let result = parseFloat(value);
        return !isNaN(result) ? result : undefined;
    }
    return undefined;
};

XMLParser.queryStringAttribute = function(node, attributeName) {
    if (!node) {
        return undefined;
    }
    let value = node.getAttribute(attributeName);
    return value !== null ? value : undefined;
};

XMLParser.queryBooleanAttribute = function(node, attributeName) {
    if (!node) {
        return undefined;
    }
    let value = node.getAttribute(attributeName);
    value = value.toLowerCase();
    if('false' === value){
        return false;
    }
    if('true' === value){
        return true;
    }
    return undefined;
};

XMLParser.queryFirstNode = function(node, tagName, namespace) {
    if (!node) {
        return undefined;
    }
    let childNodes = node.childNodes;
    let length = childNodes.length;
    for (let q = 0; q < length; q++) {
        let child = childNodes[q];
        if(namespace){
            if (child.localName === tagName && namespace.indexOf(child.namespaceURI) !== -1) {
                return child;
            }
        }
        else{
            if (child.localName === tagName) {
                return child;
            }
        }

    }
    return undefined;
};

XMLParser.queryNodes = function(node, tagName, namespace) {
    if (!node) {
        return undefined;
    }
    let result = [];
    let childNodes = node.getElementsByTagNameNS('*', tagName);
    let length = childNodes.length;
    for (let q = 0; q < length; q++) {
        let child = childNodes[q];
        if(namespace){
            if (child.localName === tagName && namespace.indexOf(child.namespaceURI) !== -1) {
                result.push(child);
            }
        }
        else{
            if (child.localName === tagName) {
                result.push(child);
            }
        }

    }
    return result;
};

XMLParser.queryChildNodes = function(node, tagName, namespace) {
    if (!node) {
        return [];
    }
    let result = [];
    let childNodes = node.childNodes;
    let length = childNodes.length;
    for (let q = 0; q < length; q++) {
        let child = childNodes[q];
        if(namespace){
            if (child.localName === tagName && namespace.indexOf(child.namespaceURI) !== -1) {
                result.push(child);
            }
        }
        else{
            if (child.localName === tagName) {
                result.push(child);
            }
        }

    }
    return result;
};

XMLParser.queryNumericValue = function(node, tagName, namespace) {
    let resultNode = XMLParser.queryFirstNode(node, tagName, namespace);
    if (resultNode) {
        let result = parseFloat(resultNode.textContent);
        return !isNaN(result) ? result : undefined;
    }
    return undefined;
};

XMLParser.queryStringValue = function(node, tagName, namespace) {
    let result = XMLParser.queryFirstNode(node, tagName, namespace);
    if (result) {
        return result.textContent.trim();
    }
    return undefined;
};

XMLParser.queryBooleanValue = function(node, tagName, namespace) {
    let result = XMLParser.queryFirstNode(node, tagName, namespace);
    if (result) {
        let value = result.textContent.trim();
        return value === '1' || /^true$/i.test(value);
    }
    return undefined;
};


export default XMLParser;
