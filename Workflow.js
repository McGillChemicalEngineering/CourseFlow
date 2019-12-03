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
        this.buttons=[];
        this.name = this.getDefaultName();
        this.id = this.project.genID();
        this.tagSets=[];
        this.isActive=false;
        this.undoHistory=[];
        this.currentUndo;
        this.undoEnabled=false;
        this.view;
    }
    
    getDefaultName(){return "Untitled Workflow"};
    getBracketList(){return null;}
    
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
        this.xmlData = (new DOMParser).parseFromString(xml,"text/xml").childNodes[0];
    }
    
    openXMLData(){
        var xmlData = this.xmlData;
        var xmlcols = [];
        for(var i=0;i<xmlData.childNodes.length;i++){
            if(xmlData.childNodes[i].tagName=="column")xmlcols.push(xmlData.childNodes[i]);
        }
        for(var i=0;i<xmlcols.length;i++){
            var col = new Column(this);
            col.fromXML(xmlcols[i]);
            this.columns.push(col);
        }
        if(this.columns.length==0)this.createInitialColumns();
        var xmlweeks = xmlData.getElementsByTagName("week");
        for(i=0;i<xmlweeks.length;i++){
            var week = this.createWeek();
            week.fromXML(xmlweeks[i]);
            this.weeks.push(week);
        }
        var xmlbrackets = xmlData.getElementsByTagName("bracket");
        for(i=0;i<xmlbrackets.length;i++){
            var br = new Bracket(this);
            br.fromXML(xmlbrackets[i]);
            this.brackets.push(br);
        }
        var xmlcomments = xmlData.getElementsByTagName("comment");
        for(var i=0;i<xmlcomments.length;i++){
            var com = new WFComment(this,0,0);
            com.fromXML(xmlcomments[i]);
            this.addComment(com);
        }
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                this.weeks[i].nodes[j].makeAutoLinks();
            }
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
            var childIndex = this.project.workflows.indexOf(child);
            var activeIndex = this.project.activeWF;
            this.project.workflows.splice(this.project.workflows.indexOf(child),1);
            this.project.workflows.push(child);
            if (activeIndex!=null&&childIndex<activeIndex)this.project.activeWF-=1;
            else if (activeIndex==childIndex)this.project.activeWF=this.project.workflows.length-1;
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
    
    
    
    findNodeById(id){
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                if(this.weeks[i].nodes[j].id==id)return this.weeks[i].nodes[j];
            }
        }
        return null;
    }
    
    //sets the name without changing the label
    setNameSilent(name){
        if(name!=null && name!=""){
            name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].updateButton();
            }
            return name;
        }else{
            return this.name;
        }
        
    }
    
    setName(name){
        name = this.setNameSilent(name);
        //if active, we have to change the name tag label to this
        if(this.view)this.view.nameUpdated();
                
    }
    
    makeActive(view){
        this.isActive=true;
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeActive();
            //uncommenting this line will allow all parents of the activated workflow to automatically expand
            //this.activateParents(this.buttons[i],true);
        }
        
        if(this.xmlData!=null){
            this.openXMLData();
        }else{
            this.createInitialColumns();
            this.createBaseWeek();
        }
        this.view=view;
        if(this.view)this.view.makeActive();
        
        if(this.undoHistory.length==0){
            this.currentUndo=-1;
            this.addUndo("Initial",this);
        }
        this.undoEnabled=true;
    }
    
    
    
    makeInactive(){
        this.undoEnabled=false;
        this.isActive=false;
        if(this.view)this.view.makeInactive();
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeInactive();
            //uncommenting this will revert automatic expansion of parents when a workflow is activated
            //this.activateParents(this.buttons[i],false);
        }
        this.saveXMLData();
        this.weeks=[];
        this.columns=[];
        this.comments=[];
        this.brackets=[];
        this.view=null;
    }
    
    clearAll(){
        if(this.view)this.view.makeInactive();
        this.weeks=[];
        this.columns=[];
        this.comments=[];
        this.brackets=[];
    }
    
    activateParents(b,add){
        if(b.parentElement.classList.contains("layoutdiv")){
            if(add)b.parentElement.classList.add("activechild");
            else b.parentElement.classList.remove("activechild");
            this.activateParents(b.parentElement,add);
        }
    }
    
    addColumn(name){
        var col = new Column(this,name);
        this.columns.push(col);
        if(this.view)this.view.columnAdded(col);
        
    }
    
    removeColumn(column){
        var index = this.columns.indexOf(column);
        if(this.view)this.view.columnRemoved(column);
        this.columns.splice(index,1);
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                var node = this.weeks[i].nodes[j];
                if(node.column==column.name)node.column=this.columns[this.columns.length-1].name;
                if(node.view)node.view.columnUpdated();
            }
        }
    }
    
    getColIndex(name){
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name==name)return i;
        }
        return 0;
    }
    
    ensureColumn(name){
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name==name)return i;
        }
        this.addColumn(name);
        return this.columns.length-1;
    }
    
    
    createBaseWeek(){
        var baseWeek = new Week(this);
        this.weeks.push(baseWeek);
        if(this.view)this.view.weekAdded(baseWeek);
        this.updateWeekIndices();
    }
    
    createWeek(){
        var week = new Week(this);
        return week;
    }
    
    updateWeekIndices(){
        var weeks = this.weeks;
        for(var i=0;i<weeks.length;i++){
            if(weeks[i].index!=i){
                weeks[i].index=i;
                if(this.view)this.view.weekIndexUpdated(weeks[i]);
            }
            if(weeks[i].name==null&&weeks[i].name!="")weeks[i].setName(null);
        }
    }
    
    
    moveWeek(week,direction){
        var index = week.index;
        if((direction>0&&index<this.weeks.length-1)||(direction<0&&index>0)){
            var week2 = this.weeks[index+direction];
            //This doesn't take into account the heights of the weeks!
            if(this.view)this.view.weeksSwapped(week,week2,direction);
            [this.weeks[index],this.weeks[index+direction]]=[this.weeks[index+direction],this.weeks[index]]
            this.updateWeekIndices();
        }
    }
    
    
    
    getTagByID(id){
        var tag;
        for(var i=0;i<this.tagSets.length;i++){
            tag = this.tagSets[i].getTagByID(id);
            if(tag!=null)return tag;
        }
    }
    
    createNodeOfType(column){
        var node;
        var wf = this;
        if(column=="LO") node = new LONode(wf);
        else if(column=="AC") node = new ACNode(wf);
        else if(column=="SA"||column=="FA"||column=="HW") node = new ASNode(wf);
        else if (column=="CO") node = new CONode(wf);
        else if(column=="OOC"||column=="ICI"||column=="ICS")node = new WFNode(wf);
        else if(column.substr(0,3)=="CUS")node = new CUSNode(wf);
        else node = new CFNode(wf);
        return node;
        
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
    
    
    
    addBracket(icon,node){
        var bracket = new Bracket(this);
        bracket.changeNode(node,true);
        bracket.changeNode(node,false);
        bracket.setIcon(icon);
        this.brackets.push(bracket);
        if(this.view)this.view.bracketAdded(bracket);
    }
    
    
    addComment(com){
        this.comments.push(com);
    }
    
    addTagSet(tag,checkParent=true){
        //Remove any children of the tag we are adding
        var allTags = tag.getAllTags([]);
        for(var i=0;i<this.tagSets.length;i++){
            if(allTags.indexOf(this.tagSets[i])>=0){
                this.tagSets.splice(i,1);
                i--;
            }
        }
        //Add the tag
        this.tagSets.push(tag);
        if(this.view)this.view.tagSetAdded(tag);
        
        //Check to see if we have all children of the parent, if the parent exists
        var parentTag = tag.parentTag;
        if(parentTag!=null&&checkParent){
            var children = parentTag.getAllTags([],parentTag.depth+1);
            children.splice(0,1);
            var addParent=true;
            for(i=0;i<children.length;i++){
                if(this.tagSets.indexOf(children[i])<0){
                    addParent=false;
                    break;
                }
            }
            if(addParent){
                this.addTagSet(parentTag);
                if(this.isActive&&this.tagSelect!=null)for(i=0;i<this.tagSelect.options.length;i++){
                    if(this.tagSelect.options[i].value==parentTag.id){
                        this.tagSelect.remove(i);
                        i--;
                    }
                }
            }
        }
        var wf = this;
        if(wf.view)wf.view.populateTagBar();
        //asynchronous debounced call to refresh the nodes
        var debouncetime=200;
        var prevRefreshCall=this.lastRefreshCall;
        this.lastRefreshCall = Date.now();
        if(prevRefreshCall&&this.lastRefreshCall-prevRefreshCall<=debouncetime){
            clearTimeout(this.lastRefreshTimer);
        }
        this.lastRefershTimer = setTimeout(function(){wf.refreshAllTags();},debouncetime);
    }
    
    removeTagSet(tag,purge=true){
        if(this.tagSets.indexOf(tag)>=0){
            this.tagSets.splice(this.tagSets.indexOf(tag),1);
        }else if(tag.parentTag!=null){
            this.removeTagSet(tag.parentTag,false);
            for(var i=0;i<tag.parentTag.children.length;i++){
                if(tag.parentTag.children[i]!=tag)this.addTagSet(tag.parentTag.children[i],false);
            }
        } 
        if(purge)this.purgeTag(tag);
        if(this.view)this.view.tagSetRemoved(tag);
            
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
    
    getTagDepth(){return -1;}
    
    refreshAllTags(){
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                this.weeks[i].nodes[j].refreshLinkedTags();
            }
        }
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
        [this.columns[in1],this.columns[in2]]=[this.columns[in2],this.columns[in1]];
        if(this.view)this.view.columnsSwitched(in1,in2);
    }
    
    addNodesFromXML(week,startIndex,xml){
        xml = (new DOMParser()).parseFromString(this.project.assignNewIDsToXML(xml),"text/xml");
        //Add everything
        var xmlnodes = xml.getElementsByTagName("node");
        var xmlbrackets = xml.getElementsByTagName("bracket");
        var nodes = [];
        for(var i=0;i<xmlnodes.length;i++){
            var xmlnode = xmlnodes[i];
            var column = getXMLVal(xmlnode,"column");
            var node = this.createNodeOfType(column);
            node.week = week;
            node.fromXML(xmlnode);
            if(this.view)this.view.nodeAddedFromXML(node);
            week.addNodeSilent(node,0,startIndex+i);
            nodes.push(node);
        }
        for(i=0;i<xmlbrackets.length;i++){
            var br = new Bracket(this);
            br.fromXML(xmlbrackets[i]);
            if(this.view)this.view.bracketAddedFromXML(br);
            this.brackets.push(br);
        }
        for(i=0;i<nodes.length;i++)nodes[i].makeAutoLinks();
        if(this.view)this.view.finishedAddingNodesFromXML(week,startIndex+xmlnodes.length);
        
    }
    
    //Call to create an undo event, which will debounce calls
    makeUndo(type,source=null){
        
        var debouncetime=500;
        var prevUndoCall = this.lastUndoCall;
        this.lastUndoCall=Date.now();
       //Debounce
        if(prevUndoCall&&this.lastUndoCall-prevUndoCall<=debouncetime){
            clearTimeout(this.lastCallTimer);
        }
        var wf = this;
        this.lastCallTimer = setTimeout(function(){if(wf.isActive)wf.addUndo(type,source)},debouncetime);
    }
        
    addUndo(type,source){
        
        this.undoEnabled=false;
        var undo = new Undo(this,type,source);
        //If we have just done one or more undos, the index will be less than the max; we should destroy everything past the current index.
        if(this.currentUndo<this.undoHistory.length-1){
            this.undoHistory.splice(this.currentUndo+1,this.undoHistory.length-2-this.currentUndo)
        }        
        //If the most recent undo is of the same type and source, we probably only need to keep one.
        if(this.undoHistory.length>1){
            var lastUndo = this.undoHistory[this.undoHistory.length-1];
            if((lastUndo.type==undo.type&&lastUndo.source==undo.source)||undo.xml==lastUndo.xml){
                this.undoHistory.splice(this.undoHistory.length-1,1);
                this.currentUndo--;
            }
        }
        this.undoHistory.push(undo);
        this.currentUndo++;
        this.undoEnabled=true;
    }
    
    undo(){
        if(this.undoEnabled&&this.currentUndo>0){
            var wf = this;
            wf.undoEnabled=false;
            makeLoad(function(){
                wf.view.graph.clearSelection();
                var lastUndo = wf.undoHistory[wf.currentUndo-1];
                wf.xmlData = lastUndo.xml;
                wf.clearAll();
                wf.openXMLData();
                wf.updateChildrenFromNodes();
                wf.view.makeActive();
                wf.currentUndo--;
                wf.undoEnabled=true;
            });
            
        }
    }
    
    redo(){
        if(this.undoEnabled&&this.currentUndo<this.undoHistory.length-1){
            var wf = this;
            wf.undoEnabled=false;
           makeLoad(function(){
                wf.view.graph.clearSelection();
                var nextUndo = wf.undoHistory[wf.currentUndo+1];
                wf.xmlData = nextUndo.xml;
                wf.clearAll();
                wf.openXMLData();
                wf.updateChildrenFromNodes();
                wf.view.makeActive();
                wf.currentUndo++;
                wf.undoEnabled=true;
            });
        }
    }
    
    updateChildrenFromNodes(){
        var linkedWF=[];
        for(var i=0;i<this.weeks.length;i++){
            for(var j=0;j<this.weeks[i].nodes.length;j++){
                var link = this.weeks[i].nodes[j].linkedWF;
                var wfc = this.project.getWFByID(link);
                if(wfc==null)this.weeks[i].nodes[j].linkedWF=null;
                else linkedWF.push(link);
            }
        }
        var childcopy = [...this.children];
        for(i=0;i<childcopy.length;i++){
            for(j=0;j<linkedWF.length;j++){
                
                if(childcopy[i].id==linkedWF[j]){childcopy.splice(i,1);linkedWF.splice(j,1);i--;j--;break;}
            }
        }
        for(i=0;i<childcopy.length;i++)this.removeChild(childcopy[i]);
        for(i=0;i<linkedWF.length;i++)this.addChild(this.project.getWFByID(linkedWF[i]));
    }
    
    
    
    
    
    
}

class Courseflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        columns.push(new Column(this,"HW"));
        columns.push(new Column(this,"AC"));
        columns.push(new Column(this,"SA"));
    }
    
    getPossibleColumns(){
        var columns = [];
        columns.push(new Column(this,"HW"));
        columns.push(new Column(this,"AC"));
        columns.push(new Column(this,"FA"));
        columns.push(new Column(this,"SA"));
        var highestCustom=0;
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name.substr(0,3)=="CUS"){
                columns.push(this.columns[i]);
                var num = int(this.columns[i].name.substr(3));
                if(num>highestCustom)highestCustom=num;
            }
        }
        columns.push(new Column(this,"CUS"+(highestCustom+1)));
        return columns;
    }
    
    getDefaultName(){return "New Course"};
    
    getType(){return "course"};
    getButtonClass(){return "layoutcourse";}
    getIcon(){return "course";}
    
    typeToXML(){return makeXML("course","wftype");}
    
    getTagDepth(){return 1;}
}

class Activityflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        columns.push(new Column(this,"OOC"));
        columns.push(new Column(this,"ICI"));
        columns.push(new Column(this,"ICS"));
    }
    
    getPossibleColumns(){
        var columns = [];
        columns.push(new Column(this,"OOC"));
        columns.push(new Column(this,"ICI"));
        columns.push(new Column(this,"ICS"));
        var highestCustom=0;
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name.substr(0,3)=="CUS"){
                columns.push(this.columns[i]);
                var num = int(this.columns[i].name.substr(3));
                if(num>highestCustom)highestCustom=num;
            }
        }
        columns.push(new Column(this,"CUS"+(highestCustom+1)));
        return columns;
    }
    
    createBaseWeek(){
        var baseWeek = new WFArea(this);
        baseWeek.index=0;
        this.weeks.push(baseWeek);
        if(this.view)this.view.weekAdded(baseWeek);
    }
    
    createWeek(){
        var week = new WFArea(this);
        return week;
    }
    
    updateWeekIndices(){};
    
    getType(){return "activity"};
    getButtonClass(){return "layoutactivity";}
    getIcon(){return "activity";}
    getBracketList(){return iconsList['strategy'];}
    
    typeToXML(){return makeXML("activity","wftype");}
    
    getDefaultName(){return "New Activity"};
    
    
    
    
}

