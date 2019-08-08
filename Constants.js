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
//A function to map the weeks' vertices into an array
function mapWeekVertices(value,index,array){
    return value.vertex;
}
//casts to int, using a default base 10
int = function(x){return parseInt(x,10);}
//creates an xml line for the given name and value
makeXML = function(value,name){
    if(value==null)value="undefined";
    return "<"+name+">"+value+"</"+name+">\n";
}
getXMLVal = function(xml,name){
    var isARRAY = (name.indexOf("ARRAY")>=0);
    var isHTML = (name.indexOf("HTML")>=0);
    var tags = xml.getElementsByTagName(name)[0];
    if(tags==null)return null;
    if(tags.childNodes.length==0)if(isARRAY)return [];else return null;
    var value = tags.childNodes[0].nodeValue;
    if(isHTML)value = tags.innerHTML;
    if(value == "undefined"){return null;}
    else if(isARRAY)return value.split(",");
    else return value;
}

//constants declaration
const cellSpacing = 40;
const colIconSize=100;
const defaultCellWidth=280;
const minCellHeight=50;
const cellDropdownHeight=10;
const cellDropdownPadding=2;
const wfStartX=cellSpacing;
const wfStartY=cellSpacing;
const defaultIconPadding=4;
const defaultTextPadding=4;
const defaultIconWidth=36;
const bracketWidth=10;
const bracketTabWidth=80;
const bracketTabHeight=80;
const bracketTriangleWidth=30;
const defaultCommentSize=36;
const exitPadding=cellSpacing;
var weekWidth;

//Styles
const defaultWeekStyle = 'editable=0;fillColor=#e6e6e6;movable=0;resizable=0;strokeColor=none;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=14;fontStyle=1;fontColor=black;';
const defaultWFAreaStyle = 'editable=0;fillColor=#FFFFFF;movable=0;resizable=0;strokeColor=black;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=14;fontStyle=1;fontColor=black;';
const defaultHeadStyle = "shape=label;fillColor=none;strokeColor=none;imageVerticalAlign=top;verticalAlign=bottom;imageAlign=center;resizable=0;imageWidth="+(colIconSize-40)+";imageHeight="+(colIconSize-40)+";fontSize=16;editable=0;fontStyle=5;fontColor=black;";
const defaultNameStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=none;fontSize=12;fontColor=black;fillColor=none;overflow=hidden;editable=0;";
const defaultWFNodeStyle="whiteSpace=wrap;strokeColor=black;strokeWidth=2;editable=0;fontColor=black;resizable=0;";
const defaultIconStyle="shape=image;constituent=1;resizable=0;editable=0;strokeColor=none;fillColor=none;";
const defaultTextStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=black;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=left;verticalAlign=top;";
const defaultTitleStyle="whiteSpace=wrap;resizable=0;movable=0;fontSize=22;fontStyle=1;fontColor=black;fillColor=none;strokeColor=none;";
const defaultDropDownStyle="constituent=1;resizable=0;strokeColor=none;fontSize=12;fontColor=black;fillColor=none;shape=label;image=resources/images/droptriangle.png;imageWidth=12;imageHeight=4;imageAlign=center;";
const defaultBracketStyle="editable=0;fillColor=none;strokeColor=none;";
const defaultBracketBarStyle="constituent=1;editable=0;fillColor=black;strokeColor=black;resizable=0;";
const invisibleStyle = "editable=0;movable=0;resizable=0;fillColor=none;strokeColor=none;constituent=1;"
const bracketTriangleStyle = "shape=triangle;editable=0;movable=0;resizable=0;fillColor=#ed4528;strokeColor=none;rotation=180;constituent=1;";
const bracketSquareStyle = "shape=label;editable=0;movable=0;resizable=0;imageAlign=right;fillColor=#ed4528;strokeColor=#ed4528;constituent=1;";
const bracketCircleStyle = "shape=ellipse;fillColor=white;strokeColor=#ed4528;editable=0;movable=0;resizable=0;constituent=1;";
const bracketIconStyle = "shape=label;fillColor=none;strokeColor=none;editable=0;movable=0;resizable=0;imageAlign=center;imageWidth=48;imageHeight=48;constituent=1;"
const defaultEdgeStyle = "editable=0;edgeStyle=orthogonalEdgeStyle;strokeColor=black;rounded=1;";
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