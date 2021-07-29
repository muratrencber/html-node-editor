const nodeClass = "node";
var defaultNodeType;
document.addEventListener("mousedown", DeselectIfNotInNodeBounds);
var nodeTypes = []

function LoadNodeTypes()
{
    nodeTypes = [];
    defaultNodeType = null;
    let defs = nodeTypesText.split(",");
    for(let i = 0; i < defs.length; i++)
    {
        let defText = defs[i];
        if(defText.trim() == "")
            continue;
        let defName = defText.split("{")[0].trim();
        let defPanels = defText.split("{")[1].split("}")[0].split(";");
        for(let f = 0; f < defPanels.length; f++)
            defPanels[f] = defPanels[f].trim();
        defPanels.pop();
        let newType = new NodeType(defName, defPanels);
        nodeTypes.push(newType);
        if(defaultNodeType == null)
            defaultNodeType = newType;
    }
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
    constructor(name, panels)
    {
        this.name = name;
        this.panels = panels;
    }
}

class Node
{
    constructor(name, type, position)
    {
        this.name = name;
        this.type = type;
        this.connectionsTo = [];
        this.connectionsFrom = [];
        this.additionalInfo = {};
        this.HTMLGridElement = null;
        this.position = position;
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

    DrawHTMLGrid(position, divScale)
    {
        if(this.HTMLGridElement != null)
            this.HTMLGridElement.innerHTML = "";
        else
        {
            this.HTMLGridElement = document.createElement("div");
            this.HTMLGridElement.className = nodeClass;
            this.HTMLGridElement.id=this.name;
            this.HTMLGridElement.addEventListener("mousedown", OnNodeMouseDown);
            this.HTMLGridElement.addEventListener("contextmenu", ContextMenuNode);
            this.HTMLGridElement.addEventListener("wheel", function(event) {AdjustGridScale(event);})
        }
        let topLeft = position.Minus(divScale.Scale(1/2));
        this.HTMLGridElement.style.position = "absolute";
        this.HTMLGridElement.style.top = topLeft.y+"px";
        this.HTMLGridElement.style.left = topLeft.x+"px";
        this.HTMLGridElement.style.width = divScale.x+"px";
        this.HTMLGridElement.style.minHeight = divScale.y+"px";
        this.HTMLGridElement.style.borderRadius = (15*scale)+"px";

        let nodeName = document.createElement("h3");
        nodeName.innerHTML = this.name;
        this.HTMLGridElement.style.fontSize = (scale*1)+"em";
        this.HTMLGridElement.appendChild(nodeName);
        if(selectedNodes[this.name] != undefined)
            this.HTMLGridElement.className = nodeClass + " selected";
        else
            this.HTMLGridElement.className = nodeClass;

        if(this.HTMLGridElement.className == nodeClass+" selected")
           this. HTMLGridElement.style.borderWidth = (5*scale)+"px";
        return this.HTMLGridElement;
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
    connectingNodes = false;
    let connectionToNode = GetNodeInBounds(event);
    if(connectionToNode != null && connectionFromNode != null && connectionFromNode.name != connectionToNode.name)
    {
        if(connections[connectionFromNode.name+"->"+connectionToNode.name] != null)
            return;
        CreateConnection(connectionFromNode, connectionToNode);
        DrawAllGrid();
    }
}

function GetNodeInBounds(event)
{
    let position = new Vector2(event.clientX, event.clientY);
    for(let i in nodes)
    {
        let currentNode = nodes[i];
        if(currentNode != null && currentNode.HTMLGridElement != null && currentNode != connectionFromNode)
        {
            rect = new Rect(null,null);
            rect.SetFromRect(currentNode.HTMLGridElement.getBoundingClientRect());
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