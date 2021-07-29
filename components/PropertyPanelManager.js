function DrawProperties()
{
    let rightPanel = document.getElementById("right-panel");
    rightPanel.innerHTML = "";
    let selectedNodeKeys = Object.keys(selectedNodes);
    let selectedConnectionKeys = Object.keys(selectedConnections);
    if(selectedConnectionKeys.length > 0)
        DrawConnectionProperties(selectedConnections[selectedConnectionKeys[selectedConnectionKeys.length - 1]]);
    else if(selectedNodeKeys.length > 0)
        DrawNodeProperties(selectedNodes[selectedNodeKeys[0]]);
}

function DrawConnectionProperties(connection)
{
    let connectionKeys = Object.keys(selectedConnections);
    let rightPanel = document.getElementById("right-panel");
    let labelDiv = document.createElement("div");
    labelDiv.className = "properties-div";
    let infoLabel = document.createElement("h4");
    if(connectionKeys.length == 1)
        infoLabel.innerHTML = connection.fromNode.name + " -> " + connection.toNode.name;
    else
        infoLabel.innerHTML = "Editing multiple connections";
    labelDiv.appendChild(infoLabel);
    rightPanel.appendChild(labelDiv);

    for(let i = 0; i < connection.conditions.length; i++)
    {
        let condition = connection.conditions[i];

        let conditionDiv = document.createElement("div");
        conditionDiv.className = "properties-div";

        let targetLabel = document.createElement("h4");
        targetLabel.innerHTML = "Target Condition Variable:";
        let selection = document.createElement("select");
        selection.id = "target-variable-"+i;
        for(let f in conditionVariables)
        {
            let option = document.createElement("option");
            option.value = conditionVariables[f].name;
            option.innerHTML = conditionVariables[f].name;
            selection.appendChild(option);
        }
        selection.value = condition.targetName;
        let typeSelection = document.createElement("select");
        for(let f = 0; f < 3; f++)
        {
            let option = document.createElement("option");
            option.value = f == 0 ? "GREATER THAN" : f == 1 ? "LESSER THAN" : "EQUAL TO";
            option.innerHTML = option.value;
            typeSelection.appendChild(option);
        }
        typeSelection.id = "target-type-"+i;
        typeSelection.value = condition.conditionType;
        
        let valueLabel = document.createElement("h4");
        valueLabel.innerHTML = "Target Value:";

        let valueInput = document.createElement("input");
        valueInput.setAttribute("type", "number");
        valueInput.id = "target-value-"+i;
        valueInput.value = condition.targetValue;

        typeSelection.setAttribute("connection-name", connection.GetName());
        selection.setAttribute("connection-name", connection.GetName());
        valueInput.setAttribute("connection-name", connection.GetName());

        typeSelection.setAttribute("order", i);
        selection.setAttribute("order", i);
        valueInput.setAttribute("order", i);

        typeSelection.setAttribute("onchange", "ChangeConnectionCondition(this)");
        selection.setAttribute("onchange", "ChangeConnectionCondition(this)");
        valueInput.setAttribute("onchange", "ChangeConnectionCondition(this)");

        let removeButton = document.createElement("button");
        removeButton.innerHTML = "Remove Condition";
        removeButton.setAttribute("connection-name", connection.GetName());
        removeButton.setAttribute("order", i);
        removeButton.setAttribute("onclick", "RemoveConnectionCondition(this)");
        removeButton.className = "remove-button";

        conditionDiv.appendChild(targetLabel);
        conditionDiv.appendChild(selection);
        conditionDiv.appendChild(typeSelection);
        conditionDiv.appendChild(valueLabel);
        conditionDiv.appendChild(valueInput);
        conditionDiv.appendChild(removeButton);
        rightPanel.appendChild(conditionDiv);
    }

    let addButtonDiv = document.createElement("div");
    addButtonDiv.className = "properties-div";

    let addButton = document.createElement("button");
    addButton.innerHTML = "Add Condition";
    addButton.setAttribute("connection-name", connection.GetName());
    addButton.setAttribute("onclick", "AddConnectionCondition(this)");

    addButtonDiv.appendChild(addButton);
    rightPanel.appendChild(addButtonDiv);
}

