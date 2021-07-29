const lineSpacing=60; //px
const lineThickness = 2.2; //px
const connectionOffset = 8;
const connectionLineThickness = 2;

var scale=1;
var offset = new Vector2(0,0);
var nodes = {};

window.addEventListener("resize", DrawAllGrid);
window.addEventListener("load", DrawAllGrid);


function DrawGridLines()
{
    let gridLineContainer = document.getElementById("grid-lines");
    gridLineContainer.innerHTML = "";
    gridLineContainer.style.width = window.innerWidth+"px";
    gridLineContainer.style.height=window.innerHeight+"px";

    let adjustedSpacing = lineSpacing * scale;
    let adjustedOffset = offset.Scale(scale);
    adjustedOffset = new Vector2(adjustedOffset.x % adjustedSpacing, adjustedOffset.y % adjustedSpacing);

    let horizontalLineCount = Math.ceil(window.innerHeight/adjustedSpacing);
    let verticalLineCount = Math.ceil(window.innerWidth/adjustedSpacing);

    for(let i=0; i < horizontalLineCount; i++)
    {
        let horizontalLine = document.createElement("div");
        let yPos = adjustedOffset.y+(i*adjustedSpacing);
        horizontalLine.className="line horizontal";
        horizontalLine.style.top = yPos+"px";
        horizontalLine.style.width = window.innerWidth+"px";
        horizontalLine.style.height = (lineThickness*scale)+"px";
        document.getElementById("grid-lines").appendChild(horizontalLine);
    }
    for(let i=0; i < verticalLineCount; i++)
    {
        let verticalLine = document.createElement("div");
        let xPos = adjustedOffset.x+(i*adjustedSpacing);
        verticalLine.className="line vertical";
        verticalLine.style.left = xPos+"px";
        verticalLine.style.height = window.innerHeight+"px";
        verticalLine.style.width = (lineThickness*scale)+"px";
        document.getElementById("grid-lines").appendChild(verticalLine);
    }
}

var defaultNodeScale = new Vector2(180,80); 
function DrawGridNodes()
{
    let gridCanvas = document.getElementById("grid-connections");
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;
    gridCanvas.innerHTML = "";

    let adjustedOffset = offset.Scale(scale);
    let adjustedScale = defaultNodeScale.Scale(scale);

    let nodeContainer = document.getElementById("grid-nodes");
    nodeContainer.innerHTML = "";
    for(let i in nodes)
    {
        let currentNode = nodes[i];
        if(currentNode == null)
            continue;
        let adjustedNodePosition = currentNode.position.Scale(scale).Plus(adjustedOffset);
        nodeContainer.appendChild(currentNode.DrawHTMLGrid(adjustedNodePosition, adjustedScale));
    }
}

function DrawDummyConnection(event)
{
    let gridCanvas = document.getElementById("grid-dummy-connection");
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;
    gridCanvas.innerHTML = "";
    if(connectingNodes == false || connectionFromNode == null ||event == null)
        return;
    let startPosition = GetAdjustedPosition(connectionFromNode.position);
    let position = new Vector2(event.clientX, event.clientY);
    let connectionToNode = GetNodeInBounds(event);
    if(connectionToNode != null && connectionToNode.name != connectionFromNode.name)
        position = GetAdjustedPosition(connectionToNode.position);
    let ctx = gridCanvas.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = connectionLineThickness*scale;
    ctx.strokeStyle="white";
    ctx.moveTo(startPosition.x, startPosition.y);
    ctx.lineTo(position.x, position.y);
    ctx.closePath();
    ctx.stroke();
}

function DrawConnections()
{
    for(let key in connections)
    {
        DrawConnection(connections[key]);
    }
}

function DrawConnection(connection)
{
    let fromNode = connection.fromNode;
    let toNode = connection.toNode;
    let unadjustedTo = toNode.position.Minus(fromNode.position);
    let startPos = GetAdjustedPosition(fromNode.position);
    let endPos = GetAdjustedPosition(toNode.position);
    let pathOffset = new Vector2(unadjustedTo.y, -unadjustedTo.x);
    pathOffset = pathOffset.Normalized();
    startPos = startPos.Plus(pathOffset.Scale(connectionOffset*scale));
    endPos = endPos.Plus(pathOffset.Scale(connectionOffset*scale));

    let isConnectionSelected = selectedConnections[connection.GetName()] != null;
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startPos.x);
    line.setAttribute("y1", startPos.y);
    line.setAttribute("x2", endPos.x);
    line.setAttribute("y2", endPos.y);
    line.setAttribute("id",connection.GetName());
    line.setAttribute("oncontextmenu", "OnConnectionContextMenu(event, this)");
    line.setAttribute("onmousedown", "OnConnectionMouseDown(event, this)");
    line.setAttribute("onmousewheel", "AdjustGridScale(event)");
    line.setAttribute("class", isConnectionSelected ? "grid-connection active" : "grid-connection");
    line.style.strokeWidth = connectionLineThickness*scale;
    
    let t1= startPos.Plus(endPos).Scale(1/2).Plus(pathOffset.Scale(connectionOffset* scale * 0.8));
    let t2=startPos.Plus(endPos).Scale(1/2).Minus(pathOffset.Scale(connectionOffset* scale * 0.8));
    let t3= startPos.Plus(endPos).Scale(1/2).Plus(unadjustedTo.Normalized().Scale(connectionOffset*scale*1.6));

    let arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrow.setAttribute("points", t1.x+","+t1.y+" "+t2.x+","+t2.y+" "+t3.x+","+t3.y);
    arrow.setAttribute("id", connection.GetName());
    arrow.setAttribute("oncontextmenu", "OnConnectionContextMenu(event, this)");
    arrow.setAttribute("onmousedown", "OnConnectionMouseDown(event, this)");
    arrow.setAttribute("onmousewheel", "AdjustGridScale(event)");
    arrow.setAttribute("class", isConnectionSelected ? "grid-connection active" : "grid-connection");

    document.getElementById("grid-connections").appendChild(line);
    document.getElementById("grid-connections").appendChild(arrow);
}

