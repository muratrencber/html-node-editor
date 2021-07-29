function ChangeNodeType(select)
{
    let keys = Object.keys(selectedNodes);
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        if(node != null && node != undefined)
        {
            node.type = select.value;
            DrawProperties();
        }
    }
}

function AddTextToNode(textArea)
{
    let text = textArea.value;
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        node.SetAdditionalInfo("text", text);
    }
    DrawProperties();
}

function AddVariablesToChange(selectOrInput)
{
    let keys = Object.keys(selectedNodes);
    let lastNode = FindNodeWithName(keys[keys.length - 1]);
    for(i in selectedNodes)
    {
        let node = selectedNodes[i];
        node.SetAdditionalInfo("varchange-count", lastNode.GetAdditionalInfo("varchange-count"));
        if(node != null && node != undefined)
        {
            let order = selectOrInput.getAttribute("order");
            let select = document.getElementById("var-name-"+order);
            let value = document.getElementById("var-target-"+order);
    
            let valueName = select.value;
            let valueTarget = value.value;
            
            node.SetAdditionalInfo("varchange-name-"+order, valueName);
            node.SetAdditionalInfo("varchange-target-"+order, valueTarget);
            
        }
    }
    DrawProperties();
}

function DeleteVar(button)
{
    let keys = Object.keys(selectedNodes);
    let lastNode = FindNodeWithName(keys[keys.length - 1]);
    for(f in selectedNodes)
    {
        let node = selectedNodes[f];
        node.SetAdditionalInfo("varchange-count", lastNode.GetAdditionalInfo("varchange-count"));
        if(node != null && node != undefined)
        {
            let order = button.getAttribute("order");
            let varCount = node.GetAdditionalInfo("varchange-count");
            if(varCount == undefined)
                return;
            for(let i = order + 1; i < varCount; i++)
            {
                let currentName = node.GetAdditionalInfo("varchange-name-"+i);
                let currentValue = node.GetAdditionalInfo("varchange-target-"+i);
    
                node.SetAdditionalInfo("varchange-name-"+(i-1), currentName);
                node.SetAdditionalInfo("varchange-target-"+(i-1), currentValue);
            }
            node.DeleteAdditionalInfo("varchange-name-"+(varCount - 1));
            node.DeleteAdditionalInfo("varchange-target-"+(varCount - 1));
            node.SetAdditionalInfo("varchange-count", varCount - 1);
        }
    }
    DrawProperties();
}

function IncreaseVarCount(button)
{
    let keys = Object.keys(selectedNodes);
    let lastNode = FindNodeWithName(keys[keys.length - 1]);
    for(f in selectedNodes)
    {
        let node = selectedNodes[f];
        node.SetAdditionalInfo("varchange-count", lastNode.GetAdditionalInfo("varchange-count"));
        if(node != null && node != undefined)
        {
            let varCount = node.GetAdditionalInfo("varchange-count");
            if(varCount == undefined)
                varCount = 1;
            varCount++;
            node.SetAdditionalInfo("varchange-count", varCount);
        }
    }
    DrawProperties();
}

function ChangeConnectionCondition(selector)
{
    let connectionName = selector.getAttribute("connection-name");
    let index = selector.getAttribute("order");

    let targetConditionVarName = document.getElementById("target-variable-"+index).value;
    let conditionTypeName = document.getElementById("target-type-"+index).value;
    let conditionTarget = document.getElementById("target-value-"+index).value;

    let connection = connections[connectionName];
    if(connection != undefined || connection != null)
    {
        connection.conditions[index].targetName = targetConditionVarName;
        connection.conditions[index].conditionType = conditionTypeName;
        connection.conditions[index].targetValue = conditionTarget;
        SyncSelectedConnections(connection);
    }
}

function RemoveConnectionCondition(selector)
{
    let connectionName = selector.getAttribute("connection-name");
    let index = selector.getAttribute("order");

    let connection = connections[connectionName];
    if(connection != undefined || connection != null)
    {
        connection.conditions.splice(index, 1);
        SyncSelectedConnections(connection);
        DrawProperties();
    }
}

function AddConnectionCondition(selector)
{
    let connectionName = selector.getAttribute("connection-name");
    let connection = connections[connectionName];
    if(connection != undefined || connection != null)
    {
        let keyName = "";
        if(Object.keys(conditionVariables).length > 0)
            keyName = Object.keys(conditionVariables)[0];
        connection.conditions.push(new Condition(keyName, 0, "EQUAL TO"));
        SyncSelectedConnections(connection);
        DrawProperties();
    }
}

function SyncSelectedConnections(connectionToCopy)
{
    for(let i in selectedConnections)
    {
        let target = selectedConnections[i];
        if(target == connectionToCopy)
            continue;
        target.conditions = [];
        for(let f = 0; f < connectionToCopy.conditions.length; f++)
        {
            let cond = connectionToCopy.conditions[f];
            let copiedCond = new Condition(cond.targetName, cond.targetValue, cond.conditionType);
            target.conditions.push(copiedCond);
        }
    }
}

function RemoveSelectedNodes()
{
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        contextId = node.name;
        delete nodes[i];
    }
    let connectionsToDelete = [];
    for(let i in connections)
    {
        let con = connections[i];
        let del = selectedNodes[con.fromNode.name] == con.fromNode || selectedNodes[con.toNode.name] == con.toNode;
        if(del)
            connectionsToDelete.push(i);
    }
    for(let i = 0; i < connectionsToDelete.length; i++)
    {
        let key = connectionsToDelete[i];
        delete connections[key];
    }
    selectedNodes = {};
    DrawAllGrid();
    DrawProperties();
}

class SavedNode
{
    constructor(node)
    {
        this.name = node.name;
        this.type = node.type;
        this.position = new Vector2(node.position.x, node.position.y);
        this.additionalInfo = {...node.additionalInfo};
    }
}
var savedNodes = [];
const pasteOffset = new Vector2(20,20);

function CopySelectedNodes()
{
    savedNodes = [];
    for(let i in tempSelectedNodes)
    {
        let node = tempSelectedNodes[i];
        let saved = new SavedNode(node);
        savedNodes.push(saved);
    }
}

function PasteSelectedNodes()
{
    selectedNodes = {};
    for(let i = 0; i < savedNodes.length; i++)
    {
        let snode = savedNodes[i];
        let name = GetLegalNodeName(snode.name);
        let node = new Node(name, snode.type, snode.position.Plus(pasteOffset));
        node.additionalInfo = {...snode.additionalInfo};
        nodes[name] = node;
        selectedNodes[name] = node;
    }
    DrawAllGrid();
    DrawProperties();
}