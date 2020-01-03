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
    constructor(wf,name){
        this.name=name;
        this.text;
        this.nodetext;
        this.image;
        this.colour;
        this.wf=wf;
        this.view;
        if(name!=null)this.setDefaultValues(name);
        
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"columnname");
        xml+=makeXML(this.image,"columnimage");
        xml+=makeXML(this.text,"columntext",true);
        xml+=makeXML(this.nodetext,"columnnodetext",true);
        return makeXML(xml,"column");
    }
    
    fromXML(xml){
        var name = getXMLVal(xml,"columnname");
        this.setName(name);
        if(name.substr(0,3)=="CUS"){
            this.image = getXMLVal(xml,"columnimage");
            this.text = getXMLVal(xml,"columntext",true);
            this.nodetext = getXMLVal(xml,"columnnodetext",true);
            if(this.wf instanceof Programflow)this.colour = SALTISEGREEN;
            else this.colour = "#a3b9df";
        }else {
            this.setDefaultValues(name);
            this.text = getXMLVal(xml,"columntext",true);
        }
        
    }
    
    setDefaultValues(name){
        switch(name){
            case "HW":
                this.image = "homework";
                this.text = "Preparation";
                this.nodetext = "Preparation";
                this.colour = SALTISELIGHTBLUE;
                break;
            case "AC":
                this.image = "lesson";
                this.text = "Activities";
                this.nodetext = "Activity";
                this.colour = SALTISEGREEN;
                break;
            case "SA":
                this.image = "assessment";
                this.text = "Assessments";
                this.nodetext = "Assessment";
                this.colour = SALTISERED;
                break;
            case "FA":
                this.image = "artifact";
                this.text = "Artifacts";
                this.nodetext = "Artifact";
                this.colour = SALTISEORANGE;
                break;
            case "OOC":
                this.image = "home";
                this.text = "Out of Class";
                this.nodetext = "Home";
                this.colour = SALTISELIGHTBLUE;
                break;
            case "ICI":
                this.image = "instruct";
                this.text = "In Class (Instructor)";
                this.nodetext = "Instructor";
                this.colour = SALTISEORANGE;
                break;
            case "ICS":
                this.image = "noinstructor";
                this.text = "In Class (Students)";
                this.nodetext = "Students";
                this.colour = SALTISEGREEN;
                break;
            case "CO":
                this.image = "instruct";
                this.text = "Course";
                this.nodetext = "Course";
                this.colour = SALTISEGREEN;
                break;
            default:
                if(name.substr(0,3)=='CUS'){
                    if(this.wf instanceof Programflow){
                        this.text = "Course Category "+name.substr(3);
                        this.colour=SALTISEGREEN;
                        this.nodetext = "New Category";
                        this.image="instruct";
                    }else{
                        this.text = "Custom Column "+name.substr(3);
                        this.colour = "#a3b9df";
                        this.nodetext = "New Custom"; 
                        this.image = "other";
                    }
                }
        }
        
    }
    
    setName(name){
        this.name=name;
    }
    
    setImage(img){
        this.image = img;
        if(this.view)this.view.imageUpdated();
    }
    
    setTextSilent(text){
        if(text!=null && text!=""){
            //text = text.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.text=text;
            if(this.name.substr(0,3)=='CUS'){this.setNodeText(text);}
            return text;
        }else{
            return this.text;
        }
        
    }
    
    setText(text){
        text = this.setTextSilent(text);
        if(this.view)this.view.textChanged();
    }
    
    setNodeText(nodetext){
        this.nodetext=nodetext;
        if(this.view)this.view.nodeTextChanged();
    }
    
    
    deleteSelf(){
        this.wf.removeColumn(this);
        if(this.view)this.view.deleted();
    }
    
    
}

