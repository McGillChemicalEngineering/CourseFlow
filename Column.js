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
        if(this.name.substr(0,3)=="CUS"||this.text!=LANGUAGE_TEXT.column[this.name].text[USER_LANGUAGE])xml+=makeXML(this.text,"columntext",true);
        if(this.name.substr(0,3)=="CUS"||this.nodetext!=LANGUAGE_TEXT.column[this.name].nodetext[USER_LANGUAGE])xml+=makeXML(this.nodetext,"columnnodetext",true);
        console.log(xml);
        return makeXML(xml,"column");
    }
    
    fromXML(xml){
        var name = getXMLVal(xml,"columnname");
        this.setName(name);
        this.setDefaultValues(name);
        var text = getXMLVal(xml,"columntext",true);
        var nodetext = getXMLVal(xml,"columntext",true);
        if(text)this.text=text;
        if(nodetext)this.nodetext=nodetext;
        var image = getXMLVal(xml,"columnimage");
        if(image)this.image=image;
        
    }
    
    setDefaultValues(name){
        if(name.substr(0,3)!="CUS"){
            this.text=LANGUAGE_TEXT.column[name].text[USER_LANGUAGE];
            this.nodetext=LANGUAGE_TEXT.column[name].nodetext[USER_LANGUAGE];
            switch(name){
                case "HW":
                    this.image = "homework";
                    this.colour = SALTISELIGHTBLUE;
                    break;
                case "AC":
                    this.image = "lesson";
                    this.colour = SALTISEGREEN;
                    break;
                case "SA":
                    this.image = "assessment";
                    this.colour = SALTISERED;
                    break;
                case "FA":
                    this.image = "artifact";
                    this.colour = SALTISEORANGE;
                    break;
                case "OOC":
                    this.image = "home";
                    this.colour = SALTISELIGHTBLUE;
                    break;
                case "ICI":
                    this.image = "instruct";
                    this.colour = SALTISEORANGE;
                    break;
                case "ICS":
                    this.image = "noinstructor";
                    this.colour = SALTISEGREEN;
                    break;
                case "CO":
                    this.image = "instruct";
                    this.colour = SALTISEGREEN;
                    break;
            }
        }else{
            if(this.wf instanceof Programflow){
                this.text = LANGUAGE_TEXT.column['CUSP'].text[USER_LANGUAGE]+" "+name.substr(3);
                this.colour=SALTISEGREEN;
                this.nodetext = LANGUAGE_TEXT.column['CUSP'].nodetext[USER_LANGUAGE];
                this.image="instruct";
            }else{
                this.text =  LANGUAGE_TEXT.column['CUS'].text[USER_LANGUAGE]+" "+name.substr(3);
                this.colour = "#a3b9df";
                this.nodetext = LANGUAGE_TEXT.column['CUS'].nodetext[USER_LANGUAGE];
                this.image = "other";
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

