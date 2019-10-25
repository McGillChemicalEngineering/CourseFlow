//The node and link classes, as well as the many extensions of each node. Each distinct node type is a separate extension of the base class, characterized by the ways in which it differs from default behaviours.

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

class CFNode {
    constructor(graph,wf){
        this.vertex;
        this.lefticon;
        this.righticon;
        this.lefticonnode;
        this.righticonnode;
        this.name;
        this.namenode;
        this.column;
        this.week;
        this.text;
        this.textnode;
        this.dropNode;
        this.textHeight=100;
        this.isDropped=false;
        this.graph=graph;
        this.wf=wf;
        this.linkedWF;
        this.id = this.wf.project.genID();
        this.autoLinkOut = new WFLink(this,graph);
        this.autoLinkOut.portStyle="sourcePort=HIDDENs;targetPort=INn;";
        this.fixedLinksOut=[];
        this.brackets=[];
        this.tags=[];
        this.tagVertices=[];
        this.tagPreviews=[];
    }
    
    makeAutoLinks(){return false;}
    
    addFixedLinkOut(target,edge=null){
        var link = new WFLink(this,this.graph,edge);
        link.setTarget(target);
        if(edge==null)link.redraw();
        link.addDelOverlay();
        this.fixedLinksOut.push(link)
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"name");
        xml+=makeXML(this.id,"id");
        xml+=makeXML(this.lefticon,"lefticon");
        xml+=makeXML(this.righticon,"righticon");
        xml+=makeXML(this.column,"column");
        xml+=makeXML(this.text,"textHTML");
        xml+=makeXML(this.linkedWF,"linkedwf");
        xml+=makeXML(this.textHeight,"textheight");
        if(this.isDropped)xml+=makeXML("true","isdropped");
        var linksOut =[];
        var linkOutPorts=[];
        for(var i=0;i<this.fixedLinksOut.length;i++){
            if(this.fixedLinksOut[i].targetNode!=null){
                linksOut.push(this.fixedLinksOut[i].targetNode.id);
                linkOutPorts.push(this.fixedLinksOut[i].getPortStyle());
            }
        }
        xml+=makeXML(linksOut,"fixedlinkARRAY");
        xml+=makeXML(linkOutPorts,"linkportARRAY");
        var tagArray=[];
        for(i=0;i<this.tags.length;i++){
            tagArray.push(this.tags[i].id);
        }
        xml+=makeXML(tagArray.join(","),"tagARRAY");
        return makeXML(xml,"node");
    }
    
    fromXML(xml){
        this.createVertex(0,0);
        this.setName(getXMLVal(xml,"name"));
        this.id = getXMLVal(xml,"id");
        this.setColumn(getXMLVal(xml,"column"));
        this.setText(getXMLVal(xml,"textHTML"));
        this.setLeftIcon(getXMLVal(xml,"lefticon"));
        this.setRightIcon(getXMLVal(xml,"righticon"));
        this.linkedWF = getXMLVal(xml,"linkedwf");
        var textHeight =getXMLVal(xml,"textheight");
        if(textHeight!=null)this.textHeight=int(textHeight);
        var linksOut = getXMLVal(xml,"fixedlinkARRAY");
        var linkOutPorts = getXMLVal(xml,"linkportARRAY");
        for(var i=0;i<linksOut.length;i++){
            var link = new WFLink(this,this.graph);
            link.id=linksOut[i];
            if(linkOutPorts[i]!=null)link.portStyle=linkOutPorts[i];
            this.fixedLinksOut.push(link);
        }
        var tagArray = getXMLVal(xml,"tagARRAY");
        if(tagArray!=null)for(i=0;i<tagArray.length;i++){
            this.addTag(this.wf.getTagByID(tagArray[i]),false);
        }
        
        
        
    }
    
    setColumn(col){
        if(this.column!=col){
            this.column=col;
            this.updateColumn();
        }
    }
    
    
    setName(name){
        if(name!=null){
            name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
            this.graph.cellLabelChanged(this.namenode,name);
        }
    }
    
    setText(text){
        this.text=text;
        if(text!=null)this.graph.cellLabelChanged(this.textnode,text);
        
    }
    
    setLinkedWF(value){
        var autoswitch=false;
        if(value=="")value=null;
        else if(value!=null&&value.substr(0,3)=="NEW"){
            value = this.wf.project.addWorkflow(value.substr(value.indexOf("_")+1)).id;
            autoswitch=true;
        }
        var oldvalue = null;
        if(value!=this.linkedWF){
            if(this.linkedWF!=null){
                var oldwf = this.wf.project.getWFByID(this.linkedWF)
                oldvalue = oldwf.name;
                this.wf.removeChild(oldwf);
                
            }
            this.linkedWF = value;
            if(value!=null){
                var wfc = this.wf.project.getWFByID(value);
                this.wf.addChild(wfc);
                if(this.name==null||this.name==""||this.name==oldvalue)this.setName(wfc.name);
                if(autoswitch)wfc.project.changeActive(wfc.project.workflows.indexOf(wfc));
            }
        }
        
    }
    
    setIcon(value,icon){
        if(icon=="left")this.setLeftIcon(value);
        if(icon=="right")this.setRightIcon(value);
    }
    
    setLeftIcon(value){
        this.lefticon=value;
        if(value!=null)this.graph.setCellStyles("image",iconpath+value+"48.png",[this.lefticonnode]);
        else this.graph.setCellStyles("image",null,[this.lefticonnode]);
    }
    setRightIcon(value){
        this.righticon=value;
        if(value!=null)this.graph.setCellStyles("image",iconpath+value+"48.png",[this.righticonnode]);
        else this.graph.setCellStyles("image",null,[this.righticonnode]);
    }
    
    setWeek(week){
        this.week=week;
    }
    
    changeWeek(y){
        var weekIndex=this.wf.weeks.indexOf(this.week);
        this.week.removeNode(this,y);
        this.week=this.wf.weeks[weekIndex+y];
        this.week.addNode(this,y,0);
        
    }
    
    getLeftIconList(){return null;}
    getRightIconList(){return null;}
    
    makeFlushWithAbove(index){
        if(index==0) this.moveNode(0,this.week.box.y()+2*cellSpacing-this.vertex.y());
        else this.moveNode(0,this.week.nodes[index-1].vertex.b()+cellSpacing-this.vertex.y());
    }
    
    moveNode(dx,dy){
        this.graph.moveCells([this.vertex],dx,dy);
        for(var i=0;i<this.brackets.length;i++){this.brackets[i].updateVertical();}
        //this.redrawLinks();
    }
    
    updateColumn(){
        this.graph.moveCells([this.vertex],this.wf.getColPos(this.column)-this.vertex.w()/2-this.vertex.x(),0);
        this.styleForColumn();
    }
    
    resizeBy(dy){
        
        if(this.isDropped&&this.textHeight+dy>0)this.textHeight=this.textHeight+dy;
        this.resizeChild(this.textnode,dy);
        this.graph.moveCells([this.dropNode],0,dy);
        this.week.resizeWeek(dy,0);
        var thisIndex = this.week.nodes.indexOf(this);
        if(thisIndex<this.week.nodes.length-1)this.week.pushNodesFast(thisIndex+1,-1,dy);
        for(var i=0;i<this.brackets.length;i++){this.brackets[i].updateVertical();}
    }
    
    resizeChild(box,dy){
        var rect = new mxRectangle(box.x(),box.y(),box.w(),box.h()+dy);
        this.graph.resizeCells([box],[rect]);
    }
    
    styleForColumn(){}
    
    createVertex(x,y){
        this.vertex=this.graph.insertVertex(this.graph.getDefaultParent(),null,'',x,y,defaultCellWidth,minCellHeight+cellDropdownHeight+cellDropdownPadding,this.getVertexStyle());
        this.vertex.isNode=true;
        this.vertex.node=this;
        this.addRightIcon();
        this.addLeftIcon();
        var left = 0;
        var width = defaultCellWidth;
        if(this.righticonnode!=null){width-=this.righticonnode.w()+2*defaultIconPadding;}
        if(this.lefticonnode!=null){left+=this.lefticonnode.w()+2*defaultIconPadding;width-=this.lefticonnode.w()+2*defaultIconPadding;}
        this.namenode = this.graph.insertVertex(this.vertex,null,'Click to edit',left,0,width,minCellHeight,defaultNameStyle);
        this.textnode = this.graph.insertVertex(this.vertex,null,'',defaultTextPadding,this.namenode.b(),this.vertex.w()-2*defaultTextPadding,1,defaultTextStyle);
        this.dropNode = this.graph.insertVertex(this.vertex,null,'',0,this.namenode.b()+cellDropdownPadding,defaultCellWidth,cellDropdownHeight,defaultDropDownStyle);
        this.dropNode.isDrop = true;
        this.dropNode.node = this;
        this.tagBox = this.graph.insertVertex(this.vertex,null,'',this.vertex.w(),0,this.vertex.w(),this.vertex.h(),defaultTagBoxStyle);
        this.graph.toggleCells(false,[this.tagBox]);
        this.vertex.cellOverlays=[];
        this.addPlusOverlay();
        this.addDelOverlay();
        this.addCopyOverlay();
        this.vertex.setConnectable(true);
    }
    
    toggleDropDown(){
        var mult = 1;
        if(this.isDropped)mult=-1;
        this.graph.resizeCell(this.vertex,new mxGeometry(this.vertex.x(),this.vertex.y(),this.vertex.w(),this.vertex.h()+mult*this.textHeight));
        this.isDropped=(!this.isDropped);
        this.graph.setCellStyles('resizable',0+this.isDropped,[this.vertex]);
        if(!this.isDropped)this.graph.setCellStyles('image',"resources/images/droptriangle.png",[this.dropNode]);
        else this.graph.setCellStyles('image',"resources/images/droptriangleup.png",[this.dropNode]);
    }
    
    addRightIcon(){return null;}
    addLeftIcon(){return null;}
    
    deleteSelf(){
        this.setLinkedWF(null);
        for(var i=0;i<this.brackets.length;i++)this.brackets[i].cellRemoved(this);
        for(var i=0;i<this.tags.length;i++){
            this.tags[i].removeNode(this);
        }
        this.week.removeNode(this);
        if(this.autoLinkOut.targetNode!=null)this.autoLinkOut.targetNode.makeAutoLinks();
        this.graph.removeCells([this.vertex]);
    }
    
    insertBelow(){
        var node = this.wf.createNodeOfType(this.column);
        node.createVertex(this.vertex.x(),this.vertex.y());
        this.wf.bringCommentsToFront();
        node.setColumn(this.column);
        node.setWeek(this.week);
        this.week.addNode(node,0,this.week.nodes.indexOf(this)+1);
        this.wf.makeUndo("Add Node",node);
        return node;
    }
    
    duplicateNode(){
        var node = this.wf.createNodeOfType(this.column);
        node.setWeek(this.week);
        node.fromXML((new DOMParser).parseFromString(this.wf.project.assignNewIDsToXML(this.toXML()),"text/xml"));
        if(node.linkedWF!=null)node.linkedWF=null;
        this.week.addNode(node,0,this.week.nodes.indexOf(this)+1);
        this.wf.makeUndo("Add Node",node);
    }
    
    getVertexStyle(){return '';}
    
    addPlusOverlay(){
        var n = this;
        var overlay = new mxCellOverlay(new mxImage('resources/images/add48.png', 24, 24), 'Insert node below');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x+n.vertex.w()/2 - bounds.width;
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
        var n = this;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 24, 24), 'Delete this node');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-n.vertex.h()/2;
            bounds.x = pt.x-bounds.width+n.vertex.w()/2;
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
        var n = this;
        var overlay = new mxCellOverlay(new mxImage('resources/images/copy48.png', 24, 24), 'Duplicate node');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.x = pt.x-bounds.width+n.vertex.w()/2;
            bounds.y = pt.y-n.vertex.h()/2+24;
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
    
    
    populateMenu(menu,cell){
        var graph = this.graph;
        if(cell==this.lefticonnode)this.populateIconMenu(menu,this.getLeftIconList(),"left");
        else if (cell==this.righticonnode)this.populateIconMenu(menu,this.getRightIconList(),"right");
        /*else if (cell==this.namenode)menu.addItem('Edit label', 'resources/images/text24.png', function(){
				graph.startEditingAtCell(cell);
        });*/
    }
    
    populateIconMenu(menu,iconArray,icon){
        var node = this;
        for(var i=0;i<iconArray.length;i++){
            var tempfunc = function(value){
                menu.addItem(iconArray[i][0],iconpath+value+'24.png',function(){
                    node.setIcon(value,icon);
                });
            }
            tempfunc(iconArray[i][1]);
        }
    }
    
    getLinkedWFList(){}

    getAcceptedWorkflowType(){return "";}
    
    redrawLinks(){
        this.autoLinkOut.redraw();
        //for(var i=0;i<this.fixedLinksOut.length;i++){this.fixedLinksOut[i].redraw();}
    }
    
    autoLinkNodes(n1,n2){
        if(n1==null)return;
        if(n2==null)n1.autoLinkOut.setTarget(null);
        else if(n1.autoLinkOut.id!=n2.id){
            n1.autoLinkOut.setTarget(n2);
        }
        n1.redrawLinks();
    }
    
    autoLinkSameType(){
        var next = this.wf.findNextNodeOfSameType(this,1);
        var last = this.wf.findNextNodeOfSameType(this,-1);
        
        this.autoLinkNodes(this,next);
        this.autoLinkNodes(last,this);
    }
    
    addBracket(br){
        this.brackets.push(br);
    }
    
    removeBracket(br){
        this.brackets.splice(this.brackets.indexOf(br),1);
    }
    
    addTag(tag,show=true){
        var n = this;
        this.tags.push(tag);
        tag.addNode(this);
        var tagLabel = this.graph.insertVertex(this.tagBox,null,tag.name,tagBoxPadding,tagBoxPadding,this.tagBox.w()-2*tagBoxPadding,tagHeight,defaultTagStyle);
        var colstyle = this.graph.getCellStyle(this.vertex)['fillColor'];
        this.graph.setCellStyles("strokeColor",colstyle,[tagLabel]);
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
            n.removeTag(tag);
            n.wf.makeUndo("Remove Tag",n);
        });
        tagLabel.cellOverlays = [overlay];
        var tagPreview = this.graph.insertVertex(this.vertex,null,'',tagBoxPadding+this.vertex.w(),tagHeight/2-2+(tagBoxPadding+tagHeight)*this.tagPreviews.length,4,4,defaultTagStyle);
        graph.orderCells(true,[tagPreview]);
        this.graph.setCellStyles("strokeColor",colstyle,[tagPreview]);
        this.tagVertices.push(tagLabel);
        this.tagPreviews.push(tagPreview);
        this.toggleTags(show);
    }
    
    removeTag(tag){
        var vertex = this.tagVertices[this.tags.indexOf(tag)];
        this.tagVertices.splice(this.tags.indexOf(tag),1);
        this.graph.removeCells([vertex,this.tagPreviews[this.tagPreviews.length-1]]);
        this.tags.splice(this.tags.indexOf(tag),1);
        this.tagPreviews.pop();
        tag.removeNode(this);
    }
    
    toggleTags(show){
        if(show){
            for(var i=0;i<this.tagVertices.length;i++){
                this.graph.moveCells([this.tagVertices[i]],0,(tagHeight+tagBoxPadding)*i-this.tagVertices[i].y());
            }
            var bounds = this.tagBox.getGeometry();
            bounds.height = this.tagVertices.length*(tagHeight+tagBoxPadding);

            this.graph.resizeCells([this.tagBox],bounds);
            this.graph.orderCells(false,[this.vertex]);
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
    
}

class ACNode extends CFNode {
    
    setColumn(col){
        this.column="AC";
        this.updateColumn();
    }
    
    addLeftIcon(){
        this.lefticonnode = this.graph.insertVertex(this.vertex,null,'',defaultIconPadding,0,defaultIconWidth,minCellHeight,defaultIconStyle);
        
    }
    
    getLeftIconList(){
        return strategyIconsArray;
    }
    
    
    getLinkedWFList(){
        var wfs = this.wf.project.workflows;
        var list=[];
        for(var i=0;i<wfs.length;i++){
            if( wfs[i] instanceof Activityflow)list.push([wfs[i].name,wfs[i].id]);
        }
        return list;
    }
    
    getAcceptedWorkflowType(){return "activity";}
    
    makeAutoLinks(){
        //this.autoLinkSameType();
        //return true;
        return false;
    }
    
    styleForColumn(){
        var colstyle=SALTISEGREEN;
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    
}

class CONode extends CFNode {
    
    setColumn(col){
        this.column="CO";
        this.updateColumn();
    }
    
    
    
    getLinkedWFList(){
        var wfs = this.wf.project.workflows;
        var list=[];
        for(var i=0;i<wfs.length;i++){
            if( wfs[i] instanceof Courseflow)list.push([wfs[i].name,wfs[i].id]);
        }
        return list;
    }
    
    
    getAcceptedWorkflowType(){return "course";}
    
    makeAutoLinks(){
        //this.autoLinkSameType();
        //return true;
        return false;
    }
    
    styleForColumn(){
        var colstyle=SALTISEGREEN;
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    
}

class ASNode extends CFNode {
    setColumn(col){
        if(this.column!=col&&(col=="FA"||col=="SA"||col=="HW")){
            this.column=col;
            this.updateColumn();
        }
    }
    
    styleForColumn(){
        var colstyle="#FFFFFF";
        if(this.column=="FA")colstyle=SALTISEORANGE;
        else if(this.column=="SA")colstyle=SALTISERED;
        else if(this.column=="HW")colstyle=SALTISELIGHTBLUE;
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
        this.graph.setCellStyles("strokeColor",colstyle,this.tagVertices.concat(this.tagPreviews));
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
}

class LONode extends CFNode {
    setColumn(col){
        this.column="LO";
        this.updateColumn();
    }
    
    styleForColumn(){
        var colstyle="#FFFFFF";
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
}

class WFNode extends CFNode {
    addLeftIcon(){
        this.lefticonnode = this.graph.insertVertex(this.vertex,null,'',defaultIconPadding,0,defaultIconWidth,minCellHeight,defaultIconStyle);
        
    }
    
    getLeftIconList(){
        return contextIconsArray;
    }
    
    addRightIcon(){
        this.righticonnode = this.graph.insertVertex(this.vertex,null,'',this.vertex.w()-defaultIconWidth-defaultIconPadding,0,defaultIconWidth,minCellHeight,defaultIconStyle);
        
    }
    
    getRightIconList(){
        return taskIconsArray;
    }
    
    styleForColumn(){
        var colstyle="#FFFFFF";
        if(this.column=="OOC")colstyle=SALTISELIGHTBLUE;
        else if(this.column=="ICI")colstyle=SALTISEORANGE;
        else if(this.column=="ICS")colstyle=SALTISEGREEN;
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    makeAutoLinks(){
        this.autoLinkSameType();
        return true;
    }
    
}

class WFLink{
    constructor(node,graph,vertex){
        this.node=node;
        this.id;
        this.portStyle=null;
        this.vertex=vertex;
        this.targetNode;
        this.graph=graph;
    }
    
    setTarget(node){
        this.targetNode = node;
        if(node==null)this.id=null;
        else this.id = node.id;
    }
    
    getPortStyle(){
        if(this.portStyle!=null)return this.portStyle;
        if(this.vertex!=null){
            var portStyle = "";
            var styleString = this.vertex.style;
            var spi = styleString.indexOf("sourcePort");
            if(spi>=0)portStyle+=styleString.substring(spi,styleString.indexOf(";",spi)+1);
            var tpi = styleString.indexOf("targetPort");
            if(tpi>=0)portStyle+=styleString.substring(tpi,styleString.indexOf(";",tpi)+1);
            this.portStyle=portStyle;
            return portStyle;
        }
        return "";
    }
    
    redraw(){
        if(this.vertex!=null){this.graph.removeCells([this.vertex]);}
        if(this.id==null)return;
        if(this.targetNode==null) {
            this.targetNode = this.node.wf.findNodeById(this.id);
            //if the node is still null after this the connection is probably garbage (for example a connection to a node that has been destroyed).
            if(this.targetNode==null){this.id=null;return;}
        }
        this.vertex = this.graph.insertEdge(this.graph.getDefaultParent(),null,'',this.node.vertex,this.targetNode.vertex,defaultEdgeStyle+this.getPortStyle());
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        if(this.vertex.cellOverlays==null)this.vertex.cellOverlays=[];
        var n = this;
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
            n.deleteSelf();
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
    
    deleteSelf(){
        this.graph.removeCells([this.vertex]);
        this.node.fixedLinksOut.splice(this.node.fixedLinksOut.indexOf(this),1);
    }
    
    
}