function DrawNodeProperties(nodes)
{
    let keys = Object.keys(selectedNodes);
    let node = selectedNodes[keys[keys.length - 1]];
    let rightPanel = document.getElementById("right-panel");
    let panels = [];
    if(keys.length == 1)
    {
        nodeType = GetNodeType(node.type);
        if(nodeType == null)
            nodeType = defaultNodeType;
        panels = nodeType.panels;
    }
    else
    {
        nodeType = GetNodeType(node.type);
        if(nodeType == null)
            nodeType = defaultNodeType;
        let panelCounts = {};
        for(let i in selectedNodes)
        {
            let n = selectedNodes[i];
            let nt = GetNodeType(n.type);
            if(nt == null)
                nt = defaultNodeType;
            for(let f = 0; f < nt.panels.length; f++)
            {
                if(panelCounts[nt.panels[f]] == undefined)
                    panelCounts[nt.panels[f]] = 1;
                else
                    panelCounts[nt.panels[f]] += 1;
            }
        }
        for(let i in panelCounts)
        {
            if(panelCounts[i] == keys.length && !multipleEditNotSupportedPanels.includes(i))
                panels.push(i);
        }
    }
    
    for(let i = 0; i < panels.length; i++)
    {
        let newPanel = CreateCustomPanel(node, panels[i]);
        if(newPanel != null)
        {
            rightPanel.appendChild(newPanel);
        }
    }
}

function CreateCustomPanel(node, panelKey)
{
    let divWrapper = document.createElement("div");
    divWrapper.className = "properties-div";
    if(panelKey == "name-field")
    {
        let label = document.createElement("h4");
        label.innerHTML = "Node Name:";
        let input = document.createElement("input")
        input.setAttribute("type", "text");
        input.value = node.name;
        input.setAttribute("node-name", node.name);
        input.setAttribute("onchange", "RenameNode(this)");
        divWrapper.appendChild(label);
        divWrapper.appendChild(input);
    }
    else if(panelKey == "type-changer")
    {
        let label = document.createElement("h4");
        label.innerHTML = "Node Type:";
        let select = document.createElement("select");
        select.setAttribute("node-name", node.name);
        for(let i = 0; i < nodeTypes.length; i++)
        {
            let option = document.createElement("option");
            option.value = nodeTypes[i].name;
            option.innerHTML = nodeTypes[i].name;
            select.appendChild(option);
        }
        select.value = node.type;
        select.setAttribute("onchange", "ChangeNodeType(this)");
        divWrapper.appendChild(label);
        divWrapper.appendChild(select);
    }
    else if(panelKey == "text-field")
    {
        let label = document.createElement("h4");
        label.innerHTML = "Node Text:";
        let text = node.GetAdditionalInfo("text");
        if(text == undefined || text == null)
            text = "";
        let textField = document.createElement("textarea");
        textField.value = text;
        textField.setAttribute("node-name", node.name);
        textField.setAttribute("rows", 4);
        textField.setAttribute("cols", 30);
        textField.setAttribute("onchange", "AddTextToNode(this)");
        divWrapper.appendChild(label);
        divWrapper.appendChild(textField);
    }
    else if(panelKey == "variable-changer")
    {
        let label = document.createElement("h4");
        label.innerHTML = "Change Variable On Finish:";
        divWrapper.appendChild(label);
        let varCount = node.GetAdditionalInfo("varchange-count");
        if(varCount == undefined)
            varCount = 1;
        for(let f = 0; f < varCount; f++)
        {
            let nameLabel = document.createElement("h4");
            nameLabel.innerHTML = "Select Target";

            let select = document.createElement("select");
            select.id = "var-name-"+f;
            select.setAttribute("order", f);
            select.setAttribute("node-name", node.name);
            let selectValue = node.GetAdditionalInfo("varchange-name-"+f);

            for(let key in conditionVariables)
            {
                let option = document.createElement("option");
                option.value = key;
                option.innerHTML = key;
                select.appendChild(option);
            }
            if(selectValue != undefined && selectValue != null)
                select.value = selectValue;

            let label2 = document.createElement("h4");
            label2.innerHTML = "Target Value:";

            let targetInput = document.createElement("input");
            targetInput.id = "var-target-"+f;
            targetInput.setAttribute("type", "number");
            targetInput.setAttribute("order", f);
            targetInput.setAttribute("node-name", node.name);
            let targetInputValue = node.GetAdditionalInfo("varchange-target-"+f);
            targetInput.value = parseFloat(targetInputValue);

            select.setAttribute("onchange", "AddVariablesToChange(this)");
            targetInput.setAttribute("onchange", "AddVariablesToChange(this)");

            divWrapper.appendChild(nameLabel);
            divWrapper.appendChild(select);
            divWrapper.appendChild(label2);
            divWrapper.appendChild(targetInput);

            if(f == 0)
                continue;

            let deleteButton = document.createElement("button");
            deleteButton.innerHTML = "Remove Variable";
            deleteButton.className = "remove-button";
            deleteButton.setAttribute("node-name", node.name);
            deleteButton.setAttribute("order", f);
            deleteButton.setAttribute("onclick", "DeleteVar(this)");
            divWrapper.appendChild(deleteButton);
        }
        let addButton = document.createElement("button");
        addButton.innerHTML = "Add Variable to Change";
        addButton.setAttribute("node-name", node.name);
        addButton.setAttribute("onclick", "IncreaseVarCount(this)");
        divWrapper.appendChild(addButton);
    }
    else
    {
        return null;
    }
    return divWrapper;
}