conditionVariables = {}

class ConditionVariable
{
    constructor(name, type, targetValue, order)
    {
        this.name = name;
        this.type = type;
        this.targetValue = targetValue;
        this.order = order;
    }
}

class Condition
{
    constructor(targetName, targetValue, conditionType)
    {
        this.targetName = targetName;
        this.targetValue = targetValue;
        this.conditionType = conditionType;
    }

    Check(val)
    {
        switch(this.conditionType)
        {
            case "LESSER THAN":
                return val < this.targetValue;
            case "GREATER THAN":
                return val > this.targetValue;
            case "EQUAL TO":
                return val == this.targetValue;
        }
        return false;
    }
}

function RefreshConditionsPanel()
{
    let conditionVarsContainer = document.getElementById("condition-variables-container");
    conditionVarsContainer.innerHTML = "";
    for(let key in conditionVariables)
    {
        let conditionVar = conditionVariables[key];
        let element = GetConVarElement(conditionVar);
        if(conditionVar.order <= conditionVarsContainer.childElementCount)
            conditionVarsContainer.insertBefore(element, conditionVarsContainer.children[conditionVar.order-1]);
        else
            conditionVarsContainer.appendChild(element);
    }
}

function GetConVarElement(convar)
{
    let conditionVarContainer = document.createElement("form");
    conditionVarContainer.id = convar.name;
    conditionVarContainer.className = "condition-variable-container";

    let nameLabel = document.createElement("label");
    nameLabel.innerHTML= "Name:";
    nameLabel.htmlFor = "condition-name";
    let name = document.createElement("input");
    name.type = "text";
    name.name = "condition-name";
    name.id = "condition-name-"+convar.name;
    name.value = convar.name;
    name.setAttribute("onchange","SetAllConditionVariables()");

    let typeLabel = document.createElement("label");
    typeLabel.innerHTML= "Type:";
    typeLabel.htmlFor = "condition-type";
    let type = document.createElement("select");
    type.id = "condition-type-"+convar.name;
    type.setAttribute("onchange","SetAllConditionVariables()");
    let floatOption = document.createElement("option");
    floatOption.value = "float";
    floatOption.id="float-"+convar.name;
    floatOption.innerHTML = "Float";
    let boolOption = document.createElement("option");
    boolOption.value = "bool";
    boolOption.id="bool-"+convar.name;
    boolOption.innerHTML = "Bool";
    let intOption = document.createElement("option");
    intOption.value = "int";
    intOption.id="int-"+convar.name;
    intOption.innerHTML = "Int";
    type.appendChild(boolOption);
    type.appendChild(intOption);
    type.appendChild(floatOption);

    let valueLabel = document.createElement("label");
    valueLabel.innerHTML= "Value:";
    valueLabel.htmlFor = "condition-value";
    let valueField = document.createElement("input");
    if(convar.type=="int")
    {
        intOption.selected = true;
        valueField.type="number";
        valueField.value = parseInt(convar.value);
    }
    else if(convar.type=="bool")
    {
        boolOption.selected = true;
        valueField.type="checkbox";
        valueField.checked = convar.value==1;
    }
    else if(convar.type=="float")
    {
        floatOption.selected = true;
        valueField.type="number";
        valueField.step="0.01";
        valueField.value = parseFloat(convar.value);
    }
    valueField.id = "condition-value-"+convar.name;
    valueField.name = "condition-value";
    valueField.setAttribute("onchange","SetAllConditionVariables()");

    let deleteField = document.createElement("button");
    deleteField.value="Remove";
    deleteField.innerHTML="Remove";
    deleteField.className = "remove-button";
    deleteField.setAttribute("onclick", "RemoveConditionVariable('"+convar.name+"')");

    conditionVarContainer.appendChild(nameLabel);
    conditionVarContainer.appendChild(name);
    conditionVarContainer.appendChild(document.createElement("br"));
    conditionVarContainer.appendChild(typeLabel);
    conditionVarContainer.appendChild(type);
    conditionVarContainer.appendChild(document.createElement("br"));
    conditionVarContainer.appendChild(valueLabel);
    conditionVarContainer.appendChild(valueField);
    conditionVarContainer.appendChild(document.createElement("br"));
    conditionVarContainer.appendChild(deleteField);

    return conditionVarContainer;
}

function AddConditionVariable()
{
    let legalName = GetLegalConditionVariableName("condition");
    let currentName = legalName;
    let i = 0;
    while(conditionVariables[currentName] != null)
    {
        currentName = legalName+i;
        i++;
    }
    conditionVariables[currentName] = new ConditionVariable(currentName, "bool", 0, Object.keys(conditionVariables).length+1);
    RefreshConditionsPanel();
    DrawProperties();
}

function SetAllConditionVariables()
{
    for(let key in conditionVariables)
    {
        let targetCondition = conditionVariables[key];
        let valueField = document.getElementById("condition-value-"+targetCondition.name);
        targetCondition.type = document.getElementById("condition-type-"+targetCondition.name).value;
        if(valueField.type == "checkbox" && targetCondition.type == "bool")
            targetCondition.value = valueField.checked ? 1 : 0;
        else if(targetCondition.type != "bool")
            targetCondition.value = valueField.value;
        else
            targetCondition.value = 0;
        let nameField = document.getElementById("condition-name-"+targetCondition.name).value;
        if(nameField != targetCondition.name)
            RenameConditionVariable(targetCondition.name, nameField);
    }
    RefreshConditionsPanel();
}

function RenameConditionVariable(oldName, newName)
{
    let legalName = GetLegalConditionVariableName(newName);
    let currentName = legalName;
    let i = 0;
    while(conditionVariables[currentName] != null)
    {
        currentName = legalName+i;
        i++;
    }
    let targetValue = conditionVariables[oldName];
    targetValue.name = currentName;
    conditionVariables[currentName] = targetValue;
    delete conditionVariables[oldName];

    RefreshConditionsPanel();
}

function RemoveConditionVariable(name)
{
    let target = conditionVariables[name];
    if(target != null)
    {
        for(let key in conditionVariables)
        {
            let other = conditionVariables[key];
            if(other.order > target.order)
                other.order--;
        }
        delete conditionVariables[name];
        RefreshConditionsPanel();
    }
}

function GetLegalConditionVariableName(currentName)
{
    return currentName.replace(/[^\x00-\x7F]/g, "").replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
}
