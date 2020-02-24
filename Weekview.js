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
        this.minimizeOverlay;
    }

    nameUpdated(){
        if(this.week.name!=null){
            this.graph.getModel().setValue(this.vertex,this.week.name);
        }else{
            this.graph.getModel().setValue(this.vertex,this.week.getDefaultName());
        }
        this.week.wf.view.populateWeekBar();
    }
    
    createVertex(x,y,width){
        var name = '';
        if(this.week.name!=null)name = this.week.name;
        var height = emptyWeekSize;
        if(this.week.collapsed)height=48;
        this.vertex = this.graph.insertVertex(this.graph.getDefaultParent(),null,name,x,y,width,height,this.getStyle());
        var week = this.week;
        this.vertex.valueChanged = function(value){
            if(value==week.getDefaultName())return mxCell.prototype.valueChanged.apply(this,arguments);
            var value1 = week.setNameSilent(value);
            if(value1!=value)week.view.graph.getModel().setValue(week.view.vertex,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
            week.wf.view.populateWeekBar();
            
        }
        this.vertex.isWeek=true;
        this.vertex.week=week;
        this.graph.orderCells(true,[this.vertex]);
        this.vertex.cellOverlays=[];
        this.addPlusOverlay();
        this.addDelOverlay();
        this.addCopyOverlay();
        this.addMoveOverlays();
        this.addMinimizeOverlay(this.week.collapsed);
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
    
    nodeResized(node,dy){
        if(!this.week.collapsed)this.resizeWeek(dy,0);
        var index = this.week.nodes.indexOf(node);
        if(index<this.week.nodes.length-1)this.pushNodesFast(index+1,-1,dy);
        
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
        if(index==0) this.moveWeek(wf.columns[0].view.vertex.b()+cellSpacing-this.vertex.y());
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
        var overlay = new mxCellOverlay(new mxImage('resources/images/add48.png', 24, 24), LANGUAGE_TEXT.week.createbelow[w.getType()][USER_LANGUAGE]);
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
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), LANGUAGE_TEXT.week.delete[w.getType()][USER_LANGUAGE]);
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
            if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deleteweek[w.getType()][USER_LANGUAGE])){
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
        var overlay = new mxCellOverlay(new mxImage('resources/images/copy48.png', 24, 24), LANGUAGE_TEXT.week.duplicate[w.getType()][USER_LANGUAGE]);
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
        var overlayUp = new mxCellOverlay(new mxImage('resources/images/moveup24.png', 16, 16), LANGUAGE_TEXT.week.move[w.getType()][USER_LANGUAGE]);
        var overlayDown = new mxCellOverlay(new mxImage('resources/images/movedown24.png', 16, 16), LANGUAGE_TEXT.week.move[w.getType()][USER_LANGUAGE]);
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
    
    //Add the overlay to collapse the week
    addMinimizeOverlay(collapsed=false){
        var w = this.week;
        var imgsrc = 'resources/images/minus24.png';
        if(collapsed)imgsrc = 'resources/images/plus24.png';
        var overlay = new mxCellOverlay(new mxImage(imgsrc, 24, 24), LANGUAGE_TEXT.week.collapse[w.getType()][USER_LANGUAGE]);
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-w.view.vertex.h()/2;
            bounds.x = pt.x-2*bounds.width+w.view.vertex.w()/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            w.toggleCollapse();
        });
        this.vertex.cellOverlays.push(overlay);
        this.minimizeOverlay = overlay;
        //this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    
    collapseToggled(){
        if(this.minimizeOverlay){
            var overlaysActive = (this.graph.getCellOverlays(this.vertex)&&this.graph.getCellOverlays(this.vertex).indexOf(this.minimizeOverlay)>=0)
            if(overlaysActive)this.graph.removeCellOverlay(this.vertex,this.minimizeOverlay);
            this.vertex.cellOverlays.splice(this.vertex.cellOverlays.indexOf(this.minimizeOverlay),1);
            this.addMinimizeOverlay(!this.week.collapsed);
            if(overlaysActive)this.graph.addCellOverlay(this.vertex,this.minimizeOverlay);
        }
        var dy;
        if(this.week.nodes.length==0)dy = emptyWeekSize-48;
        else dy = this.getSizeForCollapse();
        var mult = -1;
        if(this.week.collapsed)mult=1;
        this.graph.resizeCell(this.vertex,new mxGeometry(this.vertex.x(),this.vertex.y(),this.vertex.w(),this.vertex.h()+mult*dy));
        for(var i=0;i<this.week.nodes.length;i++){
            this.graph.cellsToggled([this.week.nodes[i].view.vertex],this.week.collapsed);
        }
        
        
        this.week.wf.view.pushWeeksFast(this.week.index+1,dy*mult)
        
    }
    
    getSizeForCollapse(){
        return this.week.nodes[this.week.nodes.length-1].view.vertex.b()-this.week.nodes[0].view.vertex.y()+emptyWeekSize+cellSpacing-48;
    }
    
    deleted(){
        this.graph.removeCells([this.vertex]);
        //pull everything upward
        if(this.week.index<this.week.wf.weeks.length)this.week.wf.view.pushWeeksFast(this.week.index);
        //if we deleted all the weeks, better make a fresh one!
        if(this.week.wf.weeks.length==0)this.week.wf.createBaseWeek(this.graph);
        this.week.wf.view.populateWeekBar();
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
            if(week.collapsed)this.graph.toggleCells(false,[node.view.vertex]);
        }
        if(!week.collapsed&&week.nodes.length>0)this.resizeWeek(week.nodes[week.nodes.length-1].view.vertex.b()-week.nodes[0].view.vertex.y()+cellSpacing,0);
    }
    
    getStyle(){
        if(this.week.wf.isSimple)return defaultWFAreaStyle;
        else return defaultWeekStyle;
    }
    
    
    populateMenu(menu){
        var graph = this.graph;
        var week=this.week;
        menu.addItem(LANGUAGE_TEXT.week.modifytext[USER_LANGUAGE], 'resources/images/text24.png', function(){
            graph.startEditingAtCell(week.view.vertex);
        });
        menu.addItem(LANGUAGE_TEXT.week.duplicate[week.getType()][USER_LANGUAGE],'resources/images/copy24.png',function(){
            week.duplicateWeek(); 
        });
        menu.addItem(LANGUAGE_TEXT.week.delete[week.getType()][USER_LANGUAGE],'resources/images/delrect24.png',function(){
            if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deleteweek[week.getType()][USER_LANGUAGE])){
                graph.clearSelection();
                week.deleteSelf();
                week.wf.makeUndo("Delete Week",week);
            }
        });
    }
    
    
    simpleToggled(){
        if(this.vertex&&this.graph){
            if(this.week.wf.isSimple)this.graph.setCellStyle(defaultWFAreaStyle,[this.vertex]);
            else this.graph.setCellStyle(defaultWeekStyle,[this.vertex]);
            this.vertex.cellOverlays=[];
            this.graph.removeCellOverlays(this.vertex);
            this.addPlusOverlay();
            this.addDelOverlay();
            this.addCopyOverlay();
            this.addMoveOverlays();
            this.addMinimizeOverlay(this.week.collapsed);
        }
    }
    

}

