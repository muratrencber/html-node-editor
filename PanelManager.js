const minSize = 5; //%

var resizerWidth = 3; //px
var leftSize = 20; //%
var rightSize = 20; //%

window.addEventListener("resize", ApplySizes);
window.addEventListener("load", ApplySizes);

function ApplySizes()
{
	let leftResizer = document.getElementById("left-resizer");
	let leftPanel = document.getElementById("left-panel");
	let leftPixelSize = ((document.body.clientWidth * leftSize / 100) - (resizerWidth));
	leftResizer.style.left = leftPixelSize + "px";
	leftResizer.style.width = (resizerWidth*2)+"px";
	leftPanel.style.width=leftPixelSize+"px";
	leftPanel.style.height=window.innerHeight+"px";
	
	let rightResizer = document.getElementById("right-resizer");
	let rightPanel = document.getElementById("right-panel");
	let rightPixelSize= ((document.body.clientWidth * rightSize / 100) - (resizerWidth));
	rightResizer.style.right = rightPixelSize + "px";
	rightResizer.style.width = (resizerWidth*2)+"px";
	rightPanel.style.width=rightPixelSize+"px";
	rightPanel.style.height=window.innerHeight+"px";
}

function IsInPanels(pos)
{
	let leftPixelSize = ((document.body.clientWidth * leftSize / 100));
	let rightPixelSize = ((document.body.clientWidth * rightSize / 100));
	if(pos.x < leftPixelSize || pos.x > document.body.clientWidth - rightPixelSize)
		return true;
	let contextMenuItem = document.getElementById("context-menu");
	let cmiRect = new Rect(null, null);
	cmiRect.SetFromRect(contextMenuItem.getBoundingClientRect());
	if(contextMenuItem.className != "contextMenu invisible" && cmiRect.Contains(pos))
		return true;
	return false;
}

function StartLeftResize()
{
	let target = document.getElementById("left-resizer");
	document.addEventListener("mousemove", ResizeLeft);
	document.onmouseup = function() {
		document.removeEventListener("mousemove", ResizeLeft);
		document.onmouseup = null;
	};
}
function StartRightResize()
{
	let target = document.getElementById("right-resizer");
	document.addEventListener("mousemove", ResizeRight);
	document.onmouseup = function() {
		document.removeEventListener("mousemove", ResizeRight);
		document.onmouseup = null;
	};
}
function ResizeLeft(event)
{
	event.preventDefault();
	let mouseX = event.pageX;
	let mouseRatio = mouseX* 100 / document.body.clientWidth;
	leftSize = clamp(mouseRatio, minSize, 100-2*minSize);
	rightSize = Math.min(rightSize, 100-leftSize-minSize);
	ApplySizes();
}
function ResizeRight(event)
{
	event.preventDefault();
	let mouseX = event.pageX;
	let mouseRatio = 100-(mouseX* 100 / document.body.clientWidth);
	rightSize = clamp(mouseRatio, minSize, 100-2*minSize);
	leftSize = Math.min(leftSize, 100-rightSize-minSize);
	ApplySizes();
}