function DrawAllGrid()
{
    DrawDummyConnection();
    DrawGridLines();
    DrawGridNodes();
    DrawConnections();
}

function AdjustGridScale(event)
{
    let oldScale = scale;
    scale -= event.deltaY/1000;
    scale = clamp(scale, 0.5, 2.3);

    let mousePosition = new Vector2(event.pageX, event.pageY);
    let realMousePosition = GetUnadjustedPosition(mousePosition, oldScale);
    let newScaledMousePosition = realMousePosition.Scale(scale);
    offset= mousePosition.Minus(newScaledMousePosition).Scale(1/scale);
    DrawAllGrid();
}
var gridDragStartPosition = new Vector2(0,0);
var selectionAreaStartPosition = new Vector2(0,0);
var savedOffset = new Vector2(0,0);
function MouseDownOnGrid(event)
{
    let mousePosition = new Vector2(event.pageX, event.pageY);
    console.log("homie"+event.which);
    switch(event.which)
    {
        case 1:
            event.preventDefault();
            console.log("homie2");
            selectionAreaStartPosition = GetUnadjustedPosition(mousePosition);
            document.addEventListener("mousemove", SelectNodeArea);
            document.addEventListener("mouseup", OnMouseUpOnGrid);
            break;
        case 2:
            event.preventDefault();
            gridDragStartPosition = mousePosition;
            savedOffset = new Vector2(offset.x, offset.y);
            document.addEventListener("mousemove", OnGridDrag);
            document.addEventListener("mouseup", OnMouseUpOnGrid);
            break;
        default:
            break;
    }
}
function OnMouseUpOnGrid()
{
    console.log("upOnGrid");
    let selectionArea = document.getElementById("grid-selection");
    selectionArea.className = "grid-selection";
    document.removeEventListener("mousemove", OnGridDrag);
    document.removeEventListener("mousemove", SelectNodeArea);
    document.removeEventListener("mouseup", OnMouseUpOnGrid);
}
function OnGridDrag(event)
{
	event.preventDefault();
    let mousePosition = new Vector2(event.pageX, event.pageY);
    offset = savedOffset.Plus(mousePosition.Minus(gridDragStartPosition).Scale(1/scale));
    DrawAllGrid();
}
function GetUnadjustedPosition(targetVector, targetScale=scale)
{
    return targetVector.Minus(offset.Scale(targetScale)).Scale(1/targetScale);
}
function GetAdjustedPosition(targetVector, targetScale=scale)
{
    return targetVector.Plus(offset).Scale(targetScale);
}
function OnClickedToGrid(event)
{
    event.preventDefault();
    switch(event.which)
    {
        case 2:
            alert("Right mouse clicked!");
            break;
        default:
            alert("Damn");
            break;
    }
}
function ContextMenuGrid(event)
{
    event.preventDefault();
    let mousePosition = new Vector2(event.pageX, event.pageY);
    if(savedNodes.length == 0)
        OpenContextMenu(mousePosition, ["Create Node", "Reset View", "Export As...", "Save as File", "Load File"], [OpenNodeContext, ResetGridView, OpenInterpretersContext, SaveAsFile, LoadFile]);
    else
        OpenContextMenu(mousePosition, ["Create Node", "Paste Nodes", "Reset View", "Export As...", "Save as File", "Load File"], [OpenNodeContext, PasteSelectedNodes, ResetGridView, OpenInterpretersContext, SaveAsFile, LoadFile]);
}

function OpenNodeContext()
{
    let names = [];
    let functions = [];
    for(let i = 0; i < nodeTypes.length; i++)
    {
        names.push(nodeTypes[i].name);
        functions.push(function() {CreateNode(nodeTypes[i].name);});
    }
    OpenContextMenu(contextMenuPosition, names, functions);
}

function CreateNode(type)
{
    let nodeName = ConvertNodeName("New Node");
    let currentNodeName = nodeName;
    let i = 0;
    while(nodes[currentNodeName] != null)
    {
        currentNodeName = nodeName +"_"+i;
        i++;
    }
    nodeName = currentNodeName;
    let newNode = new Node(nodeName, type, GetUnadjustedPosition(contextMenuPosition));
    nodes[nodeName] = newNode;
    DrawAllGrid();
}

function GetLegalNodeName(nodeName)
{
    let currentNodeName = nodeName;
    let i = 0;
    while(nodes[currentNodeName] != null)
    {
        currentNodeName = nodeName +"_"+i;
        i++;
    }
    return currentNodeName;
}

function ConvertNodeName(targetName)
{
    return targetName.replace("->","_").replace(" ","_").replace("__","_").toLowerCase();
}

function ResetGridView()
{
    scale = 1;
    offset = new Vector2(0,0);
    DrawAllGrid();
}