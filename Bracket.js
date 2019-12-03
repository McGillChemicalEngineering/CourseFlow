//The bracket object, used primarily in labeling strategies.

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


class Bracket {
    
    constructor(wf){
        this.wf=wf;
        this.topNode;
        this.bottomNode;
        this.label;
        this.icon;
        this.id = this.wf.project.genID();
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.id,"id");
        xml+=makeXML(this.icon,"icon");
        xml+=makeXML(this.topNode.id,"topnode");
        xml+=makeXML(this.bottomNode.id,"bottomnode");
        return makeXML(xml,"bracket");
    }
    
    
    fromXML(xml){
        this.id = getXMLVal(xml,"id");
        this.setIcon(getXMLVal(xml,"icon"));
        this.changeNode(this.wf.findNodeById(getXMLVal(xml,"topnode")),true);
        this.changeNode(this.wf.findNodeById(getXMLVal(xml,"bottomnode")),false);
    }
    
    setIcon(icon){
        if(this.wf.view)this.wf.view.legendUpdate('strategy',icon,this.icon,iconsList['strategy']);
        this.icon = icon;
        if(this.view)this.view.iconChanged();
    }
    
    
    
    getNode(isTop){
        if(isTop)return this.topNode;
        return this.bottomNode;
    }
    
    changeNode(newNode,isTop){
        if(isTop){
            if(this.topNode!=null)this.topNode.removeBracket(this);
            this.topNode=newNode;
            this.topNode.addBracket(this);
        }
        else{
            if(this.bottomNode!=null)this.bottomNode.removeBracket(this);
            this.bottomNode = newNode;
            this.bottomNode.addBracket(this);
        }
        if(this.view)this.view.nodeChanged();
    }
    
    
    
    deleteSelf(){
        if(this.wf.view)this.wf.view.legendUpdate('strategy',null,this.icon);
        this.topNode.removeBracket(this);
        this.bottomNode.removeBracket(this);
        this.wf.brackets.splice(this.wf.brackets.indexOf(this),1);
        if(this.view)this.view.deleted();
    }
    
    
    cellRemoved(node){
        var isTop=false;
        var isBottom=false;
        if(this.topNode==node)isTop=true;
        if(this.bottomNode==node)isBottom=true;
        if(isTop&&isBottom)this.deleteSelf();
        else{
            var nextNode = this.wf.findNextNodeOfSameType(node,isTop-isBottom,false);
            this.changeNode(nextNode,isTop);
        }
    }
    
    
    
}