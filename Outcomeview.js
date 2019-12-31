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
            if(this.wf.tagSets[i].view)this.wf.tagSets[i].view.clearViews();
        }
        this.tableCells=[];
        this.tagViews=[];
        this.categoryViews=[];
        this.container.innerHTML="";
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
            var cgv = new OutcomeCategoryview(nodeCategories[i],this.wf);
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
        var grandtotal = [];
        for(var i=0;i<this.categoryViews.length;i++){
            var total = [];
            for(var j=0;j<this.categoryViews[i].nodeViews.length;j++){
                var nodes = this.categoryViews[i].nodeViews[j].nodes;
                if(nodes.length>0)total.push(nodes[0]);
            }
            this.categoryViews[i].nodeViews.push(new OutcomeNodeview(total,true));
            grandtotal = grandtotal.concat(total);
        }
        this.grandTotal=new OutcomeNodeview(grandtotal,true);
        this.categoryViews.push(new OutcomeCategoryview({value:"grandtotal",text:"Grand Total"},this.wf));
        this.categoryViews[this.categoryViews.length-1].nodeViews.push(this.grandTotal);
        
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
            allTags[i].view = new OutcomeTagview(allTags[i],this.wf);
            this.tagViews.push(allTags[i].view);
        }
    }
    
    isValidNode(node){
        return(node.column=="SA");
    }
    
    getNodeCategories(){
        var list = iconsList['assessment'].slice(0);
        return list;
    }
    
    getCategoryForNode(node){
        var category = node.lefticon;
        if(category==null)category="none";
        for(var i=0;i<this.categoryViews.length;i++){
            if(this.categoryViews[i].value==category)return this.categoryViews[i];
        }
        if(category=="none"){
            this.categoryViews.push(new OutcomeCategoryview({text:"Uncategorized",value:"none"},this.wf));
            return this.categoryViews[this.categoryViews.length-1];
        }
        return null;
    }
    
    nodeAdded(node){
        if(!this.isValidNode(node))return;
        var index = 1;
        for(var i=0;i<this.categoryViews.length;i++){
            var cv = this.categoryViews[i];
            if(cv.value==node.lefticon||(cv.value=="none"&&node.lefticon==null)){
                index+=cv.nodeViews.length-2;
                var lastnv = cv.nodeViews[cv.nodeViews.length-1];
                lastnv.nodes.push(node);
                this.grandTotal.nodes.push(node);
                var nv = new OutcomeNodeview([node]);
                node.view = nv;
                nv.createVertex(lastnv.vertex.parentElement,lastnv.vertex);
                nv.createTableHead(lastnv.tablehead.parentElement,lastnv.tablehead);
                cv.nodeViews.splice(cv.nodeViews.length-1,0,nv);
                cv.nodeAdded(node);
                for(var j=0;j<this.tableCells.length;j++){
                    var newCell = new OutcomeTableCell(this.tagViews[j].tag,nv);
                    newCell.createVertex(this.tagViews[j].vertex,this.tableCells[j][index].vertex);
                    this.tableCells[j].splice(index,0,newCell);
                }
                break;
            }else{
                index+=cv.nodeViews.length;
            }
        }
        this.updateTable();
    }
    
    populateTagBar(){
        this.makeInactive();
        this.makeActive();
    }
    
    tagSetAdded(tag){
        
    }
    
    tagSetRemoved(tag){
        if(tag.view)tag.view.clearViews();
        this.populateTagBar();
    }

    generateToolbars(){
        var container = this.toolbarDiv;
        container.style.display="inline";
        while(container.firstChild)container.removeChild(container.firstChild);
        makeResizable(container,"left");
        this.generateTagBar(container);
        
    }

    generateTagBar(){
        if(this.wf.getTagDepth()<0)return;
        
        var wf = this.wf;
        var p=wf.project;
        var header = document.createElement('h3');
        header.className="nodebarh3";
        header.innerHTML="Outcomes:";
        this.toolbarDiv.appendChild(header);
        
        
        
        
        var compSelect = document.createElement('select');
        this.tagSelect=compSelect;
        this.populateTagSelect(p.competencies,this.wf.getTagDepth());
        
        var addButton = document.createElement('button');
        addButton.innerHTML = "Assign Outcome";
        addButton.onclick=function(){
            var value = compSelect.value;
            if(value!=""){
                var comp = p.getTagByID(value);
                wf.addTagSet(comp);
                var removalIDs = comp.getAllID([]);
                for(var i=0;i<compSelect.options.length;i++)if(removalIDs.indexOf(compSelect.options[i].value)>=0){
                    compSelect.remove(i);
                    i--;
                }
            }
        }
        
        
        this.toolbarDiv.appendChild(compSelect);
        this.toolbarDiv.appendChild(addButton);
        
    }

    populateTagSelect(list,depth=0){
        var compSelect=this.tagSelect;
        while(compSelect.length>0)compSelect.remove(0);
        var currentIndices = [];
        for(i=0;i<this.wf.tagSets.length;i++){
            currentIndices = this.wf.tagSets[i].getAllID(currentIndices,depth);
        }
        var allTags=[];
        for(i=0;i<list.length;i++){
            allTags = list[i].getAllTags(allTags,depth,currentIndices);
        }
        var opt = document.createElement('option');
        opt.text = "Select set to add";
        opt.value = "";
        compSelect.add(opt);
        for(var i=0;i<allTags.length;i++){
            opt = document.createElement('option');
            opt.innerHTML = "&nbsp;".repeat(allTags[i].depth*4)+allTags[i].getType()[0]+" - "+allTags[i].name;
            opt.value = allTags[i].id;
            compSelect.add(opt);
        }
    }
    
    
}

