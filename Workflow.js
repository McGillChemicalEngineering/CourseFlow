
class Workflow{
    constructor(container,project){
        this.weeks=[];
        this.columns=[];
        this.brackets=[];
        this.comments=[];
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
        for(i=0;i<this.brackets.length;i++){
            xml+=this.brackets[i].toXML();
        }
        for(i=0;i<this.comments.length;i++){
            xml+=this.comments[i].toXML();
        }
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
        var xmlbrackets = xmlData.getElementsByTagName("bracket");
        for(i=0;i<xmlbrackets.length;i++){
            var br = new Bracket(this.graph,this);
            br.fromXML(xmlbrackets[i]);
            this.brackets.push(br);
        }
        var xmlcomments = xmlData.getElementsByTagName("comment");
        for(var i=0;i<xmlcomments.length;i++){
            var com = new WFComment(this.graph,this,0,0);
            com.fromXML(xmlcomments[i]);
            this.addComment(com);
        }
    }
    
    typeToXML(){return "";}
    
    makeConnectionsFromIds(){
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                for(var k=0;k<this.weeks[i].nodes[j].fixedLinksOut.length;k++){
                    this.weeks[i].nodes[j].fixedLinksOut[k].redraw();
                    this.weeks[i].nodes[j].fixedLinksOut[k].addDelOverlay();
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
        //nbContainer.style.top = int(minimap.style.top)+int(minimap.style.height)+6+"px";
        
        //Add the first cells
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try
        {
            //Create the title boxes
            this.createTitleNode();
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
        
        var wf = this;
        // Installs a popupmenu handler.
        graph.popupMenuHandler.factoryMethod = function(menu, cell, evt){return wf.createPopupMenu(menu, cell, evt);};
        
        this.generateToolbars(nbContainer);
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
        this.comments=[];
        this.brackets=[];
        if(this.graph!=null)this.graph.destroy();
    }
    
    createTitleNode(){
        var wf = this;
        var title = "[Insert Title Here]";
        if(this.name!=null)title = this.name;
        this.titleNode = this.graph.insertVertex(this.graph.getDefaultParent(),null,title,wfStartX,cellSpacing,300,50,defaultTitleStyle);
        this.titleNode.valueChanged = function(value){
            //value = value.replace(/[^\w]/gi,'')
            wf.setName(value);
            mxCell.prototype.valueChanged.apply(this,arguments);
            
        }
    }
    
    createPopupMenu(menu,cell,evt){
        var graph = this.graph;
        var wf = this;
        var model = graph.getModel();
        
        if (cell != null){
            if (graph.isPart(cell)){
                if(cell.getParent().isNode)cell.getParent().node.populateMenu(menu,cell);
            }
        }
        menu.addItem('Add Comment','resources/images/comment24.png',function(){
            var com = new WFComment(graph,wf,evt.clientX-int(wf.project.container.style.left)-graph.view.getTranslate().x,evt.clientY-int(wf.project.container.style.top)-graph.view.getTranslate().y);
            com.createVertex();
            wf.addComment(com);
        });
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
        else if (column=="CO") node = new CONode(graph,wf);
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
    
    //Executed when we generate all the toolbars
    generateToolbars(container){
        this.generateNodeBar(container);
        this.generateBracketBar(container);
        this.generateTagBar(container);
    }
    
    generateNodeBar(container){ 
        var header = document.createElement('h3');
        header.innerHTML="Nodes:";
        container.appendChild(header);
        
        var nodebar = new mxToolbar(container);
		nodebar.enabled = false;
        
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        var makeDropFunction=function(col,workflow){
            var dropfunction = function(graph, evt, filler, x, y)
            {
                var wf = workflow;
                var column=col;
                var cell = graph.getCellAt(x,y);
                graph.stopEditing(false);
                if(cell!=null && cell.isWeek){
                    var node=wf.createNodeOfType(column);
                    node.createVertex(x,y);
                    node.setColumn(column);
                    node.setWeek(cell.week);
                    cell.week.addNode(node);

                }

            }
            return dropfunction;
        }
        
        for(var i=0;i<this.columns.length;i++){
            this.addNodebarItem(container,this.columns[i].text,'resources/data/'+this.columns[i].image+'24.png',makeDropFunction(this.columns[i].name,this));
        }
    }
    
    generateBracketBar(){}
    generateTagBar(){}
    
   
    
    addNodebarItem(container,name,image, dropfunction)
    {
       
        var graph = this.graph;
        // Creates the image which is used as the drag icon (preview)
        var line = document.createElement("button");
        var img = document.createElement("img");
        var namediv = document.createElement("div");
        img.setAttribute('src',image);
        namediv.innerText = name;
        line.appendChild(img);
        line.appendChild(namediv);
        container.appendChild(line);
        var dragimg = img.cloneNode(true);
        

        mxUtils.makeDraggable(line, graph, dropfunction,dragimg);

        return line;
    }
    
    addBracket(icon,cell){
        var bracket = new Bracket(this.graph,this);
        bracket.createVertex();
        bracket.changeNode(cell.node,true);
        bracket.changeNode(cell.node,false);
        bracket.setIcon(icon);
        bracket.updateHorizontal();
        this.brackets.push(bracket);
    }
    
    addComment(com){
        this.comments.push(com);
    }
    
    
    //Since the XML file may not originate from the program, there may be some overlap in the IDs. We therefore flip each ID to negative temporarily, assign everything, then use the IDs that were generated in the initial creation of the nodes.
    addNodesFromXML(week,startIndex,xml){
        xml = (new DOMParser()).parseFromString(this.project.assignNewIDsToXML(xml),"text/xml");;
        //Add everything
        var xmlnodes = xml.getElementsByTagName("node");
        var xmlbrackets = xml.getElementsByTagName("bracket");
        for(var i=0;i<xmlnodes.length;i++){
            var xmlnode = xmlnodes[i];
            var column = getXMLVal(xmlnode,"column");
            var node = this.createNodeOfType(column);
            node.week = week;
            node.fromXML(xmlnode);
            week.addNode(node,0,startIndex+i);
        }
        for(i=0;i<xmlbrackets.length;i++){
            var br = new Bracket(this.graph,this);
            br.fromXML(xmlbrackets[i]);
            this.brackets.push(br);
        }
    }

    
}

class Courseflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        var graph = this.graph;
        //columns.push(new Column(graph,this,"LO","Learning Objectives","reading"));
        columns.push(new Column(graph,this,"AC","Activities","instruct","Activity"));
        columns.push(new Column(graph,this,"FA","Artifacts","quiz","Artifact"));
        columns.push(new Column(graph,this,"SA","Assessments","evaluate","Assessment"));
    }
    
    getDefaultName(){return "New Course"};
    
    typeToXML(){return makeXML("course","wftype");}
}

class Activityflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        var graph = this.graph;
        columns.push(new Column(graph,this,"OOC","Out of Class","home","Home"));
        columns.push(new Column(graph,this,"ICI","In Class (Instructor)","instruct","Instructor"));
        columns.push(new Column(graph,this,"ICS","In Class (Students)","noinstructor","Students"));
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
    
