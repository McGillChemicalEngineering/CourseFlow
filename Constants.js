//Definition of global variables and functions for ease of use.

/*    Copyright (C) 2019  SALTISE

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>*/

//A few logistical functions to more quickly grab the dimensions and sides of a cell
mxCell.prototype.x = function(){return this.getGeometry().x;}
mxCell.prototype.y = function(){return this.getGeometry().y;}
mxCell.prototype.w = function(){return this.getGeometry().width;}
mxCell.prototype.h = function(){return this.getGeometry().height;}
mxCell.prototype.r = function(){return this.x()+this.w();}
mxCell.prototype.b = function(){return this.y()+this.h();}
mxCell.prototype.resize = function(graph,dx,dy){
    graph.resizeCells([this],[new mxRectangle(this.x(),this.y(),this.w()+dx,this.h()+dy)]);
}
//Makes a function activate the start load first, then run asynchronously. Useful for things that take a lot of time.
function makeLoad(toLoad){
    startLoad();
    setTimeout(function(){toLoad();endLoad();},20);
}
function startLoad(){
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '* {cursor:wait !important;}';
    style.id = "waitingStyle";
    document.getElementsByTagName("head")[0].appendChild(style);

}
function endLoad(){
    var style = document.getElementById("waitingStyle");
    if(style!=null)style.parentElement.removeChild(style);
}

