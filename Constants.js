//A few logistical functions to more quickly grab the dimensions and sides of a cell
mxCell.prototype.x = function(){return this.getGeometry().x;}
mxCell.prototype.y = function(){return this.getGeometry().y;}
mxCell.prototype.w = function(){return this.getGeometry().width;}
mxCell.prototype.h = function(){return this.getGeometry().height;}
mxCell.prototype.r = function(){return this.x()+this.w();}
mxCell.prototype.b = function(){return this.y()+this.h();}
//casts to int, using a default base 10
int = function(x){return parseInt(x,10);}
//creates an xml line for the given name and value
makeXML = function(value,name){
    if(value==null)value="undefined";
    return "<"+name+">"+value+"</"+name+">\n";
}
getXMLVal = function(xml,name){
    var isARRAY = (name.indexOf("ARRAY")>=0);
    var tags = xml.getElementsByTagName(name)[0];
    if(tags.childNodes.length==0)if(isARRAY)return [];else return null;
    var value = tags.childNodes[0].nodeValue;
    if(value == "undefined"){return null;}
    else if(isARRAY)return value.split(",");
    else return value;
}

//constants declaration
const cellSpacing = 40;
const colIconSize=120;
const defaultCellWidth=300;
const minCellHeight=80;
const wfStartX=cellSpacing;
const wfStartY=cellSpacing;
const defaultIconPadding=4;
const defaultIconWidth=48;
var weekWidth;

//Styles
const defaultWeekStyle = 'editable=0;fillColor=#e6e6e6;movable=0;resizable=0;strokeColor=none;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=14;fontStyle=1;fontColor=black;';
const defaultWFAreaStyle = 'editable=0;fillColor=#FFFFFF;movable=0;resizable=0;strokeColor=black;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=14;fontStyle=1;fontColor=black;';
const defaultHeadStyle = "shape=label;fillColor=none;strokeColor=none;imageVerticalAlign=top;verticalAlign=bottom;imageAlign=center;resizable=0;imageWidth="+(colIconSize-40)+";imageHeight="+(colIconSize-40)+";fontSize=20;editable=0;fontStyle=5;fontColor=black;";
const textStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=none;fontSize=12;fontColor=black;fillColor=none;";
const defaultWFNodeStyle="whiteSpace=wrap;absoluteArcSize=1;arcSize=15;rounded=1;strokeColor=black;strokeWidth=2;editable=0;fontColor=black;";
const defaultIconStyle="shape=image;constituent=1;resizable=0;editable=0;strokeColor=none;fillColor=none;";

//Icons
const strategyIconsArray=[['Jigsaw','jigsaw'],['Peer Instruction','peer-instruction'],['Case Studies','case-studies'],['Gallery Walk','gallery-walk'],['Reflective Writing','reflective-writing'],['Two-Stage Exam','two-stage-exam'],['Toolkit','toolkit'],['One Minute Paper','one-minute-paper'],['Distributed Problem Solving','distributed-problem-solving'],['Peer Assessment','peer-assessment']];
const taskIconsArray=[['Problem Solving','problem'],['Research','research'],['Reading','reading'],['Writing','write'],['Discussion','discuss'],['Present','present'],['Peer Review','peerreview'],['Instructor Evaluation','evaluate'],['Quiz','quiz'],['Play','play'],['Create','create'],['Iterate','practice']]
const contextIconsArray=[['Individual Work','solo'],['Work in Groups','group'],['Whole Class','class']]
const iconpath='resources/data/';