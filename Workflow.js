//The basic workflow class and extensions, which store each individual workflow (flowchart)

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


class Workflow{
    constructor(container,project){
        this.weeks=[];
        this.columns=[];
        this.brackets=[];
        this.comments=[];
        this.children=[];
        this.xmlData;
        this.project=project;
        this.graph;
        this.buttons=[];
        this.name = this.getDefaultName();
        this.id = this.project.genID();
        this.tagBarDiv;
        this.tagSelect;
        this.tagSets=[];
        this.isActive=false;
    }
    
    getDefaultName(){return "Untitled Workflow"};
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"wfname");
        xml+=makeXML(this.id,"wfid");
        xml+=this.typeToXML();
        
        var usedWF = [];
        for(var i=0;i<this.children.length;i++)usedWF.push(this.children[i].id);
        xml+=makeXML(usedWF.join(","),"usedwfARRAY");
        
        var tagSets = [];
        for(i=0;i<this.tagSets.length;i++){tagSets.push(this.tagSets[i].id);}
        xml+=makeXML(tagSets.join(","),"tagsetARRAY");
        if(this.isActive)this.saveXMLData();
        xml+=(new XMLSerializer()).serializeToString(this.xmlData);
        var xmlData = makeXML(xml,"workflow");
        return xmlData;
    }
    
    saveXMLData(){
        var xml="";
        for(var i=0;i<this.columns.length;i++){
            xml+=this.columns[i].toXML();
        }
        for(i=0;i<this.weeks.length;i++){
            xml+=this.weeks[i].toXML();
        }
        for(i=0;i<this.comments.length;i++){
            xml+=this.comments[i].toXML();
        }
        for(i=0;i<this.brackets.length;i++){
            xml+=this.brackets[i].toXML();
        }
        xml=makeXML(xml,"wfdata");
        this.xmlData = (new DOMParser).parseFromString(xml,"text/xml");
    }
    
    openXMLData(){
        var xmlData = this.xmlData;
        var xmlweeks = xmlData.getElementsByTagName("week");
        for(var i=0;i<xmlweeks.length;i++){
            if(i>0)this.weeks[i-1].insertBelow();
            this.weeks[i].fromXML(xmlweeks[i]);
        }
        this.updateWeekIndices();
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
    
    fromXML(xmlData){
        this.setName(getXMLVal(xmlData,"wfname"));
        this.id = getXMLVal(xmlData,"wfid");
        this.tagsetArray = getXMLVal(xmlData,"tagsetARRAY");
        this.usedWF = getXMLVal(xmlData,"usedwfARRAY");
        this.xmlData = xmlData.getElementsByTagName("wfdata")[0];
        if(this.xmlData==null){
            console.log("The savefile is an older version. Attempting to repair...");
            //This is an old savefile, and doesn't have a wfdata tag.
            this.xmlData = (new DOMParser()).parseFromString("<wfdata></wfdata>","text/xml");
            var weeks = xmlData.getElementsByTagName("week");
            var brackets = xmlData.getElementsByTagName("bracket");
            var comments = xmlData.getElementsByTagName("comment");
            for(var i=0;i<weeks.length;i++){this.xmlData.documentElement.appendChild(weeks[i].cloneNode(true));}
            for(i=0;i<brackets.length;i++){this.xmlData.documentElement.appendChild(brackets[i].cloneNode(true));}
            for(i=0;i<comments.length;i++){this.xmlData.documentElement.appendChild(comments[i].cloneNode(true));}
        }
        
    }
    
    addButton(container,recurse=true){
        var button = new Layoutbutton(this,container);
        button.makeEditable(true,true,false);
        button.makeMovable();
        button.makeExpandable();
        this.buttons.push(button);
        if(recurse)for(var i=0;i<this.children.length;i++){
            this.children[i].addButton(button.childdiv);
        }
    }
    
    removeButton(button){
        if(this.children!=null)for(var i=0;i<this.children.length;i++){
            var wfc = this.children[i];
            for(var j=0;j<wfc.buttons.length;j++){
                if(wfc.buttons[j].container==button.childdiv){
                    wfc.removeButton(wfc.buttons[j]);
                    
                }
            }
        }
        this.buttons.splice(this.buttons.indexOf(button),1);
        button.removeSelf();
    }
    
    clickButton(){
        this.project.changeActive(this.project.getWFIndex(this),true);
    }
    
    getType(){return "other";}
    getButtonClass(){return "layoutactivity";}
    getIcon(){return "";}
    
    addChild(child,recurse=true){
        this.children.push(child);
        //If child is at the root level, remove its button
        if(child.buttons!=null&&child.buttons.length>0&&child.buttons[0].container.id=="layout"){
            child.removeButton(child.buttons[0]);
        }
        //Add it to the parent at all locations in the tree
        for(var i=0;i<this.buttons.length;i++){
            child.addButton(this.buttons[i].childdiv,recurse);
        }
    }
    
    removeChild(child){
        console.log(child);
        this.children.splice(this.children.indexOf(child),1);
        //remove the button from all instances of the parent, but only once (we might use the same activity twice in one course, for example)
        for(var i=0;i<this.buttons.length;i++){
            for(var j=0;j<child.buttons.length;j++){
                if(child.buttons[j].bdiv.parentElement == this.buttons[i].childdiv){
                    child.removeButton(child.buttons[j]);
                    break;
                }
            }
        }
        //if no instances still exist, move it back into the root
        if(child.buttons.length==0){
            child.addButton(this.project.layout);
            this.project.workflows.splice(this.project.workflows.indexOf(child),1);
            this.project.workflows.push(child);
        }
        
    }
    
    getChildren(){
        return this.children;
    }
    
    getNumberOfDescendants(des){
        var children = this.children;
        for(var i=0;i<children.length;i++){
            var wfc = children[i];
            if(des[wfc.getType()]==null)des[wfc.getType()]=1;
            else des[wfc.getType()]=des[wfc.getType()]+1;
            des = wfc.getNumberOfDescendants(des);
            
        }
        return des;
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
    
    setName(name,changeLabel=false){
        //if active, we have to change the name tag label to this
        if(name!=null && name!=""){
            name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            if(this.isActive&&changeLabel){
                this.graph.labelChanged(this.titleNode,name);
                //valueChanged has already been altered to call this function, so we return; the rest will be taken care of in the second pass
                return;
            }
            //otherwise, we just change the name
            else 
                this.name=name;
                for(var i=0;i<this.buttons.length;i++){
                    this.buttons[i].updateButton();
                }
        }
    }
    
    
    makeActive(graph){
        
        this.isActive=true;
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeActive();
            //uncommenting this line will allow all parents of the activated workflow to automatically expand
            //this.activateParents(this.buttons[i],true);
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
            if(this.xmlData!=null)this.openXMLData();
            this.createSpanner();
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
        this.isActive=false;
        this.graph.clearSelection();
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeInactive();
            //uncommenting this will revert automatic expansion of parents when a workflow is activated
            //this.activateParents(this.buttons[i],false);
        }
        for(i=0;i<this.tagSets.length;i++){
            this.tagSets[i].clearData();
        }
        nbContainer.style.display="none";
        this.saveXMLData();
        this.weeks=[];
        this.columns=[];
        this.comments=[];
        this.brackets=[];
        if(this.graph!=null)this.graph.destroy();
    }
    
    activateParents(b,add){
        if(b.parentElement.classList.contains("layoutdiv")){
            if(add)b.parentElement.classList.add("activechild");
            else b.parentElement.classList.remove("activechild");
            this.activateParents(b.parentElement,add);
        }
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
            var com = new WFComment(graph,wf,evt.pageX-int(wf.project.container.style.left)-graph.view.getTranslate().x,evt.pageY-int(wf.project.container.style.top)-graph.view.getTranslate().y);
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
    
    //This creates an invisible box that spans the width of our workflow. It's useful to have the graph area automatically resize in the y direction, but we want to maintain a minimum width in the x direction so that the user can always see the right hand side even when the editbar is up, and so they can click the seemingly empty space to the right of the graph to deselect items, and this is sort of cheesy way around that.
    createSpanner(){
        this.spanner = this.graph.insertVertex(this.graph.getDefaultParent(),null,'',wfStartX,0,this.weeks[0].box.w()+600,1,invisibleStyle);
        
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
    
    getTagByID(id){
        var tag;
        for(var i=0;i<this.tagSets.length;i++){
            tag = this.tagSets[i].getTagByID(id);
            if(tag!=null)return tag;
        }
    }
    
    bringCommentsToFront(){
        if(this.comments.length==0)return;
        var com = [];
        for(var i=0;i<this.comments.length;i++){
            com.push(this.comments[i].vertex);
        }
        this.graph.orderCells(false,com);
    }
    
    
    createNodeOfType(column){
        var node;
        var graph = this.graph;
        var wf = this;
        if(column=="LO") node = new LONode(graph,wf);
        else if(column=="AC") node = new ACNode(graph,wf);
        else if(column=="SA"||column=="FA"||column=="HW") node = new ASNode(graph,wf);
        else if (column=="CO") node = new CONode(graph,wf);
        else if(column=="OOC"||column=="ICI"||column=="ICS")node = new WFNode(graph,wf);
        else node = new CFNode(graph,wf);
        return node;
        
    }
    
    findNearestColumn(x){
        var dist = 99999;
        var tdist = 0;
        var name = null;
        for(var i=0;i<this.columns.length;i++){
            tdist = Math.abs(this.columns[i].pos-x);
            if(tdist<dist){
                dist=tdist;
                name = this.columns[i].name;
            }
        }
        if(name!=null)return name;
        else return this.columns[0].name;
    }
    
    findNextNodeOfSameType(node,direction,sameType=true){
        var week = node.week;
        var nodeIndex = week.nodes.indexOf(node);
        var weekIndex = this.weeks.indexOf(week);
        nodeIndex+=direction;
        while(weekIndex<this.weeks.length&&weekIndex>=0){
            while(nodeIndex<this.weeks[weekIndex].nodes.length&&nodeIndex>=0){
                if(!sameType||this.weeks[weekIndex].nodes[nodeIndex].constructor===node.constructor)return(this.weeks[weekIndex].nodes[nodeIndex]);
                nodeIndex+=direction;
            }
            weekIndex+=direction;
            if(nodeIndex<0&&weekIndex>=0)nodeIndex=this.weeks[weekIndex].nodes.length-1;
            else if(nodeIndex>0&&weekIndex<this.weeks.length)nodeIndex=0;
        }
        return null;
    }
    
    //Executed when we generate all the toolbars
    generateToolbars(container){
        this.project.makeResizable(container,"left");
        this.generateNodeBar(container);
        this.generateBracketBar(container);
        this.generateTagBar(container);
    }
    
    generateNodeBar(container){ 
        var header = document.createElement('h3');
        header.className="nodebarh3";
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
                    console.log(wf);
                    wf.bringCommentsToFront();

                }

            }
            return dropfunction;
        }
        
        for(var i=0;i<this.columns.length;i++){
            this.addNodebarItem(container,this.columns[i].nodetext,'resources/data/'+this.columns[i].image+'24.png',makeDropFunction(this.columns[i].name,this));
        }
    }
    
    
    
    generateBracketBar(){}
    generateTagBar(){}
    
    populateTagBar(){
        this.tagBarDiv.innerHTML="";
        for(var i=0;i<this.tagSets.length;i++){
            var tagDiv = document.createElement('div');
            this.tagBarDiv.appendChild(tagDiv);
            tagDiv.layout=this;
            this.populateTagDiv(tagDiv,this.tagSets[i]);
        }
        if(this.tagSets.length==0){
            this.tagBarDiv.classList.add("emptytext");
            this.tagBarDiv.innerHTML="<b>No outcomes have been added yet! Use the buttons below to add one.</b>"
        }else this.tagBarDiv.classList.remove("emptytext");
    }
    
    populateTagDiv(container,tag){
         var button = new Layoutbutton(tag,container);
        button.b.onclick=null;
        
        //Creates the function that is called when you drop it on something
        var makeDropFunction=function(addedtag,workflow){
            var dropfunction = function(graph, evt, filler, x, y)
            {
                var wf = workflow;
                var thistag =addedtag;
                var cell = graph.getCellAt(x,y);
                graph.stopEditing(false);
                while(cell!=null&&graph.isPart(cell)){cell=graph.getModel().getParent(cell);}
                if(cell!=null && cell.isNode){
                    cell.node.addTag(thistag,cell);
                }

            }
            return dropfunction;
        }
        
        this.addNodebarItem(button.bwrap,tag.name,"resources/data/"+tag.getIcon()+"24.png",makeDropFunction(tag,this),button);
        tag.addDrop(button);
        if(tag.depth==0)button.makeEditable(false,false,true);
        button.makeExpandable();
        
        for(var i=0;i<tag.children.length;i++){
            this.populateTagDiv(button.childdiv,tag.children[i]);
        }
        return button;
    }
    
   
    //Adds a drag and drop. If button is null, it creates one, if it is passed an existing button it simply makes it draggable.
    addNodebarItem(container,name,image, dropfunction,button=null)
    {
       
        var graph = this.graph;
        var line;
        var img;
        var namediv;
        if(button==null){
            line = document.createElement("button");
            img = document.createElement("img");
            namediv = document.createElement("div");
            img.setAttribute('src',image);
            namediv.innerText = name;
            line.appendChild(img);
            line.appendChild(namediv);
            container.appendChild(line);
        }else {
            img=button.icon;
            line=button.b;
            namediv=button.namediv;
        }
        // Creates the image which is used as the drag icon (preview)
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
    
    addTagSet(tag){
        this.tagSets.push(tag);
    }
    
    removeTagSet(tag){
        if(this.tagSets.indexOf(tag)>=0){
            this.tagSets.splice(this.tagSets.indexOf(tag),1); 
            this.purgeTag(tag);
        }
            
    }
    
    purgeTag(tag){
        
        var idSet = [];
        idSet = tag.getAllID(idSet);
        if(idSet.length==0)return;
        if(this.isActive){
                for(var i=0;i<this.weeks.length;i++){
                    for(var j=0;j<this.weeks[i].nodes.length;j++){
                        var node = this.weeks[i].nodes[j];
                        for(var k=0;k<idSet.length;k++){
                            var id=idSet[k];
                            for(var l=0;l<node.tags.length;l++){
                                if(node.tags[l].id==id){
                                    node.removeTag(node.tags[l]);
                                    l--;
                                }
                            }
                        }
                    }
                }
            }else{
                if(this.xmlData==null)return;
                for(var k =0;k<idSet.length;k++){
                    var id = idSet[k];
                    var xmlused =this.xmlData.getElementsByTagName("tagARRAY");
                    for(i=0;i<xmlused.length;i++){
                        if(xmlused[i].childNodes.length==0)continue;
                        var usedArray = xmlused[i].childNodes[0].nodeValue.split(',');
                        while(usedArray.indexOf(id)>=0){
                            usedArray.splice(usedArray.indexOf(id),1);
                        }
                        xmlused[i].childNodes[0].nodeValue = usedArray.join(',');
                    }
                }
            }
    }
    
    populateTagSelect(list){
        var compSelect=this.tagSelect;
        while(compSelect.length>0)compSelect.remove(0);
        var opt = document.createElement('option');
        opt.text = "Select set to add";
        opt.value = "";
        compSelect.add(opt);
        for(var i=0;i<list.length;i++){
            if(this.tagSets.indexOf(list[i])<0){
                opt = document.createElement('option');
                opt.text = list[i].name;
                opt.value = list[i].id;
                compSelect.add(opt);
            }
        }
    }
    
    
    //Since the XML file may not originate from the program, there may be some overlap in the IDs. We therefore flip each ID to negative temporarily, assign everything, then use the IDs that were generated in the initial creation of the nodes.
    addNodesFromXML(week,startIndex,xml){
        xml = (new DOMParser()).parseFromString(this.project.assignNewIDsToXML(xml),"text/xml");
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
        
        this.bringCommentsToFront();
    }
    
    expandAllNodes(expand=true){
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                var node = this.weeks[i].nodes[j];
                if(node.isDropped!=expand)node.toggleDropDown();
            }
        }
    }
    
    //Purge the workflow from this one
    purgeUsedWF(wf){
        var checknodes=false;
        while(this.children.indexOf(wf)>=0){
            this.children.splice(this.children.indexOf(wf),1);
            checknodes=true;
        }
        if(checknodes){
        //if it's active, easy to remove from nodes
            if(this.isActive){
                for(var j=0;j<this.weeks.length;j++){
                    for(var k=0;k<this.weeks[j].nodes.length;k++){
                        var node = this.weeks[j].nodes[k];
                        if(node.linkedWF==wf.id)node.linkedWF=null;
                    }
                }
            }else{
                //do it in the xmlvar 
                if(this.xmlData==null)return;
                var xmllinks = this.xmlData.getElementsByTagName("linkedwf");
                for(var i=0;i<xmllinks.length;i++){
                    xmllinks[i].childNodes[0].nodeValue="";
                }
            }
            
        }
    }
    
    
    getDeleteText(){
        return "Delete this workflow? Warning: this will delete all contents (but not any workflows used by it)!";
    }
    
    getUnassignText(){
        return "Unassign this workflow? Note: this will NOT delete the workflow, but WILL remove this reference to it from the parent workflow.";
    }

    deleteSelf(){
        this.project.deleteWF(this);
    }
    
    unassignFrom(parent){
        if(parent instanceof Workflow){
            this.project.removeChild(parent,this);
            
        }else{
            console.log("I don't know what to do with this");
        }
    }

    
    //swap the two used workflows (used to rearrange the layout)
    swapChildren(c1,c2){
        var i1 = this.children.indexOf(c1);
        var i2 = this.children.indexOf(c2);
        [this.children[i1],this.children[i2]]=[this.children[i2],this.children[i1]];
        
    }
    
    
    swapColumns(in1,in2){
        [this.columns[in1].pos,this.columns[in2].pos]=[this.columns[in2].pos,this.columns[in1].pos];
        [this.columns[in1],this.columns[in2]]=[this.columns[in2],this.columns[in1]];
        this.columns[in1].updatePosition();
        this.columns[in2].updatePosition();
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                this.weeks[i].nodes[j].updateColumn();
            }
        }
    }
    
    

    
}

class Courseflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        var graph = this.graph;
        columns.push(new Column(graph,this,"HW","Preparation","homework","Preparation"));
        columns.push(new Column(graph,this,"AC","Activities","lesson","Activity"));
        columns.push(new Column(graph,this,"FA","Artifacts","artifact","Artifact"));
        columns.push(new Column(graph,this,"SA","Assessments","assessment","Assessment"));
    }
    
    getDefaultName(){return "New Course"};
    
    getType(){return "course"};
    getButtonClass(){return "layoutcourse";}
    getIcon(){return "course";}
    
    typeToXML(){return makeXML("course","wftype");}
    
    generateTagBar(container){
        var p=this.project;
        var wf = this;
        var header = document.createElement('h3');
        header.className="nodebarh3";
        header.innerHTML="Outcomes:";
        container.appendChild(header);
        
        this.tagBarDiv =  document.createElement('div');
        
        
        container.appendChild(this.tagBarDiv);
        
        var compSelect = document.createElement('select');
        this.tagSelect=compSelect;
        this.populateTagSelect(p.competencies);
        
        var addButton = document.createElement('button');
        addButton.innerHTML = "Assign Outcome";
        addButton.onclick=function(){
            var value = compSelect.value;
            if(value!=""){
               var comp = p.getCompByID(value);
               wf.addTagSet(comp);
               wf.populateTagBar();
                compSelect.remove(compSelect.selectedIndex);
            }
        }
        
        container.appendChild(compSelect);
        container.appendChild(addButton);
        
        this.populateTagBar();
    }
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
    
    getType(){return "activity"};
    getButtonClass(){return "layoutactivity";}
    getIcon(){return "activity";}
    
    typeToXML(){return makeXML("activity","wftype");}
    
    getDefaultName(){return "New Activity"};
    
    generateBracketBar(container){ 
        
        var header = document.createElement('h3');
        header.className="nodebarh3";
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
        columns.push(new Column(graph,this,"CO","Course","instruct","Course"));
        columns.push(new Column(graph,this,"SA","Assessments","assessment","Assessment"));
    }
    
    createBaseWeek(){
        var baseWeek = new WFArea(this.graph,this);
        baseWeek.index=0;
        this.weeks.push(baseWeek);
        baseWeek.createBox(cellSpacing,this.columns[0].head.b()+cellSpacing,weekWidth);
    }
    
    updateWeekIndices(){};
    
    getType(){return "program";}
    getButtonClass(){return "layoutprogram";}
    getIcon(){return "program";}
    
    typeToXML(){return makeXML("program","wftype");}
    
    getDefaultName(){return "New Program"};
    
}