class WFAreaview extends Weekview{
    addDelOverlay(){if(!this.week.wf.isSimple)super.addDelOverlay();}
    
    addPlusOverlay(){if(!this.week.wf.isSimple)super.addPlusOverlay();}
    
    addCopyOverlay(){if(!this.week.wf.isSimple)super.addCopyOverlay();}
    
    addMoveOverlays(){if(!this.week.wf.isSimple)super.addMoveOverlays();}
    
    addMinimizeOverlay(){if(!this.week.wf.isSimple)super.addMinimizeOverlay();}
    
    
    populateMenu(menu){
        var week = this.week;
        if(!this.week.wf.isSimple){
            super.populateMenu(menu);
        }
        var sub = menu.addItem(LANGUAGE_TEXT.week.options[USER_LANGUAGE],'resources/images/weekstyle24.png');
        menu.addItem(LANGUAGE_TEXT.week.simple[USER_LANGUAGE],'resources/images/weekstylesimple24.png',function(){
            week.wf.toggleSimple(true);
        },sub);
        menu.addItem(LANGUAGE_TEXT.week.parts[USER_LANGUAGE],'resources/images/weekstyleparts24.png',function(){
            week.wf.toggleSimple(false);
        },sub);
    }
    
}


class Termview extends Weekview{
    nodeAdded(node,origin,index){
        var col = node.column;
        if(origin>0)this.makeFlushWithAbove(this.week.wf.weeks.indexOf(this.week));
        index=this.week.nodesByColumn[col].indexOf(node);
        node.view.makeFlushWithAbove(index,col);
        if(index<this.week.nodesByColumn[col].length-1)this.pushNodesFast(index+1,-1,null,col);
        //what used to be the largest
        var largest = this.getLargestColumn(col,-node.view.vertex.h()-cellSpacing);
        //what is the current column size
        var newheight = this.getHeightOfCol(col);
        if(largest<newheight){
            //pass 0 as origin to prevent making it flush (we do so automatically); we have to do this every time because we don't actually know whether or not the original week was resized
            this.resizeWeek(newheight-largest,0);
        }
    }
    
    
    nodeAddedSilently(node,origin,index){
        var col = node.column;
        if(origin>0)this.makeFlushWithAbove(this.week.wf.weeks.indexOf(this.week));
        index=this.week.nodesByColumn[col].indexOf(node);
        node.view.makeFlushWithAbove(index,col);
        //what used to be the largest
        var largest = this.getLargestColumn(col,-node.view.vertex.h()-cellSpacing);
        //what is the current column size
        var newheight = this.getHeightOfCol(col);
        if(largest<newheight){
            //pass 0 as origin to prevent making it flush (we do so automatically); we have to do this every time because we don't actually know whether or not the original week was resized
            this.resizeWeek(newheight-largest,0);
        }
    }
    
