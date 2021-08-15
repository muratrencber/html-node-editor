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