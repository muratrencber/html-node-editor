const nodeClass = "node";
const childNodeClass = "node-child";
const connectionButtonClass = "connection-button";
var defaultNodeType;
document.addEventListener("mousedown", DeselectIfNotInNodeBounds);
var nodeTypes = []

function LoadNodeTypes()
{
    nodeTypes = [];
    defaultNodeType = null;

    for(let i in nodeTypesDict)
    {
        if(forbiddenTypeNames.includes(i))
        {
            console.warn("You cannot use \""+ i + "\" as a type name!");
            continue;
        }
        let t = nodeTypesDict[i];
        let newType = new NodeType(i, t["panels"], t["tag"], t["default-connection-node-type"], t["default-child-node-type"]);
        nodeTypes.push(newType);
        if(defaultNodeType == null)
            defaultNodeType = newType;
    }

    /* OLD WAY
    let defs = nodeTypesText.split(",");
    for(let i = 0; i < defs.length; i++)
    {
        let defText = defs[i];
        if(defText.trim() == "")
            continue;
        let defName = defText.split("{")[0].trim();
        if(defName == "CustomNode")
        {
            console.error("Type name \"CustomNode\" cannot be used!");
            continue;
        }
        let defPanels = defText.split("{")[1].split("}")[0].split(";");
        for(let f = 0; f < defPanels.length; f++)
            defPanels[f] = defPanels[f].trim();
        defPanels.pop();
        let newType = new NodeType(defName, defPanels);
        nodeTypes.push(newType);
        if(defaultNodeType == null)
            defaultNodeType = newType;
    }*/
}

function GetNodeType(typeKey)
{
    for(let i = 0; i < nodeTypes.length; i++)
    {
        if(nodeTypes[i].name == typeKey)
            return nodeTypes[i];
    }
    return null;
}

class NodeType
{
    constructor(name, panels, tag, defaultConnectionType, defaultChildType)
    {
        this.name = name;
        this.panels = panels;
        this.tag = tag;
        this.defaultConnectionType = defaultConnectionType;
        this.defaultChildType = defaultChildType;
    }
}

class Node
{
    constructor(name, type, position)
    {
        this.name = name;
        this.connectionsTo = [];
        this.connectionsFrom = [];
        this.additionalInfo = {};
        this.children = [];
        this.isChild = false;
        this.parent = null;
        this.HTMLGridElement = null;
        this.HTMLLeftButton = null;
        this.HTMLRightButton = null;
        this.HTMLDummyContainer = null;
        this.position = position;
        this.SetType(type);
    }

    SetType(typeName)
    {
        if(typeName == "CustomNode")
        {
            this.type = typeName;
            return;
        }
        else
        {
            let t = GetNodeType(typeName);
            if(t == null || t == undefined)
                t = defaultNodeType;
            this.type = t.name;
            this.defaultConnectionType = t.defaultConnectionType;
            this.defaultChildType = t.defaultChildType;
            this.RefreshPanels();
        }
    }

    RefreshPanels()
    {
        let t = GetNodeType(this.type);
        if(t == null || t == undefined)
            t = defaultNodeType;
        if(this.type == "CustomNode")
            return;
        this.panels = [];
        for(let i = 0; i < t.panels.length; i++)
            this.panels.push(t.panels[i]);
    }

    SetAdditionalInfo(key, value)
    {
        this.additionalInfo[key] = value;
    }

    GetAdditionalInfo(key)
    {
        return this.additionalInfo[key];
    }

    DeleteAdditionalInfo(key)
    {
        delete this.additionalInfo[key];
    }

