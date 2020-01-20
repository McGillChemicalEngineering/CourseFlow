//The visualization of a node to be instantiated in the Workflowview.

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

class Nodeview{
    constructor(graph,node){
        this.node=node;
        this.vertex;
        this.lefticonnode;
        this.righticonnode;
        this.namenode;
        this.textnode;
        this.dropNode;
        this.graph=graph;
        if(this.node.autoLinkOut)this.node.autoLinkOut.view = new WFAutolinkview(graph,this.node.autoLinkOut);
        this.tagPreviews=[];
        this.tagVertices=[];
        
    }
    
    
    createVertex(x,y){
        var width = defaultCellWidth;
        if(this.node.wf.weeks[0] instanceof Term)width=200;
        var h = minCellHeight+cellDropdownHeight+cellDropdownPadding;
        if(this.node.isDropped)h+=this.node.textHeight;
        var vertexStyle = this.node.getVertexStyle();
        if(this.node.isDropped)vertexStyle = vertexStyle.replace("resizable=0","resizable=1");
        this.vertex=this.graph.insertVertex(this.graph.getDefaultParent(),null,'',x,y,width,h,vertexStyle);
        this.vertex.isNode=true;
        this.vertex.node=this.node;
        var left = 0;
        if(this.addRightIcon()){width-=this.righticonnode.w()+2*defaultIconPadding;}
        if(this.addLeftIcon()){left+=this.lefticonnode.w()+2*defaultIconPadding;width-=this.lefticonnode.w()+2*defaultIconPadding;}
        var name = 'Click to edit';
        if(this.node.name)name=this.node.name;
        this.namenode = this.graph.insertVertex(this.vertex,null,name,left,0,width,minCellHeight,defaultNameStyle);
        var node = this.node;
        this.namenode.valueChanged = function(value){
            var value1 = node.setNameSilent(value);
            if(value1!=value)node.view.graph.getModel().setValue(node.view.namenode,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
        }
        var text = '';
        if(this.node.text)text = this.node.text;
        h=1;
        if(this.node.isDropped)h+=this.node.textHeight;
        this.textnode = this.graph.insertVertex(this.vertex,null,text,defaultTextPadding,this.namenode.b(),this.vertex.w()-2*defaultTextPadding,h,defaultTextStyle);
        var dropDownStyle = defaultDropDownStyle;
        if(this.node.isDropped)dropDownStyle+="image=resources/images/droptriangleup.png;";
        else dropDownStyle+="image=resources/images/droptriangle.png;";
        this.dropNode = this.graph.insertVertex(this.vertex,null,'',0,this.textnode.b()-1+cellDropdownPadding,this.vertex.w(),cellDropdownHeight,dropDownStyle);
        this.dropNode.isDrop = true;
        this.dropNode.node = this.node;
        this.tagBox = this.graph.insertVertex(this.vertex,null,'',this.vertex.w(),0,this.vertex.w(),this.vertex.h(),defaultTagBoxStyle);
        this.graph.toggleCells(false,[this.tagBox]);
        this.vertex.cellOverlays=[];
        this.addPlusOverlay();
        this.addDelOverlay();
        this.addCopyOverlay();
        this.vertex.setConnectable(true);
    }
    
    nameUpdated(){
        this.graph.cellLabelChanged(this.namenode,this.node.name);
    }

    textUpdated(){
        this.graph.cellLabelChanged(this.textnode,this.node.text);
    }
    
    addRightIcon(){
        if(this.node.getIconCategory("right")||this.node.getAcceptedWorkflowType()){
            var style = defaultIconStyle;
            if(this.node.righticon){
                style+="image="+iconpath+this.node.righticon+"48.png;";
                this.node.wf.view.legendUpdate(this.node.getIconCategory("right"),this.node.righticon,null);
            }else if(this.node.getRightIconList()==null&&this.node.linkedWF){
                style+="image="+iconpath+"linked48.png;";
            }
            this.righticonnode = this.graph.insertVertex(this.vertex,null,'',this.vertex.w()-defaultIconWidth-defaultIconPadding,0,defaultIconWidth,minCellHeight,style);
            return true;
        }
        return false;
        
    }
    addLeftIcon(){
        if(this.node.getIconCategory("left")){
            var style = defaultIconStyle;
            if(this.node.lefticon){
                style+="image="+iconpath+this.node.lefticon+"48.png;";
                this.node.wf.view.legendUpdate(this.node.getIconCategory("left"),this.node.lefticon,null);
            }
            this.lefticonnode = this.graph.insertVertex(this.vertex,null,'',defaultIconPadding,0,defaultIconWidth,minCellHeight,style);
            return true;
        }
        return false;
    }
    
    leftIconUpdated(oldvalue){
        var newvalue = this.node.lefticon;
        this.node.wf.view.legendUpdate(this.node.getIconCategory("left"),newvalue,oldvalue);
        if(newvalue!=null)this.graph.setCellStyles("image",iconpath+newvalue+"48.png",[this.lefticonnode]);
        else this.graph.setCellStyles("image",null,[this.lefticonnode]);
    }
    
    rightIconUpdated(oldvalue){
        var newvalue = this.node.righticon;
        this.node.wf.view.legendUpdate(this.node.getIconCategory("right"),newvalue,oldvalue);
        if(newvalue!=null)this.graph.setCellStyles("image",iconpath+newvalue+"48.png",[this.righticonnode]);
        else this.graph.setCellStyles("image",null,[this.righticonnode]);
    }

    linkedWFUpdated(value,oldvalue){
        if(this.node.getRightIconList()==null){
            if(value&&!oldvalue)this.rightIconUpdated("linked");
            else if(oldvalue&&!value)this.rightIconUpdated(null);
        }
    }
    
    moveNode(dx,dy){
        this.graph.moveCells([this.vertex],dx,dy);
        for(var i=0;i<this.node.brackets.length;i++){this.node.brackets[i].view.updateVertical();}
        //this.redrawLinks();
    }
    
    columnUpdated(){
        this.graph.moveCells([this.vertex],this.node.wf.view.getColPos(this.node.column)-this.vertex.w()/2-this.vertex.x(),0);
        this.styleForColumn();
        for(var i=0;i<this.node.tags.length;i++)this.node.tags[i].view.updateDrops();
    }
    
    styleForColumn(){
        var colstyle = this.node.getColumnStyle();
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
        this.graph.setCellStyles("strokeColor",colstyle,this.tagVertices.concat(this.tagPreviews));
    }
    
    makeFlushWithAbove(index,column=null){
        if(index==0) this.moveNode(0,this.node.week.view.vertex.y()+2*cellSpacing-this.vertex.y());
        else {
            var nodes;
            if(column==null)nodes = this.node.week.nodes;
            else nodes=this.node.week.nodesByColumn[column];
            this.moveNode(0,nodes[index-1].view.vertex.b()+cellSpacing-this.vertex.y());
        }
    }
    
    vertexResized(dy){
        this.resizeChild(this.textnode,dy);
        this.graph.moveCells([this.dropNode],0,dy);
        this.node.week.view.nodeResized(this.node,dy);
        for(var i=0;i<this.node.brackets.length;i++){this.node.brackets[i].view.updateVertical();}
        
    }
    
    resizeChild(box,dy){
        var rect = new mxRectangle(box.x(),box.y(),box.w(),box.h()+dy);
        this.graph.resizeCells([box],[rect]);
    }
    
    dropDownToggled(){
        var mult = 1;
        if(this.node.isDropped)mult=-1;
        this.graph.resizeCell(this.vertex,new mxGeometry(this.vertex.x(),this.vertex.y(),this.vertex.w(),this.vertex.h()+mult*this.node.textHeight));
        this.graph.setCellStyles('resizable',1-this.node.isDropped,[this.vertex]);
        if(this.node.isDropped)this.graph.setCellStyles('image',"resources/images/droptriangle.png",[this.dropNode]);
        else this.graph.setCellStyles('image',"resources/images/droptriangleup.png",[this.dropNode]);
        
    }
    
    insertedBelow(node){
        this.createVertex(node.view.vertex.x(),node.view.vertex.y());
    }
    
    fillTags(){
        var node = this.node;
        for(var i=0;i<node.tags.length;i++){
            node.view.tagAdded(node.tags[i],false);
        }
    }
    
    deleted(){
        this.graph.removeCells([this.vertex]);
    }
    
    
    addPlusOverlay(){
        var n = this.node;
        var overlay = new mxCellOverlay(new mxImage('resources/images/add48.png', 24, 24), 'Insert node below');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x+n.view.vertex.w()/2 - bounds.width;
            return bounds;
        };
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            n.insertBelow();
        });
        this.vertex.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        var n = this.node;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), 'Delete this node');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-n.view.vertex.h()/2;
            bounds.x = pt.x-bounds.width+n.view.vertex.w()/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            if(mxUtils.confirm("Delete this node?")){
                graph.clearSelection();
                n.deleteSelf();
                n.wf.makeUndo("Delete Node",n);
            }
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
    
    addCopyOverlay(){
        var n = this.node;
        var overlay = new mxCellOverlay(new mxImage('resources/images/copy48.png', 24, 24), 'Duplicate node');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x-bounds.width+n.view.vertex.w()/2;
            bounds.y = pt.y-n.view.vertex.h()/2+24;
            return bounds;
        };
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            n.duplicateNode();
        });
        this.vertex.cellOverlays.push(overlay);
        //this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    
    
    
    tagAdded(tag,show){
        var vertices = tag.view.addNode(this.node);
        this.tagVertices.push(vertices.label);
        this.tagPreviews.push(vertices.preview);
        this.toggleTags(show);
    }
    
    tagRemoved(tag){
        var index = this.node.tags.indexOf(tag); 
        this.graph.removeCells([this.tagVertices.splice(index,1)[0],this.tagPreviews.splice(index,1)[0]]);
        if(tag.view)tag.view.removeNode(this.node);
        
        for(var i=0;i<this.tagVertices.length;i++){
            this.graph.moveCells([this.tagVertices[i]],0,(tagHeight+tagBoxPadding)*i-this.tagVertices[i].y());
        }
        for(var i=0;i<this.tagPreviews.length;i++){
            this.graph.moveCells([this.tagPreviews[i]],0,tagHeight/2-2+(tagBoxPadding+tagHeight)*i-this.tagPreviews[i].y());
        }
    }
    
    toggleTags(show){
        if(show){
            for(var i=0;i<this.tagVertices.length;i++){
                this.graph.moveCells([this.tagVertices[i]],0,(tagHeight+tagBoxPadding)*i-this.tagVertices[i].y());
            }
            for(var i=0;i<this.tagPreviews.length;i++){
                this.graph.moveCells([this.tagPreviews[i]],0,tagHeight/2-2+(tagBoxPadding+tagHeight)*i-this.tagPreviews[i].y());
            }
            var bounds = this.tagBox.getGeometry();
            bounds.height = this.tagVertices.length*(tagHeight+tagBoxPadding);

            this.graph.resizeCells([this.tagBox],bounds);
            this.graph.orderCells(false,[this.vertex]);
            this.node.wf.view.bringCommentsToFront();
        }else{
            for(var i=0;i<this.tagVertices.length;i++){
                this.graph.removeCellOverlays(this.tagVertices[i]);
            }
        }
        this.graph.toggleCells(show,[this.tagBox]);
    }
    
    highlight(on){
        var g = this.graph.view.getState(this.vertex).shape.node;
        if(g.firstChild!=null){
            if(on)g.firstChild.classList.add("highlighted");
            else g.firstChild.classList.remove("highlighted");
        }
    }
    
    
    
    populateMenu(menu){
        var graph = this.graph;
        var p = this.node.wf.project;
        var node=this.node;
        this.populateIconMenu(menu,node.getLeftIconList(),"Left");
        this.populateIconMenu(menu,node.getRightIconList(),"Right");
        menu.addItem('Edit label', 'resources/images/text24.png', function(){
				graph.startEditingAtCell(node.view.namenode);
        });
        menu.addItem('Show/Hide Description','resources/images/view24.png',function(){node.toggleDropDown();});
        if(node.linkedWF!=null)menu.addItem('Go To Linked Workflow','resources/images/enterlinked24.png',function(){
            var linkedWF = node.linkedWF;
            if(linkedWF!=null)p.changeActive(p.workflows.indexOf(p.getWFByID(linkedWF)));
        });
        this.populateLinkedWFMenu(menu,node.getLinkedWFList());
        menu.addItem('Duplicate Node','resources/images/copy24.png',function(){
           node.duplicateNode(); 
        });
        menu.addItem('Delete Node','resources/images/delrect24.png',function(){
            if(mxUtils.confirm("Delete this node?")){
                graph.clearSelection();
                node.deleteSelf();
                node.wf.makeUndo("Delete Node",node);
            }
        });
    }
    
    populateIconMenu(menu,iconArray,icon){
        var node = this.node;
        if(iconArray==null||iconArray.length==0)return;
        var sub = menu.addItem(icon+" Icon",'resources/images/'+icon.toLowerCase()+'icon24.png');
        for(var i=0;i<iconArray.length;i++){
            var tempfunc = function(value){
                menu.addItem(value.text,iconpath+value.value+'24.png',function(){
                    node.setIcon(value.value,icon.toLowerCase());
                },sub);
            }
            tempfunc(iconArray[i]);
        }
    }
    
    populateLinkedWFMenu(menu,WFArray){
        var node = this.node;
        if(WFArray==null)return;
        var sub = menu.addItem("Set Linked WF",'resources/images/plusblack24.png');
        menu.addItem("None",'',function(){node.setLinkedWF("");},sub)
        for(var i=0;i<WFArray.length;i++){
            var tempfunc = function(value){
                menu.addItem(value[0],'',function(){
                    node.setLinkedWF(value[1]);
                },sub);
            }
            tempfunc(WFArray[i]);
        }
        menu.addItem("Create new "+node.getAcceptedWorkflowType(),'',function(){
            node.setLinkedWF("NEW_"+node.getAcceptedWorkflowType());
        },sub);
    }
    
    fixedLinkAdded(link,edge){
        link.view = new WFLinkview(this.graph,link);
        link.view.vertex=edge;
        if(edge==null)link.redraw();
        else{
            link.view.addValuesToVertex();
        }
        link.view.addDelOverlay();
    }
    
    
    

    
}


