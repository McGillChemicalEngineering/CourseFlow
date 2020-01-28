//The visualization of a column to be instantiated in the Workflowview.

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

class Columnview{
    constructor(graph,column){
        this.graph = graph;
        this.column = column;
        this.pos=0;
    }
    
    textChanged(){
        this.vertex.setValue(this.column.text);
    }
    
    nodeTextChanged(){
        this.column.wf.view.populateNodeBar();
    }
    
    createVertex(){
        var col = this.column;
        this.vertex = this.graph.insertVertex(this.graph.getDefaultParent(), null,col.text,this.pos,4*cellSpacing, colIconSize, colIconSize,defaultHeadStyle+'image=resources/data/'+col.image+'.png;');
        this.vertex.isHead=true;
        this.vertex.column=col;
        this.vertex.valueChanged = function(value){
            var value1 = col.setTextSilent(value);
            if(value1!=value)col.view.graph.getModel().setValue(col.view.vertex,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
            
        }
        if(col.name.substr(0,3)=='CUS'&&col.nodetext!=this.text)col.setNodeText(col.text);
        
    }
    
    imageUpdated(){
        this.graph.setCellStyles('image','resources/data/'+this.column.image+'.png',[this.vertex]);
        this.column.wf.view.populateNodeBar();
    }
    
    updatePosition(){
        this.graph.moveCells([this.vertex],this.pos-this.vertex.w()/2-this.vertex.x());
    }
    
    deleted(){
        this.graph.removeCells([this.vertex]);
    }
    
    
    populateMenu(menu){
        var graph = this.graph;
        var col=this.column;
        menu.addItem(LANGUAGE_TEXT.column.modifytext[USER_LANGUAGE], 'resources/images/text24.png', function(){
				graph.startEditingAtCell(col.view.vertex);
        });
        if(col.name.substr(0,3)=='CUS')this.populateIconMenu(menu,iconsList['column']);
        menu.addItem(LANGUAGE_TEXT.column.delete[USER_LANGUAGE],'resources/images/delrect24.png',function(){
            if(col.wf.columns.length==1)alert(LANGUAGE_TEXT.column.deletelast[USER_LANGUAGE]);
            else if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deletecolumn[USER_LANGUAGE])){
                graph.clearSelection();
                col.deleteSelf();
                col.wf.makeUndo("Delete Column",col);
            }
        });
    }
    
    populateIconMenu(menu,iconArray){
        var col = this.column;
        if(iconArray==null||iconArray.length==0)return;
        var sub = menu.addItem(LANGUAGE_TEXT.column.icon[USER_LANGUAGE],'resources/images/lefticon24.png');
        for(var i=0;i<iconArray.length;i++){
            var tempfunc = function(value){
                menu.addItem(value.text[USER_LANGUAGE],iconpath+value.value+'24.png',function(){
                    col.setImage(value.value);
                },sub);
            }
            tempfunc(iconArray[i]);
        }
    }
    
}