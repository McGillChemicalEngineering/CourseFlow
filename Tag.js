//The tag class. This defines a tag, which is actually a tree-like structure. The root tag is stored at the top level of the project, and represents the tree itself (you probably shouldn't be able to tag anything with this top level one). Tags will also have a list of nodes, which is populated when a workflow is loaded and added to as tags are added, that correspond to those that have been tagged with the tag.

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

class Tag {
    constructor(project,parentTag){
        if(parentTag==null)this.depth=0;
        else(this.depth = parentTag.depth+1);
        this.name=this.getDefaultName();
        this.project = project;
        this.id = project.genID();
        this.children=[];
        this.nodes=[];
        this.drops=[];
        this.buttons=[];
        this.parentTag=parentTag;
        this.depth;
        this.wrapperDiv;
        this.isActive=false;
        this.isComplete=false;
    }
    
    setName(name){
        if(name!=null && name!=""){
            name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].namediv.innerHTML=this.name;
            }
        }
    }
    
    removeChild(child){
        if(this.children.indexOf(child)>=0){
            this.children.splice(this.children.indexOf(child),1);
        }
    }
    
    getDefaultName(){
        return "New "+this.getType();
    }
    
    clearData(){
        this.nodes=[];
        this.drops=[];
        this.isComplete=false;
        for(var i=0;i<this.children.length;i++){
            this.children[i].clearData();
        }
    }
    
    addButton(container,recurse=true){
        var button = new Layoutbutton(this,container);
        button.makeEditable(true,true,false);
        button.makeMovable();
        this.buttons.push(button);
        if(recurse)for(var i=0;i<this.children.length;i++){
            this.children[i].addButton(button.childdiv);
        }
    }
    
    removeButton(button){
        this.buttons.splice(this.buttons.indexOf(button),1);
        button.removeSelf();
    }
    
    getButtonClass(){return "layoutactivity";}
    
    getChildren(){return this.children;}
    
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
    
    getDeleteText(){
            return "Delete this learning outcome? Warning: this will delete all contents and remove them from all workflows!";
    }
    
    getUnassignText(){
        return "Unassign this learning outcome? Note: this will NOT delete the learning outcome, but WILL remove all references to it from the workflow.";
    }
    
    deleteSelf(button){
        if(this.depth==0)this.project.deleteComp(this);
        else{
            this.parentTag.removeChild(this);
            if(button!=null)button.removeSelf();
            for(var i=0;i<this.project.workflows.length;i++){
                this.project.workflows[i].purgeTag(this);
            }
        }
    }
    
    unassignFrom(parent){
        if(parent instanceof Workflow){
            parent.removeTagSet(this);
            parent.populateTagBar();
            parent.populateTagSelect(this.project.competencies,parent.getTagDepth());
            
        }else if(parent instanceof CFNode){
            parent.removeTag(this,true);
            parent.wf.makeUndo("Tag Removed",parent);
            var eb = this.project.editbar;
            if(eb.node==parent){
                eb.populateTags();
            }
            
        }else{
            console.log("I don't know what to do with this");
        }
    }
    
    clickButton(){
        this.project.changeActive(this.project.getCompIndex(this),false);
    }
    
    getType(){
        switch(this.depth){
            case 0: return "Program Outcome";
            case 1: return "Course Outcome";
            case 2: return "Activity Outcome";
            default: return "Tag";
        }
    }
    
    getIcon(){
        switch(this.depth){
            case 0: return "program";
            case 1: return "course";
            case 2: return "activity";
            default: return "";
        }
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"tagname");
        xml+=makeXML(this.id,"tagid");
        for(var i=0;i<this.children.length;i++){
            xml+=this.children[i].toXML();
        }
        return makeXML(xml,"tag");
    }
    
    fromXML(xml){
        this.setName(getXMLVal(xml,"tagname"));
        this.id=getXMLVal(xml,"tagid");
        for(var i = 0;i<xml.childNodes.length;i++){
            if(xml.childNodes[i].nodeName=="tag"){
                var newtag = new Tag(this.project,this);
                newtag.fromXML(xml.childNodes[i]);
                this.children.push(newtag);
            }
        }
    }
    
    makeActive(container){
        container.style.height="initial";
        container.style.overflow="initial";
        this.isActive=true;
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeActive();
        }
        this.wrapperDiv = document.createElement('div');
        this.wrapperDiv.innerHTML="<h3>Learning Outcomes:</h3><p>This page allows you to create outcomes. For an explanation of the outcomes, click here: <img src='resources/images/info32.png' width=16px id='outcomeinfo'></p>";
        var p = this.project;
        this.wrapperDiv.className = "competencywrapper";
        container.appendChild(this.wrapperDiv);
        document.getElementById('outcomeinfo').onclick = function(){p.showHelp("outcomehelp.html");}
        
        this.makeInitialLine(this.wrapperDiv);
    }
    
    makeInactive(container){
        this.isActive=false;
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeInactive();
        } 
        container.removeChild(this.wrapperDiv);
        this.wrapperDiv = null;
    }
    
    getTagByID(id){
        if(this.id==id)return this;
        var tag;
        for(var i=0;i<this.children.length;i++){
            tag = this.children[i].getTagByID(id);
            if(tag!=null)return tag;
        }
        return null;
    }
    
    getAllID(list,maxdepth=-1){
        list.push(this.id);
        if(this.depth!=maxdepth)for(var i=0;i<this.children.length;i++){
            list = this.children[i].getAllID(list,maxdepth);
        }
        return list;
    }
    
    getAllTags(list,maxdepth=-1,ignorelist=null){
        if(ignorelist!=null&&ignorelist.indexOf(this.id)>=0)return list;
        list.push(this);
        if(this.depth!=maxdepth)for(var i=0;i<this.children.length;i++){
            list = this.children[i].getAllTags(list,maxdepth,ignorelist);
        }
        return list;
    }
    
    makeInitialLine(container){
        var button = this.makeButton(container);
        for(var i=0;i<this.children.length;i++){
            this.children[i].makeInitialLine(button);
        }
    }
    
    makeButton(container){
        var tag = this;
        var button = new CompetencyEditButton(this,container);
        button.makeEditable(true,this.depth>0,false);
        button.makeMovable();
        button.makeExpandable();
        button.b.onclick=function(){button.renameClick();}
        var createchildfunction = function(){
            var newtag = new Tag(tag.project,tag);
            tag.children.push(newtag);
            newtag.makeInitialLine(button.childdiv);
            button.expand();
        }
        if(this.depth<2)button.makeCreateChild(createchildfunction);
        return button.childdiv;
    }
    
    addDrop(button){
        var tag = this;
        button.b.addEventListener("mouseover",function(evt){tag.highlight(true)});
        button.b.addEventListener("mouseleave",function(evt){if(!button.b.isToggled)tag.highlight(false)});
        button.b.hasListener=true;
        button.b.isToggled=false;
        button.b.onclick= function(){button.b.isToggled=(!button.b.isToggled);};
        this.drops.push(button);
    }
    
    
    //swap the two usedsubtags (used to rearrange the layout)
    swapChildren(c1,c2){
        var i1 = this.children.indexOf(c1);
        var i2 = this.children.indexOf(c2);
        [this.children[i1],this.children[i2]]=[this.children[i2],this.children[i1]];
        
    }
    
    highlight(on){
        for(var i=0;i<this.nodes.length;i++){
            this.nodes[i].highlight(on);
        }
        for(i=0;i<this.drops.length;i++){
            if(on&&this.nodes.length>0)this.drops[i].bwrap.classList.add("highlighted");
            else this.drops[i].bwrap.classList.remove("highlighted");
        }
    }
    
    makeEditButton(container,node,editbar){
        var tag = this;
        var button = new EditBarTagButton(this,container);
        button.makeEditable(false,false,true,node);
        button.b.onclick=null;
        return button.childdiv;
    }
    
    addNode(node){
        this.nodes.push(node);
        this.updateDrops();
    }
    
    removeNode(node){
        this.nodes.splice(this.nodes.indexOf(node),1);
        this.updateDrops();
    }
    
    updateDrops(){
        var colours = [];
        for(var i=0;i<this.nodes.length;i++){
            var colour = this.nodes[i].graph.getCellStyle(this.nodes[i].vertex)["fillColor"];
            if(colours.indexOf(colour)<0)colours.push(colour);
        }
        var colCount=99;
        if(this.nodes[0]!=null)colCount=this.nodes[0].wf.columns.length;
        this.isComplete=(this.children.length>0);
        for(i=0;i<this.children.length;i++){
            if(!this.children[i].isComplete)this.isComplete=false;
        }
        if(colCount<=colours.length)this.isComplete=true;
        
        for(i=0;i<this.drops.length;i++){
            this.drops[i].updateNodeIndicators(colours,this.isComplete);
        }
        if(this.parentTag!=null)this.parentTag.updateDrops();
        
        
    }
    
    
}

