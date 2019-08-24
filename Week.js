//Definition of the week class, which includes both actual weeks in the course level and just a container for nodes at the activity level.

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

class Week {
    constructor(graph,wf){
        this.graph=graph;
        this.nodes=[];
        this.box;
        this.index;
        this.wf=wf;
        this.id = this.wf.project.genID();
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.id,"weekid");
        for(var i=0;i<this.nodes.length;i++){
            xml+=this.nodes[i].toXML();
        }
        return makeXML(xml,"week");
    }
    
    fromXML(xmlData){
        var graph = this.graph;
        var wf = this.wf;
        this.id = getXMLVal(xmlData,"weekid");
        var xmlnodes = xmlData.getElementsByTagName("node");
        for(var i=0;i<xmlnodes.length;i++){
            var xmlnode = xmlnodes[i];
            var column = getXMLVal(xmlnode,"column");
            var node = wf.createNodeOfType(column);
            node.week = this;
            node.fromXML(xmlnode);
            this.addNode(node);
        }
    }
    
    createBox(x,y,width){
        this.box = this.graph.insertVertex(this.graph.getDefaultParent(),null,'',x,y,width,100,this.getStyle());
        this.box.isWeek=true;
        this.box.week=this;
        this.graph.orderCells(true,[this.box]);
        this.box.cellOverlays=[];
        this.addPlusOverlay();
        this.addDelOverlay();
    }
    
    getStyle(){
        return defaultWeekStyle;
    }
    
    //Adds a node. If we are just switching the node, we don't need to push weeks.
    addNode(node,origin=0,index=-1){
        this.resizeWeek(node.vertex.h()+cellSpacing,origin);
        if(index<0||origin<0||index>this.nodes.length-1){this.nodes.push(node);}
        else if(origin > 0) {this.nodes.splice(0,0,node);}
        else this.nodes.splice(index,0,node);
        index=this.nodes.indexOf(node);
        node.makeFlushWithAbove(index,this);
        if(index<this.nodes.length-1)this.pushNodes(index+1);
        node.makeAutoLinks();
    }
    
    //Removes a node. If we are just switching the node, we don't need to push weeks.
    removeNode(node,origin=0){
        var index=this.nodes.indexOf(node);
        this.nodes.splice(index,1);
        this.resizeWeek(-1*node.vertex.h()-cellSpacing,origin);
        if(index<this.nodes.length)this.pushNodes(index);
    }
    
    pushNodes(startIndex,endIndex=-1){
        if(startIndex==0) {this.nodes[0].makeFlushWithAbove(0);startIndex++;}
        if(startIndex>this.nodes.length-1)return;
        var dy = this.nodes[startIndex-1].vertex.b()+cellSpacing-this.nodes[startIndex].vertex.y();
        for(var i=startIndex;i<this.nodes.length;i++){
            this.nodes[i].moveNode(0,dy);
            if(i==endIndex)break;
        }
    }
    
    getNearestNode(y){
        for(var i=0;i<this.nodes.length;i++){
            var vertex = this.nodes[i].vertex;
            //find first node AFTER the point
            if(vertex.y()+vertex.h()/2>y){
                if(i==0)return 0; //we are above the first node
                var pvertex = this.nodes[i-1].vertex;
                if(vertex.y()+vertex.h()/2-y<y-pvertex.y()-pvertex.h()/2)return i;
                return i-1;
            }
        }
        return this.nodes.length-1; //we are past the last node
    }
    
    getNextIndexFromPoint(y){
        for(var i=0;i<this.nodes.length;i++){
            var vertex = this.nodes[i].vertex;
            if(vertex.y()>y)return i;
        }
        return this.nodes.length+1;
    }
    
    shiftNode(initIndex,finalIndex){
        if(initIndex==finalIndex)return;
        var prevNode = this.wf.findNextNodeOfSameType(this.nodes[initIndex],-1)
        this.nodes.splice(finalIndex,0,this.nodes.splice(initIndex,1)[0]);
        var min = Math.min(initIndex,finalIndex);
        var max = Math.max(initIndex,finalIndex)
        this.nodes[finalIndex].makeFlushWithAbove(finalIndex);
        if(initIndex<finalIndex)this.pushNodes(min,max);
        else this.pushNodes(min+1,max);
        //Make the autolinks if needed
        if(this.nodes[finalIndex].makeAutoLinks()){
            if(prevNode!=null)prevNode.makeAutoLinks();
        }
        
    }
    
    //Lays out all the cells within the week. This should only be used for loading files, due to how slow it is.
    doLayout(){
        var y=this.box.y();
        for(i=0;i<this.nodes.length;i++){
            var cell = this.nodes[i].vertex;
            y+=cellSpacing;
            this.graph.moveCells([cell],0,y-cell.y());
            y+=cell.h();
        }
        if(y+cellSpacing>this.box.b()){
            this.resizeWeek(y+cellSpacing-this.box.h());
        }
    }
    
    makeFlushWithAbove(index){
        if(index==0) this.moveWeek(this.wf.columns[0].head.b()+cellSpacing-this.box.y());
        else this.moveWeek(this.wf.weeks[this.index-1].box.b()-this.box.y());
    }
    
    moveWeek(dy){
        this.graph.moveCells([this.box],0,dy);
        this.graph.moveCells(this.nodes.map(mapWeekVertices),0,dy);
    }
    
    resizeWeek(dy,origin){
        var rect;
        if(dy*origin>0) rect = new mxRectangle(this.box.x(),this.box.y()-dy,this.box.w(),this.box.h()+dy);
        else rect = new mxRectangle(this.box.x(),this.box.y(),this.box.w(),this.box.h()+dy);
        this.graph.resizeCells([this.box],[rect]);
        if(origin==0 && this.index<this.wf.weeks.length-1){this.wf.pushWeeks(this.index+1);}
        return;
        
    }
    
    //Determines whether the position of the point in a week below (1), above (-1), or in (0) the week.
    relativePos(y){
        if(y>this.box.b() && this.index<this.wf.weeks.length-1)return 1;
        if(y<this.box.y() && this.index>0)return -1;
        return 0;
    }
    
    //Add the overlay to create new weeks
    addPlusOverlay(){
        var w = this;
        var overlay = new mxCellOverlay(new mxImage('resources/images/add48.png', 24, 24), 'Insert week below');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x - bounds.width / 2;
            return bounds;
        };
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            w.insertBelow();
        });
        this.box.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.box, overlay);
    }
    
    //Add the overlay to delete the week
    addDelOverlay(){
        var w = this;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), 'Delete this week');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-w.box.h()/2;
            bounds.x = pt.x-bounds.width+w.box.w()/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            if(mxUtils.confirm("Delete this week? Warning: this will delete any nodes still inside!")){
                graph.clearSelection();
                w.deleteSelf();
            }
        });
        this.box.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.box, overlay);
    }
    
    //Causes the week to delete itself and all its contents
    deleteSelf(){
        for(var i=0;i<this.nodes.length;i++){
            this.nodes[i].deleteSelf();
        }
        this.graph.removeCells([this.box]);
        this.wf.weeks.splice(this.index,1);
        this.wf.updateWeekIndices();
        //pull everything upward
        if(this.index<this.wf.weeks.length)this.wf.pushWeeks(this.index);
        //if we deleted all the weeks, better make a fresh one!
        if(this.wf.weeks.length==0)this.wf.createBaseWeek(this.graph);
    }
    
    //Insert a new week below
    insertBelow(){
        var newWeek = new Week(this.graph,this.wf);
        newWeek.createBox(this.box.x(),this.box.b(),weekWidth);
        this.wf.weeks.splice(this.index+1,0,newWeek);
        this.wf.updateWeekIndices();
        //push everything downward
        if(this.index<this.wf.weeks.length-2)this.wf.pushWeeks(this.index+2);
        
    }
    
    
}

class WFArea extends Week{
    addDelOverlay(){}
    
    addPlusOverlay(){}
    
    getStyle(){
        return defaultWFAreaStyle;
    }
    
    
}