class WFLinkview{
    constructor(graph,link){
        this.link=link;
        this.graph=graph;
        this.vertex;
    }
    
    getPortStyle(){
        if(this.vertex!=null){
            var portStyle = "";
            var styleString = this.vertex.style;
            var spi = styleString.indexOf("sourcePort");
            if(spi>=0)portStyle+=styleString.substring(spi,styleString.indexOf(";",spi)+1);
            var tpi = styleString.indexOf("targetPort");
            if(tpi>=0)portStyle+=styleString.substring(tpi,styleString.indexOf(";",tpi)+1);
            return portStyle;
        }
    }
    
    populateMenu(menu){
        var graph = this.graph;
        var p = this.link.node.wf.project;
        var link=this.link;
        menu.addItem('Edit label', 'resources/images/text24.png', function(){
				graph.startEditingAtCell(link.view.vertex);
        });
        menu.addItem('Toggle Dashed','resources/images/dashed24.png',function(){
            if(link.style!="dashed")link.changeStyle("dashed"); 
            else(link.changeStyle(null));
        });
        menu.addItem('Delete Link','resources/images/delrect24.png',function(){
            if(mxUtils.confirm("Delete this link?")){
                graph.clearSelection();
                link.deleteSelf();
                link.node.wf.makeUndo("Delete Link",link);
            }
        });
    }
    