    generateBracketBar(container){ 
        
        var header = document.createElement('h3');
        header.innerHTML="Strategies:";
        container.appendChild(header);
        
        var bracketbar = new mxToolbar(container);
		bracketbar.enabled = false;
        
        var makeDropFunction=function(strat,workflow){
            var dropfunction = function(graph, evt, filler, x, y)
            {
                var wf = workflow;
                var strategy=strat;
                var cell = graph.getCellAt(x,y);
                graph.stopEditing(false);
                if(cell!=null&&graph.isPart(cell))cell=graph.getModel().getParent(cell);
                if(cell!=null && cell.isNode){
                    wf.addBracket(strategy,cell);
                }
                if(cell!=null&&cell.isWeek){
                    var xml = findStrategyXML(strategy);
                    var startIndex = cell.week.getNextIndexFromPoint(y);
                    wf.addNodesFromXML(cell.week,startIndex,xml);
                }

            }
            return dropfunction;
        }
        
        var stratlist = strategyIconsArray;
        
        for(var i=0;i<stratlist.length;i++){
            this.addNodebarItem(container,stratlist[i][0],'resources/data/'+stratlist[i][1]+'24.png',makeDropFunction(stratlist[i][1],this));
        }
    }
    
}

class Programflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        var graph = this.graph;
        columns.push(new Column(graph,this,"CO","Course","instruct"));
        columns.push(new Column(graph,this,"SA","Assessments","evaluate"));
    }
    
    createBaseWeek(){
        var baseWeek = new WFArea(this.graph,this);
        baseWeek.index=0;
        this.weeks.push(baseWeek);
        baseWeek.createBox(cellSpacing,this.columns[0].head.b()+cellSpacing,weekWidth);
    }
    
    updateWeekIndices(){};
    
    typeToXML(){return makeXML("program","wftype");}
    
    getDefaultName(){return "New Program"};
    
}