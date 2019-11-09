//The bracket object, used primarily in labeling strategies.

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
        this.label.cellOverlays=[];
        this.addDelOverlay();
        
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
        this.wf.legendUpdate('strategy',icon,this.icon,iconsList['strategy']);
        this.icon = icon;
        this.graph.setCellStyles("image",iconpath+icon+".png",[this.iconVertex]);
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
    
    
    //Add the overlay to delete the node
    addDelOverlay(){
        var n = this;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), 'Delete this bracket');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-n.label.h()/2;
            bounds.x = pt.x-bounds.width+n.label.w()/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            n.deleteSelf();
            n.wf.makeUndo("Delete Bracket",n);
        });
        this.label.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
    
    deleteSelf(){
        this.wf.legendUpdate('strategy',null,this.icon);
        this.topNode.removeBracket(this);
        this.bottomNode.removeBracket(this);
        this.wf.brackets.splice(this.wf.brackets.indexOf(this),1);
        this.graph.removeCells([this.vertex]);
    }
    
    cellRemoved(node){
        var isTop=false;
        var isBottom=false;
        if(this.topNode==node)isTop=true;
        if(this.bottomNode==node)isBottom=true;
        if(isTop&&isBottom)this.deleteSelf();
        else{
            var nextNode = this.wf.findNextNodeOfSameType(node,isTop-isBottom,false);
            this.changeNode(nextNode,isTop);
        }
    }
    
    populateMenu(menu){
        var graph = this.graph;
        var bracket=this;
        menu.addItem('Delete Bracket','resources/images/delrect24.png',function(){
            graph.clearSelection();
            bracket.deleteSelf();
            bracket.wf.makeUndo("Delete Bracket",bracket);
        });
    }
    
    
}