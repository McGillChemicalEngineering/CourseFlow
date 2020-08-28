//Layoutbutton class, which creates buttons for tags and workflows to appear in the side nav, and in other places where a heirarchical layout is required.

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

class Layoutbutton {
    constructor(layout,container){
        this.container=container;
        this.layout = layout;
        this.bdiv = document.createElement('div');
        this.bdiv.className = "layoutdiv";
        this.bdiv.button=this;
        this.bwrap = document.createElement('div');
        this.bwrap.className = "layoutbuttonwrap";
        this.b = this.makeB();
        this.b.className=layout.getButtonClass();
        this.b.onclick = function(){layout.clickButton();}
        this.namediv = document.createElement('div');
        this.icon = this.makeIcon();
        this.icon.draggable=false;
        this.hiddenchildren = document.createElement('div');
        this.hiddenchildren.className = "hiddenchildrendiv";
        this.expandIcon = document.createElement('img');
        this.b.appendChild(this.icon);
        this.b.appendChild(this.namediv);
        this.bwrap.appendChild(this.b);
        this.bdiv.appendChild(this.bwrap);
        this.bdiv.appendChild(this.hiddenchildren);
        this.childdiv = this.makeChildDiv();
        this.childdiv.className="layoutchilddiv";
        this.bdiv.appendChild(this.childdiv);
        this.container.appendChild(this.bdiv);
        this.bdiv.contextItem = this;
        if(container.parentElement.button!=null){container.parentElement.button.updateChildren();}
        this.updateButton();
    }
    
    makeIcon(){
        return document.createElement('img');
    }
    
    makeB(){return document.createElement('button');}
    makeChildDiv(){return document.createElement('div');}
    
    updateChildren(){
        var layout = this.layout;
        if(layout.children.length>0){
            this.bdiv.classList.add("haschildren");
            var des={};
            des = layout.getNumberOfDescendants(des);
            var text = "... ";
            for (var propt in des){
                var s = propt;
                if(des[propt]!=1){
                    s=s.replace(/y$/,"ie").replace(/s$/,"");
                    s+="s";
                }
                text+=des[propt]+" ";
                text+=s+", ";
            }
            text = text.replace(/, $/,"");
            this.hiddenchildren.innerHTML = text;
        }else{
            this.bdiv.classList.remove("haschildren");
            if(this.bdiv.classList.contains("expanded"))this.collapse();
        }
    }
    
    updateChildrenUnlinked(){
        if(this.childdiv.childNodes.length>0){
            this.bdiv.classList.add("haschildren");
            var des = {};
            des = this.getNumberOfDescendants(des);
            var text = "... ";
            for (var propt in des){
                var s = propt;
                if(des[propt]!=1){
                    s=s.replace(/y$/,"ie").replace(/s$/,"");
                    s+="s";
                }
                text+=des[propt]+" ";
                text+=s+", ";
            }
            text = text.replace(/, $/,"");
            this.hiddenchildren.innerHTML = text;
        }else{
            this.bdiv.classList.remove("haschildren");
            if(this.bdiv.classList.contains("expanded"))this.collapse();
        }
    }
    
    getNumberOfDescendants(des){
        var children = this.childdiv.childNodes;
        for(var i=0;i<children.length;i++){
            var child = children[i];
            console.log(child.button.layout.getNameType());
            var type = child.button.layout.getNameType();
            if(des[type]==null)des[type]=1;
            else des[type]=des[type]+1;
            des = child.button.getNumberOfDescendants(des);
        }
        return des;
    }
    
    updateButton(){
        this.namediv.innerHTML = this.layout.name;
        if(this.layout.getIcon())this.icon.src=iconpath+this.layout.getIcon()+".svg";
    }
    
    
    removeSelf(){
        this.container.removeChild(this.bdiv);
        if(this.container.parentElement.button!=null){this.container.parentElement.button.updateChildren();}
    }
    
    
    makeEditable(renamable=true,deletable=true,unassignable=true,parent=null){
        this.renamable=renamable;
        this.deletable=deletable;
        this.unassignable=unassignable;
        var p = this.layout.project;
        var layout = this.layout;
        var bl = this;
        var b = this.b;
        var edit = document.createElement('div');
        edit.className="deletelayoutdiv";
        if(renamable){
            var nameIcon = document.createElement('img');
            nameIcon.src=iconpath+"edit.svg";
            nameIcon.style.width='16px';
            nameIcon.onclick=function(){
                bl.renameClick();
            }
            edit.appendChild(nameIcon);
        }
        if(deletable){
            var delicon = document.createElement('img');
            delicon.src=iconpath+"delrect.svg";
            delicon.style.width='16px';
            delicon.onclick=function(){
                bl.deleteClick();
            }
            edit.appendChild(delicon);
        }
        if(unassignable){
            edit.appendChild(this.makeUnassign(parent));
        }
        this.bwrap.appendChild(edit);
    }
    
