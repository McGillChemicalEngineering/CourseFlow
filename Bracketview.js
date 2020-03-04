//The visualization of a bracket to be instantiated in the Workflowview.

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

class Bracketview{

    constructor(graph,bracket){
        this.graph=graph;
        this.bracket = bracket;
        this.vertex;
        this.iconVertex;
        
    }
    
    createVertex(){
        this.vertex = this.graph.insertVertex(this.graph.getDefaultParent(),null,'',0,0,bracketWidth,10,defaultBracketStyle);
        this.vertex.isBracket=true;
        this.vertex.bracket = this.bracket;
        this.graph.insertVertex(this.vertex,null,'',0,0,bracketWidth,3,defaultBracketBarStyle);
        this.graph.insertVertex(this.vertex,null,'',bracketWidth-3,0,3,10,defaultBracketBarStyle);
        this.graph.insertVertex(this.vertex,null,'',0,7,bracketWidth,3,defaultBracketBarStyle);
        this.label = this.graph.insertVertex(this.vertex,null,'',bracketWidth-bracketTriangleWidth-3,5-bracketTabHeight/2,bracketTabWidth+bracketTriangleWidth,bracketTabHeight,invisibleStyle);
        var triangle = this.graph.insertVertex(this.label,null,'',0,0,bracketTriangleWidth,bracketTabHeight,bracketTriangleStyle);
        var square = this.graph.insertVertex(this.label,null,'',bracketTriangleWidth,0,bracketTabWidth,bracketTabHeight,bracketSquareStyle);
        var circle = this.graph.insertVertex(square,null,'',5,5,bracketTabWidth-10,bracketTabHeight-10,bracketCircleStyle)
        var style = bracketIconStyle;
        if(this.bracket.icon){
            style+="image="+iconpath+this.bracket.icon+".png;";
            this.bracket.wf.view.legendUpdate('strategy',this.bracket.icon,null);
        }
        this.iconVertex = this.graph.insertVertex(circle,null,'',0,0,circle.w(),circle.h(),style);
        this.label.cellOverlays=[];
        this.addDelOverlay();
        
    }
    
    iconChanged(){
        this.graph.setCellStyles("image",iconpath+this.bracket.icon+".png",[this.iconVertex]);
    }
    
    
    redraw(dh){
        var bar = this.vertex.getChildAt(1);
        bar.resize(this.graph,0,dh);
        var bot = this.vertex.getChildAt(2);
        this.graph.moveCells([bot],0,dh);
        this.graph.moveCells([this.label],0,dh/2);
    }
    
    nodeChanged(){
        if(this.bracket.topNode!=null&&this.bracket.bottomNode!=null)this.updateVertical();
    }
    
    updateVertical(){
        if(this.bracket.topNode.view.vertex.y()>this.bracket.bottomNode.view.vertex.y()){var temp = this.topNode;this.topNode=this.bottomNode;this.bottomNode=temp;}
        var dy = this.bracket.topNode.view.vertex.y() - this.vertex.y();
        if(dy!=0)this.graph.moveCells([this.vertex],0,dy);
        var dh = this.bracket.bottomNode.view.vertex.b() - this.vertex.b();
        if(dh!=0)this.vertex.resize(this.graph,0,dh);
        
        this.redraw(dh);
    }
    
    updateHorizontal(){
        var dx = this.bracket.wf.weeks[0].view.vertex.r()+10-this.vertex.x();
        this.graph.moveCells([this.vertex],dx,0);
    }
    
    
    //Add the overlay to delete the node
    addDelOverlay(){
        var n = this.bracket;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), LANGUAGE_TEXT.bracket.delete[USER_LANGUAGE]);
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-n.view.label.h()/2;
            bounds.x = pt.x-bounds.width+n.view.label.w()/2;
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
    
    deleted(){
        this.graph.removeCells([this.vertex]);
    }
    
    
    populateMenu(menu){
        this.bracket.populateMenu(menu);
    }
    
    


}