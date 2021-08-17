function ChangeNodeType(select)
{
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        if(node != null && node != undefined)
        {
            node.SetType(select.value);
        }
    }
    DrawProperties();
}

function ChangeNodeConnectionType(select)
{
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        if(node != null && node != undefined)
        {
            let val = select.value;
            if(val == "Choose")
                val = "";
            node.defaultConnectionType = val;
        }
    }
    DrawProperties();
}

function ChangeNodeChildType(select)
{
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        if(node != null && node != undefined)
        {
            node.defaultChildType = select.value;
        }
    }
    DrawProperties();
}

function AddPanelToNode(panelName)
{
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        node.type = "CustomNode";
        if(!node.panels.includes(panelName))
            node.panels.push(panelName);
    }
    DrawProperties();
}

function RemovePanelFromNode(element)
{
    let panelName = element.getAttribute("panel-name");
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        node.type = "CustomNode";
        let index = node.panels.indexOf(panelName);
        if(index >= 0 && index < node.panels.length)
            node.panels.splice(index, 1);
        if(panelName == "tag")
            node.DeleteAdditionalInfo("tag");
        else if(panelName == "text-field")
            node.DeleteAdditionalInfo("text");
        else if(panelName == "variable-changer")
        {
            let count = node.GetAdditionalInfo("varchange-count") | 0;
            for(let i = 0; i < count; i++)
            {
                node.DeleteAdditionalInfo("varchange-name-"+i);
                node.DeleteAdditionalInfo("varchange-target-"+i);
            }
            node.DeleteAdditionalInfo("varchange-count");
        }
        else if(panelName == "node-text-changer")
        {
            let count = node.GetAdditionalInfo("nodechange-count") | 0;
            for(let i = 0; i < count; i++)
            {
                node.DeleteAdditionalInfo("nodechange-name-"+i);
                node.DeleteAdditionalInfo("nodechange-value-"+i);
            }
            node.DeleteAdditionalInfo("nodechange-count");
        }
    }
    DrawProperties();
}

function ShowPanelContext(event)
{
    let mousePosition = new Vector2(event.pageX, event.pageY);
    let availablePanels = [...panels];
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        for(let f = 0; f < node.panels.length; f++)
        {
            let pnl = node.panels[f];
            let index = availablePanels.indexOf(pnl);
            if(index >= 0 && index < availablePanels.length)
                availablePanels.splice(index, 1);
        }
    }
    if(availablePanels.length == 0)
    {
        console.log("No suitable panel found!");
        return;
    }
    let panelFunctions = [];
    for(let i = 0; i < availablePanels.length; i++)
    {
        panelFunctions.push(function() {AddPanelToNode(availablePanels[i]);});
    }
    OpenContextMenu(mousePosition, availablePanels, panelFunctions);
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
        if(node.isChild)
        {
            let parent = node.parent;
            if(nodes[node.parent.name] == parent)
            {
                let targetIndex = parent.children.indexOf(node);
                console.log(targetIndex);
                if(targetIndex != -1)
                    parent.children.splice(targetIndex, 1);
            }
        }
        else
        {
            for(let i = 0; i < node.children.length; i++)
            {
                contextId = node.children[i].name;
                delete nodes[contextId];
            }
            node.children = [];
        }
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
        this.children = [];
        this.defaultConnectionType = node.defaultConnectionType;
        this.defaultChildType = node.defaultChildType;
        if(!node.isChild)
        {
            for(let i = 0; i < node.children.length; i++)
            {
                let child = new SavedNode(node.children[i]);
                this.children.push(child);
            }
        }
        this.position = new Vector2(node.position.x, node.position.y);
        this.additionalInfo = {...node.additionalInfo};
        this.panels = [...node.panels];
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
        if(node.isChild && tempSelectedNodes[node.parent.name] == node.parent)
            continue;
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
        node.panels = [...snode.panels];
        node.defaultConnectionType = snode.defaultConnectionType;
        node.defaultChildType = snode.defaultChildType;
        for(let j = 0; j < snode.children.length; j++)
        {
            let schild = snode.children[j];
            let childName = GetLegalNodeName(schild.name);
            let child = new Node(childName, schild.type, snode.position.Plus(pasteOffset));
            child.additionalInfo = {...schild.additionalInfo};
            child.panels = [...schild.panels];
            child.defaultConnectionType = schild.defaultConnectionType;
            child.defaultChildType = schild.defaultChildType;
            node.children.push(child);
            child.parent = node;
            child.isChild = true;
            nodes[childName] = child;
        }
        nodes[name] = node;
        selectedNodes[name] = node;
    }
    DrawAllGrid();
    DrawProperties();
}

