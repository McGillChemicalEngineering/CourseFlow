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
    constructor(wf,x,y,parent=null){
        this.wf=wf;
        this.text="";
        this.x=x;
        this.y=y;
        if(parent&&parent.view){
            this.x=this.x-parent.view.vertex.x();
            this.y=this.y-parent.view.vertex.y();
        }
        this.view;
        this.parent=parent;
    }
    
    toXML(){
        var xml="";
        xml+=makeXML(this.text,"textHTML");
        xml+=makeXML(this.x,"x");
        xml+=makeXML(this.y,"y");
        if(this.parent){
            if(this.parent.id)xml+=makeXML(this.parent.id,"commentparent");
            else if(this.parent instanceof Column)xml+=makeXML(this.parent.name,"commentparent");
        }
        return makeXML(xml,"comment");
    }
    
    fromXML(xml){
        this.x=int(getXMLVal(xml,"x"));
        this.y=int(getXMLVal(xml,"y"));
        var text = getXMLVal(xml,"textHTML");
        if(text!=null)this.text=text;
        var parent = getXMLVal(xml,"commentparent");
        if(parent){
            if(int(parent)==int(parent))this.setParentByID(parent);
            else this.setColumnParent(parent);
        }
    }
    
    setParentByID(parentID){
        this.parent = this.wf.findNodeById(parentID);
        if(!this.parent){
            for(var i=0;i<this.wf.weeks.length;i++)if(this.wf.weeks[i].id==parentID){this.parent=this.wf.weeks[i];return;}
            for(var i=0;i<this.wf.brackets.length;i++)if(this.wf.brackets[i].id==parentID){this.parent=this.wf.brackets[i];return;}
        }
    }
    
    setColumnParent(parent){
        this.parent=this.wf.columns[this.wf.getColIndex(parent)];
    }
    
    
    deleteSelf(){
        this.wf.comments.splice(this.wf.comments.indexOf(this),1);
        if(this.view)this.view.deleted();
    }
    
    populateMenu(menu){
        var p = this.wf.project;
        var comment = this;
        menu.addItem(LANGUAGE_TEXT.comment.show[USER_LANGUAGE], 'resources/images/view24.png', function(){
            if(comment.view)comment.view.show();
        });
        menu.addItem(LANGUAGE_TEXT.comment.delete[USER_LANGUAGE],'resources/images/delrect24.png',function(){
            if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deletecomment[USER_LANGUAGE])){
                comment.deleteSelf();
                comment.wf.updated("Delete Comment",comment);
            }
        }); menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],'resources/images/info24.png',function(){
            p.showHelp('commenthelp.html');
        });
    }
    
    
}