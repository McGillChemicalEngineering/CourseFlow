//A superclass to the workflow and tags

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

class Layout{
    constructor(project){
        this.project = project;
        this.name = this.getDefaultName();
        this.id = this.project.genID();
        this.children=[];
        this.buttons=[];
        this.isActive=false;
    }
    
    clickButton(){
        this.project.changeActive(this.project.getIndex(this));
        
    }
    
    addChild(child){
        this.children.push(child);
    }
    
    removeChild(child){
        this.children.splic(this.children.indexOf(child));
    }
    
    
    
    
    
}