    DrawHTMLGrid(position, divScale, buttonScale)
    {
        if(this.HTMLGridElement != null)
            this.HTMLGridElement.innerHTML = "";
        else
        {
            this.HTMLGridElement = document.createElement("div");
            this.HTMLGridElement.className = nodeClass;
            this.HTMLGridElement.id=this.name;
            if(this.isChild)
            {
                this.HTMLGridElement.addEventListener("mousedown", OnNodeMouseDown);
                this.HTMLGridElement.addEventListener("contextmenu", ContextMenuNode);
                this.HTMLGridElement.addEventListener("wheel", function(event) {AdjustGridScale(event);})
            }
        }
        if(this.HTMLLeftButton == null)
        {
            this.HTMLLeftButton = document.createElement("div");
            this.HTMLLeftButton.className = connectionButtonClass;
            this.HTMLLeftButton.addEventListener("mousedown", StartNodeConnectionFromButton);
        }
        if(this.HTMLRightButton == null)
        {
            this.HTMLRightButton = document.createElement("div");
            this.HTMLRightButton.className = connectionButtonClass;
            this.HTMLRightButton.addEventListener("mousedown", StartNodeConnectionFromButton);
        }

        let classN = this.isChild ? childNodeClass : nodeClass;
        if(selectedNodes[this.name] != undefined)
            this.HTMLGridElement.className = classN + " selected";
        else
            this.HTMLGridElement.className = classN;

        if(!this.isChild)
        {
            let topLeft = position.Minus(divScale.Scale(1/2));
            this.HTMLGridElement.style.position = "absolute";
            this.HTMLGridElement.style.top = topLeft.y+"px";
            this.HTMLGridElement.style.left = topLeft.x+"px";
            this.HTMLGridElement.style.width = divScale.x+"px";
            this.HTMLGridElement.style.minHeight = divScale.y+"px";

            this.HTMLDummyContainer = document.createElement("div");
            this.HTMLDummyContainer.className = nodeClass;
            this.HTMLDummyContainer.id = this.name;
            this.HTMLDummyContainer.addEventListener("mousedown", OnNodeMouseDown);
            this.HTMLDummyContainer.addEventListener("contextmenu", ContextMenuNode);
            this.HTMLDummyContainer.addEventListener("wheel", function(event) {AdjustGridScale(event);})
            this.HTMLDummyContainer.className = this.HTMLGridElement.className;

            let dummyName = document.createElement("h3");
            dummyName.innerHTML = this.name;

            this.HTMLDummyContainer.appendChild(dummyName);
            this.HTMLGridElement.appendChild(this.HTMLDummyContainer);   
            this.HTMLGridElement.style.fontSize = (scale*1)+"em";         
        }
        this.HTMLGridElement.style.borderRadius = (0*scale)+"px";

        if(!this.isChild)
        {
            let leftButtonTopLeft = position.Minus(new Vector2(divScale.Scale(1/2).Plus(buttonScale).Plus(new Vector2(5 * scale,0)).x, buttonScale.y/2));
            this.HTMLLeftButton.style.position = "absolute";
            this.HTMLLeftButton.style.top = leftButtonTopLeft.y+"px";
            this.HTMLLeftButton.style.left = leftButtonTopLeft.x+"px";
            this.HTMLLeftButton.style.width = buttonScale.x+"px";
            this.HTMLLeftButton.style.minHeight = buttonScale.y+"px";
            this.HTMLLeftButton.setAttribute("node-name", this.name);
            this.HTMLLeftButton.style.borderRadius = 0+"px";
            
            let rightButtonTopLeft = position.Plus(new Vector2((divScale.x / 2), -buttonScale.y/2));
            this.HTMLRightButton.style.position = "absolute";
            this.HTMLRightButton.style.top = rightButtonTopLeft.y+"px";
            this.HTMLRightButton.style.left = rightButtonTopLeft.x+"px";
            this.HTMLRightButton.style.width = buttonScale.x+"px";
            this.HTMLRightButton.style.minHeight = buttonScale.y+"px";
            this.HTMLRightButton.style.borderRadius = 0+"px";
            this.HTMLRightButton.setAttribute("node-name", this.name);
        }
        else
        {
            let nodeName = document.createElement("h3");
            nodeName.innerHTML = this.name;
            this.HTMLGridElement.appendChild(nodeName);
        }


        if(!this.isChild)
        {
            let addChildButton = document.createElement("button");
            addChildButton.innerHTML = "+ Add Child";
            addChildButton.style.fontSize = "1em";
            addChildButton.style.borderRadius = this.HTMLGridElement.style.borderRadius;
            addChildButton.setAttribute("node-name", this.name);
            addChildButton.addEventListener("mousedown", ClickedCreateChildButton);
            this.HTMLGridElement.appendChild(addChildButton);

            for(let i = 0; i < this.children.length; i++)
            {
                let child = this.children[i];
                let element = child.DrawHTMLGrid()[0];
                this.HTMLGridElement.appendChild(element);
            }
        }

        if(this.HTMLGridElement.className == classN+" selected")
           this. HTMLGridElement.style.borderWidth = (5*scale)+"px";
        return [this.HTMLGridElement, this.HTMLLeftButton, this.HTMLRightButton];
    }