//A function to map the weeks' vertices into an array
function mapWeekVertices(value,index,array){
    return value.vertex;
}
//casts to int, using a default base 10
int = function(x){return parseInt(x,10);}
//creates an xml line for the given name and value
makeXML = function(value,name){
    if(value==null)value="undefined"
    if(name.indexOf("HTML")>=0)value = cleanHTML(value);
    return "<"+name+">"+value+"</"+name+">\n";
}
getXMLVal = function(xml,name){
    var isARRAY = (name.indexOf("ARRAY")>=0);
    var isHTML = (name.indexOf("HTML")>=0);
    var tags = xml.getElementsByTagName(name)[0];
    if(tags==null)return null;
    if(tags.childNodes.length==0)if(isARRAY)return [];else return null;
    var value = tags.childNodes[0].nodeValue;
    if(isHTML)value = makeHTML(tags.innerHTML);
    if(value == "undefined"){return null;}
    else if(isARRAY){
        value = value.split(",");
        if(value.length==1&&value[0]=="")return [];
        else return value;
    }
    else return value;
}
cleanHTML = function(text){
    text = text.replace(/&/g,"&amp;");
    text = text.replace(/'/g,"&apos;");
    text = text.replace(/"/g,"&quot;");
    text = text.replace(/</g,"&lt;");
    text = text.replace(/>/g,"&gt;");
    return text;
}
makeHTML = function(text){
    text = text.replace(/&apos;/g,"\'");
    text = text.replace(/&quot;/g,"\"");
    text = text.replace(/&lt;/g,"<");
    text = text.replace(/&gt;/g,">");
    text = text.replace(/&amp;/g,"&");
    return text;
}

//constants declaration
const cellSpacing = 20;
const emptyWeekSize=60;
const colIconSize=100;
const defaultCellWidth=280;
const minCellHeight=50;
const cellDropdownHeight=16;
const cellDropdownPadding=0;
const wfStartX=cellSpacing;
const wfStartY=cellSpacing;
const defaultIconPadding=12;
const defaultTextPadding=0;
const defaultIconWidth=36;
const bracketWidth=10;
const bracketTabWidth=80;
const bracketTabHeight=80;
const bracketTriangleWidth=30;
const defaultCommentSize=36;
const exitPadding=cellSpacing;
const tagBoxPadding = 5;
const tagHeight = 20;
var weekWidth;

//Colours
const SALTISEGREEN = '#369934';
const SALTISEBLUE = '#1976bc';
const SALTISERED = '#cc3c23';
const SALTISEORANGE = '#cc922d';
const SALTISELIGHTBLUE = '#1293b3';
// default values:
//const SALTISEGREEN = '#46c443';
//const SALTISEBLUE = '#1976bc';
//const SALTISERED = '#ed4528';
//const SALTISEORANGE = '#eba833';
//const SALTISELIGHTBLUE = '#54c0db';

//Styles
const defaultWeekStyle = 'fillColor=#e6e6e6;movable=0;resizable=0;strokeColor=none;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=13;fontStyle=1;fontColor=black;';
const defaultWFAreaStyle = 'editable=0;fillColor=#FFFFFF;movable=0;resizable=0;strokeColor=black;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=14;fontStyle=1;fontColor=black;';
const defaultHeadStyle = "shape=label;fillColor=none;strokeColor=none;imageVerticalAlign=top;verticalAlign=bottom;imageAlign=center;resizable=0;imageWidth="+(colIconSize-40)+";imageHeight="+(colIconSize-40)+";fontSize=16;editable=0;fontStyle=5;fontColor=black;";
const defaultNameStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=none;fontSize=14;fontColor=white;fillColor=none;overflow=hidden;editable=0;fontStyle=1;fontFamily=arial;";
const defaultWFNodeStyle="whiteSpace=wrap;strokeColor=black;strokeWidth=2;editable=0;fontColor=black;resizable=0;";
const defaultIconStyle="shape=image;constituent=1;resizable=0;editable=0;strokeColor=none;fillColor=none;";
const defaultTextStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=black;strokeWidth=2;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=left;verticalAlign=top;";
const defaultTitleStyle="whiteSpace=nowrap;resizable=0;movable=0;fontSize=22;fontStyle=1;fontColor=black;fillColor=none;strokeColor=none;";
const defaultTagBoxStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=none;fontSize=12;fontColor=black;fillColor=none;overflow=hidden;editable=0;align=left;verticalAlign=top;";
const defaultTagStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=black;strokeWidth=3;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=left;verticalAlign=top;rounded=1;arcSize=50;spacingLeft=20;";
const defaultDropDownStyle="constituent=1;resizable=0;strokeColor=black;strokeWidth=2;fontSize=12;fontColor=black;fillColor=#FFFFFF;shape=label;image=resources/images/droptriangle.png;imageWidth=12;imageHeight=4;imageAlign=center;";
const defaultBracketStyle="editable=0;fillColor=none;strokeColor=none;";
const defaultBracketBarStyle="constituent=1;editable=0;fillColor=black;strokeColor=black;resizable=0;";
const invisibleStyle = "editable=0;movable=0;resizable=0;fillColor=none;strokeColor=none;constituent=1;"
const bracketTriangleStyle = "shape=triangle;editable=0;movable=0;resizable=0;fillColor=#ed4528;strokeColor=none;rotation=180;constituent=1;";
const bracketSquareStyle = "shape=label;editable=0;movable=0;resizable=0;imageAlign=right;fillColor=#ed4528;strokeColor=#ed4528;constituent=1;";
const bracketCircleStyle = "shape=ellipse;fillColor=white;strokeColor=#ed4528;editable=0;movable=0;resizable=0;constituent=1;";
const bracketIconStyle = "shape=label;fillColor=none;strokeColor=none;editable=0;movable=0;resizable=0;imageAlign=center;imageWidth=48;imageHeight=48;constituent=1;"
const defaultEdgeStyle = "editable=0;movable=0;resizable=0;bendable=0;edgeStyle=orthogonalEdgeStyle;strokeColor=black;rounded=1;";
const defaultCommentStyle = "shape=label;imageAlign=center;padding=4;editable=0;resizable=0;whiteSpace=wrap;fillColor=#ffff88;strokeColor=black;image=resources/images/comment32.png;";

//Icons
const strategyIconsArray=[['Jigsaw','jigsaw'],['Peer Instruction','peer-instruction'],['Case Studies','case-studies'],['Gallery Walk','gallery-walk'],['Reflective Writing','reflective-writing'],['Two-Stage Exam','two-stage-exam'],['Toolkit','toolkit'],['One Minute Paper','one-minute-paper'],['Distributed Problem Solving','distributed-problem-solving'],['Peer Assessment','peer-assessment']];
const taskIconsArray=[['Gather Information','research'],['Discuss','discuss'],['Solve','problem'],['Analyze','analyze'],['Assess/Review Peers','peerreview'],['Evaluate Peers','evaluate'],['Debate','debate'],['Game/Roleplay','play'],['Create/Design','create'],['Revise/Improve','practice'],['Read','reading'],['Write','write'],['Present','present'],['Experiment/Inquiry','experiment'],['Quiz/Test','quiz'],['Other','other']]
const contextIconsArray=[['Individual Work','solo'],['Work in Groups','group'],['Whole Class','class']]
const iconpath='resources/data/';


/*This function would usually be called inside the graph initialization function of Project. However, for reasons I cannot seem to understand, it simply does not work inside the scope of a class function. I therefore define the function out here and call it.*/
function initializeConnectionPointForGraph(graph){
    // Returns the actual point for a port by redirecting the constraint to the port
        graph.getConnectionPoint = function(vertex, constraint)
        {
            if (constraint.id != null && vertex != null && vertex.shape != null)
            {
                var port = vertex.shape.getPorts()[constraint.id];

                if (port != null)
                {
                    constraint = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
                }
            }

            return mxGraph.prototype.getConnectionPoint.apply(this, arguments);
        }
        
        
}

//Overwrite Quill's default link sanitization to add http
var Link = Quill.import('formats/link');
var builtInFunc = Link.sanitize;
Link.sanitize = function customSanitizeLinkInput(linkValueInput) {
    var val = linkValueInput;

    // do nothing, since this implies user's already using a custom protocol
    if (/^\w+:/.test(val));
    else if (!/^https?:/.test(val))
        val = "http://" + val;

    return builtInFunc.call(this, val); // retain the built-in logic
};

// These should be defined only once, otherwise they end up iterating through themselves multiple times.
var insertEdgePrototype = mxConnectionHandler.prototype.insertEdge;
var drawPreviewPrototype = mxVertexHandler.prototype.drawPreview;
