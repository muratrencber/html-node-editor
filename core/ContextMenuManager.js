var contextMenuPosition;
let avoidHiding;
function OpenContextMenu(position, names, functions)
{
    let contextMenuItemOld = document.getElementById("context-menu");
    if(contextMenuItemOld.className != "contextMenu invisible")
    {
        avoidHiding = true;
    }
    ClearContextMenu();
    contextMenuPosition = new Vector2(position.x, position.y);
    let contextMenuItem = document.getElementById("context-menu");
    contextMenuItem.style.left = position.x+"px";
    contextMenuItem.style.top = position.y+"px";
    contextMenuItem.className="contextMenu";
    let length = Math.min(names.length, functions.length);
    for(let  i = 0; i < length; i++)
    {
        AppendButtonToContextMenu(names[i], functions[i], i!=0);
    }
    document.body.addEventListener("mousedown", CheckClickForContextMenu);
}
function OpenContextMenuWStrings(position, names, functions)
{
    ClearContextMenu();
    contextMenuPosition = new Vector2(position.x, position.y);
    let contextMenuItem = document.getElementById("context-menu");
    contextMenuItem.style.left = position.x+"px";
    contextMenuItem.style.top = position.y+"px";
    contextMenuItem.className="contextMenu";
    let length = Math.min(names.length, functions.length);
    for(let  i = 0; i < length; i++)
    {
        AppendButtonToContextMenuString(names[i], functions[i], i!=0);
    }
    document.body.addEventListener("mousedown", CheckClickForContextMenu);
}
function AppendButtonToContextMenu(name, func, addLineBreak = true)
{
    let contextMenuItem = document.getElementById("context-menu");

    let linebreak = document.createElement("br");
    let button = document.createElement("input");
    button.type="button";
    button.value=name;
    button.addEventListener("click", func);
    button.addEventListener("click", HideContextMenu);
    if(addLineBreak)
        contextMenuItem.appendChild(linebreak);
    contextMenuItem.appendChild(button);
}
function AppendButtonToContextMenuString(name, func, addLineBreak = true)
{
    let contextMenuItem = document.getElementById("context-menu");

    let linebreak = document.createElement("br");
    let button = document.createElement("input");
    button.type="button";
    button.value=name;
    button.setAttribute("onclick", func);
    button.addEventListener("click", HideContextMenu);
    if(addLineBreak)
        contextMenuItem.appendChild(linebreak);
    contextMenuItem.appendChild(button);
}
function ClearContextMenu()
{
    document.getElementById("context-menu").innerHTML = "";
}
function HideContextMenu()
{
    if(avoidHiding)
    {
        avoidHiding = false;
        return;
    }
    document.body.removeEventListener("mousedown", CheckClickForContextMenu);
    let contextMenuItem = document.getElementById("context-menu");
    contextMenuItem.className="contextMenu invisible";
}
function CheckClickForContextMenu(event)
{
    //console.log("Check Context Menu");
    let mousePosition = new Vector2(event.pageX, event.pageY);
    let contextMenuItem = document.getElementById("context-menu");
    let menuDOMRect = contextMenuItem.getBoundingClientRect();
    let menuRect = new Rect(new Vector2(menuDOMRect.x, menuDOMRect.y), new Vector2(menuDOMRect.width, menuDOMRect.height));
    let inBounds = menuRect.Contains(mousePosition);
    //console.log("MENURECT: "+menuRect.ToString()+", MOUSEPOS: "+ mousePosition.ToString()+", INBOUNDS: "+inBounds);
    if(!inBounds)
    {
        event.preventDefault();
        HideContextMenu();
    }
}