class Programflow extends Workflow{
    
    createInitialColumns(){
        var columns = this.columns;
        columns.push(new Column(this,"CO"));
        columns.push(new Column(this,"SA"));
    }
    
    getPossibleColumns(){
        var columns = [];
        columns.push(new Column(this,"CO"));
        columns.push(new Column(this,"SA"));
        var highestCustom=0;
        for(var i=0;i<this.columns.length;i++){
            if(this.columns[i].name.substr(0,3)=="CUS"){
                columns.push(this.columns[i]);
                var num = int(this.columns[i].name.substr(3));
                if(num>highestCustom)highestCustom=num;
            }
        }
        columns.push(new Column(this,"CUS"+(highestCustom+1)));
        return columns;
    }
    
    createWeek(){
        return new Term(this);
    }
    
    
    
    createBaseWeek(){
        var baseWeek = new Term(this);
        this.weeks.push(baseWeek);
        if(this.view)this.view.weekAdded(baseWeek);
        this.updateWeekIndices();
    }
    
    //updateWeekIndices(){};
    
    getType(){return "program";}
    getButtonClass(){return "layoutprogram";}
    getIcon(){return "program";}
    getTagDepth(){return 0;}
    
    typeToXML(){return makeXML("program","wftype");}
    
    getDefaultName(){return "New Program"};
    
    
    
    
}