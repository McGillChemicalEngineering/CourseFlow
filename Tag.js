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
        this.subtags=[];
        this.nodes=[];
        this.buttons=[];
        this.parentTag=parentTag;
        this.depth;
        this.wrapperDiv;
        this.isActive=false;
    }
    
    setName(name){
        if(name!=null && name!=""){
            name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
            for(var i=0;i<this.buttons.length;i++){
                this.buttons[i].firstElementChild.firstElementChild.innerHTML=this.name;
            }
        }
    }
    
    getDefaultName(){
        return "New "+this.getType();
    }
    
    getButtonClass(){return "layoutactivity";}
    
    getChildren(){return this.subtags;}
    
    getDeleteText(){
            return "Delete this learning outcome? Warning: this will delete all contents and remove them from all workflows!";
    }
    
    getUnassignText(){
        return "Unassign this learning outcome? Note: this will NOT delete the learning outcome, but WILL remove all references to it from the workflow.";
    }
    
    deleteSelf(){
        this.project.deleteComp(this);
    }
    
    unassignFrom(parent){
        if(parent instanceof Workflow){
            parent.removeTagSet(this);
            parent.populateTagBar();
            parent.populateTagSelect(this.project.competencies);
            
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
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"tagname");
        xml+=makeXML(this.id,"tagid");
        for(var i=0;i<this.subtags.length;i++){
            xml+=this.subtags[i].toXML();
        }
        return makeXML(xml,"tag");
    }
    
    fromXML(xml){
        this.setName(getXMLVal(xml,"tagname"));
        this.id=getXMLVal(xml,"tagid");
        //var subtags = xml.querySelectorAll('tag>tag');
        for(var i = 0;i<xml.childNodes.length;i++){
            if(xml.childNodes[i].nodeName=="tag"){
                var newtag = new Tag(this.project,this);
                newtag.fromXML(xml.childNodes[i]);
                this.subtags.push(newtag);
            }
        }
    }
    
    makeActive(container){
        this.isActive=true;
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].classList.add("active");
        }
        this.wrapperDiv = document.createElement('div');
        this.wrapperDiv.innerHTML="<h3>Learning Outcomes (Under Development):</h3><p>This experimental feature is currently incomplete. Please use caution when making use of it: save often, and keep a backup of your file without the learning outcomes.</p>"
        this.wrapperDiv.className = "competencywrapper";
        container.appendChild(this.wrapperDiv);
        
        this.makeInitialLine(this.wrapperDiv);
    }
    
    makeInactive(container){
        this.isActive=false;
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].classList.remove("active");
        } 
        container.removeChild(this.wrapperDiv);
        this.wrapperDiv = null;
    }
    
    getTagByID(id){
        if(this.id==id)return this;
        var tag;
        for(var i=0;i<this.subtags.length;i++){
            tag = this.subtags[i].getTagByID(id);
            if(tag!=null)return tag;
        }
        return null;
    }
    
    getAllID(list){
        list.push(this.id);
        for(var i=0;i<this.subtags.length;i++){
            list = this.subtags[i].getAllID(list);
        }
        return list;
    }
    
    makeInitialLine(container){
        var button = this.makeButton(container);
        for(var i=0;i<this.subtags.length;i++){
            this.subtags[i].makeInitialLine(button);
        }
    }
    
    makeButton(container){
        var tag = this;
        var p = tag.project;
        if(container.wf!=null&&container.hiddenchildren!=null)p.updateHiddenChildren(container);
        if(container.classList.contains("layoutdiv"))container.classList.add("haschildren");
        var bdiv = p.makeLayoutButtonDiv(tag,container);
        var bwrap = p.makeLayoutButtonWrapper(tag,bdiv);
        var b = p.makeLayoutButton(tag);
        bwrap.appendChild(b);
        bwrap.appendChild(p.makeLayoutButtonEdit(tag,b,true,true,false));
        bwrap.appendChild(p.makeLayoutButtonMove(tag,bdiv));
        bdiv.appendChild(bwrap);
        p.makeLayoutButtonExpandable(bdiv);
        
        var addChild = document.createElement('button');
        addChild.innerHTML = "+";
        addChild.className = "addsubtag";
        addChild.onclick = function(){
            var newtag = new Tag(tag.project,tag);
            tag.subtags.push(newtag);
            newtag.makeInitialLine(bdiv);
        }
        bdiv.appendChild(addChild);
        var prevAdd;
        if(container.lastChild!=null&&container.lastChild.classList.contains("addsubtag"))prevAdd = container.lastChild;
        bdiv.wf=tag;
        container.insertBefore(bdiv,prevAdd);
        return bdiv;
    }
    
    
    swapUsedIndices(id1,id2){
        for(var i=0;i<this.subtags.length;i++){
            if(this.subtags[i].id==id1){
                for(var j=0;j<this.subtags.length;j++){
                    if(this.subtags[j].id==id2){
                        [this.subtags[i],this.subtags[j]]=[this.subtags[j],this.subtags[i]];
                        return;
                    }
                }
            }
        }
    }
    
}