    deleteClick(){
        if(mxUtils.confirm(this.layout.getDeleteText())){
            this.layout.deleteSelf(this);
        }
    }
    
    makeUnassign(parent){
        var layout = this.layout;
        var b = this;
        if(parent==null&&this.container.layout!=null)parent = this.container.layout;
        this.unassignParent = parent;
        var unassignicon = document.createElement('img');
        unassignicon.src=iconpath+"unassign.svg";
        unassignicon.style.width='16px';
        unassignicon.onclick=function(){
            b.unassignClick();
        }
        return unassignicon;
    }
    
    unassignClick(){
        var parent = this.unassignParent;
        var layout = this.layout;
        if(mxUtils.confirm(layout.getUnassignText())){
            layout.unassignFrom(parent);
        }
    }
    
    renameClick(){
        var p;
        if(this.layout instanceof Project)p=this.layout;
        else p = this.layout.project;
        var layout = this.layout;
        var bl = this;
        var b = this.b;
        var tempfunc = b.onclick;
        //create an input, on enter or exit make that the new name
        bl.namediv.innerHTML="<input type='text' value = '"+layout.name+"'placeholder='<type a new name here>'></input>";
        bl.namediv.firstElementChild.focus();
        bl.namediv.firstElementChild.select();
        b.onclick=null;
        p.container.addEventListener('mouseup',function(evt){
            if(bl.namediv.firstElementChild!=null&&!bl.namediv.contains(evt.target))bl.namediv.firstElementChild.blur();
        },{once:true});
        var enterfunc =function(evt){
            if(evt.key!=null&&evt.key=="Enter"){
                
                if(bl.namediv.firstElementChild!=null)bl.namediv.firstElementChild.blur();
            }
        }
        document.addEventListener('keydown',enterfunc);
        bl.namediv.firstElementChild.addEventListener("focusout",function(){
            b.onclick=tempfunc;
            if(bl.namediv.firstElementChild.value=="")bl.namediv.innerHTML=layout.name;
            else {
                layout.setName(bl.namediv.firstElementChild.value);
            }
            document.removeEventListener('keydown',enterfunc);
        },{once:true});
    }
    
    makeCreateChild(createfunction){
        this.createfunction=createfunction;
        var create = document.createElement('div');
        create.className="createlayoutdiv";
        create.innerHTML = "+"+LANGUAGE_TEXT.layoutnav.createnew[USER_LANGUAGE];
        create.onclick=createfunction;
        this.bdiv.appendChild(create);
    }
    
    makeMovable(){
        var layout = this.layout;
        var button = this;
        var bdiv = this.bdiv;
        
        bdiv.draggable=false;
        bdiv.ondragstart = function(evt){
            var id = 'drag-'+Date.now();
            bdiv.id=id;
            evt.dataTransfer.setData("text",id);
            evt.stopPropagation();
        }
        bdiv.ondragover = function(evt){
            evt.stopPropagation();
            var source = document.getElementById(evt.dataTransfer.getData("text"));
            if(source==null||source.button==null||source.button.layout==null||layout instanceof Workflow!=source.button.layout instanceof Workflow)return;
            evt.preventDefault();
            var sourcebutton = source.button;
            if(sourcebutton==null||sourcebutton==button)return;
            var currentTime = Date.now();
            if(sourcebutton.lastDragged!=null&&(sourcebutton.nextNewDrop>currentTime||(sourcebutton.lastDragged==button&&sourcebutton.nextSameDrop>currentTime)))return;
            sourcebutton.lastDragged=button;
            sourcebutton.nextNewDrop = currentTime+300;
            sourcebutton.nextSameDrop = currentTime+500;
            sourcebutton.attemptToDrop(button);
            
        }
        button.bdiv.ondrop = function(evt){
            evt.preventDefault();
        }
        button.bdiv.ondragend=function(evt){
            bdiv.draggable=false;
            bdiv.classList.remove("dragging");
        }
        
        var movehandle = document.createElement('div');
        movehandle.className = "movehandle";
        var up = document.createElement('img');
        up.src = iconpath+"movehandle.svg";
        up.draggable=false;
        movehandle.onmousedown=function(evt){
            if(evt.buttons>1)return;
            bdiv.draggable=true;
            bdiv.classList.add("dragging");
        }
        movehandle.onmouseup = function(){
            bdiv.draggable=false;
            bdiv.classList.remove("dragging");
        }
        movehandle.appendChild(up);
        this.bdiv.insertBefore(movehandle,this.childdiv);
    }
    
