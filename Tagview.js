//The visualization of a tag to be instantiated in the Workflowview.

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

class Tagview{
    constructor(graph,tag,wf){
        this.graph=graph;
        this.nodes=[];
        this.vertices=[];
        this.tagPreviews=[];
        this.drops=[];
        this.tag=tag;
        this.isComplete=false;
        this.wf = wf;
        this.createViews();
    }
    
    nameUpdated(){
        for(var i=0;i<this.drops.length;i++){
            this.drops[i].updateButton();
        }
        for(var i=0;i<this.vertices.length;i++){
            this.graph.getModel().setValue(this.vertices[i],this.tag.name);
        }
    }
    
    createViews(){
        for(var i=0;i<this.tag.children.length;i++){
            var tag = this.tag.children[i];
            if(tag.view==null||!(tag.view instanceof Tagview))tag.view = new this.constructor(this.graph,tag,this.wf);
        }
    }
    
    clearViews(){
        for(var i=0;i<this.tag.children.length;i++){
            this.tag.children[i].view.clearViews();
        }
        this.tag.view = null;
    }
    
    addVertex(node){
        var tag = this.tag;
        var style = defaultTagStyle;
        style+="strokeColor="+this.graph.getCellStyle(node.view.vertex)['fillColor'];
        var tagLabel = this.graph.insertVertex(node.view.tagBox,null,tag.name,tagBoxPadding,tagBoxPadding,node.view.tagBox.w()-2*tagBoxPadding,tagHeight,style);
        var overlay = new mxCellOverlay(new mxImage('resources/images/del48.png', 16, 16), 'Remove this tag');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-bounds.height/2;
            bounds.x = pt.x-tagLabel.w()/2+2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            node.removeTag(tag,true);
            node.wf.makeUndo("Remove Tag",node);
        });
        tagLabel.cellOverlays = [overlay];
        var tagPreview = this.graph.insertVertex(node.view.vertex,null,'',tagBoxPadding+node.view.vertex.w(),tagHeight/2-2+(tagBoxPadding+tagHeight)*node.view.tagPreviews.length,4,4,style);
        graph.orderCells(true,[tagPreview]);
        this.vertices.push(tagLabel);
        this.tagPreviews.push(tagPreview);
        
        return {label:tagLabel,preview:tagPreview};
    }
    
    addDrop(button){
        var tag = this;
        button.b.addEventListener("mouseover",function(evt){tag.highlight(true)});
        button.b.addEventListener("mouseleave",function(evt){if(!button.b.isToggled)tag.highlight(false)});
        button.b.hasListener=true;
        button.b.isToggled=false;
        button.b.onclick= function(){button.b.isToggled=(!button.b.isToggled);};
        this.drops.push(button);
    }
    
    highlight(on){
        for(var i=0;i<this.nodes.length;i++){
            this.nodes[i].view.highlight(on);
        }
        for(i=0;i<this.drops.length;i++){
            if(on&&this.nodes.length>0)this.drops[i].bwrap.classList.add("highlighted");
            else this.drops[i].bwrap.classList.remove("highlighted");
        }
    }
    
    
    makeEditButton(container,node,editbar){
        var tag = this;
        var button = new EditBarTagButton(this.tag,container);
        button.makeEditable(false,false,true,node);
        button.b.onclick=null;
        return button.childdiv;
    }
    
    
    
    addNode(node){
        this.nodes.push(node);
        this.updateDrops();
        return this.addVertex(node);
        
    }
    
    removeNode(node){
        var index = this.nodes.indexOf(node);
        this.nodes.splice(index,1);
        this.vertices.splice(index,1);
        this.tagPreviews.splice(index,1);
        this.updateDrops();
    }
    
    
    updateDrops(){
        var colours = [];
        for(var i=0;i<this.nodes.length;i++){
            var colour = this.nodes[i].view.graph.getCellStyle(this.nodes[i].view.vertex)["fillColor"];
            if(colours.indexOf(colour)<0)colours.push(colour);
        }
        var colCount=99;
        if(this.nodes[0]!=null)colCount=this.nodes[0].wf.columns.length;
        this.isComplete=(this.tag.children.length>0);
        for(i=0;i<this.tag.children.length;i++){
            if(!this.tag.children[i].view.isComplete)this.isComplete=false;
        }
        if(colCount<=colours.length)this.isComplete=true;
        
        for(i=0;i<this.drops.length;i++){
            this.drops[i].updateNodeIndicators(colours,this.isComplete);
        }
        if(this.tag.parentTag&&this.tag.parentTag.view)this.tag.parentTag.view.updateDrops();
        
        
    }
    
    
    
}