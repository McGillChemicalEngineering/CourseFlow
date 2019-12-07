//The visualization of a week to be instantiated in the Workflowview.

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


class Weekview{
    
    constructor(graph,week){
        this.vertex;
        this.week = week;
        this.graph = graph;
    }

    nameUpdated(){
        if(this.week.name!=null){
            this.graph.getModel().setValue(this.vertex,this.week.name);
        }else{
            this.graph.getModel().setValue(this.vertex,this.week.getDefaultName());
        }
    }
    
    createVertex(x,y,width){
        var name = '';
        if(this.week.name!=null)name = this.week.name;
        this.vertex = this.graph.insertVertex(this.graph.getDefaultParent(),null,name,x,y,width,emptyWeekSize,this.getStyle());
        var week = this.week;
        this.vertex.valueChanged = function(value){
            if(value==week.getDefaultName())return mxCell.prototype.valueChanged.apply(this,arguments);
            var value1 = week.setNameSilent(value);
            if(value1!=value)week.view.graph.getModel().setValue(week.view.vertex,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
            
        }
        this.vertex.isWeek=true;
        this.vertex.week=week;
        this.graph.orderCells(true,[this.vertex]);
        this.vertex.cellOverlays=[];
        this.addPlusOverlay();
        this.addDelOverlay();
        this.addCopyOverlay();
        this.addMoveOverlays();
    }
    
    nodeAdded(node,origin,index){
        this.resizeWeek(node.view.vertex.h()+cellSpacing,origin);
        node.view.makeFlushWithAbove(index);
        if(index<this.week.nodes.length-1)this.pushNodesFast(index+1);
    }
    
    nodeAddedSilently(node,origin,index){
        this.resizeWeek(node.view.vertex.h()+cellSpacing,origin);
        node.view.makeFlushWithAbove(index);
    }
    
    nodeRemoved(node,origin,index){
        this.resizeWeek(-1*node.view.vertex.h()-cellSpacing,origin);
        if(index<this.week.nodes.length)this.pushNodesFast(index);
    }
    
    /*pushNodes(startIndex,endIndex=-1){
        if(startIndex==0) {this.week.nodes[0].view.makeFlushWithAbove(0);startIndex++;}
        if(startIndex>this.week.nodes.length-1)return;
        var dy = this.week.nodes[startIndex-1].view.vertex.b()+cellSpacing-this.week.nodes[startIndex].view.vertex.y();
        for(var i=startIndex;i<this.week.nodes.length;i++){
            this.week.nodes[i].moveNode(0,dy);
            if(i==endIndex)break;
        }
    }*/
    
    //A significantly faster version of this function, which first computes what must be moved, then moves it all at once in a single call to moveCells
    pushNodesFast(startIndex,endIndex=-1,dy=null){
        var nodes = this.week.nodes;
        if(startIndex==0) {nodes[0].view.makeFlushWithAbove(0);startIndex++;}
        if(startIndex>nodes.length-1)return;
        if(dy==null)dy = nodes[startIndex-1].view.vertex.b()+cellSpacing-nodes[startIndex].view.vertex.y();
        var vertices=[];
        var brackets=[];
        for(var i=startIndex;i<nodes.length;i++){
            vertices.push(nodes[i].view.vertex);
            for(var j=0;j<nodes[i].brackets.length;j++){
                var bracket = nodes[i].brackets[j];
                if(brackets.indexOf(bracket)<0)brackets.push(bracket);
            }
            if(i==endIndex)break;
        }
        this.graph.moveCells(vertices,0,dy);
        for(i=0;i<brackets.length;i++)brackets[i].view.updateVertical();
    }
    
    
    getNearestNode(y){
        var nodes = this.week.nodes;
        for(var i=0;i<nodes.length;i++){
            var vertex = nodes[i].view.vertex;
            //find first node AFTER the point
            if(vertex.y()+vertex.h()/2>y){
                if(i==0)return 0; //we are above the first node
                var pvertex = this.week.nodes[i-1].view.vertex;
                if(vertex.y()+vertex.h()/2-y<y-pvertex.y()-pvertex.h()/2)return i;
                return i-1;
            }
        }
        return nodes.length-1; //we are past the last node
    }
    
    
    getNextIndexFromPoint(y){
        var nodes = this.week.nodes;
        for(var i=0;i<nodes.length;i++){
            var vertex = nodes[i].view.vertex;
            if(vertex.y()>y)return i;
        }
        return nodes.length+1;
    }
    
    nodeShifted(initIndex,finalIndex){
        var min = Math.min(initIndex,finalIndex);
        var max = Math.max(initIndex,finalIndex)
        this.week.nodes[finalIndex].view.makeFlushWithAbove(finalIndex);
        if(initIndex<finalIndex)this.pushNodesFast(min,max);
        else this.pushNodesFast(min+1,max);
        
    }
    
    makeFlushWithAbove(index){
        var wf = this.week.wf;
        if(index==0) this.moveWeek(wf.columns[0].head.b()+cellSpacing-this.vertex.y());
        else this.moveWeek(wf.weeks[index-1].view.vertex.b()-this.vertex.y());
    }
    
    moveWeek(dy){
        var vertices = [this.vertex];
        for(var i=0;i<this.week.nodes.length;i++)vertices.push(this.week.nodes[i].view.vertex);
        this.graph.moveCells(vertices,0,dy);
    }
    
    resizeWeek(dy,origin){
        var rect;
        if(dy*origin>0) rect = new mxRectangle(this.vertex.x(),this.vertex.y()-dy,this.vertex.w(),this.vertex.h()+dy);
        else rect = new mxRectangle(this.vertex.x(),this.vertex.y(),this.vertex.w(),this.vertex.h()+dy);
        this.graph.resizeCells([this.vertex],[rect]);
        if(origin==0 && this.week.index<this.week.wf.weeks.length-1){this.week.wf.view.pushWeeksFast(this.week.index+1,dy);}
        return;
        
    }
    
    //Determines whether the position of the point in a week below (1), above (-1), or in (0) the week.
    relativePos(y){
        if(y>this.vertex.b() && this.week.index<this.week.wf.weeks.length-1)return 1;
        if(y<this.vertex.y() && this.week.index>0)return -1;
        return 0;
    }
    
    //Add the overlay to create new weeks
    addPlusOverlay(){
        var w = this.week;
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
            w.wf.makeUndo("Add Week",w);
        });
        this.vertex.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    //Add the overlay to delete the week
    addDelOverlay(){
        var w = this.week;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), 'Delete this week');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-w.view.vertex.h()/2;
            bounds.x = pt.x-bounds.width+w.view.vertex.w()/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            if(mxUtils.confirm("Delete this week? Warning: this will delete any nodes still inside!")){
                graph.clearSelection();
                w.deleteSelf();
                w.wf.makeUndo("Delete Week",w);
            }
        });
        this.vertex.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    addCopyOverlay(){
        var w = this.week;
        var overlay = new mxCellOverlay(new mxImage('resources/images/copy48.png', 24, 24), 'Duplicate week');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x-bounds.width+w.view.vertex.w()/2;
            bounds.y = pt.y-w.view.vertex.h()/2+24;
            return bounds;
        };
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            w.duplicateWeek();
        });
        this.vertex.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    addMoveOverlays(){
        var w = this.week;
        var overlayUp = new mxCellOverlay(new mxImage('resources/images/moveup24.png', 16, 16), 'Move week');
        var overlayDown = new mxCellOverlay(new mxImage('resources/images/movedown24.png', 16, 16), 'Move week');
        overlayUp.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x-w.view.vertex.w()/2;
            bounds.y = pt.y-w.view.vertex.h()/2;
            return bounds;
        };
        overlayDown.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x-w.view.vertex.w()/2;
            bounds.y = pt.y+w.view.vertex.h()/2-bounds.height;
            return bounds;
        };
        var graph = this.graph;
        overlayUp.cursor = 'pointer';
        overlayDown.cursor = 'pointer';
        overlayUp.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            w.wf.moveWeek(w,-1);
        });
        overlayDown.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            w.wf.moveWeek(w,+1);
        });
        this.vertex.cellOverlays.push(overlayUp);
        this.vertex.cellOverlays.push(overlayDown);
        //this.graph.addCellOverlay(this.vertex, overlay);
        
    }
    
    deleted(){
        this.graph.removeCells([this.vertex]);
        //pull everything upward
        if(this.week.index<this.week.wf.weeks.length)this.week.wf.view.pushWeeksFast(this.week.index);
        //if we deleted all the weeks, better make a fresh one!
        if(this.week.wf.weeks.length==0)this.week.wf.createBaseWeek(this.graph);
    }
    
    insertedBelow(week){
        this.createVertex(week.view.vertex.x(),week.view.vertex.b(),week.wf.view.weekWidth);
        //push everything downward
        if(week.index<week.wf.weeks.length-2)week.wf.view.pushWeeksFast(week.index+2);
    }
    
    fillNodes(){
        var week = this.week;
        for(var i=0;i<week.nodes.length;i++){
            var node = week.nodes[i];
            node.view = new Nodeview(this.graph,node);
            var y;
            if(i==0)y=week.view.vertex.y()+2*cellSpacing;
            else y=week.nodes[i-1].view.vertex.b()+cellSpacing;
            node.view.createVertex(0,y);
            node.view.fillTags();
            node.view.columnUpdated();
        }
        if(week.nodes.length>0)this.resizeWeek(week.nodes[week.nodes.length-1].view.vertex.b()-week.nodes[0].view.vertex.y()+cellSpacing,0);
    }
    
    getStyle(){
        return defaultWeekStyle;
    }
    
    
    populateMenu(menu){
        var graph = this.graph;
        var week=this.week;
        if(!(week instanceof WFArea)){
            menu.addItem('Edit label', 'resources/images/text24.png', function(){
				graph.startEditingAtCell(week.view.vertex);
            });
            menu.addItem('Duplicate Week','resources/images/copy24.png',function(){
                week.duplicateWeek(); 
            });
            menu.addItem('Delete Week','resources/images/delrect24.png',function(){
                if(mxUtils.confirm("Delete this week?")){
                    graph.clearSelection();
                    week.deleteSelf();
                    week.wf.makeUndo("Delete Week",week);
                }
            });
        }
    }
    
    
    

}

