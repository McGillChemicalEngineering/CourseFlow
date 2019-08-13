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
    constructor(graph,wf,x,y){
        this.graph=graph;
        this.wf=wf;
        this.vertex;
        this.text="";
        this.x=x;
        this.y=y;
        this.state=false;
    }
    
    toXML(){
        var xml="";
        xml+=makeXML(this.text,"textHTML");
        xml+=makeXML(this.x,"x");
        xml+=makeXML(this.y,"y");
        return makeXML(xml,"comment");
    }
    
    fromXML(xml){
        this.x=getXMLVal(xml,"x");
        this.y=getXMLVal(xml,"y");
        var text = getXMLVal(xml,"textHTML");
        if(text!=null)this.text=text;
        this.createVertex();
    }
    
    createVertex(){
        this.vertex = this.graph.insertVertex(this.graph.getDefaultParent(),null,'',this.x,this.y,defaultCommentSize,defaultCommentSize,defaultCommentStyle);
        this.vertex.isComment=true;
        this.vertex.comment=this;
    }
    
    show(){
        var com = this;
        var clickDiv = document.createElement('div');
        clickDiv.className = "commentDiv";
        clickDiv.style.left=int(this.x)+int(this.wf.project.container.style.left)+"px";
        clickDiv.style.top=int(this.y)+int(this.wf.project.container.style.top)+"px";
        var textDiv=document.createElement('div');
        textDiv.innerHTML=this.text;
        clickDiv.appendChild(textDiv);
        var inputField = document.createElement("textarea");
        var inputButton = document.createElement("button");
        inputButton.innerHTML="Add Comment";
        
        
        var appendComment = function(evt2){
            com.text+="<p>"+inputField.value.replace(/\n/g,"<br>")+"</p>";
            inputField.value="";
            textDiv.innerHTML=com.text;
        }
        inputButton.addEventListener('click',appendComment);
        clickDiv.appendChild(inputField);
        clickDiv.appendChild(inputButton);
        document.body.appendChild(clickDiv);
        
        //removes the div when the user clicks outside the element. The first click bubbles up, and causes the state to change ONLY once it hits the top.
        var outsideClickListener = function(evt2){
            if(!(clickDiv.contains(evt2.target)) && com.state){
                removeDiv();
                com.state=false;
            }else{com.state=true;}
        };

        function removeDiv(){
            document.body.removeChild(clickDiv);
            document.removeEventListener('click',outsideClickListener);
        };
        document.addEventListener('click',outsideClickListener);
        
        
    }
    
}