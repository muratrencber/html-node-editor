class SerializedStatus
{
    constructor(nodes, connections, conditionVariables, scale, offset)
    {
        this.nodes = nodes;
        this.connections = connections;
        this.conditionVariables = conditionVariables;
        this.scale = scale;
        this.offset = offset;
    }
}

class SerializedNode
{
    constructor(node)
    {
        this.name = node.name;
        this.type = node.type;
        this.isChild = node.isChild;
        this.defaultConnectionType = node.defaultConnectionType;
        this.defaultChildType = node.defaultChildType;
        this.additionalInfo = node.additionalInfo;
        this.position = node.position;
        this.panels = node.panels;

        this.connectionsTo = [];
        for(let i = 0; i < node.connectionsTo.length; i++)
            this.connectionsTo.push(node.connectionsTo[i].GetName());

        this.connectionsFrom = [];
        for(let i = 0; i < node.connectionsFrom.length; i++)
            this.connectionsFrom.push(node.connectionsFrom[i].GetName());

        this.children = [];
        for(let i = 0; i < node.children.length; i++)
            this.children.push(node.children[i].name);
    }
}

class SerializedConnection
{
    constructor(connection)
    {
        this.fromNode = connection.fromNode.name;
        this.toNode = connection.toNode.name;
        this.conditions = connection.conditions;
    }
}

function SaveAsFile()
{
    let serializedNodes = {};
    for(let i in nodes)
        serializedNodes[i] = new SerializedNode(nodes[i]);
    let serializedConnections = {};
    for(let i in connections)
        serializedConnections[i] = new SerializedConnection(connections[i]);
    let status = new SerializedStatus(serializedNodes, serializedConnections, conditionVariables, scale, offset);
    let result = JSON.stringify(status);
    
    let filename = "save.nesf";
    let type = ".nesf";
    var file = new Blob([result], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function LoadFile()
{
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = ".nesf";
    input.click();

    input.onchange = e => {
        var file = e.target.files[0];
        var fr = new FileReader();
        fr.onload = function(){
            let serializedStatus = JSON.parse(fr.result);
            if(serializedStatus == null || serializedStatus == undefined)
                return;

            nodes = {};
            for(let i in serializedStatus.nodes)
            {
                let serializedNode = serializedStatus.nodes[i];
                nodes[i] = new Node(serializedNode.name, serializedNode.type, new Vector2(serializedNode.position.x, serializedNode.position.y));
                nodes[i].additionalInfo = serializedNode.additionalInfo;
                nodes[i].isChild = serializedNode.isChild;
                nodes[i].defaultConnectionType = serializedNode.defaultConnectionType;
                nodes[i].defaultChildType = serializedNode.defaultChildType;
                nodes[i].panels = [...serializedNode.panels];
                nodes[i].RefreshPanels();
            }

            for(let i in serializedStatus.nodes)
            {
                let serializedNode = serializedStatus.nodes[i];
                for(let j = 0; j < serializedNode.children.length; j++)
                {
                    let child = nodes[serializedNode.children[j]];
                    if(child != null && child != undefined)
                    {
                        nodes[i].children.push(child);
                        child.parent = nodes[i];
                    }
                }
            }

            connections = {};
            for(let i in serializedStatus.connections)
            {
                let serializedConnection = serializedStatus.connections[i];

                let fromNode = FindNodeWithName(serializedConnection.fromNode);
                let toNode = FindNodeWithName(serializedConnection.toNode);
                connections[i] = new Connection(fromNode, toNode);
                connections[i].conditions = [];
                for(let f = 0; f < serializedConnection.conditions.length; f++)
                {
                    let serializedCondition = serializedConnection.conditions[f];
                    connections[i].conditions.push(new Condition(serializedCondition.targetName, serializedCondition.targetValue, serializedCondition.targetType));
                }

                fromNode.connectionsTo.push(connections[i]);
                toNode.connectionsFrom.push(connections[i]);
            }
            
            conditionVariables = {};
            for(let i in serializedStatus.conditionVariables)
            {
                let serializedConditionVariable = serializedStatus.conditionVariables[i];
                conditionVariables[i] = new ConditionVariable(serializedConditionVariable.name, serializedConditionVariable.type, serializedConditionVariable.targetValue, serializedConditionVariable.order);
            }

            scale = serializedStatus.scale;
            offset = new Vector2(serializedStatus.offset.x, serializedStatus.offset.y);

            DrawAllGrid();
            RefreshConditionsPanel();
            DrawProperties();
        }
        fr.readAsText(file);
    }
}