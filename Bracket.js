//Creates a bracket object. The object should float to the right (or left) of any object it brackets. It should be composed of a vertex (which shows an icon or text), and an invisible vertex that vertically spans it, upon which is drawn a set of lines that will create the bracket itself. The span vertex will have a resize function that snaps to vertices much like the vertex movement functions, and will itself be immovable.
//The class stores the top and bottom nodes that the span is snapped to, and these will be exported to xml on save. Nodes will link to the Bracket as well, however that need not be exported to the xml as we will go back through and add the brackets after all the nodes


class Bracket {
    
    constructor(graph, wf){
        this.graph=graph;
        this.wf=wf;
        this.topNode;
        this.bottomNode;
        this.vertex;
        this.label;
        this.icon;
        this.iconVertex;
        this.id = this.wf.project.genID();
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.id,"id");
        xml+=makeXML(this.icon,"icon");
        xml+=makeXML(this.topNode.id,"topnode");
        xml+=makeXML(this.bottomNode.id,"bottomnode");
        return makeXML(xml,"bracket");
    }
    
    createVertex(){
        this.vertex = this.graph.insertVertex(this.graph.getDefaultParent(),null,'',0,0,bracketWidth,10,defaultBracketStyle);
        this.vertex.isBracket=true;
        this.vertex.bracket = this;
        this.graph.insertVertex(this.vertex,null,'',0,0,bracketWidth,3,defaultBracketBarStyle);
        this.graph.insertVertex(this.vertex,null,'',bracketWidth-3,0,3,10,defaultBracketBarStyle);
        this.graph.insertVertex(this.vertex,null,'',0,7,bracketWidth,3,defaultBracketBarStyle);
        this.label = this.graph.insertVertex(this.vertex,null,'',bracketWidth-bracketTriangleWidth-3,5-bracketTabHeight/2,bracketTabWidth+bracketTriangleWidth,bracketTabHeight,invisibleStyle);
        var triangle = this.graph.insertVertex(this.label,null,'',0,0,bracketTriangleWidth,bracketTabHeight,bracketTriangleStyle);
        var square = this.graph.insertVertex(this.label,null,'',bracketTriangleWidth,0,bracketTabWidth,bracketTabHeight,bracketSquareStyle);
        var circle = this.graph.insertVertex(square,null,'',5,5,bracketTabWidth-10,bracketTabHeight-10,bracketCircleStyle)
        this.iconVertex = this.graph.insertVertex(circle,null,'',0,0,circle.w(),circle.h(),bracketIconStyle);
        
        
    }
    
    fromXML(xml){
        this.createVertex();
        this.id = getXMLVal(xml,"id");
        this.setIcon(getXMLVal(xml,"icon"));
        this.changeNode(this.wf.findNodeById(getXMLVal(xml,"topnode")),true);
        this.changeNode(this.wf.findNodeById(getXMLVal(xml,"bottomnode")),false);
        this.updateHorizontal();
    }
    
    setIcon(icon){
        this.icon = icon;
        this.graph.setCellStyles("image",iconpath+icon+"48.png",[this.iconVertex]);
    }
    
    
    redraw(dh){
        var bar = this.vertex.getChildAt(1);
        bar.resize(this.graph,0,dh);
        var bot = this.vertex.getChildAt(2);
        this.graph.moveCells([bot],0,dh);
        this.graph.moveCells([this.label],0,dh/2);
    }
    
    getNode(isTop){
        if(isTop)return this.topNode;
        return this.bottomNode;
    }
    
    changeNode(newNode,isTop){
        if(isTop){
            if(this.topNode!=null)this.topNode.removeBracket(this);
            this.topNode=newNode;
            this.topNode.addBracket(this);
        }
        else{
            if(this.bottomNode!=null)this.bottomNode.removeBracket(this);
            this.bottomNode = newNode;
            this.bottomNode.addBracket(this);
        }
        if(this.topNode!=null&&this.bottomNode!=null)this.updateVertical();
    }
    
    updateVertical(){
        if(this.topNode.vertex.y()>this.bottomNode.vertex.y()){var temp = this.topNode;this.topNode=this.bottomNode;this.bottomNode=temp;}
        var dy = this.topNode.vertex.y() - this.vertex.y();
        if(dy!=0)this.graph.moveCells([this.vertex],0,dy);
        var dh = this.bottomNode.vertex.b() - this.vertex.b();
        if(dh!=0)this.vertex.resize(this.graph,0,dh);
        
        this.redraw(dh);
    }
    updateHorizontal(){
        var dx = this.wf.weeks[0].box.r()+10-this.vertex.x();
        this.graph.moveCells([this.vertex],dx,0);
    }
    
    
    
}