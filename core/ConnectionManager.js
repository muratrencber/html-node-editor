connections = {};
document.addEventListener("mousedown", DeselectIfNotInConnectionBounds);

class Connection
{
    constructor(from, to, conditions=[])
    {
        this.fromNode = from;
        this.toNode = to;
        this.conditions = conditions;
    }

    AddCondition(newCond)
    {
        this.conditions.push(newCond);
    }

    Check(val)
    {
        for(let i = 0; i < this.conditions.length; i++)
        {
            if(!this.conditions[i].Check(val))
                return false;
        }
        return true;
    }

    GetName()
    {
        return this.fromNode.name+"->"+this.toNode.name;
    }
}
var selectedConnections = {};
var clickedConnection;
var lastClickPosition;
function OnConnectionMouseDown(event, element)
{
    switch(event.which)
    {
        case 1:
            clickedConnection = true;
            lastClickPosition = new Vector2(event.pageX, event.pageY);
            let connectionName = element.id;
            SelectConnection(connectionName);
            break;
        case 2:
            MouseDownOnGrid(event);
            break;
    }
}

function SelectConnection(connectionName)
{
    let pressingCTRL = pressedKeys[17] != undefined && Object.keys(pressedKeys).length == 1;
    let selectedConnection = connections[connectionName];
    if(pressingCTRL)
    {
        if(selectedConnections[connectionName] == selectedConnection)
            delete selectedConnections[connectionName];
        else
            selectedConnections[connectionName] = selectedConnection;
    }
    else if(selectedConnection != null)
    {
        selectedConnections = {};
        selectedConnections[connectionName] = selectedConnection;
    }
    if(selectedConnection != null)
    {
        SelectNode(null);
    }
    DrawProperties();
    DrawAllGrid();
}

var contextConnectionName;
function OnConnectionContextMenu(event, element)
{
    event.preventDefault();
    contextConnectionName = element.id;
    let mousePosition = new Vector2(event.pageX, event.pageY);
    OpenContextMenu(mousePosition, ["Remove Connection"], [RemoveConnection]);
}


function DeselectIfNotInConnectionBounds(event)
{
    let keys = Object.keys(selectedConnections);
    if(!clickedConnection && keys.length > 0 && !IsInPanels(new Vector2(event.pageX, event.pageY)))
    {
        selectedConnections = {};
        SelectConnection("connection_null");
    }
    clickedConnection = false;
}

function CreateConnection(fromNode, toNode)
{
    let connection = new Connection(fromNode, toNode);
    fromNode.connectionsTo.push(connection);
    toNode.connectionsFrom.push(connection);

    let connectionName = connection.GetName();
    connections[connectionName] = connection;
}

function RemoveConnection()
{
    let connection = connections[contextConnectionName];
    let fromIndex = connection.fromNode.connectionsTo.indexOf(connection);
    connection.fromNode.connectionsTo.splice(fromIndex, 1);
    let toIndex = connection.toNode.connectionsFrom.indexOf(connection);
    connection.toNode.connectionsFrom.splice(toIndex, 1);
    
    delete connections[contextConnectionName];
    DrawAllGrid();
}