    attemptToDrop(target){
        var parent = this.getParent();
        if(parent==target||target.getParent()==this)return;
        //For workflows, we shouldn't be able to move them out of their parent. For tags, this might be desirable (ex moving a depth 2 tag from one depth 1 to another).
        //For both: If you're dragging a root level, then find the highest ancestor of the target and just rearrange in whatever way is appropriate
        if(parent==null){
            //We should have the same parents
            if(this.bdiv.parentElement!=target.bdiv.parentElement)return;
            var ancestor2 = target.getMostDistantAncestor();
            if(this==ancestor2)return;
            this.moveTo(ancestor2);
        }else{
        //Take the target, find the ancestor that is of the same class (or for tags at the same depth) as the source. For workflows move iff they have the same parent, for tags move iff they have the same most distant ancestor
            var myDepth = this.layout.getDepth();
            var targetDepth = target.layout.getDepth();
            var moveInto = false;
            if(targetDepth==myDepth-1&&this.layout instanceof Tag){
                moveInto = true;
            }else target = target.getAncestorWithDepth(this.layout.getDepth());
            if(target==null)return;
            if(this.layout instanceof Workflow && target.getParent()!=parent)return;
            if(this.layout instanceof Tag && this.getMostDistantAncestor() != target.getMostDistantAncestor())return;
            if(moveInto)this.moveInto(target);
            else this.moveTo(target);
        }
        
        
    }
    
    getParent(){
        if(this.container.parentElement.classList.contains("layoutdiv")){
            return this.container.parentElement.button;
        }
        return null;
    }
    
    getMostDistantAncestor(){
        var ancestor =this;
        while(true){
            var parent = ancestor.getParent();
            if(parent==null)return ancestor;
            else ancestor = parent;
        }
    }
        
    getAncestorWithDepth(targetDepth){
        var ancestor = this;
        while(ancestor.layout.getDepth()!=targetDepth){
            var parent = ancestor.getParent();
            if(parent==null)return null;
            else ancestor = parent;
        }
        return ancestor;
    }
    
    makeNodeIndicators(){
        var indicatorSuper = document.createElement('div');
        indicatorSuper.className="nodeindicatorwrap";
        var indicatorHelper = document.createElement('div');
        indicatorHelper.className="nodeindicatorhelper";
        indicatorSuper.appendChild(indicatorHelper);
        var indicatorWrap = document.createElement('div');
        indicatorWrap.className = "nodeindicatordiv";
        this.indicatorWrap = indicatorWrap;
        indicatorSuper.appendChild(indicatorWrap);
        this.bwrap.appendChild(indicatorSuper);
    }
    
    makeExpandable(){
        var bl = this;
        var expandDiv = document.createElement('div');
        expandDiv.className="expanddiv";
        this.expandIcon.src=iconpath+"arrowright.svg";
        this.expandIcon.style.width='16px';
        this.expandIcon.onclick=function(){
            if(bl.bdiv.classList.contains("expanded")){bl.collapse();}
            else {bl.expand();}
        }
        expandDiv.appendChild(this.expandIcon);
        this.bdiv.appendChild(expandDiv);
        this.hiddenchildren.onclick = this.expandIcon.onclick;
    }
    
    expand(){
        this.bdiv.classList.add("expanded");
        this.expandIcon.src=iconpath+"arrowdown.svg";
    }
    
    collapse(){
        this.bdiv.classList.remove("expanded");
        this.expandIcon.src=iconpath+"arrowright.svg";
    }
    
    makeActive(){
        this.bdiv.classList.add("active");
    }
    
    makeInactive(){
        this.bdiv.classList.remove("active");
    }
    
