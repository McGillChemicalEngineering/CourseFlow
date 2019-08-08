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
    }
    
    setColumn(col){
        if(this.column!=col){
            this.column=col;
            this.updateColumn();
        }
    }
    
    
    setName(name){
        this.name=name;
        if(name!=null)this.graph.cellLabelChanged(this.namenode,name);
    }
    
    setText(text){
        this.text=text;
        if(text!=null)this.graph.cellLabelChanged(this.textnode,text);
        
    }
    
    setLinkedWF(value){
        if(value=="")value=null;
        if(value!=this.linkedWF){
            if(this.linkedWF!=null){
                this.wf.removeUsedWF(this.linkedWF);
                this.wf.project.removeChild(this.wf,this.wf.project.getWFByID(this.linkedWF));
            }
            this.linkedWF = value;
            if(value!=null){
                this.wf.addUsedWF(value);
                this.wf.project.addChild(this.wf,this.wf.project.getWFByID(value));
            }
        }
        
    }
    
    setIcon(value,icon){
        if(icon=="left")this.setLeftIcon(value);
        if(icon=="right")this.setRightIcon(value);
    }
    
    setLeftIcon(value){
        this.lefticon=value;
        if(value!=null)this.graph.setCellStyles("image",iconpath+value+".png",[this.lefticonnode]);
        else this.graph.setCellStyles("image",null,[this.lefticonnode]);
    }
    setRightIcon(value){
        this.righticon=value;
        if(value!=null)this.graph.setCellStyles("image",iconpath+value+".png",[this.righticonnode]);
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
        if(index==0) this.moveNode(0,this.week.box.y()+cellSpacing-this.vertex.y());
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
        this.week.resizeWeek(dy);
        var thisIndex = this.week.nodes.indexOf(this);
        if(thisIndex<this.week.nodes.length-1)this.week.pushNodes(thisIndex+1);
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
        this.vertex.cellOverlays=[];
        this.addPlusOverlay();
        this.addDelOverlay();
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
        for(var i=0;i<this.brackets.length;i++)this.brackets[i].cellRemoved(this);
        this.week.removeNode(this);
        if(this.autoLinkOut.targetNode!=null)this.autoLinkOut.targetNode.makeAutoLinks();
        this.graph.removeCells([this.vertex]);
    }
    
    insertBelow(){
        var node = this.wf.createNodeOfType(this.column);
        node.createVertex(this.vertex.x(),this.vertex.y());
        node.setColumn(this.column);
        node.setWeek(this.week);
        this.week.addNode(node,0,this.week.nodes.indexOf(this)+1);
    }
    
    getVertexStyle(){return '';}
    
    addPlusOverlay(){
        var n = this;
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
            }
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
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
    
    makeAutoLinks(){
        this.autoLinkSameType();
        return true;
    }
    
    styleForColumn(){
        var colstyle='#E5FFE5';
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
    
    makeAutoLinks(){
        this.autoLinkSameType();
        return true;
    }
    
    styleForColumn(){
        var colstyle='#E5FFE5';
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    
}

class ASNode extends CFNode {
    setColumn(col){
        if(this.column!=col&&(col=="FA"||col=="SA")){
            this.column=col;
            this.updateColumn();
        }
    }
    
    styleForColumn(){
        var colstyle="#FFFFFF";
        if(this.column=="FA")colstyle='#C4DAFF';
        else if(this.column=="SA")colstyle='#FFE5E5';
        this.graph.setCellStyles("fillColor",colstyle,[this.vertex]);
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
        if(this.column=="OOC")colstyle='#C4DAFF';
        else if(this.column=="ICI")colstyle='#FFE5E5';
        else if(this.column=="ICS")colstyle='#E5FFE5';
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