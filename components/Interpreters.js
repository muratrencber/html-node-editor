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
        if(tag != "panel-node")
            continue;
        result += "<PANEL id=\""+n.name+"\">\n";
        for(let j = 0; j < n.connectionsTo.length; j++)
        {
            let con = n.connectionsTo[j];
            let dn = con.toNode;
            let dntag = dn.GetAdditionalInfo("tag");
            if(dntag == undefined && dn.panels.includes("tags"))
                dntag = nodeTags[0];
            console.log(dntag);
            if(dntag != "dialogue-node")
                continue;
            let nextN = null;
            for(let k = 0; k < dn.connectionsTo.length; k++)
            {
                let con2 = dn.connectionsTo[k];
                let con2Tag = con2.toNode.GetAdditionalInfo("tag");
                if(con2Tag == "panel-node")
                {
                    nextN = con2.toNode;
                    break;
                }
            }
            if(nextN == null)
                continue;
            for(let k = 0; k < con.conditions.length; k++)
            {
                let cond = con.conditions[k];
                result += "<condition name=\""+cond.targetName+"\" target=\""+cond.targetValue+"\" type=\""+cond.conditionType+"\">\n";
            }
            result += "<option id=\""+nextN.name+"\">"+dn.GetAdditionalInfo("text");
            if(dn.panels.includes("variable-changer"))
            {
                result += "\n";
                let cCount = dn.GetAdditionalInfo("varchange-count");
                for(let k = 0; k < cCount; k++)
                {
                    let name = dn.GetAdditionalInfo("varchange-name-"+k);
                    let val = dn.GetAdditionalInfo("varchange-target-"+k);
                    if(val == undefined || name == undefined)
                        break;
                    result += "<result type=\"change-variable\" name=\""+name+"\" value=\""+val+"\"></result>\n";
                }
            }
            if(dn.panels.includes("node-text-changer"))
            {
                result += "\n";
                let cCount = dn.GetAdditionalInfo("nodechange-count");
                for(let k = 0; k < cCount; k++)
                {
                    let name = dn.GetAdditionalInfo("nodechange-name-"+k);
                    let val = dn.GetAdditionalInfo("nodechange-value-"+k);
                    if(val == undefined || name == undefined)
                        break;
                    result += "<result type=\"change-node-text\" name=\""+name+"\" value=\""+val+"\"></result>\n";
                }
            }
            result += "</option>\n";
            for(let k = 0; k < con.conditions.length; k++)
            {
                result += "</condition>\n"
            }
        }
        result += "</PANEL>\n\n";
    }
    return {"result": result, "extension": ".pnsc"};
}