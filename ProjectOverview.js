//A class which creates an overview of the project in the graphcontainer when no layouts are being displayed.

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

class ProjectOverview{
    constructor(container, project){
        this.container = container;
        this.project = project;
        this.contentdivs=[];
    }
    
    nameUpdated(){
        this.nameDiv.innerHTML = this.project.name;
    }
    
    makeActive(){
        var p = this.project;
        this.container.innerHTML = "";
        this.container.style.width = "auto";
        this.container.style.height = "auto";
        var wrapper = document.createElement('div');
        this.container.appendChild(wrapper);
        wrapper.className = "projectoverview";
        var header = document.createElement('h1');
        header.innerHTML = LANGUAGE_TEXT.project.projectoverview[USER_LANGUAGE];
        wrapper.appendChild(header);
        
        var nameBlock = document.createElement('div');
        this.nameDiv = document.createElement('div');
        var editNameDiv = document.createElement('div');
        var nameIcon = document.createElement('img');
        
        nameIcon.src="resources/images/edit16.png";
        nameIcon.style.width='16px';
        editNameDiv.className="deletelayoutdiv";
        editNameDiv.appendChild(nameIcon);
        this.nameDiv.innerHTML = this.project.name;
        editNameDiv.onclick = function(){if(p.readOnly)return;p.requestName(LANGUAGE_TEXT.layoutnav.projectreanmetitle[USER_LANGUAGE]);}
        nameBlock.appendChild(this.nameDiv);
        nameBlock.appendChild(editNameDiv);
        nameBlock.classList.add("projecttitle");
        wrapper.appendChild(nameBlock);
        wrapper.appendChild(document.createElement('hr'));
        
        var types = [];
        for(var prop in this.project.workflows)types.push(prop);
        for(var i=0;i<types.length;i++){
            var content = new ProjectOverviewCategory(wrapper,types[i],this)
            content.creatediv();
            this.contentdivs.push(content);
        }
        
    }
    
    makeInactive(){
        for(var i=0;i<this.contentdivs.length;i++)this.contentdivs[i].depopulate();
        this.container.innerHTML = "";
    }
    
    workflowAdded(wf){
        for(var i=0;i<this.contentdivs.length;i++){
            if(this.contentdivs[i].type==wf.getType())wf.addButton(this.contentdivs[i].div,false);
        }
    }
    
    workflowRemoved(wf){
        for(var i=0;i<this.contentdivs.length;i++){
            if(this.contentdivs[i].type==wf.getType()){
                for(var j=0;j<this.contentdivs[i].buttons.length;j++){
                    if(this.contentdivs[i].buttons[j].layout==wf){
                        this.contentdivs[i].buttons.splice(j,1);
                        j--;
                    }
                }
            }
        }
    }
    
}

class ProjectOverviewCategory{
    constructor(container,type,overview){
        this.container = container;
        this.type = type;
        this.overview = overview;
        this.div;
        this.buttons=[];
    }
    
    creatediv(){
        var pcv = this;
        var wrapper = document.createElement('div');
        wrapper.className = "categorywrapper";
        this.container.appendChild(wrapper);
        this.div = document.createElement('div');
        this.div.className = "workflowdiv"
        var header = document.createElement('h3');
        header.innerHTML = LANGUAGE_TEXT.workflow.plurals[this.type][USER_LANGUAGE];
        wrapper.appendChild(header);
        wrapper.appendChild(this.div);
        var createchild = document.createElement('div');
        createchild.innerHTML = "+" + LANGUAGE_TEXT.layoutnav.createnew[USER_LANGUAGE];
        createchild.className = "createlayoutdiv";
        createchild.onclick = function(){pcv.overview.project.addWorkflow(pcv.type);}
        wrapper.appendChild(createchild);
        if(this.type=="outcome")wrapper.style.width="760px";
        this.populate();
    }
    
    populate(){
        var layouts = this.overview.project.workflows[this.type];
        for(var i=0;i<layouts.length;i++){
            this.buttons.push(layouts[i].addButton(this.div,false));
            this.buttons[i].nonLayout=true;
        }
        
    }
    
    depopulate(){
        for(var i=0;i<this.buttons.length;i++){
            this.buttons[i].layout.removeButton(this.buttons[i]);
        }
        this.buttons=[];
    }
}