    RefreshConButtonsAndPositions(container, buttonScale)
    {
        let r = this.HTMLGridElement.getBoundingClientRect();
        if(this.isChild)
        {
            let pos = new Vector2(r.x + r.width / 2, r.y + r.height / 2);
            this.position = GetUnadjustedPosition(pos);
            
            let leftButtonTopLeft = new Vector2(r.x - buttonScale.x, r.y);
            this.HTMLLeftButton.style.position = "absolute";
            this.HTMLLeftButton.style.top = leftButtonTopLeft.y+"px";
            this.HTMLLeftButton.style.left = leftButtonTopLeft.x+"px";
            this.HTMLLeftButton.style.width = buttonScale.x+"px";
            this.HTMLLeftButton.style.borderRadius = 0+"px";
            this.HTMLLeftButton.setAttribute("node-name", this.name);

            let rightButtonTopLeft = new Vector2(r.x + r.width, r.y);
            this.HTMLRightButton.style.position = "absolute";
            this.HTMLRightButton.style.top = rightButtonTopLeft.y+"px";
            this.HTMLRightButton.style.left = rightButtonTopLeft.x+"px";
            this.HTMLRightButton.style.width = buttonScale.x+"px";
            this.HTMLRightButton.style.borderRadius = 0+"px";
            this.HTMLRightButton.setAttribute("node-name", this.name);

            container.appendChild(this.HTMLLeftButton);
            container.appendChild(this.HTMLRightButton);
        }
        else
        {
            r = this.HTMLDummyContainer.getBoundingClientRect();
            for(let i = 0; i < this.children.length; i++)
                this.children[i].RefreshConButtonsAndPositions(container, buttonScale);
        }
        this.HTMLRightButton.style.minHeight = (r.height * 0.9)+"px";
        this.HTMLLeftButton.style.minHeight = (r.height * 0.9)+"px";
    }
}

var selectedNodes = {};
var nodeDragStarty
var selectedNodeDragStartPosition = new Vector2(0,0);
function OnNodeMouseDown(event)
{
    switch(event.which)
    {
        case 1:
            let nodeID = this.id;
            let n = SelectNode(nodeID);
            let slnkeys = Object.keys(selectedNodes);
            if(slnkeys.length > 0 && n.HTMLGridElement)
            {
                selectedNodeDragStartPosition = new Vector2(event.pageX, event.pageY);
                event.preventDefault();
                document.addEventListener("mousemove", OnNodeDrag);
                document.onmouseup = function() {
                    document.removeEventListener("mousemove", OnNodeDrag);
                    document.onmouseup = null;
                };

            }
            break;
        case 2:
            MouseDownOnGrid(event);
            break;
    }
}

function ClickedCreateChildButton(event)
{
    let nodeName = event.target.getAttribute("node-name");
    let n = FindNodeWithName(nodeName);
    if(n == null || n == undefined)
        return;
    let t = GetNodeType(n.defaultChildType);
    if(t == null || t == undefined)
        t = defaultNodeType;
    CreateChildNode(n, t.name);
}

function SelectNodeArea(event)
{
    let pressingCTRL = pressedKeys[17] != undefined && Object.keys(pressedKeys).length == 1;
    let mousePosition = new Vector2(event.pageX, event.pageY);
    let adjustedOldPosition = GetAdjustedPosition(selectionAreaStartPosition);
    let selectionArea = document.getElementById("grid-selection");
    selectionArea.className = "grid-selection active";
    let topLeft = new Vector2(Math.min(mousePosition.x, adjustedOldPosition.x), Math.min(mousePosition.y, adjustedOldPosition.y));
    let size = adjustedOldPosition.Minus(mousePosition);
    selectionArea.style.left = topLeft.x+"px";
    selectionArea.style.top = topLeft.y+"px";
    selectionArea.style.width = Math.abs(size.x)+"px";
    selectionArea.style.height = Math.abs(size.y)+"px";
    let arect = new Rect(null, null);
    arect.SetFromRect(selectionArea.getBoundingClientRect());
    selectedConnections = {};

    for(let i in nodes)
    {
        let n = nodes[i];
        nrect = new Rect(null,null);
        nrect.SetFromRect(n.HTMLGridElement.getBoundingClientRect());
        if(nrect.Intersects(arect))
        {
            if(pressingCTRL && selectedNodes[n.name] == n)
                delete selectedNodes[n.name];
            else
                selectedNodes[n.name] = n;
        }
        else if(selectedNodes[n.name] == n)
            delete selectedNodes[n.name];
    }
    DrawAllGrid();
    DrawProperties();
}