class OutcomeCategoryview{
    constructor(data,wf){
        this.colgroup;
        this.wf=wf;
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

        if(this.value!="grandtotal"&&this.value!="none"){
            var newChildDiv = document.createElement('div');
            newChildDiv.classList.add("createlayoutdiv");
            var newChildIcon = document.createElement('img');
            newChildIcon.src="resources/images/createchild16.png";
            newChildIcon.style.width='16px';
            newChildIcon.onclick = function(){
                cv.addNode();
            }
            newChildDiv.append(newChildIcon);
            catHead.appendChild(newChildDiv);
        }
        
        this.tablehead = catHead;
    }
    
    addNode(){
        var wf = this.wf;
        var week = wf.weeks[wf.weeks.length-1];
        if(week){
            var node = new ASNode(wf);
            node.setColumn("SA");
            if(this.value!="none")node.setLeftIcon(this.value);
            node.week=week;
            week.addNode(node);
            if(wf.view)wf.view.nodeAdded(node);
        }
        
    }
    
    nodeAdded(node){
        this.tablehead.setAttribute("colspan",int(this.tablehead.getAttribute("colspan"))+1);
        this.tablehead.classList.add("haschildren");
    }
    
    nodeRemoved(node){
        this.tablehead.setAttribute("colspan",int(this.tablehead.getAttribute("colspan"))-1);
        if(this.nodeViews.length<=2)this.tablehead.classList.remove("haschildren");
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
        this.namediv;
        this.isTotal=isTotal;
    }
    
    
    tagRemoved(){
        
    }
    
    tagAdded(){
        
    }
    
    createVertex(parent,createBefore=null){
        this.vertex = document.createElement('col');
        parent.insertBefore(this.vertex,createBefore);
    }
    
    
    createTableHead(parent,createBefore=null){
        var nv = this;
        this.tablehead = document.createElement('th');
        this.tablehead.classList.add("nodetitle");
        var textwrapper = document.createElement('div');
        textwrapper.classList.add('headertextwrap');
        this.tablehead.appendChild(textwrapper);
        this.textdiv = document.createElement('div');
        textwrapper.appendChild(this.textdiv);
        this.textdiv.classList.add("rotatedheader");
        this.namediv = document.createElement('div');
        this.namediv.classList.add("outcometableheadertext");
        this.textdiv.appendChild(this.namediv);
        if(this.isTotal){this.namediv.innerHTML = "Total";this.tablehead.classList.add("totalcell");}
        else if(this.nodes.length==0){this.namediv.innerHTML = "";this.tablehead.classList.add("emptycell");}
        else {
            this.nameUpdated();
            var renameDiv = document.createElement('div');
            renameDiv.className = "deletelayoutdiv";
            var deleteIcon = document.createElement('img');
            deleteIcon.src = "resources/images/delrect16.png";
            deleteIcon.style.width='16px';
            deleteIcon.onclick = function(){
                nv.deleteClick();
            }
            renameDiv.append(deleteIcon);
            
            var renameIcon = document.createElement('img');
            renameIcon.src="resources/images/edit16.png";
            renameIcon.style.width='16px';
            renameIcon.onclick = function(){
                nv.renameClick();
            }
            renameDiv.appendChild(renameIcon);
            this.textdiv.appendChild(renameDiv);
        }
        parent.insertBefore(this.tablehead,createBefore);
    }
    
    deleteClick(){
        var nv = this;
        var node = this.nodes[0];
        if(!node)return;
        if(mxUtils.confirm("Delete this node?")){
            node.deleteSelf();
            node.wf.makeUndo("Delete Node",node);
        }
    }
    
    renameClick(){
        var nv = this;
        var node = this.nodes[0];
        if(!node)return;
        var tempfunc = this.namediv.onclick;
        var name = node.name;
        if(!name)name="";
        this.namediv.innerHTML="<input type='text' value = '"+name+"'placeholder='<type a new name here>'></input>";
        this.namediv.firstElementChild.focus();
        this.namediv.firstElementChild.select();
        this.namediv.onclick=null;
        
        var enterfunc =function(evt){
            if(evt.key!=null&&evt.key=="Enter"){
                if(nv.namediv.firstElementChild!=null)nv.namediv.firstElementChild.blur();
            }
        }
        document.addEventListener('keydown',enterfunc);
        nv.namediv.firstElementChild.addEventListener("focusout",function(){
           nv.namediv.onclick = tempfunc;
            if(nv.namediv.firstElementChild.value==""){
                nv.nameUpdated();
            }else{
                node.setName(nv.namediv.firstElementChild.value);
            }
            document.removeEventListener('keydown',enterfunc);
        },true);
    }
    
    
    nameUpdated(){
        if(this.nodes[0].name)this.namediv.innerHTML = this.nodes[0].name;
        else this.namediv.innerHTML = "New Node";
    }
    
