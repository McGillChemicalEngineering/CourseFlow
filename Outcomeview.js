/*The essential classes for the outcomes-based view of courses*/

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

class Outcomeview{
    constructor(container,wf){
        this.wf = wf;
        this.container = container;
        this.table;
        this.categoryViews;
        this.tagViews;
        this.tableCells=[];
        this.toolbarDiv;
    }
    
    nameUpdated(){
        
    }
    
    makeActive(){
        this.container.style.width="";
        this.container.style.height="";
        this.toolbarDiv = document.getElementById('nbContainer');
        
        this.table = document.createElement('table');
        this.table.classList.add("outcometable");
        this.container.appendChild(this.table);
        
        
        this.generateToolbars();
        
        this.drawGraph();
        
    }
    
    makeInactive(){
        for(var i=0;i<this.wf.tagSets.length;i++){
            this.wf.tagSets[i].view.clearViews();
        }
        this.container.innerHTML="";
    }
    
    generateToolbars(){
        var container = this.toolbarDiv;
        container.style.display="inline";
        while(container.firstChild)container.removeChild(container.firstChild);
        makeResizable(container,"left");
        
    }
    
    drawGraph(){
        var table = this.table;
        this.createCategoryViews();
        this.createNodeViews();
        this.createTagViews();
        
        //Create all the columns/column groups
        table.appendChild(document.createElement('col'));
        for(var i=0;i<this.categoryViews.length;i++){
            var cg = this.categoryViews[i].createVertex(table);
            table.appendChild(cg);
            for(var j=0;j<this.categoryViews[i].nodeViews.length;j++){
                var nv = this.categoryViews[i].nodeViews[j];
                nv.createVertex(cg);
            }
            
        }
        
        
        //Create the first "head" row showing the categories
        var catRow = document.createElement('tr');
        catRow.appendChild(document.createElement('th'));
        table.appendChild(catRow);
        
        //Create the next "head" row showing the actual node names
        var headRow = document.createElement('tr');
        var headBase = document.createElement('th');
        headRow.appendChild(headBase);
        for(var i=0;i<this.categoryViews.length;i++){
            this.categoryViews[i].createTableHead(catRow);
            for(var j=0;j<this.categoryViews[i].nodeViews.length;j++){
                var nv = this.categoryViews[i].nodeViews[j];
                nv.createTableHead(headRow);
            }
        }
        table.appendChild(headRow);
        
        var tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        
        //Create all the rows
        for(var i=0;i<this.tagViews.length;i++){
            var cellRow=[];
            this.tagViews[i].createVertex(tbody);
            for(var j=0;j<this.categoryViews.length;j++){
                for(var k=0;k<this.categoryViews[j].nodeViews.length;k++){
                    var nv = this.categoryViews[j].nodeViews[k];
                    var tc = new OutcomeTableCell(this.tagViews[i].tag,nv);
                    tc.createVertex(this.tagViews[i].vertex);
                    cellRow.push(tc);
                }
            }
            this.tableCells.push(cellRow);
        }
        
        
        this.updateTable();
        
        
    }
    
    updateTable(){
        for(var i=0;i<this.tableCells.length;i++){
            for(var j=0;j<this.tableCells[i].length;j++){
                var tc = this.tableCells[i][j];
                tc.validateSelf();
            }
        }
    }
    
    createCategoryViews(){
        var nodeCategories = this.getNodeCategories();
        this.categoryViews = [];
        for(var i=0;i<nodeCategories.length;i++){
            var cgv = new OutcomeCategoryview(nodeCategories[i]);
            this.categoryViews.push(cgv);
        }
    }

                   
    createNodeViews(){
        for(var i=0;i<this.wf.weeks.length;i++){
            for(var j=0;j<this.wf.weeks[i].nodes.length;j++){
                var node = this.wf.weeks[i].nodes[j];
                if(this.isValidNode(node))this.addNodeView(node);
            }
        }
        for(var i=0;i<this.categoryViews.length;i++){
            var total = [];
            for(var j=0;j<this.categoryViews[i].nodeViews.length;j++){
                var nodes = this.categoryViews[i].nodeViews[j].nodes;
                if(nodes.length>0)total.push(nodes[0]);
            }
            this.categoryViews[i].nodeViews.push(new OutcomeNodeview(total,true));
        }
    }
    