function SelectNode(nodeName)
{
    if(nodeName == null)
    {
        selectedNodes = {};
        return null;
    }
    let pressingCTRL = pressedKeys[17] != undefined && Object.keys(pressedKeys).length == 1;
    let selectedNode = FindNodeWithName(nodeName);
    if(!pressingCTRL && Object.keys(selectedNodes).length > 0 && selectedNodes[nodeName] != selectedNode)
    {
        selectedNodes = {};
    }
    if(selectedNode != null)
    {
        if(selectedNodes[nodeName] == selectedNode && pressingCTRL)
        {
            delete selectedNodes[nodeName];
        }
        else
        {
            SelectConnection("connection_null");
            selectedNodes[nodeName] = selectedNode;
        }
        DrawAllGrid();
        return selectedNode;
    }
}

function DeselectIfNotInNodeBounds(event)
{
    let position = new Vector2(event.clientX, event.clientY);
    if(Object.keys(nodes).length == 0 || IsInPanels(position))
        return;
    let pressingCTRL = pressedKeys[17] != undefined && Object.keys(pressedKeys).length == 1;
    if(!pressingCTRL)
    {
        let oneInBounds = false;
        for(let i in selectedNodes)
        {
            let selectedNode = selectedNodes[i];
            if(selectedNode != null && selectedNode.HTMLGridElement != null)
            {
                rect = new Rect(null,null);
                rect.SetFromRect(selectedNode.HTMLGridElement.getBoundingClientRect());
                if(!rect.Contains(position))
                {
                    SelectNode(selectedNode.name);
                }
                else
                {
                    oneInBounds = true;
                }
            }
        }
        if(!oneInBounds)
        {
            selectedNodes = {};
        }
    }
    DrawAllGrid();
    DrawProperties();
}

function OnNodeDrag(event)
{
	event.preventDefault();
    let mousePosition = new Vector2(event.pageX, event.pageY);
    for(let i in selectedNodes)
    {
        let selectedNode = selectedNodes[i];
        if(selectedNode != null)
            selectedNode.position = selectedNode.position.Plus(mousePosition.Minus(selectedNodeDragStartPosition).Scale(1/scale));
    }
    selectedNodeDragStartPosition = mousePosition;
    DrawAllGrid();
}

function FindNodeWithName(name)
{
    return nodes[name];
}

var tempSelectedNodes = {};
var contextId="";
function ContextMenuNode(event)
{
    event.preventDefault();
    contextId = this.id;
    let mousePosition = new Vector2(event.pageX, event.pageY);
    tempSelectedNodes = {...selectedNodes};
    if(Object.keys(selectedNodes).length > 1)
    {
        OpenContextMenu(mousePosition, ["Remove Nodes", "Copy Nodes"], [RemoveSelectedNodes, CopySelectedNodes]);
    }
    else
    {
        OpenContextMenu(mousePosition, ["Create Connection", "Copy Node", "Remove Node"], [StartNodeConnection, CopySelectedNodes, RemoveNode]);
    }
}

var connectionFromNode; //this is not a relative position
var connectingNodes = false;

function StartNodeConnectionFromButton(event)
{
    contextId = event.target.getAttribute("node-name");
    event.stopPropagation();
    event.preventDefault();
    HideContextMenu();
    connectionFromNode = FindNodeWithName(contextId);
    if(connectionFromNode)
    {
        connectingNodes = true;
        connectionStartPos = connectionFromNode.position;
        document.addEventListener("mouseup", EndConnection);
        document.addEventListener("mousedown", EndConnection);
        document.addEventListener("mousemove", DrawDummyConnection);
    }
    else
    {
        connectingNodes = false;
    }
}

function StartNodeConnection()
{
    connectionFromNode = FindNodeWithName(contextId);
    if(connectionFromNode)
    {
        connectingNodes = true;
        connectionStartPos = connectionFromNode.position;
        document.addEventListener("mousedown", EndConnection);
        document.addEventListener("mousemove", DrawDummyConnection);
    }
    else
    {
        connectingNodes = false;
    }
}

