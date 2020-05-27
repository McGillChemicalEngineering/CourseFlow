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
        this.timeNode;
        this.graph=graph;
        if(this.node.autoLinkOut)this.node.autoLinkOut.view = new WFAutolinkview(graph,this.node.autoLinkOut);
        this.tagPreview;
        
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
        var name = LANGUAGE_TEXT.node.defaulttext[USER_LANGUAGE];
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
        if(this.node.isDropped)dropDownStyle+="image=resources/images/droptriangleup.png;fontColor=white;";
        else dropDownStyle+="image=resources/images/droptriangle.png;fontColor=black;";
        var dropText='';
        if(text!=null&&text.replace(/(<p\>|<\/p>|<br>|\n| |[^a-zA-Z0-9])/g,'')!='')dropText='...';
        this.dropNode = this.graph.insertVertex(this.vertex,null,dropText,0,this.textnode.b()-1+cellDropdownPadding,this.vertex.w(),cellDropdownHeight,dropDownStyle);
        this.dropNode.isDrop = true;
        this.dropNode.node = this.node;
        var linkStyle = defaultLinkIconStyle;
        if(node.linkedWF!=null)linkStyle+="image=resources/images/wflink16.png;";
        this.linkIcon = this.graph.insertVertex(this.dropNode,null,'',this.dropNode.r()-24,2,16,16,linkStyle);
        var timeadj = 0;
        if(window.navigator.userAgent.match("Chrome"))timeadj=-2;
        this.timeNode = this.graph.insertVertex(this.vertex,null,this.node.getTimeString(),this.dropNode.x(),this.dropNode.y()+timeadj,this.dropNode.w()-28,this.dropNode.h(),defaultTimeStyle);
        this.timeNode.isDrop=true;
        this.timeNode.node = this.node;
        this.tagBoxDiv = document.createElement('div');
        this.tagBoxDiv.className = "tagboxdiv";
        this.node.wf.view.container.appendChild(this.tagBoxDiv);
        this.tagPreview = this.graph.insertVertex(this.vertex,null,'',tagBoxPadding+this.vertex.w(),0,tagHeight,tagHeight,defaultTagPreviewStyle+this.node.getColumnStyle());
        this.tagPreview.cellOverlays=[];
        this.tagPreview.isTagPreview=true;
        this.tagPreview.node=this.node;
        this.graph.orderCells(true,[this.tagPreview]);
        if(this.node.tags.length<1)this.graph.toggleCells(false,[this.tagPreview]);
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
        var text = this.node.text;
        this.graph.cellLabelChanged(this.textnode,text);
        if(text!=null&&text.replace(/(<p\>|<\/p>|<br>|\n| |[^a-zA-Z0-9])/g,'')!='')this.graph.cellLabelChanged(this.dropNode,'...');
        else this.graph.cellLabelChanged(this.dropNode,'');
    }
    
    addRightIcon(){
        if(this.node.getIconCategory("right")){
            var style = defaultIconStyle;
            if(this.node.righticon){
                style+="image="+iconpath+this.node.righticon+"48.png;";
                this.node.wf.view.legendUpdate(this.node.getIconCategory("right"),this.node.righticon,null);
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
        if(value&&!oldvalue){
            this.graph.setCellStyles("image","resources/images/wflink16.png",[this.linkIcon]);
        }
        else if(oldvalue&&!value){
            this.graph.setCellStyles("image",null,[this.linkIcon]);
        }
    }
    
    moveNode(dx,dy){
        this.graph.moveCells([this.vertex],dx,dy);
        for(var i=0;i<this.node.brackets.length;i++){this.node.brackets[i].view.updateVertical();}
        this.tagBoxDiv.style.display="none";
    }
    
    columnUpdated(){
        this.graph.moveCells([this.vertex],this.node.wf.view.getColPos(this.node.column)-this.vertex.w()/2-this.vertex.x(),0);
        this.styleForColumn();
        for(var i=0;i<this.node.tags.length;i++)this.node.tags[i].tag.view.updateDrops();
    }
    
    styleForColumn(){
        var colstyle = this.node.getColumnStyle();
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
        this.tagBoxDiv.style.border = "3px solid "+colstyle;
        this.graph.setCellStyles("strokeColor",colstyle,[this.tagPreview]);
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
        this.graph.moveCells([this.timeNode],0,dy);
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
        if(this.node.isDropped){
            this.graph.setCellStyles('image',"resources/images/droptriangle.png",[this.dropNode]);
            this.graph.setCellStyles('fontColor','black',[this.dropNode]);
        }else {
            this.graph.setCellStyles('image',"resources/images/droptriangleup.png",[this.dropNode]);
            this.graph.setCellStyles('fontColor','white',[this.dropNode]);
        }
        
    }
    
    insertBelow(node){
        node.view = new this.constructor(this.graph,node);
        node.view.insertedBelow(this.node);
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
        var overlay = new mxCellOverlay(new mxImage('resources/images/add48.png', 24, 24), LANGUAGE_TEXT.node.createbelow[USER_LANGUAGE]);
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
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), LANGUAGE_TEXT.node.delete[USER_LANGUAGE]);
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
            if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deletenode[USER_LANGUAGE])){
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
        var overlay = new mxCellOverlay(new mxImage('resources/images/copy48.png', 24, 24), LANGUAGE_TEXT.node.duplicate[USER_LANGUAGE]);
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
    
    
    
    
    tagAdded(nodeTag,show){
        this.graph.toggleCells(true,[this.tagPreview]);
        nodeTag.view = new NodeTagView(nodeTag);
        nodeTag.view.makeVertex(this.tagBoxDiv);
        if(show)nodeTag.view.positionSelf();
        this.graph.cellLabelChanged(this.tagPreview,""+this.node.tags.length);
        this.toggleTags(show);
    }
    
    tagRemoved(nodeTag){
        var tag = nodeTag.tag;
        if(nodeTag.view){nodeTag.view.removed();}
        if(tag.view)tag.view.removeNode(this.node);
        if(this.node.tags.length<1)this.graph.toggleCells(false,[this.tagPreview]);
        this.graph.cellLabelChanged(this.tagPreview,this.node.tags.length);
    }
    
    toggleTags(show){
        this.graph.toggleCells(show,[this.tagBox]);
        if(show){
            this.tagBoxDiv.style.display = "inline-block";
            this.tagBoxDiv.style.left = this.vertex.r()-1+tagBoxPadding+"px";
            this.tagBoxDiv.style.top = this.vertex.y()-1+"px";
            this.sortTags();
        }else{
            this.tagBoxDiv.style.display = "none";
        }
    }
    
    sortTags(){
        console.log("Sorting");
        var allTags = [];
        for(var i=0;i<this.node.wf.tagSets.length;i++)allTags = this.node.wf.tagSets[i].getAllID(allTags);
        var nodeList = this.tagBoxDiv.childNodes;
        var arr = [].slice.call(nodeList);
        arr.sort(function(a,b){
            try{
                var tagA = a.button.layout.id;
                var tagB = b.button.layout.id;
                return allTags.indexOf(tagA)-allTags.indexOf(tagB);
                
            }catch(err){
                console.log("THERE WAS AN ERROR SORTING TAGS");
                return 0;
            }
            
        });
        for(var i=0;i<arr.length;i++){
            this.tagBoxDiv.appendChild(arr[i]);
        }
    }
    
    
    
    highlight(on){
        var gstate = this.graph.view.getState(this.vertex);
        if(gstate==null)return;
        var g = gstate.shape.node;
        if(g.firstChild!=null){
            if(on)g.firstChild.classList.add("highlighted");
            else g.firstChild.classList.remove("highlighted");
        }
    }
    
    mouseIn(){
        var node = this.node;
        for(var i=0;i<node.fixedLinksOut.length;i++){
            node.fixedLinksOut[i].view.highlight(true);
        }
    }
    
    mouseOut(){
        var node = this.node;
        for(var i=0;i<node.fixedLinksOut.length;i++){
            node.fixedLinksOut[i].view.highlight(false);
        }
    }
    
    selected(){
        var node = this.node;
        for(var i=0;i<node.fixedLinksOut.length;i++){
            node.fixedLinksOut[i].view.select(true);
        }
    }
    
    deselected(){
        var node = this.node;
        for(var i=0;i<node.fixedLinksOut.length;i++){
            node.fixedLinksOut[i].view.select(false);
        }
    }
    
    populateMenu(menu){
        var node=this.node;
        menu.addItem(LANGUAGE_TEXT.node.showhide[USER_LANGUAGE],'resources/images/view24.png',function(){node.toggleDropDown();});
        node.populateMenu(menu);
    }
    
    
    
    fixedLinkAdded(link,edge){
        link.view = new WFLinkview(this.graph,link);
        link.view.vertex=edge;
        if(edge==null)link.redraw();
        else{
            link.view.addValuesToVertex();
        }
        if(link.id)link.view.addDelOverlay();
    }
    
    startTitleEdit(){
        this.graph.startEditingAtCell(this.namenode);
    }
    
    timeUpdated(){
        this.graph.cellLabelChanged(this.timeNode,this.node.getTimeString());
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
        if(link.labelx!=null){
            this.vertex.geometry.y=0;
            this.vertex.geometry.x=link.labelx;
            this.vertex.valueChanged(link.text);
        }
        
        
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
    
    highlight(on){
        var gstate = this.graph.view.getState(this.vertex);
        if(gstate==null)return;
        var g = gstate.shape.node;
        if(g.firstChild!=null){
            for(var i=0;i<g.childNodes.length;i++){
                if(on)g.childNodes[i].classList.add("highlighted");
                else g.childNodes[i].classList.remove("highlighted");
            }
        }
    }
    
    select(on){
        var gstate = this.graph.view.getState(this.vertex);
        if(gstate==null)return;
        var g = gstate.shape.node;
        if(g.firstChild!=null){
            for(var i=0;i<g.childNodes.length;i++){
                if(on)g.childNodes[i].classList.add("selected");
                else g.childNodes[i].classList.remove("selected");
            }
        }
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

class NodeTagView{
    constructor(nodeTag,vertex){
        this.nodeTag=nodeTag;
    }
    
    makeVertex(container){
        this.vertex = this.nodeTag.tag.view.addNode(this.nodeTag,container);
        this.updateVertex();
    }
    
    updateVertex(){
        var completeness = this.nodeTag.degree;
        var str = "";
        if(this.nodeTag.node.wf.advancedOutcomes && (completeness & 1) == 0){
            this.vertex.csvtext="";
            if(completeness & 2){str+="<div class='firstoutcomelevel'>"+"I"+"</div>";}
            if(completeness & 4){str+="<div class='secondoutcomelevel'>"+"D"+"</div>";}
            if(completeness & 8){str+="<div class='thirdoutcomelevel'>"+"A"+"</div>";}
        }else{
            str="<img src='resources/images/check16.png'>"
        }
        if(this.vertex){
            this.vertex.updateButton(str,completeness);
        }
    }
    
    removed(){
        if(this.vertex)this.vertex.bdiv.parentElement.removeChild(this.vertex.bdiv);
    }
    
    positionSelf(){
        var buttons = this.vertex.bdiv.parentElement.childNodes;
        if(buttons.length<2)return;
        var allTags = [];
        for(var i=0;i<this.nodeTag.node.wf.tagSets.length;i++){
            this.nodeTag.node.wf.tagSets[i].getAllID(allTags);
        }
        var myIndex = allTags.indexOf(this.nodeTag.tag.id);
        for(var i=0;i<buttons.length;i++){
            var button = buttons[i].button;
            var tagID;
            if(button)tagID = button.layout.id;
            var tagIndex = allTags.indexOf(tagID);
            if(tagIndex>myIndex){
                this.vertex.bdiv.parentElement.insertBefore(this.vertex.bdiv,button.bdiv);
                break;
            }
            
        }
    }
}