function AddNodeChange()
{
    let keys = Object.keys(selectedNodes);
    let lastNode = selectedNodes[keys[keys.length - 1]];

    let count = lastNode.GetAdditionalInfo("nodechange-count") | 0;
    lastNode.SetAdditionalInfo("nodechange-name-"+count, lastNode.name);
    lastNode.SetAdditionalInfo("nodechange-value-"+count, "");

    count += 1;
    lastNode.SetAdditionalInfo("nodechange-count", count);

    SyncNodeChanges();
    DrawProperties();
}

function RemoveNodeChange(element)
{
    let index = element.getAttribute("order");
    
    let keys = Object.keys(selectedNodes);
    let lastNode = selectedNodes[keys[keys.length - 1]];

    let count = lastNode.GetAdditionalInfo("nodechange-count") | 0;
    for(let i = index + 1; i < count; i++)
    {
        let currentName = node.GetAdditionalInfo("nodechange-name-"+i);
        let currentValue = node.GetAdditionalInfo("nodechange-value-"+i);

        lastNode.SetAdditionalInfo("nodechange-name-"+(i-1), currentName);
        lastNode.SetAdditionalInfo("nodechange-value-"+(i-1), currentValue);
    }
    lastNode.DeleteAdditionalInfo("nodechange-name-"+(count - 1));
    lastNode.DeleteAdditionalInfo("nodechange-value-"+(count - 1));
    lastNode.SetAdditionalInfo("nodechange-count", count - 1);

    SyncNodeChanges();
    DrawProperties();
}

function AlterNodeChange(element)
{
    let index = element.getAttribute("order");
    let selectField = document.getElementById("nodechange-select-"+index);
    let textField = document.getElementById("nodechange-textarea-"+index);

    let keys = Object.keys(selectedNodes);
    let lastNode = selectedNodes[keys[keys.length - 1]];

    lastNode.SetAdditionalInfo("nodechange-name-"+index, selectField.value);
    lastNode.SetAdditionalInfo("nodechange-value-"+index, textField.value);

    SyncNodeChanges();
    DrawProperties();
}

function SyncNodeChanges()
{
    let keys = Object.keys(selectedNodes);
    let lastNode = selectedNodes[keys[keys.length - 1]];
    let lNCount = lastNode.GetAdditionalInfo("nodechange-count");
    if(lNCount == undefined)
        lNCount = 0;
    for(let i in selectedNodes)
    {
        let node = selectedNodes[i];
        if(node == lastNode)
            continue;
        let count = node.GetAdditionalInfo("nodechange-count");
        if(count == undefined)
            count = 0;
        for(let f = lNCount; f < count; f++)
        {
            node.DeleteAdditionalInfo("nodechange-name-"+f);
            node.DeleteAdditionalInfo("nodechange-value-"+f);
        }
        for(let f= 0; f < lNCount; f++)
        {
            let name = lastNode.GetAdditionalInfo("nodechange-name-"+f);
            let value = lastNode.GetAdditionalInfo("nodechange-value-"+f);

            node.SetAdditionalInfo("nodechange-name-"+f, name);
            node.SetAdditionalInfo("nodechange-value-"+f, name);
        }
        node.SetAdditionalInfo("nodechange-count", lNCount);
    }
}

function ChangeNodeTags(select)
{
    let tag = select.value;
    for(let i in selectedNodes)
        selectedNodes[i].SetAdditionalInfo("tag", tag);
    DrawProperties();
}