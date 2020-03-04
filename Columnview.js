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
        this.vertex;
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
            col.wf.view.fillColumnFloat();
            
        }
        
        
    }
    
    imageUpdated(){
        this.graph.setCellStyles('image','resources/data/'+this.column.image+'.png',[this.vertex]);
        this.column.wf.view.populateNodeBar();
    }
    
    updatePosition(){
        this.graph.moveCells([this.vertex],this.pos-this.vertex.w()/2-this.vertex.x());
        if(this.column.wf.view)this.column.wf.view.fillColumnFloat();
    }
    
    deleted(){
        this.graph.removeCells([this.vertex]);
        this.column.wf.view.fillColumnFloat();
    }
    
    colourUpdated(){
        var column = this.column;
        var wf = this.column.wf;
        for(var i=0;i<wf.weeks.length;i++){
            for(var j=0;j<wf.weeks[i].nodes.length;j++){
                var node = wf.weeks[i].nodes[j];
                if(node.column==column.name&&node.view)node.view.columnUpdated();
            }
        }
        if(wf.view)wf.view.populateNodeBar();
    }
    
    
    populateMenu(menu){
        var col=this.column;
        var graph = this.graph;
        
        menu.addItem(LANGUAGE_TEXT.column.modifytext[USER_LANGUAGE], 'resources/images/text24.png', function(){
				graph.startEditingAtCell(col.view.vertex);
        });
        col.populateMenu(menu);
    }
    
    
    visibilityChanged(){return null;}
    
}