class WFAreaview extends Weekview{
    addDelOverlay(){}
    
    addPlusOverlay(){}
    
    addCopyOverlay(){}
    
    addMoveOverlays(){}
    
    getStyle(){
        return defaultWFAreaStyle;
    }
    
}


class Termview extends Weekview{
    nodeAdded(node,origin,index){
        var col = node.column;
        if(origin>0)this.makeFlushWithAbove(this.week.wf.weeks.indexOf(this.week));
        if(this.getLargestColumn(col,-1)==this.week.nodesByColumn[col].length-1){
            //pass 0 as origin to prevent making it flush (we do so automatically); we have to do this every time because we don't actually know whether or not the original week was resized
            this.resizeWeek(node.view.vertex.h()+cellSpacing,0);
        }
        index=this.week.nodesByColumn[col].indexOf(node);
        node.view.makeFlushWithAbove(index,col);
        if(index<this.week.nodesByColumn[col].length-1)this.pushNodesFast(index+1,-1,null,col);
    }
    
    
    nodeAddedSilently(node,origin,index){
        var col = node.column;
        if(origin>0)this.makeFlushWithAbove(this.week.wf.weeks.indexOf(this.week));
        if(this.getLargestColumn(col,-1)==this.week.nodesByColumn[col].length-1){
            //pass 0 as origin to prevent making it flush (we do so automatically); we have to do this every time because we don't actually know whether or not the original week was resized
            this.resizeWeek(node.view.vertex.h()+cellSpacing,0);
        }
        index=this.week.nodesByColumn[col].indexOf(node);
        node.view.makeFlushWithAbove(index,col);
    }
    