    addNodeView(node){
        node.view = new OutcomeNodeview([node]);
        this.getCategoryForNode(node).nodeViews.push(node.view);
    }
            
    createTagViews(){
        this.tagViews = [];
        var allTags = [];
        for(var i=0;i<this.wf.tagSets.length;i++){
            this.wf.tagSets[i].getAllTags(allTags);
        }
        for(i=0;i<allTags.length;i++){
            allTags[i].view = new OutcomeTagview(allTags[i]);
            this.tagViews.push(allTags[i].view);
        }
    }
    
    isValidNode(node){
        return(node.column=="SA");
    }
    
    getNodeCategories(){
        var list = iconsList['assessment'].slice(0);
        list.push({text:"None",value:"none"});
        return list;
    }
    
    getCategoryForNode(node){
        var category = node.lefticon;
        if(category==null)category="none";
        for(var i=0;i<this.categoryViews.length;i++){
            if(this.categoryViews[i].value==category)return this.categoryViews[i];
        }
        return null;
    }
    
    
}

class OutcomeCategoryview{
    constructor(data){
        this.colgroup;
        this.tablehead;
        this.vertex;
        this.name = data.text;
        this.value = data.value;
        this.nodeViews = [new OutcomeNodeview([])];
        this.expandIcon=document.createElement('img');
    }
    
    createVertex(parent){
        this.vertex = document.createElement('colgroup');
        return this.vertex;
    }
    
    createTableHead(parent){
        var cv = this;
        var catHead = document.createElement('th');
        catHead.classList.add('expanded');
        if(this.nodeViews.length>2)catHead.classList.add('haschildren');
        var wrapper = document.createElement('div');
        wrapper.classList.add("categoryhead");
        catHead.setAttribute("colspan",this.nodeViews.length);
        wrapper.innerHTML = this.name.replace(/\//g,"\/<wbr>");
        catHead.appendChild(wrapper);
        parent.appendChild(catHead);
        
        
        var expandDiv = document.createElement('div');
        expandDiv.className="expanddiv";
        this.expandIcon.src="resources/images/minus16.png";
        this.expandIcon.style.width='16px';
        this.expandIcon.onclick=function(){
            if(catHead.classList.contains("expanded")){cv.collapse();}
            else {cv.expand();}
        }
        expandDiv.appendChild(this.expandIcon);
        catHead.appendChild(expandDiv);
        this.tablehead = catHead;
    }
    
    expand(){
        this.tablehead.classList.add("expanded");
        for(var i=1;i<this.nodeViews.length-1;i++){
            this.nodeViews[i].vertex.classList.remove("hidden");
            this.nodeViews[i].textdiv.classList.remove("hidden");
        }
        this.expandIcon.src="resources/images/minus16.png";
    }
    
    collapse(){
        this.tablehead.classList.remove("expanded");
        for(var i=1;i<this.nodeViews.length-1;i++){
            this.nodeViews[i].vertex.classList.add("hidden");
            this.nodeViews[i].textdiv.classList.add("hidden");
        }
        this.expandIcon.src="resources/images/plus16.png";
    }
    
}

class OutcomeNodeview{
    constructor(nodes,isTotal=false){
        this.nodes=nodes;
        this.vertex;
        this.tablehead;
        this.textdiv;
        this.isTotal=isTotal;
    }
    
    createVertex(parent){
        this.vertex = document.createElement('col');
        parent.appendChild(this.vertex);
    }
    
