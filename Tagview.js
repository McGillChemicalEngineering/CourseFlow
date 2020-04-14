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
        this.drops=[];
        this.tag=tag;
        this.isComplete=false;
        this.wf = wf;
        this.highlighted=false;
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
        this.vertices.push(tagLabel);
        
        return tagLabel;
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
    
    updateNodeHighlight(on){
        if(on)this.highlighted=true;
        else{
            this.highlighted=false;
            for(var i=0;i<this.tag.children.length;i++){
                if(this.tag.children[i].view.highlighted){this.highlighted=true;break;}
            }
        }
        on = this.highlighted;
        for(var i=0;i<this.nodes.length;i++){
            this.nodes[i].view.highlight(on);
        }
        if(this.tag.parentTag&&this.tag.parentTag.view)this.tag.parentTag.view.updateNodeHighlight(on);
    }
    
    highlight(on){
        for(var i=0;i<this.drops.length;i++){
            if(on)this.drops[i].bwrap.classList.add("highlighted");
            else this.drops[i].bwrap.classList.remove("highlighted");
        }
        this.updateNodeHighlight(on);
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
        this.updateDescendantDrops();
        this.updateAncestorDrops();
        return this.addVertex(node);
        
    }
    
    removeNode(node){
        var index = this.nodes.indexOf(node);
        this.nodes.splice(index,1);
        this.vertices.splice(index,1);
        this.updateDrops();
        this.updateDescendantDrops();
        this.updateAncestorDrops();
    }
    
    updateDescendantDrops(){
        for(var i=0;i<this.tag.children.length;i++){
            var tag = this.tag.children[i];
            tag.view.updateDrops();
            tag.view.updateDescendantDrops();
        }
    }
    
    updateAncestorDrops(){
        if(this.tag.parentTag&&this.tag.parentTag.view){
            this.tag.parentTag.view.updateDrops();
            this.tag.parentTag.view.updateAncestorDrops();
        }
    }
    
    validateSelf(col){
        var completeness = this.validateParents(this.tag,col);
        if(completeness == 0)completeness = this.validateTag(this.tag,col);
        if(completeness > 0.990)return true;
        else return false;
    }
    
    validateTag(tag,col){
        var nodes = tag.view.nodes;
        for(var i=0;i<nodes.length;i++){
            if(nodes[i].column==col)return 1.0;
        }
        var completeness = 0.0;
        for(var i=0;i<tag.children.length;i++){
            completeness+=this.validateTag(tag.children[i],col)/tag.children.length;
        }
        return completeness;
    }
    
    validateParents(tag,col){
        if(tag.parentTag&&tag.parentTag.view){
            var tv = tag.parentTag.view;
            for(var i=0;i<tv.nodes.length;i++){
                if(tv.nodes[i].column==col)return 1.0;
            }
            return this.validateParents(tag.parentTag,col);
        }
        return 0.0;
    }
    
    updateDrops(){
        var colours = [];
        var allColours=[];
        for(var i=0;i<this.wf.columns.length;i++){
            if(allColours.indexOf(this.wf.columns[i].colour)<0)allColours.push(this.wf.columns[i].colour);
            if(colours.indexOf(this.wf.columns[i].colour<0)&&this.validateSelf(this.wf.columns[i].name))colours.push(this.wf.columns[i].colour);
        }
        this.isComplete=(colours.length>=allColours.length);
        
        for(i=0;i<this.drops.length;i++){
            this.drops[i].updateNodeIndicators(colours,this.isComplete);
        }
        
        
    }
    
    terminologyUpdated(){
        for(var i=0;i<this.drops.length;i++){this.drops[i].updateButton();this.drops[i].updateChildren();}
        
    }
    
    populateMenu(menu){
        this.tag.populateMenu(menu);
    }
    
    
    
}