    //Gets the largest column. Optionally we can add a modifier to a column's lenth (useful if we've just added a node and want to know if it USED to be the largest column, for example)
    getLargestColumn(col=null,modifier=0){
        var num=0;
        for(var prop in this.week.nodesByColumn){
            var length = this.week.nodesByColumn[prop].length;
            if(prop==col)length+=modifier;
            if(length>num){
                num=length;
            }
        }
        return num;
    }
    
    nodeRemoved(node,origin,index){
        if(origin<0)this.makeFlushWithAbove(this.week.wf.weeks.indexOf(this.week));
        var col = node.column;
        
        if(index<this.week.nodesByColumn[col].length)this.pushNodesFast(index,-1,null,col);
        if(this.getLargestColumn(col)==this.week.nodesByColumn[col].length){
            this.resizeWeek(-1*node.view.vertex.h()-cellSpacing,0);
        }
    }
    
    //A significantly faster version of this function, which first computes what must be moved, then moves it all at once in a single call to moveCells
    pushNodesFast(startIndex,endIndex=-1,dy=null,column=null){
        var nodesByColumn = this.week.nodesByColumn;
        if(startIndex==0){
            for(var prop in nodesByColumn){
                if(column==null||column==prop){
                    nodesByColumn[prop][0].view.makeFlushWithAbove(0);
                }
            }
            startIndex++;
        }
        
        
        for(var prop in nodesByColumn){
            if(column==null||column==prop){
                var nodes = nodesByColumn[prop];
                if(startIndex>nodes.length-1)continue;
                var dycol=dy;
                if(dycol==null)dycol = nodes[startIndex-1].view.vertex.b()+cellSpacing-nodes[startIndex].view.vertex.y();
                var vertices=[];
                var brackets=[];
                for(var i=startIndex;i<nodes.length;i++){
                    vertices.push(nodes[i].view.vertex);
                    for(var j=0;j<nodes[i].brackets.length;j++){
                        var bracket = nodes[i].brackets[j];
                        if(brackets.indexOf(bracket)<0)brackets.push(bracket);
                    }
                    if(i==endIndex)break;
                }
                this.graph.moveCells(vertices,0,dycol);
                for(i=0;i<brackets.length;i++)brackets[i].updateVertical();
            }
        }

        
        
    }
    
    
    getNextIndexFromPoint(y,column){
        if(this.week.nodesByColumn[column]==null)this.week.nodesByColumn[column]=[];
        var nodes=this.week.nodesByColumn[column];
        for(var i=0;i<nodes.length;i++){
            var vertex = nodes[i].view.vertex;
            if(vertex.y()>y)return i;
        }
        return nodes.length+1;
    }
    
    
    getNearestNode(y,column){
        if(this.week.nodesByColumn[column]==null)this.week.nodesByColumn[column]=[];
        var nodes = this.week.nodesByColumn[column];
        for(var i=0;i<nodes.length;i++){
            var vertex = nodes[i].view.vertex;
            //find first node AFTER the point
            if(vertex.y()+vertex.h()/2>y){
                if(i==0)return 0; //we are above the first node
                var pvertex = nodes[i-1].view.vertex;
                if(vertex.y()+vertex.h()/2-y<y-pvertex.y()-pvertex.h()/2)return i;
                return i-1;
            }
        }
        return nodes.length-1; //we are past the last node
    }
    
