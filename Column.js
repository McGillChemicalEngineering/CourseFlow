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
        if(name.substr(0,3)=="CUS"){
            this.setImage(getXMLVal(xml,"columnimage"));
            this.setText(getXMLVal(xml,"columntext"));
            console.log(this.text);
            this.setNodeText(getXMLVal(xml,"columnnodetext"));
        }else {
            this.setDefaultValues(name);
            var text = getXMLVal(xml,"columntext");
            var nodetext = getXMLVal(xml,"columnnodetext");
            if(this.text!=text)this.setText(text);
            if(this.nodetext!=nodetext)this.setNodeText(getXMLVal(xml,"nodetext"));
        }
        
    }
    
    setDefaultValues(name){
        switch(name){
            case "HW":
                this.image = "homework";
                this.text = "Preparation";
                this.nodetext = "Preparation";
                break;
            case "AC":
                this.image = "lesson";
                this.text = "Activities";
                this.nodetext = "Activity";
                break;
            case "SA":
                this.image = "assessment";
                this.text = "Assessments";
                this.nodetext = "Assessment";
                break;
            case "FA":
                this.image = "artifact";
                this.text = "Artifacts";
                this.nodetext = "Artifact";
                break;
            case "OOC":
                this.image = "home";
                this.text = "Out of Class";
                this.nodetext = "Home";
                break;
            case "ICI":
                this.image = "instruct";
                this.text = "In Class (Instructor)";
                this.nodetext = "Instructor";
                break;
            case "ICS":
                this.image = "noinstructor";
                this.text = "In Class (Students)";
                this.nodetext = "Students";
                break;
            case "CO":
                this.image = "instruct";
                this.text = "Course";
                this.nodetext = "Course";
                break;
            default:
                if(name.substr(0,3)=='CUS'){
                    this.image = "other";
                    this.text = "Custom Column "+name.substr(3);
                    this.nodetext = "New Custom";
                }
        }
        
    }
    
    setName(name){
        this.name=name;
        
    }
    
    setImage(img){
        this.image = img;
        this.graph.setCellStyles('image','resources/data/'+img+'.png',[this.head]);
        this.wf.populateNodeBar();
    }
    
    setTextSilent(text){
        if(text!=null && text!=""){
            text = text.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.text=text;
            console.log(this.name.substr(0,3));
            if(this.name.substr(0,3)=='CUS'){this.setNodeText(text);}
            return text;
        }else{
            return this.text;
        }
        
    }
    
    setText(text){
        console.log(text);
        text = this.setTextSilent(text);
        if(this.head!=null)this.head.setValue(text);
    }
    
    setNodeText(nodetext){
        this.nodetext=nodetext;
        this.wf.populateNodeBar();
    }
    
    
    createHead(){
        this.head = this.graph.insertVertex(this.graph.getDefaultParent(), null,this.text,this.pos,3*cellSpacing, colIconSize, colIconSize,defaultHeadStyle+'image=resources/data/'+this.image+'.png;');
        console.log(this.text);
        this.head.isHead=true;
        this.head.column=this;
        var col = this;
        this.head.valueChanged = function(value){
            var value1 = col.setTextSilent(value);
            if(value1!=value)col.graph.getModel().setValue(wf.titleNode,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
            
        }
        if(this.name.substr(0,3)=='CUS'&&this.nodetext!=this.text)this.setNodeText(this.text);
        
    }
    
    
    updatePosition(){
        this.graph.moveCells([this.head],this.pos-this.head.w()/2-this.head.x());
    }
    
    deleteSelf(){
        this.wf.removeColumn(this);
        this.graph.removeCells([this.head]);
    }
    
    populateMenu(menu){
        var graph = this.graph;
        var col=this;
        menu.addItem('Edit label', 'resources/images/text24.png', function(){
				graph.startEditingAtCell(col.head);
        });
        if(this.name.substr(0,3)=='CUS')this.populateIconMenu(menu,iconsList['column']);
        menu.addItem('Delete Column','resources/images/delrect24.png',function(){
            if(col.wf.columns.length==1)alert("You can't delete the last column!");
            else if(mxUtils.confirm("Delete this column?")){
                graph.clearSelection();
                col.deleteSelf();
                col.wf.makeUndo("Delete Column",col);
            }
        });
    }
    
    populateIconMenu(menu,iconArray){
        var col = this;
        if(iconArray==null||iconArray.length==0)return;
        var sub = menu.addItem("Icon",'resources/images/lefticon24.png');
        for(var i=0;i<iconArray.length;i++){
            var tempfunc = function(value){
                menu.addItem(value.text,iconpath+value.value+'24.png',function(){
                    col.setImage(value.value);
                },sub);
            }
            tempfunc(iconArray[i]);
        }
    }
    
}