    //Gets the largest column. Includes a modifier to be used when, for example, we want to know what the biggest column will be after removing a node.
    getLargestColumn(col,mod){
        var height=0;
        for(var prop in this.week.nodesByColumn){
            var b = this.getHeightOfCol(prop);
            if(col==prop)b+=mod;
            if(b>height){
                height=b;
            }
        }
        return height;
    }
    
    getHeightOfCol(col){
        var nodes = this.week.nodesByColumn[col];
        if(nodes.length==0)return 0;
        return nodes[nodes.length-1].view.vertex.b()+cellSpacing-nodes[0].view.vertex.y();
    }
    
    nodeRemoved(node,origin,index){
        if(origin<0)this.makeFlushWithAbove(this.week.wf.weeks.indexOf(this.week));
        var col = node.column;
        if(index<this.week.nodesByColumn[col].length)this.pushNodesFast(index,-1,null,col);
        //The current largest column
        var largest = this.getLargestColumn();
        //the old height of the column
        var oldheight = this.getHeightOfCol(col)+cellSpacing+node.view.vertex.h();
        if(largest<oldheight){
            this.resizeWeek(largest-oldheight,0);
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
    
    
    nodeResized(node,dy){
        var prevlargest = this.getLargestColumn(node.column,-dy);
        var newlargest = this.getLargestColumn();
        if(!this.week.collapsed&&newlargest!=prevlargest)this.resizeWeek(newlargest-prevlargest,0);
        var index = this.week.nodesByColumn[node.column].indexOf(node);
        if(index<this.week.nodesByColumn[node.column].length-1)this.pushNodesFast(index+1,-1,dy,node.column);
        
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
                if(week.collapsed)this.graph.toggleCells(false,[node.view.vertex]);
            }
        }
        if(!week.collapsed&&week.nodes.length>0)this.resizeWeek(b-week.nodes[0].view.vertex.y()+cellSpacing,0);
    }
    
    
    getSizeForCollapse(){
        var nodesByColumn = this.week.nodesByColumn;
        var dy=0;
        for(var prop in nodesByColumn){
            if(nodesByColumn[prop].length>0){
                var y = nodesByColumn[prop][nodesByColumn[prop].length-1].view.vertex.b()-nodesByColumn[prop][0].view.vertex.y();
                if(y>dy)dy=y;
            }
        }
        return dy+emptyWeekSize+cellSpacing-48;
    }
    
    
    
}