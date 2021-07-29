var pressedKeys = {}

document.onkeydown = OnKeyDown;
document.onkeyup = OnKeyUp;

const cCode = 67;
const vCode = 86;
const ctrlCode = 17;
const delCode = 46;

function OnKeyDown(e)
{
    let key = e.which || e.keyCode;
    let isTextOrInput = document.activeElement.nodeName == "TEXTAREA" || document.activeElement.nodeName =="INPUT";
    if(pressedKeys[delCode] == undefined && key == delCode && Object.keys(pressedKeys).length == 0 && !isTextOrInput)
    {
        e.preventDefault();
        RemoveSelectedNodes();
    }
    else if(pressedKeys[ctrlCode] != undefined && key == cCode && Object.keys(pressedKeys).length == 1 && !isTextOrInput)
    {
        e.preventDefault();
        CopySelectedNodes();
    }
    else if(pressedKeys[ctrlCode] != undefined && key == vCode && Object.keys(pressedKeys).length == 1 && !isTextOrInput)
    {
        e.preventDefault();
        PasteSelectedNodes();
    }
    pressedKeys[key] = key;
}

function OnKeyUp(e)
{
    let key = e.which || e.keyCode;
    delete pressedKeys[key];
}