    moveTo(target){
        //figure out of we are moving up or down
        var parent = this.getParent();
        var targetParent = target.getParent();
        var isAfter = false;
        var myindex = Array.prototype.indexOf.call(this.container.children,this.bdiv);
        var targetindex = Array.prototype.indexOf.call(this.container.children,target.bdiv);
        if(targetindex>myindex)isAfter=true;
        var container = target.container;
        if(isAfter)container.insertBefore(this.bdiv,target.bdiv.nextElementSibling);
        else container.insertBefore(this.bdiv,target.bdiv);
        this.container = container;
        if(parent == null){
            //We are dropping at the root level
            this.layout.project.moveLayout(this.layout,target.layout,isAfter);
        }else{
            //We are dropping at another level
            targetParent.layout.moveChild(this.layout,target.layout,isAfter);
        }
        if(parent!=targetParent){
            if(parent)parent.updateChildren();
            if(targetParent)target.updateChildren();
        }
    }
    
    moveInto(target){
        var parent = this.getParent();
        this.container = target.childdiv;
        target.childdiv.insertBefore(this.bdiv,target.childdiv.firstElementChild);
        target.layout.moveChild(this.layout,null,true);
        target.updateChildren();
        target.expand();
        if(parent)parent.updateChildren();
    }
    
    
    updateNodeIndicators(colours,isComplete){
        this.indicatorWrap.innerHTML="";
        if(isComplete){
            var check = document.createElement('img');
            check.src = iconpath+"check.svg";
            check.style.width='16px';
            check.style.verticalAlign="middle";
            this.indicatorWrap.appendChild(check);
        } else for(var i=0;i<colours.length;i++){
            var circle = document.createElement('div');
            circle.className = "indicatordot";
            circle.style.background = colours[i];
            this.indicatorWrap.appendChild(circle);
        }
    }
    
    populateMenu(menu){
        var b = this;
        if(this.renamable)menu.addItem(LANGUAGE_TEXT.workflow.rename[USER_LANGUAGE],iconpath+'edit.svg',function(){
            b.renameClick();
        });
        if(this.deletable)menu.addItem(LANGUAGE_TEXT.workflow.delete[USER_LANGUAGE],iconpath+'delrect.svg',function(){
            b.deleteClick();
        });
         if(this.unassignable)menu.addItem(LANGUAGE_TEXT.workflow.unassign[USER_LANGUAGE],iconpath+'unassign.svg',function(){
            b.unassignClick();
        });
        
        if(this.createfunction)menu.addItem(LANGUAGE_TEXT.workflow.createchild[USER_LANGUAGE],iconpath+'createchild.svg',function(){
            b.createfunction();
        });
        
        menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],iconpath+'info.svg',function(){
            var layout = b.layout;
            if(layout instanceof Tag)layout.project.showHelp('outcomehelp.html');
            else if(layout instanceof Activityflow)layout.project.showHelp('activityhelp.html');
            else if(layout instanceof Activityflow)layout.project.showHelp('coursehelp.html');
            else if(layout instanceof Activityflow)layout.project.showHelp('programhelp.html');
            else layout.project.showHelp('help.html');
        });
    }


}

class CompetencyEditButton extends Layoutbutton{
    makeB(){return document.createElement('li');}
    makeChildDiv(){return document.createElement('ol');}
    collapse(){this.layout.collapsed=true;super.collapse();}
    expand(){this.layout.collapsed=false;super.expand();}
}

class EditBarTagButton extends Layoutbutton{
     makeUnassign(parent){
        var layout = this.layout;
        if(parent==null&&this.container.layout!=null)parent = this.container.layout;
        var unassignicon = document.createElement('img');
        unassignicon.src=iconpath+"unassign.svg";
        unassignicon.style.width='16px';
        unassignicon.onclick=function(){
            unassignicon.classList.add("detached");
            layout.unassignFrom(parent);
        }
        return unassignicon;
    }
}

class NodeTagButton extends EditBarTagButton{
    updateButton(iconhtml,completeness=1){
        if(iconhtml)this.icon.innerHTML=iconhtml;
        this.namediv.innerHTML = this.layout.name;
        if(this.outcomecheckbox)this.outcomecheckbox.value=completeness;
        for(var i=0;i<this.childdiv.childNodes.length;i++){
            var bdiv = this.childdiv.childNodes[i];
            if(bdiv.button){
                bdiv.button.updateButton(iconhtml,completeness);
            }
        }
    }
    
    makeIcon(){
        var icon = document.createElement('div');
        icon.className = "nodetagbuttonicon";
        return icon;
    }
}