    addValuesToVertex(){
        var link = this.link;
        this.vertex.isLink = true;
        this.vertex.link = link;
        
        this.vertex.valueChanged = function(value){
            var value1 = link.setTextSilent(value);
            if(value1!=value)link.view.graph.getModel().setValue(link.view.vertex,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
        }
    }
    
    redraw(){
        var link = this.link;
        if(this.vertex!=null){this.graph.removeCells([this.vertex]);}
        if(link.id==null)return;
        var style = defaultEdgeStyle;
        switch(link.style){
            case "dashed":
                style+="dashed=1;";
                break;
        }
        style += link.getPortStyle();
        this.vertex = this.graph.insertEdge(this.graph.getDefaultParent(),null,link.text,link.node.view.vertex,link.targetNode.view.vertex,style);
        this.addValuesToVertex();
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        if(this.vertex.cellOverlays==null)this.vertex.cellOverlays=[];
        var n = this.link;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), 'Delete this link');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-bounds.height/2;
            bounds.x = pt.x-bounds.width/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            graph.clearSelection();
            n.deleteSelf();
            n.node.wf.makeUndo("Delete Link",n);
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
    
    deleted(){
        this.graph.removeCells([this.vertex]);
    }
    
    
    
}

class WFAutolinkview extends WFLinkview{
    populateMenu(menu){
        var graph = this.graph;
        var p = this.link.node.wf.project;
        var link=this.link;
        menu.addItem('Delete Link','resources/images/delrect24.png',function(){
            if(mxUtils.confirm("This is the automatically generated link for this node. If deleted, this will prevent the node from automatically linking to that below it. Do you want to proceed?")){
                graph.clearSelection();
                link.deleteSelf();
                link.node.wf.makeUndo("Delete Link",link);
            }
        });
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        if(this.vertex.cellOverlays==null)this.vertex.cellOverlays=[];
        var n = this.link;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), 'Delete this link');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-bounds.height/2;
            bounds.x = pt.x-bounds.width/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            if(mxUtils.confirm("This is the automatically generated link for this node. If deleted, this will prevent the node from automatically linking to that below it. Do you want to proceed?")){
                graph.clearSelection();
                n.deleteSelf();
                n.node.wf.makeUndo("Delete Link",n);
            }
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
}
