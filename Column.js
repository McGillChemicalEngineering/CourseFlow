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
    constructor(graph,wf,name){
        this.name=name;
        this.text;
        this.nodetext;
        this.image;
        this.head;
        this.pos=0;
        this.graph=graph;
        this.wf=wf;
        if(name!=null)this.setDefaultValues(name);
        
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"columnname");
        xml+=makeXML(this.image,"columnimage");
        xml+=makeXML(this.text,"columntext");
        xml+=makeXML(this.nodetext,"columnnodetext");
        return makeXML(xml,"column");
    }
    
    fromXML(xml){
        var name = getXMLVal(xml,"columnname");
        this.setName(name);
        if(name=="CUS"){
            this.setImage(getXMLVal(xml,"columnimage"));
            this.setText(getXMLVal(xml,"columntext"));
            this.setNodeText(getXMLVal(xml,"columnnodetext"));            
        }else this.setDefaultValues(name);
    }
    
    setDefaultValues(name){
        switch(name){
            case "HW":
                this.setImage("homework");
                this.setText("Preparation");
                this.setNodeText("Preparation");
                break;
            case "AC":
                this.setImage("lesson");
                this.setText("Activities");
                this.setNodeText("Activity");
                break;
            case "SA":
                this.setImage("assessment");
                this.setText("Assessments");
                this.setNodeText("Assessment");
                break;
            case "FA":
                this.setImage("artifact");
                this.setText("Artifacts");
                this.setNodeText("Artifact");
                break;
            case "OOC":
                this.setImage("home");
                this.setText("Out of Class");
                this.setNodeText("Home");
                break;
            case "ICI":
                this.setImage("instruct");
                this.setText("In Class (Instructor)");
                this.setNodeText("Instructor");
                break;
            case "ICS":
                this.setImage("noinstructor");
                this.setText("In Class (Students)");
                this.setNodeText("Students");
                break;
            case "CO":
                this.setImage("instruct");
                this.setText("Course");
                this.setNodeText("Course");
                break;
        }
    }
    
    setName(name){
        this.name=name;
        
    }
    
    setImage(img){
        this.image = img;
        this.graph.setCellStyle(defaultHeadStyle+'image=resources/data/'+img+'.png;');
    }
    
    setText(text){
        this.text=text;
        if(this.head!=null)this.head.setValue(text);
    }
    
    setNodeText(nodetext){
        this.nodetext=nodetext;
    }
    
    
    createHead(){
        this.head = this.graph.insertVertex(this.graph.getDefaultParent(), null,this.text,this.pos,3*cellSpacing, colIconSize, colIconSize,defaultHeadStyle+'image=resources/data/'+this.image+'.png;');
        this.head.isHead=true;
        this.head.column=this;
    }
    
    
    updatePosition(){
        this.graph.moveCells([this.head],this.pos-this.head.w()/2-this.head.x());
    }
    
    deleteSelf(){
        this.wf.removeColumn(this);
        this.graph.removeCells([this.head]);
    }
}



