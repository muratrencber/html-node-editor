//AVAILABLE PANEL NAMES:
//name-field
//type-changer
//text-field
//variable-changer
//node-text-changer
//tags

var panels = ["name-field", "type-changer", "text-field", "variable-changer", "node-text-changer", "tags"];
var nodeTags = ["dialogue-node", "panel-node"]
var nonRemoveablePanels = ["name-field", "type-changer"];
const forbiddenTypeNames = ["CustomNode", ""];

const nodeTypesDict = 
{
    "DefaultNode":
    {
        "panels":["name-field", "type-changer", "text-field"],
        "tag": "",
        "default-connection-node-type": "",
        "default-child-node-type": ""
    },
    "PanelNode":
    {
        "panels":["name-field", "type-changer", "text-field"],
        "tag": "panel-node",
        "default-connection-node-type": "DialogueNode",
        "default-child-node-type": "DialogueNode"
    },
    "DialgoueNode":
    {
        "panels":["name-field", "type-changer", "tags", "text-field"],
        "tag": "dialogue-node",
        "default-connection-node-type": "PanelNode",
        "default-child-node-type": "PanelNode"
    },
    "DialgoueNodeWithEffects":
    {
        "panels":["name-field", "type-changer", "tags", "text-field", "variable-changer"],
        "tag": "dialogue-node",
        "default-connection-node-type": "PanelNode",
        "default-child-node-type": "PanelNode"
    }
}

const nodeTypesText =
`DefaultNode
{
    name-field;
    type-changer;
    text-field;
}, DialogueNode
{
    name-field;
    type-changer;
    text-field;
}, DialgoueNodeWithEffects
{
    name-field;
    type-changer;
    text-field;
    variable-changer;
}`;

const multipleEditNotSupportedPanels = ["name-field"];