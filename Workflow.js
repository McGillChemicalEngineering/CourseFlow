
class Workflow{
    constructor(container,project){
        this.weeks=[];
        this.columns=[];
        this.usedWF=[];
        this.xmlData;
        this.project=project;
        this.graph;
        this.buttons=[];
        this.name = this.getDefaultName();
        this.id = this.project.genID();
    }
    
    getDefaultName(){return "Untitled Workflow"};
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"wfname");
        xml+=makeXML(this.id,"wfid");
        xml+=this.typeToXML();
        for(var i=0;i<this.weeks.length;i++){
            xml+=this.weeks[i].toXML();
        }
        xml+=makeXML(this.usedWF.join(","),"usedwfARRAY");
        var xmlData = makeXML(xml,"workflow");
        var parser = new DOMParser();
        this.xmlData = parser.parseFromString(xmlData,"text/xml");
    }
    
    fromXML(){
        var xmlData = this.xmlData;
        this.name = getXMLVal(xmlData,"wfname");
        this.id = getXMLVal(xmlData,"wfid");
        var xmlweeks = xmlData.getElementsByTagName("week");
        for(var i=0;i<xmlweeks.length;i++){
            if(i>0)this.weeks[0].insertBelow();
            this.weeks[i].fromXML(xmlweeks[i]);
        }
        this.updateWeekIndices();
        this.usedWF = getXMLVal(xmlData,"usedwfARRAY");
        this.makeConnectionsFromIds();
    }
    
    typeToXML(){return "";}
    
    makeConnectionsFromIds(){
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                for(var k=0;k<this.weeks[i].nodes[j].fixedLinksOut.length;k++){
                    this.weeks[i].nodes[j].fixedLinksOut[k].redraw();
                }
            }
        }
    }
    
    findNodeById(id){
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                if(this.weeks[i].nodes[j].id==id)return this.weeks[i].nodes[j];
            }
        }
        return null;
    }
    
    setName(name){
        this.name=name;
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].firstElementChild.innerHTML=this.name;
        }
    }
    
    makeActive(graph){
        
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].firstElementChild.style.color="#1976bc";
        }
        
        
        this.graph=graph;
        var parent = graph.getDefaultParent();
        var columns = this.columns;
        var weeks = this.weeks;
        var minimap = document.getElementById('outlineContainer');
        
        var nbContainer = document.getElementById('nbContainer');
        nbContainer.style.display="inline";
        while(nbContainer.firstChild)nbContainer.removeChild(nbContainer.firstChild);
        nbContainer.style.top = int(minimap.style.top)+int(minimap.style.height)+6+"px";
        
        
        
        var nodebar = new mxToolbar(nbContainer);
		nodebar.enabled = false;
        
        
        //Add the first cells
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try
        {
            //Create all the columns
            this.createInitialColumns();
            for(i=0;i<columns.length;i++){columns[i].pos = wfStartX+cellSpacing+defaultCellWidth/2+i*(defaultCellWidth-2*cellSpacing);}
            for(i=0;i<columns.length;i++){columns[i].createHead(wfStartY);columns[i].updatePosition();}
            weekWidth=columns[columns.length-1].pos+defaultCellWidth/2+cellSpacing;
            this.createBaseWeek();
            if(this.xmlData!=null)this.fromXML();
        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }
        //Set up the nodes toolbar
        var wf = this;
        var addNBType = function(icon, w, h, col)
        {
            var img = wf.addNBItem( nodebar, col, icon);
            img.enabled = true;

            graph.getSelectionModel().addListener(mxEvent.CHANGE, function()
            {
                var tmp = graph.isSelectionEmpty();
                mxUtils.setOpacity(img, (tmp) ? 100 : 20);
                img.enabled = tmp;
            });
            
        };
        
        for(i=0;i<columns.length;i++){
            addNBType('resources/data/'+columns[i].image+'24.png',24,24,columns[i].name);
        }
        
        
        
        // Installs a popupmenu handler.
        graph.popupMenuHandler.factoryMethod = function(menu, cell, evt){return wf.createPopupMenu(menu, cell, evt);};
    }
    
    makeInactive(){
        this.graph.clearSelection();
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].firstElementChild.style.color="black";
        }
        nbContainer.style.display="none";
        this.toXML();
        this.weeks=[];
        this.columns=[];
        if(this.graph!=null)this.graph.destroy();
    }
    
    createPopupMenu(menu,cell,evt){
        var graph = this.graph;
        var model = graph.getModel();
        graph.clearSelection();
        
        if (cell != null){
            if (graph.isPart(cell)){
                if(cell.getParent().isNode)cell.getParent().node.populateMenu(menu,cell);
            }
        }
        menu.addSeparator();

        menu.addItem("What's this?",'resources/images/info24.png',function(){
            
        });
    }
    
    
    createBaseWeek(){
        var baseWeek = new Week(this.graph,this);
        this.weeks.push(baseWeek);
        baseWeek.createBox(cellSpacing,this.columns[0].head.b()+cellSpacing,weekWidth);
        this.updateWeekIndices();
    }
    updateWeekIndices(){
        var weeks = this.weeks;
        for(var i=0;i<weeks.length;i++){
            if(weeks[i].index!=i){
                this.graph.setCellStyles("fillColor","#"+(0xf0f0f0+(i%2)*0x050505).toString(16)+";",[weeks[i].box]);
                weeks[i].index=i;
            }
            this.graph.labelChanged(weeks[i].box,'Week '+(i+1));
        }
    }
    pushWeeks(startIndex){
        var weeks = this.weeks;
        //this should never start at 0, the top week should not be moved
        if(startIndex==0) {weeks[0].makeFlushWithAbove(0);startIndex++}
        if(startIndex>weeks.length-1)return;
        var dy=weeks[startIndex-1].box.b()-weeks[startIndex].box.y();
        for(var i=startIndex;i<weeks.length;i++){
            weeks[i].moveWeek(dy);
        }
    }
    
    getColPos(name){
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name==name)return this.columns[i].pos;
        }
        return this.columns[0].pos;
    }
    getColIndex(name){
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name==name)return i;
        }
        return 0;
    }
    
    addUsedWF(value){
        this.usedWF.push(value);
    }
    
    removeUsedWF(value){
        this.usedWF.splice(this.usedWF.indexOf(value),1);
    }
    
    createNodeOfType(column){
        var node;
        var graph = this.graph;
        var wf = this;
        if(column=="LO") node = new LONode(graph,wf);
        else if(column=="AC") node = new ACNode(graph,wf);
        else if(column=="SA"||column=="FA") node = new ASNode(graph,wf);
        else if(column=="OOC"||column=="ICI"||column=="ICS")node = new WFNode(graph,wf);
        else node = new CFNode(graph,wf);
        return node;
        
    }
    
    findNextNodeOfSameType(node,direction){
        var week = node.week;
        var nodeIndex = week.nodes.indexOf(node);
        var weekIndex = this.weeks.indexOf(week);
        nodeIndex+=direction;
        while(weekIndex<this.weeks.length&&weekIndex>=0){
            while(nodeIndex<this.weeks[weekIndex].nodes.length&&nodeIndex>=0){
                if(this.weeks[weekIndex].nodes[nodeIndex].constructor===node.constructor)return(this.weeks[weekIndex].nodes[nodeIndex]);
                nodeIndex+=direction;
            }
            weekIndex+=direction;
        }
        return null;
    }
    
    addNBItem(toolbar, col, image)
    {
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        var graph = this.graph;
        var wf = this;
        var funct = function(graph, evt, cell, x, y)
        {
            var column=col;
            cell = graph.getCellAt(x,y);
            graph.stopEditing(false);
            if(cell!=null && cell.isWeek){
                var node=wf.createNodeOfType(column);
                node.createVertex(x,y);
                node.setColumn(column);
                node.setWeek(cell.week);
                cell.week.addNode(node);

            }

        }

        // Creates the image which is used as the drag icon (preview)
        var img = toolbar.addMode(null, image, function(evt, cell)
        {
            var pt = this.graph.getPointForEvent(evt);
            funct(graph, evt, cell, pt.x, pt.y);
        });

        // Disables dragging if element is disabled. This is a workaround
        // for wrong event order in IE. Following is a dummy listener that
        // is invoked as the last listener in IE.
        mxEvent.addListener(img, 'mousedown', function(evt)
        {
            // do nothing
        });

        // This listener is always called first before any other listener
        // in all browsers.
        mxEvent.addListener(img, 'mousedown', function(evt)
        {
            if (img.enabled == false)
            {
                mxEvent.consume(evt);
            }
        });

        mxUtils.makeDraggable(img, graph, funct);

        return img;
    }

    
}

class Courseflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        var graph = this.graph;
        columns.push(new Column(graph,this,"LO","Learning Objectives","reading"));
        columns.push(new Column(graph,this,"AC","Activities","instruct"));
        columns.push(new Column(graph,this,"FA","Formative Assessments","quiz"));
        columns.push(new Column(graph,this,"SA","Assessments","evaluate"));
    }
    
    getDefaultName(){return "New Course"};
    
    typeToXML(){return makeXML("course","wftype");}
}

class Activityflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        var graph = this.graph;
        columns.push(new Column(graph,this,"OOC","Out of Class","home"));
        columns.push(new Column(graph,this,"ICI","In Class (Instructor)","instruct"));
        columns.push(new Column(graph,this,"ICS","In Class (Students)","noinstructor"));
    }
    
    createBaseWeek(){
        var baseWeek = new WFArea(this.graph,this);
        baseWeek.index=0;
        this.weeks.push(baseWeek);
        baseWeek.createBox(cellSpacing,this.columns[0].head.b()+cellSpacing,weekWidth);
    }
    
    updateWeekIndices(){};
    
    typeToXML(){return makeXML("activity","wftype");}
    
    getDefaultName(){return "New Activity"};
    
}