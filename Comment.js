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
        this.x=int(getXMLVal(xml,"x"));
        this.y=int(getXMLVal(xml,"y"));
        var text = getXMLVal(xml,"textHTML");
        if(text!=null)this.text=text;
        this.createVertex();
    }
    
    createVertex(){
        this.vertex = this.graph.insertVertex(this.graph.getDefaultParent(),null,'',this.x,this.y,defaultCommentSize,defaultCommentSize,defaultCommentStyle);
        this.vertex.isComment=true;
        this.vertex.comment=this;
        this.vertex.cellOverlays=[];
        this.addDelOverlay();
    }
    
    show(){
        var com = this;
        var graphWrapper = document.getElementById("graphWrapper");
        var clickDiv = document.createElement('div');
        clickDiv.className = "commentDiv";
        clickDiv.style.left=int(this.x)+"px";
        clickDiv.style.top=int(this.y)+"px";
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
        graphWrapper.appendChild(clickDiv);
        
        //removes the div when the user clicks outside the element. The first click bubbles up, and causes the state to change ONLY once it hits the top.
        var outsideClickListener = function(evt2){
            if(!(clickDiv.contains(evt2.target)) && com.state){
                removeDiv();
                com.state=false;
            }else{com.state=true;}
        };

        function removeDiv(){
            clickDiv.parentElement.removeChild(clickDiv);
            document.removeEventListener('click',outsideClickListener);
        };
        document.addEventListener('click',outsideClickListener);
        
        
    }
    
    //Add the overlay to delete the node
    addDelOverlay(){
        var n = this;
        var overlay = new mxCellOverlay(new mxImage('resources/images/delrect48.png', 12, 12), 'Delete this comment');
        overlay.getBounds = function(state){ //overrides default bounds
            var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);
            var pt = state.view.getPoint(state, {x: 0, y: 0, relative: true});
            bounds.y = pt.y-n.vertex.h()/2;
            bounds.x = pt.x-bounds.width+n.vertex.w()/2;
            return bounds;
        }
        var graph = this.graph;
        overlay.cursor = 'pointer';
        overlay.addListener(mxEvent.CLICK, function(sender, plusEvent){
            if(mxUtils.confirm("Delete this comment?")){
                graph.clearSelection();
                n.deleteSelf();
                n.wf.makeUndo("Delete Comment",n);
            }
        });
        this.vertex.cellOverlays.push(overlay);
        //n.graph.addCellOverlay(n.vertex, overlay);
    }
    
    deleteSelf(){
        this.wf.comments.splice(this.wf.comments.indexOf(this),1);
        this.graph.removeCells([this.vertex]);
    }
    
    populateMenu(menu){
        var graph = this.graph;
        var comment=this;
        menu.addItem('Show', 'resources/images/view24.png', function(){
            comment.show();
        });
        menu.addItem('Delete Comment','resources/images/delrect24.png',function(){
            if(mxUtils.confirm("Delete this comment?")){
                graph.clearSelection();
                comment.deleteSelf();
                comment.wf.makeUndo("Delete Comment",comment);
            }
        });
    }
    
}