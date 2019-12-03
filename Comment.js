//Comments.

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

class WFComment{
    constructor(wf,x,y){
        this.wf=wf;
        this.text="";
        this.x=x;
        this.y=y;
        this.view;
    }
    
    toXML(){
        var xml="";
        xml+=makeXML(this.text,"textHTML");
        xml+=makeXML(this.x,"x");
        xml+=makeXML(this.y,"y");
        return makeXML(xml,"comment");
    }
    
    fromXML(xml){
        this.x=int(getXMLVal(xml,"x"));
        this.y=int(getXMLVal(xml,"y"));
        var text = getXMLVal(xml,"textHTML");
        if(text!=null)this.text=text;
    }
    
    
    deleteSelf(){
        this.wf.comments.splice(this.wf.comments.indexOf(this),1);
        if(this.view)this.view.deleted();
    }
    
    
    
}