function EndConnection(event)
{
    document.removeEventListener("mousemove", DrawDummyConnection);
    document.removeEventListener("mousedown", EndConnection);
    document.removeEventListener("mouseup", EndConnection);
    connectingNodes = false;
    if(event.button != 0)
    {
        DrawAllGrid();
        return;
    }
    let connectionToNode = GetNodeInBounds(event);
    if(connectionFromNode != null)
    {
        if(IsConnectionValid(connectionFromNode, connectionToNode))
        {
            if(connections[connectionFromNode.name+"->"+connectionToNode.name] != null)
                return;
            CreateConnection(connectionFromNode, connectionToNode);
        }
        else if(connectionToNode == null)
        {
            connectingNodes = true;
            contextMenuPosition = new Vector2(event.pageX, event.pageY);
            let t = GetNodeType(connectionFromNode.defaultConnectionType);
            if(t != null)
                CreateNode(connectionFromNode.defaultConnectionType);
            else
                OpenNodeContext();
        }
    }
    DrawAllGrid();
}

function IsConnectionValid(from, to)
{
    if(from == null)
        return false;
    if(to == null)
        return false;
    if(from.name == to.name)
        return false;
    if(from.isChild && to == from.parent)
        return false;
    if(to.isChild && from == to.parent)
        return false;
    if(from.isChild && to.isChild && from.parent == to.parent)
        return false;
    return true;
}

function GetNodeInBounds(event)
{
    let position = new Vector2(event.clientX, event.clientY);
    for(let i in nodes)
    {
        let currentNode = nodes[i];
        if(currentNode != null && (currentNode.HTMLGridElement != null || currentNode.HTMLDummyContainer != null) && currentNode != connectionFromNode)
        {
            rect = new Rect(null,null);
            let element = currentNode.isChild ? currentNode.HTMLGridElement : currentNode.HTMLDummyContainer;
            rect.SetFromRect(element.getBoundingClientRect());
            if(rect.Contains(position))
                return currentNode;
        }
    }
    return null;
}

function RemoveNode()
{
    let target = nodes[contextId];
    let connectionsToDelete = {};
    if(target != null)
    {
        for(let i = 0; i < target.connectionsFrom.length; i++)
        {
            let connection = target.connectionsFrom[i];
            contextConnectionName = connection.GetName();
            connectionsToDelete[contextConnectionName] = contextConnectionName;
        }
        for(let i = 0; i < target.connectionsTo.length; i++)
        {
            let connection = target.connectionsTo[i];
            contextConnectionName = connection.GetName();
            connectionsToDelete[contextConnectionName] = contextConnectionName;
        }
        delete nodes[contextId];
        if(target.isChild)
        {
            let parent = target.parent;
            if(nodes[target.parent.name] == parent)
            {
                let targetIndex = parent.children.indexOf(target);
                console.log(targetIndex);
                if(targetIndex != -1)
                    parent.children.splice(targetIndex, 1);
            }
        }
        else
        {
            for(let i = 0; i < target.children.length; i++)
            {
                contextId = target.children[i].name;
                RemoveNode();
            }
        }
        for(let i in connectionsToDelete)
        {
            contextConnectionName = i;
            RemoveConnection();
        }
    }
    DrawAllGrid();
}

function RenameNode(input)
{
    let newName = input.value;
    let oldName = input.getAttribute("node-name");
    let targetNode = FindNodeWithName(oldName);
    let nodeName = ConvertNodeName(newName);
    let currentNodeName = nodeName;
    let i = 0;
    while(nodes[currentNodeName] != null)
    {
        currentNodeName = nodeName +" "+i;
        i++;
    }
    nodeName = currentNodeName;
    targetNode.HTMLGridElement.id = nodeName;
    nodes[nodeName] = targetNode;
    delete nodes[oldName];

    connectionsToChange= {};
    for(let key in connections)
    {
        let newConnectionName = "";
        elements = key.split("->");
        newConnectionName += elements[0] == oldName ? nodeName : elements[0];
        newConnectionName += "->";
        newConnectionName += elements[1] == oldName ? nodeName : elements[1];
        if(newConnectionName != key)
        {
            connectionsToChange[key] = newConnectionName;
        }
    }
    for(let key in connectionsToChange)
    {
        let cache = connections[key];
        delete connections[key];
        connections[connectionsToChange[key]] = cache; 
    }

    targetNode.name = nodeName;
    DrawAllGrid();
    DrawProperties();
}