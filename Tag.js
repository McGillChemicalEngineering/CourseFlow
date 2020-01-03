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
        this.buttons=[];
        this.parentTag=parentTag;
        this.depth;
        this.isActive=false;
        this.view;
    }
    
    setName(name){
        if(name!=null && name!=""){
            //name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].updateButton();
            }
            if(this.view)this.view.nameUpdated();
        }
    }

    makeActive(view){
        try{
            this.isActive=true;
            this.view = view;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].makeActive();
            }
            this.view.makeActive();
        }catch(err){
            alert("Oops! The outcome could not be opened.");
            gaError("Outcome",err);
        }
    }
    
    makeInactive(){
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].makeInactive();
        } 
        this.view.makeInactive();
        this.view = null;
    }
    
    removeChild(child){
        if(this.children.indexOf(child)>=0){
            this.children.splice(this.children.indexOf(child),1);
        }
    }
    
    getDefaultName(){
        return "New "+this.getType();
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
            parent.makeUndo("Tagset Removed",parent);
            
        }else if(parent instanceof CFNode){
            parent.removeTag(this,true);
            parent.wf.makeUndo("Tag Removed",parent);
            if(parent.wf.view){
                var eb = parent.wf.view.editbar;
                if(eb.node==parent){
                    eb.populateTags();
                }
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
        xml+=makeXML(this.name,"tagname",true);
        xml+=makeXML(this.id,"tagid");
        for(var i=0;i<this.children.length;i++){
            xml+=this.children[i].toXML();
        }
        return makeXML(xml,"tag");
    }
    
    fromXML(xml){
        this.setName(getXMLVal(xml,"tagname",true));
        this.id=getXMLVal(xml,"tagid");
        for(var i = 0;i<xml.childNodes.length;i++){
            if(xml.childNodes[i].nodeName=="tag"){
                var newtag = new Tag(this.project,this);
                newtag.fromXML(xml.childNodes[i]);
                this.children.push(newtag);
            }
        }
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
    
    
    
    
    
    //swap the two usedsubtags (used to rearrange the layout)
    swapChildren(c1,c2){
        var i1 = this.children.indexOf(c1);
        var i2 = this.children.indexOf(c2);
        [this.children[i1],this.children[i2]]=[this.children[i2],this.children[i1]];
        
    }
    
    
    
    
    
}

