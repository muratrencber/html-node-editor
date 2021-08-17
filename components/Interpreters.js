let interpreters = [
    {
        "name": "PanelScript Exporter",
        "function": PanelScriptInterpreter
    }
]

function SaveInterpretedFile(interpreter)
{
    let result = interpreter();
    let filename = "save"+result["extension"];
    let type = result["extension"];
    var file = new Blob([result["result"]], {type: type});
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

function OpenInterpretersContext()
{
    let names = [];
    let functions = [];
    for(let i = 0; i < interpreters.length; i++)
    {
        names.push(interpreters[i]["name"]);
        functions.push(function() {SaveInterpretedFile(interpreters[i]["function"]);});
    }
    OpenContextMenu(contextMenuPosition, names, functions);
}

function PSCondition(cond, prefix)
{
    let str = "";
    str += "<"+prefix+"condition var-name=\""+cond.targetName+"\" var-target=\""+cond.targetValue+"\" var-type=\""+cond.conditionType+"\"></"+prefix+"condition>";
    return str;
}

function PSTextChanger(dn)
{
    let str = "";
    if(dn.panels.includes("node-text-changer"))
    {
        let cCount = dn.GetAdditionalInfo("nodechange-count");
        for(let k = 0; k < cCount; k++)
        {
            let name = dn.GetAdditionalInfo("nodechange-name-"+k);
            let val = dn.GetAdditionalInfo("nodechange-value-"+k);
            if(val == undefined || name == undefined)
                break;
            str += "<result type=\"change-node-text\" name=\""+name+"\" value=\""+val+"\"></result>\n";
        }
    }
    return str;
}

function PSVarChanger(dn)
{
    let str = "";
    if(dn.panels.includes("variable-changer"))
    {
        let cCount = dn.GetAdditionalInfo("varchange-count");
        if(cCount == undefined || cCount == null || cCount == 0)
            cCount = 1;
        for(let k = 0; k < cCount; k++)
        {
            let name = dn.GetAdditionalInfo("varchange-name-"+k);
            let val = dn.GetAdditionalInfo("varchange-target-"+k);
            if(val == undefined || name == undefined)
                break;
            str += "<result type=\"change-variable\" name=\""+name+"\" value=\""+val+"\"></result>\n";
        }
    }
    return str;
}

function PanelScriptInterpreter()
{
    let result = "";
    for(let i in conditionVariables)
    {
        let cvar = conditionVariables[i];
        result += "<var def=\""+cvar.targetValue+"\">"+cvar.name+"</var>\n";
    }
    result += "\n";
    for(let i in nodes)
    {
        let n = nodes[i];
        let tag = n.GetAdditionalInfo("tag");
        let ntext = n.GetAdditionalInfo("text");
        if(tag != "panel-node")
            continue;
        result += "<PANEL id=\""+n.name+"\">\n";
        result += "<text>"+ntext+"</text>\n";
        for(let j = 0; j < n.connectionsTo.length+n.children.length; j++)
        {
            let con = null;
            if(j < n.connectionsTo.length)
                con = n.connectionsTo[j];
            else
                con = new Connection(n, n.children[j - n.connectionsTo.length], []);
            let dn = con.toNode;
            let dntag = dn.GetAdditionalInfo("tag");
            if(dntag == undefined && dn.panels.includes("tags"))
                dntag = nodeTags[0];
            console.log(dntag);
            if(dntag == "dialogue-node")
            {
                result += "<option>\n<text>"+dn.GetAdditionalInfo("text")+"</text>\n<id>"+dn.name+"</id>\n";
                for(let k = 0; k < dn.connectionsTo.length; k++)
                {
                    let con2 = dn.connectionsTo[k];
                    let con2Tag = con2.toNode.GetAdditionalInfo("tag");
                    if(con2Tag == "panel-node")
                    {
                        let transitionTo = con2.toNode;
                        result += "<transition id=\""+transitionTo.name+"\">"
                        for(let f = 0; f < con2.conditions.length; f++)
                            result += PSCondition(con2.conditions[f], "tr")+"\n";
                        result += "</transition>\n";
                    }
                }
            }
            else if(dntag == "panel-node")
            {
                result += "<option>\n<text></text>\n<id></id>\n<transition id=\""+dn.name+"\">";
                result += "</transition>\n";
            }
            for(let k = 0; k < con.conditions.length; k++)
                result += PSCondition(con.conditions[k], "op")+"\n";
            result += PSVarChanger(dn);
            result += PSTextChanger(dn);
            result += "</option>\n";
        }
        result += PSVarChanger(n);
        result += PSTextChanger(n);
        result += "</PANEL>\n\n";
    }
    return {"result": result, "extension": ".pnsc"};
}