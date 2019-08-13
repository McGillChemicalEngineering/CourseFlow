//Defines columns and their headings

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

class Column {
    constructor(graph,wf,name,text,image,nodetext){
        this.name=name;
        this.text=text;
        this.nodetext=nodetext;
        this.image=image;
        this.head;
        this.pos=0;
        this.graph=graph;
        this.wf=wf;
        
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"columnname");
        xml+=makeXML(this.image,"columnimage");
        xml+=makeXML(this.text,"columntext");
        xml+=makeXML(this.nodetext,"columnnodetext");
        return makeXML(xml,"column");
    }
    
    
    createHead(y){
        this.head = this.graph.insertVertex(this.graph.getDefaultParent(), null,this.text,this.pos,3*cellSpacing, colIconSize, colIconSize,defaultHeadStyle+'image=resources/data/'+this.image+'.png;');
        this.head.isHead=true;
        this.head.column=this;
    }
    
    updatePosition(){
        this.graph.moveCells([this.head],this.pos-this.head.w()/2-this.head.x());
    }
}