     nodeShifted(initIndex,finalIndex,column){
        var nodes = this.week.nodesByColumn[column];
        var min = Math.min(initIndex,finalIndex);
        var max = Math.max(initIndex,finalIndex);
        nodes[finalIndex].view.makeFlushWithAbove(finalIndex,column);
        if(initIndex<finalIndex)this.pushNodesFast(min,max,null,column);
        else this.pushNodesFast(min+1,max,null,column);
        
    }
    
    
    insertedBelow(week){
        this.createVertex(week.view.vertex.x(),week.view.vertex.b(),week.wf.view.weekWidth);
        //push everything downward
        if(week.index<week.wf.weeks.length-2)week.wf.view.pushWeeksFast(week.index+2);
    }
    
    
    fillNodes(){
        var week = this.week;
        var b = 0;
        for(var col in week.nodesByColumn){
            var nodes = week.nodesByColumn[col];
            for(var i=0;i<nodes.length;i++){
                var node = nodes[i];
                node.view = new Nodeview(this.graph,node);
                var y;
                if(i==0)y=week.view.vertex.y()+2*cellSpacing;
                else y=nodes[i-1].view.vertex.b()+cellSpacing;
                node.view.createVertex(0,y);
                node.view.fillTags();
                node.view.columnUpdated();
                if(node.view.vertex.b()>b)b=node.view.vertex.b();
            }
        }
        
        if(week.nodes.length>0)this.resizeWeek(b-week.nodes[0].view.vertex.y()+cellSpacing,0);
    }
    
    
}