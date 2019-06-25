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
        this.graph=graph;
        this.wf=wf;
        this.linkedWF;
        this.id = this.wf.project.genID();
        this.autoLinkOut = new WFLink(this,graph);
        this.fixedLinksOut=[];
    }
    
    makeAutoLinks(){return false;}
    
    addFixedLinkOut(target){
        var link = new WFLink(this,this.graph);
        link.setTarget(target);
        link.redraw();
        this.fixedLinksOut.push(link)
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"name");
        xml+=makeXML(this.id,"id");
        xml+=makeXML(this.lefticon,"lefticon");
        xml+=makeXML(this.righticon,"righticon");
        xml+=makeXML(this.column,"column");
        xml+=makeXML(this.text,"text");
        xml+=makeXML(this.linkedWF,"linkedwf");
        var linksOut =[];
        for(var i=0;i<this.fixedLinksOut.length;i++)if(this.fixedLinksOut[i].id!=null)linksOut.push(this.fixedLinksOut[i].id);
        xml+=makeXML(linksOut,"fixedlinkARRAY");
        return makeXML(xml,"node");
    }
    
    fromXML(xml){
        this.createVertex(0,0);
        this.setName(getXMLVal(xml,"name"));
        this.id = getXMLVal(xml,"id");
        this.setColumn(getXMLVal(xml,"column"));
        this.setText(getXMLVal(xml,"text"));
        this.setLeftIcon(getXMLVal(xml,"lefticon"));
        this.setRightIcon(getXMLVal(xml,"righticon"));
        this.linkedWF = getXMLVal(xml,"linkedwf");
        var linksOut = getXMLVal(xml,"fixedlinkARRAY");
        for(var i=0;i<linksOut.length;i++){
            var link = new WFLink(this,this.graph);
            link.id=linksOut[i];
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
        
    }
    
    setLinkedWF(value){
        if(value=="")value=null;
        if(value!=this.linkedWF){
            if(value==null){
                this.wf.project.removeChild(this.wf,this.wf.project.getWFByID(this.linkedWF));
            }else{
                if(this.linkedWF!=null){
                    this.wf.removeUsedWF(this.linkedWF);
                    this.wf.project.removeChild(this.wf,this.wf.project.getWFByID(this.linkedWF));
                }
                this.linkedWF = value;
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
        //this.redrawLinks();
    }
    
    updateColumn(){
        this.graph.moveCells([this.vertex],this.wf.getColPos(this.column)-this.vertex.w()/2-this.vertex.x(),0);
        this.styleForColumn();
    }
    
    resizeBy(dy){
        if(this.lefticonnode!=null)this.resizeChild(this.lefticonnode,dy);
        if(this.righticonnode!=null)this.resizeChild(this.righticonnode,dy);
        this.resizeChild(this.namenode,dy);
        this.week.resizeWeek(dy);
        var thisIndex = this.week.nodes.indexOf(this);
        if(thisIndex<this.week.nodes.length-1)this.week.pushNodes(thisIndex+1);
    }
    
    resizeChild(box,dy){
        var rect = new mxRectangle(box.x(),box.y(),box.w(),box.h()+dy);
        this.graph.resizeCells([box],[rect]);
    }
    
    styleForColumn(){}
    
    createVertex(x,y){
        this.vertex=this.graph.insertVertex(this.graph.getDefaultParent(),null,'',x,y,defaultCellWidth,minCellHeight,this.getVertexStyle());
        this.vertex.isNode=true;
        this.vertex.node=this;
        this.addRightIcon();
        this.addLeftIcon();
        var left = 0;
        var width = defaultCellWidth;
        if(this.righticonnode!=null){width-=this.righticonnode.w()+2*defaultIconPadding;}
        if(this.lefticonnode!=null){left+=this.lefticonnode.w()+2*defaultIconPadding;width-=this.lefticonnode.w()+2*defaultIconPadding;}
        this.namenode = this.graph.insertVertex(this.vertex,null,'Click to edit',left,0,width,minCellHeight,textStyle);
        this.addPlusOverlay();
        this.addDelOverlay();
        this.vertex.setConnectable(true);
    }
    
    addRightIcon(){return null;}
    addLeftIcon(){return null;}
    
    deleteSelf(){
        this.week.removeNode(this);
        this.graph.removeCells([this.vertex,this.righticonnode,this.lefticonnode,this.namenode]);
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
        this.graph.addCellOverlay(this.vertex, overlay);
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        var n = this;
        var overlay = new mxCellOverlay(new mxImage('resources/images/del48.png', 24, 24), 'Delete this node');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-bounds.width/2-n.vertex.h()/2;
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
        n.graph.addCellOverlay(n.vertex, overlay);
    }
    
    populateMenu(menu,cell){
        var graph = this.graph;
        if(cell==this.lefticonnode)this.populateIconMenu(menu,this.getLeftIconList(),"left");
        else if (cell==this.righticonnode)this.populateIconMenu(menu,this.getRightIconList(),"right");
        else if (cell==this.namenode)menu.addItem('Edit label', 'resources/images/text24.png', function(){
				graph.startEditingAtCell(cell);
        });
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
    constructor(node,graph){
        this.node=node;
        this.id;
        this.vertex;
        this.targetNode;
        this.graph=graph;
    }
    
    setTarget(node){
        this.targetNode = node;
        if(node==null)this.id=null;
        else this.id = node.id;
    }
    
    redraw(){
        if(this.vertex!=null){this.graph.removeCells([this.vertex]);}
        if(this.id==null)return;
        if(this.targetNode==null) {
            this.targetNode = this.node.wf.findNodeById(this.id);
            //if the node is still null after this the connection is probably garbage (for example a connection to a node that has been destroyed).
            if(this.targetNode==null){this.id=null;return;}
        }
        this.vertex = this.graph.insertEdge(this.graph.getDefaultParent(),null,'',this.node.vertex,this.targetNode.vertex,"editable=0;edgeStyle=orthogonalEdgeStyle;strokeColor=black;");
    }
    
    
}