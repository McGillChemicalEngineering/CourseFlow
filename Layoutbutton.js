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
        this.icon = document.createElement('img');
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
        if(container.parentElement.button!=null){container.parentElement.button.updateChildren();}
        this.updateButton();        
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
                    s=s.replace(/y$/,"ie");
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
    
    updateButton(){
        this.namediv.innerHTML = this.layout.name;
        this.icon.src="resources/data/"+this.layout.getIcon()+"24.png";
    }
    
    removeSelf(){
        this.container.removeChild(this.bdiv);
        if(this.container.parentElement.button!=null){this.container.parentElement.button.updateChildren();}
    }
    
    
    makeEditable(renamable=true,deletable=true,unassignable=true,parent=null){
        var p = this.layout.project;
        var layout = this.layout;
        var bl = this;
        var b = this.b;
        var edit = document.createElement('div');
        edit.className="deletelayoutdiv";
        if(renamable){
            var nameIcon = document.createElement('img');
            nameIcon.src="resources/images/edit16.png";
            nameIcon.style.width='16px';
            nameIcon.onclick=function(){
                bl.renameClick();
            }
            edit.appendChild(nameIcon);
        }
        if(deletable){
            var delicon = document.createElement('img');
            delicon.src="resources/images/delrect16.png";
            delicon.style.width='16px';
            delicon.onclick=function(){
                if(mxUtils.confirm(layout.getDeleteText())){
                    layout.deleteSelf(bl);
                }
            }
            edit.appendChild(delicon);
        }
        if(unassignable){
            edit.appendChild(this.makeUnassign(parent));
        }
        this.bwrap.appendChild(edit);
    }
    
    makeUnassign(parent){
        var layout = this.layout;
        if(parent==null&&this.container.layout!=null)parent = this.container.layout;
        var unassignicon = document.createElement('img');
        unassignicon.src="resources/images/unassign16.png";
        unassignicon.style.width='16px';
        unassignicon.onclick=function(){
            if(mxUtils.confirm(layout.getUnassignText())){
                layout.unassignFrom(parent);
            }
        }
        return unassignicon;
    }
    
    renameClick(){
        
        var p = this.layout.project;
        var layout = this.layout;
        var bl = this;
        var b = this.b;
        var tempfunc = b.onclick;
        //create an input, on enter or exit make that the new name
        bl.namediv.innerHTML="<input type='text' value = '"+layout.name+"'placeholder='<type a new name here>'></input>";
        bl.namediv.firstElementChild.focus();
        bl.namediv.firstElementChild.select();
        b.onclick=null;
        p.container.addEventListener('click',function(){
            if(bl.namediv.firstElementChild!=null)bl.namediv.firstElementChild.blur();
        },true);
        bl.namediv.firstElementChild.addEventListener("focusout",function(){
            b.onclick=tempfunc;
            if(bl.namediv.firstElementChild.value=="")bl.namediv.innerHTML=layout.name;
            else {
                layout.setName(bl.namediv.firstElementChild.value,true);
                bl.namediv.innerHTML=layout.name;
            }
        },true);
    }
    
    makeCreateChild(createfunction){
        var create = document.createElement('div');
        create.className="createlayoutdiv";
        var childicon = document.createElement('img');
        childicon.src="resources/images/createchild16.png";
        childicon.style.width='16px';
        childicon.onclick=createfunction;
        create.appendChild(childicon);
        this.bwrap.appendChild(create);
    }
    
    makeMovable(){
        var layout = this.layout;
        var button = this;
        var move = document.createElement('div');
        move.className = "editlayoutdiv";
        var up = document.createElement('img');
        up.className="layoutchange";
        up.src = "resources/images/moveup16.png";
        up.onclick=function(){
            button.moveButton(true);
        }
        move.appendChild(up);
        var down = document.createElement('img');
        down.className="layoutchange";
        down.src = "resources/images/movedown16.png";
        down.onclick=function(){
            button.moveButton(false);
        }
        move.appendChild(down);
        this.bwrap.appendChild(move);
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
        this.expandIcon.src="resources/images/plus16.png";
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
        this.expandIcon.src="resources/images/minus16.png";
    }
    
    collapse(){
        this.bdiv.classList.remove("expanded");
        this.expandIcon.src="resources/images/plus16.png";
    }
    
    makeActive(){
        this.bdiv.classList.add("active");
    }
    
    makeInactive(){
        this.bdiv.classList.remove("active");
    }
    
    //moves the button up or down. If it's at the root level, this entails switching the workflow ordering and then switching the order of the buttons. If it's NOT at the root level, we have to switch it in children of the parent, then switch the order of the buttons.
    moveButton(up){
        var parent = this.container;
        var button2;
        var myindex = Array.prototype.indexOf.call(parent.childNodes,this.bdiv);
        if(up&&myindex>0&&parent.childNodes[myindex-1].classList.contains("layoutdiv")){
            //move it up
            button2 = parent.childNodes[myindex-1].button;
            parent.insertBefore(parent.childNodes[myindex],parent.childNodes[myindex-1]);

        }else if(!up&&myindex<parent.childNodes.length-1&&parent.childNodes[myindex+1].classList.contains("layoutdiv")){
            //move it down
            button2 = parent.childNodes[myindex+1].button;
            parent.insertBefore(parent.childNodes[myindex+1],parent.childNodes[myindex]);
        }
        if(button2!=null&&button2.layout!=null){
            if(!parent.parentElement.classList.contains("layoutdiv")){
                var p = this.layout.project;
                if(this.layout instanceof Workflow && button2.layout instanceof Workflow){
                    [p.workflows[p.workflows.indexOf(this.layout)],p.workflows[p.workflows.indexOf(button2.layout)]] = [p.workflows[p.workflows.indexOf(button2.layout)],p.workflows[p.workflows.indexOf(this.layout)]];
                    if(this.layout.isActive)p.activeWF = p.workflows.indexOf(this.layout);
                    else if (button2.layout.isActive)p.activeWF = p.workflows.indexOf(button2.layout);
                }else if(this.layout instanceof Tag && button2.layout instanceof Tag){
                    [p.competencies[p.competencies.indexOf(this.layout)],p.competencies[p.competencies.indexOf(button2.layout)]] = [p.competencies[p.competencies.indexOf(button2.layout)],p.competencies[p.competencies.indexOf(this.layout)]];
                    if(this.layout.isActive)p.activeComp = p.competencies.indexOf(this.layout);
                    else if (button2.layout.isActive)p.activeComp = p.competencies.indexOf(button2.layout);
                }
            }else{
                var buttonp = parent.button;
                if(buttonp!=null&&buttonp.layout!=null){
                    buttonp.layout.swapChildren(this.layout,button2.layout);
                }
                
            }
        }
    }
    
    updateNodeIndicators(colours,isComplete){
        this.indicatorWrap.innerHTML="";
        if(isComplete){
            var check = document.createElement('img');
            check.src = "resources/images/check16.png";
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


}

class CompetencyEditButton extends Layoutbutton{
    makeB(){return document.createElement('li');}
    makeChildDiv(){return document.createElement('ol');}
}

class EditBarTagButton extends Layoutbutton{
     makeUnassign(parent){
        var layout = this.layout;
        if(parent==null&&this.container.layout!=null)parent = this.container.layout;
        var unassignicon = document.createElement('img');
        unassignicon.src="resources/images/unassign16.png";
        unassignicon.style.width='16px';
        unassignicon.onclick=function(){
            layout.unassignFrom(parent);
        }
        return unassignicon;
    }
}