    createTableHead(parent){
        this.tablehead = document.createElement('th');
        this.tablehead.classList.add("nodetitle");
        var textwrapper = document.createElement('div');
        textwrapper.classList.add('headertextwrap');
        this.tablehead.appendChild(textwrapper);
        this.textdiv = document.createElement('div');
        textwrapper.appendChild(this.textdiv);
        this.textdiv.classList.add("rotatedheader");
        if(this.isTotal){this.textdiv.innerHTML = "Total";this.tablehead.classList.add("totalcell");}
        else if(this.nodes.length==0){this.textdiv.innerHTML = "";this.tablehead.classList.add("emptycell");}
        else this.textdiv.innerHTML = this.nodes[0].name;
        parent.appendChild(this.tablehead);
    }
    
}



class OutcomeTagview{
    constructor(tag){
        this.tag=tag;
        this.vertex;
        this.nameCell;
        this.expandIcon = document.createElement('img');
    }
    
    nameUpdated(){
        this.updateName();
    }
    
    createVertex(parent){
        var tv = this;
        var vertex = document.createElement('tr');
        this.vertex=vertex;
        if(this.tag.children.length>0)vertex.classList.add("haschildren");
        vertex.classList.add("expanded");
        vertex.classList.add("depth"+this.tag.depth);
        parent.appendChild(vertex);
        this.nameCell = document.createElement('td');
        this.updateName()
        vertex.appendChild(this.nameCell);
        var expandDiv = document.createElement('div');
        expandDiv.className="expanddiv";
        this.expandIcon.src="resources/images/minus16.png";
        this.expandIcon.style.width='16px';
        this.expandIcon.onclick=function(){
            if(vertex.classList.contains("expanded")){tv.collapse();}
            else {tv.expand();}
        }
        expandDiv.appendChild(this.expandIcon);
        this.nameCell.appendChild(expandDiv);
    }
    
    expand(){
        this.vertex.classList.add("expanded");
        this.showTag();
        this.expandIcon.src="resources/images/minus16.png";
    }
    
    showTag(){
        if(this.vertex){
            this.vertex.classList.remove("hidden");
            if(this.vertex.classList.contains("expanded")){
                for(var i=0;i<this.tag.children.length;i++){
                    if(this.tag.children[i].view)this.tag.children[i].view.showTag();
                }
            }
        }
    }
    
    hideTag(){
        if(this.vertex){
            this.vertex.classList.add("hidden");
            if(this.vertex.classList.contains("expanded")){
                for(var i=0;i<this.tag.children.length;i++){
                    if(this.tag.children[i].view)this.tag.children[i].view.hideTag();
                }
            }
        }
    }
    
    collapse(){
        this.vertex.classList.remove("expanded");
        for(var i=0;i<this.tag.children.length;i++){
            if(this.tag.children[i].view)this.tag.children[i].view.hideTag();
        }
        this.expandIcon.src="resources/images/plus16.png";
    }
    
    updateName(){
        var name="";
        if(this.tag.parentTag)name+=(int(this.tag.parentTag.children.indexOf(this.tag))+1)+".  ";
        name += this.tag.name;
        this.nameCell.innerHTML=name;
    }
    
    
    clearViews(){
        for(var i=0;i<this.tag.children.length;i++){
            this.tag.children[i].view.clearViews();
        }
        this.tag.view = null;
    }
}

class OutcomeTableCell{
    constructor(tag,nodeview){
        this.tag = tag;
        this.nodeview = nodeview;
        this.vertex;
    }
    
    createVertex(parent){
        this.vertex = document.createElement('td');
        if(this.nodeview.isTotal)this.vertex.classList.add("totalcell");
        else if(this.nodeview.nodes.length==0)this.vertex.classList.add("emptycell");
        parent.appendChild(this.vertex);
    }
    
    validateSelf(){
        var completeness=this.validateTag(this.tag);
        if(completeness==0)this.vertex.innerHTML="";
        else if (completeness==1)this.vertex.innerHTML="Y";
        else this.vertex.innerHTML="(P)";
    }
    
    validateTag(tag){
        for(var i=0;i<this.nodeview.nodes.length;i++){
            if(this.nodeview.nodes[i].tags.indexOf(tag)>=0)return 1.0;
        }
        var completeness = 0.0;
        for(var i=0;i<tag.children.length;i++){
            completeness+=this.validateTag(tag.children[i])/tag.children.length;
        }
        return completeness;
    }
    
}