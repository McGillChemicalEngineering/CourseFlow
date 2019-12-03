//A view of a tag that allows it and its descendants to be edited.

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

class Tagbuilder{
    constructor(container,tag){
        this.wrapperDiv;
        this.tag = tag;
        this.container = container;
        this.button;
        
    }
    
    makeActive(){
        var container = this.container;
        container.style.height="initial";
        container.style.overflow="initial";
        this.wrapperDiv = document.createElement('div');
        this.wrapperDiv.innerHTML="<h3>Learning Outcomes:</h3><p>This page allows you to create outcomes. For an explanation of the outcomes, click here: <img src='resources/images/info32.png' width=16px id='outcomeinfo'></p>";
        var p = this.tag.project;
        this.wrapperDiv.className = "competencywrapper";
        container.appendChild(this.wrapperDiv);
        document.getElementById('outcomeinfo').onclick = function(){p.showHelp("outcomehelp.html");}
        
        this.makeInitialLine(this.wrapperDiv);
    }
    
    makeInactive(){
        this.clearViews();
        this.container.removeChild(this.wrapperDiv);
    }
    
    nameUpdated(){
        this.button.updateButton();
    }
    
    clearViews(){
        for(var i=0;i<this.tag.children.length;i++){
            this.tag.children[i].view.clearViews();
        }
        this.tag.view = null;
    }
    
    makeInitialLine(container){
        var button = this.makeButton(container);
        for(var i=0;i<this.tag.children.length;i++){
            var child = this.tag.children[i];
            child.view = new this.constructor(this.container,child);
            child.view.makeInitialLine(button);
        }
    }
    
    makeButton(container){
        var tag = this.tag;
        var view = this;
        var button = new CompetencyEditButton(tag,container);
        button.makeEditable(true,tag.depth>0,false);
        button.makeMovable();
        button.makeExpandable();
        button.b.onclick=function(){button.renameClick();}
        var createchildfunction = function(){
            var newtag = new Tag(tag.project,tag);
            tag.children.push(newtag);
            newtag.view = new view.constructor(view.container,newtag);
            newtag.view.makeInitialLine(button.childdiv);
            button.expand();
        }
        if(tag.depth<2)button.makeCreateChild(createchildfunction);
        this.button = button;
        return button.childdiv;
    }
    
    
    
}