    leftIconUpdated(){
        
    }
    
    rightIconUpdated(){
        
    }
    
    deleted(){
        var node = this.nodes[0];
        var index = 1;
        var categoryViews = node.wf.view.categoryViews;
        var grandTotal = node.wf.view.grandTotal;
        for(var i=0;i<categoryViews.length;i++){
            var cv = categoryViews[i];
            if(cv.nodeViews.indexOf(this)>=0){
                var totalview = cv.nodeViews[cv.nodeViews.length-1];
                totalview.nodes.splice(totalview.nodes.indexOf(node),1);
                index+=cv.nodeViews.indexOf(this);
                cv.nodeViews.splice(cv.nodeViews.indexOf(this),1);
                cv.nodeRemoved(node);
                this.tablehead.parentElement.removeChild(this.tablehead);
                this.vertex.parentElement.removeChild(this.vertex);
                grandTotal.nodes.splice(grandTotal.nodes.indexOf(node),1);
                var tableCells = node.wf.view.tableCells;
                for(var j=0;j<tableCells.length;j++){
                    tableCells[j][index].vertex.parentElement.removeChild(tableCells[j][index-1].vertex);
                    tableCells[j].splice(index-1,1);
                }
                break;
            }else{
                index+=cv.nodeViews.length;
            }
        }
        node.wf.view.updateTable();
        
    }
    
}



class OutcomeTagview{
    constructor(tag,wf){
        this.tag=tag;
        this.wf = wf;
        this.vertex;
        this.nameCell;
        this.expandIcon = document.createElement('img');
    }
    
    
    nameUpdated(){
        this.updateName();
    }
    
    createVertex(parent){
        var wf = this.wf;
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
        if(tv.tag.depth<=wf.getTagDepth()){
            var editdiv = document.createElement('div');
            editdiv.className = "deletelayoutdiv";
            var unassignicon = document.createElement('img');
            unassignicon.src="resources/images/unassign16.png";
            unassignicon.style.width='16px';
            unassignicon.onclick = function(){
                if(mxUtils.confirm(tv.tag.getUnassignText())){
                    tv.tag.unassignFrom(wf);
                }
            }
            editdiv.appendChild(unassignicon);
            this.nameCell.appendChild(editdiv);
        }
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
            if(this.tag.children[i].view)this.tag.children[i].view.clearViews();
        }
        this.tag.view = null;
    }
}

class OutcomeTableCell{
    constructor(tag,nodeview){
        this.tag = tag;
        this.nodeview = nodeview;
        this.vertex;
        this.checkbox;
        this.validationImg;
    }
    
    createVertex(parent,createBefore){
        var tag = this.tag;
        var node = this.nodeview.nodes[0];
        this.vertex = document.createElement('td');
        if(this.nodeview.isTotal)this.vertex.classList.add("totalcell");
        else if(this.nodeview.nodes.length==0)this.vertex.classList.add("emptycell");
        parent.insertBefore(this.vertex,createBefore);
        if(this.nodeview.nodes.length>0||this.nodeview.isTotal){
            var checkbox = document.createElement('input');
            checkbox.type="checkbox";
            checkbox.checked=false;
            if(this.nodeview.isTotal){checkbox.disabled=true;checkbox.classList.add("hidden");}
            checkbox.classList.add("outcomecheckbox");
            this.vertex.appendChild(checkbox);
            this.checkbox = checkbox;
            checkbox.onclick=function(){
                if(checkbox.checked){
                    node.addTag(tag,false,true);
                }else{
                    node.removeTag(tag,true);
                }
                if(node.wf.view)node.wf.view.updateTable();
            }
            
            var validationImg = document.createElement('img');
            validationImg.classList.add("outcomecellicon");
            validationImg.style.width='16px';
            this.vertex.appendChild(validationImg);
            this.validationImg = validationImg;
        }
    }
    
    validateSelf(){
        if(this.nodeview.nodes.length==0){
            if(this.validationImg)this.validationImg.src="";
            return;
        }
        var completeness = this.validateParents(this.tag);
        if(completeness==0)completeness=this.validateTag(this.tag);
        if(completeness==1){
            this.checkbox.checked=true;
            this.validationImg.src = "resources/images/check16.png";
        }else{
            this.checkbox.checked=false;
            if(this.nodeview.isTotal)this.validationImg.src = "resources/images/warningcheck16.png";
            else if(completeness>0)this.validationImg.src = "resources/images/nocheck16.png";
            else this.validationImg.src = "";
        }
    }
    
    validateParents(tag){
        if(tag.parentTag){
            for(var i=0;i<this.nodeview.nodes.length;i++){
                if(this.nodeview.nodes[i].tags.indexOf(tag.parentTag)>=0)return 1.0;
            }
            return this.validateParents(tag.parentTag);
        }
        return 0.0;
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