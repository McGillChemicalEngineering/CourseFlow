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
        this.headRow;
        this.tagViews;
        this.tableCells=[];
        this.toolbarDiv;
        this.editbar;
    }
    
    nameUpdated(){
        this.titleInput.value = this.wf.name;
    }
    
    createTitleNode(){
        var wf = this.wf;
        var title = "["+LANGUAGE_TEXT.workflow.inserttitle[USER_LANGUAGE]+"]";
        if(wf.name&&wf.name!=wf.getDefaultName())title=wf.name;
        var titleDiv = document.createElement('div');
        this.container.appendChild(titleDiv);
        var titleInput = document.createElement('input');
        titleInput.type="text";
        titleInput.value=title
        titleInput.onchange=function(){wf.setNameSilent(titleInput.value)};
        titleInput.className = "outcometabletitle outcometabletitleinput";
        this.titleInput = titleInput;
        titleDiv.appendChild(titleInput);
        
    }
    
    createAuthorNode(){
        var wf = this.wf;
        var title = "["+LANGUAGE_TEXT.workflow.insertauthor[USER_LANGUAGE]+"]";
        if(wf.author)title = wf.author;
        var authorDiv = document.createElement('div');
        this.container.appendChild(authorDiv);
        var authorInput = document.createElement('input');
        authorInput.type="text";
        authorInput.value=title;
        authorInput.onchange=function(){wf.setAuthorSilent(authorInput.value)};
        authorInput.className = "outcometableauthor outcometabletitleinput";
        this.authorInput = authorInput;
        authorDiv.appendChild(authorInput);
        
    }
    
    makeActive(){
        this.container.style.width="";
        this.container.style.height="";
        this.toolbarDiv = document.getElementById('nbWrapper');
        this.toolbarDiv.parentElement.style.display="inline-block";
        
        this.createTitleNode();
        this.createAuthorNode();
        
        this.table = document.createElement('table');
        this.table.classList.add("outcometable");
        this.container.appendChild(this.table);
        
        
        this.generateToolbars();
        
        this.drawGraph();
        
        var ebContainer = document.getElementById('ebWrapper');
        makeResizable(ebContainer.parentElement,"left");
        ebContainer.parentElement.style.zIndex='3';
        ebContainer.parentElement.style.width = '400px';
        var editbar = new EditBar(ebContainer,this.wf);
        this.editbar = editbar;
        
        
        
        $("#print").removeClass("disabled");
        $("#expand").removeClass("disabled");
        $("#collapse").removeClass("disabled");
        
    }
    
    makeInactive(){
        this.editbar.disable();
        
        this.toolbarDiv.parentElement.style.display="none";
        for(var i=0;i<this.wf.tagSets.length;i++){
            if(this.wf.tagSets[i].view)this.wf.tagSets[i].view.clearViews();
        }
        this.tableCells=[];
        this.tagViews=[];
        this.categoryViews=[];
        this.container.innerHTML="";
        
        
        $("#print").addClass("disabled");
        $("#expand").addClass("disabled");
        $("#collapse").addClass("disabled");
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
        this.headRow = headRow;
        
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
        var wf = this;
        var debouncetime = 100;
        var prevUpdateCall = this.lastUpdateCall;
        this.lastUpdateCall = Date.now();
        if(prevUpdateCall&&this.lastUpdateCall-prevUpdateCall<=debouncetime)clearTimeout(this.lastUpdateTimer);
        this.lastUpdateTimer = setTimeout(function(){
            for(var i=0;i<wf.tableCells.length;i++){
                for(var j=0;j<wf.tableCells[i].length;j++){
                    var tc = wf.tableCells[i][j];
                    tc.validateSelf();
                }
            }
        },debouncetime);
        
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
            this.categoryViews[i].nodeViews.push(new OutcomeNodeview(total,true,this.categoryViews[i]));
            grandtotal = grandtotal.concat(total);
        }
        this.categoryViews.push(new OutcomeCategoryview({value:"grandtotal",text:LANGUAGE_TEXT.outcomeview.grandtotal[USER_LANGUAGE]},this.wf));
        this.grandTotal=new OutcomeNodeview(grandtotal,true,this.categoryViews[this.categoryViews.length-1]);
        this.categoryViews[this.categoryViews.length-1].nodeViews.push(this.grandTotal);
        
    }
    
    addNodeView(node){
        var cv = this.getCategoryForNode(node);
        if(!cv)return;
        node.view = new OutcomeNodeview([node],false,cv);
        cv.nodeViews.push(node.view);
    }
            
    createTagViews(){
        this.tagViews = [new OutcomeTagview(null,this.wf)];
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
        return (node.column=="SA");
    }
    
    getNodeCategories(){
        var list = iconsList['assessment'].slice(0);
        return list;
    }
    
    insertCategory(cv){
        var lastcv = this.categoryViews[this.categoryViews.length-1];
        cv.createVertex();
        this.table.insertBefore(cv.vertex,lastcv.vertex);
        this.categoryViews.splice(this.categoryViews.length-1,0,cv);
        cv.nodeViews[0].insertSelf(lastcv.nodeViews[0]);
        cv.nodeViews.push(new OutcomeNodeview([],true,cv));
        cv.nodeViews[1].insertSelf(lastcv.nodeViews[0]);
        cv.createTableHead(lastcv.tablehead.parentElement,lastcv.tablehead);
        
    }
    
    removeCategory(cv){
        console.log("removing category");
        for(var i=0;i<cv.nodeViews.length;i++){
            cv.nodeViews[i].removeSelf();
        }
        cv.vertex.parentElement.removeChild(cv.vertex);
        cv.tablehead.parentElement.removeChild(cv.tablehead);
        this.categoryViews.splice(this.categoryViews.indexOf(cv),1);
    }
    
    getCategoryForNode(node){
        var category = this.getCategoryFromNode(node);
        if(category==null)category="none";
        for(var i=0;i<this.categoryViews.length;i++){
            if(this.categoryViews[i].value==category)return this.categoryViews[i];
        }
        if(category=="none"){
            var uncat = new OutcomeCategoryview({text:LANGUAGE_TEXT.outcomeview.uncategorized[USER_LANGUAGE],value:"none"},this.wf)
            //it's possible that we are switching a node in a complete table into the uncategorized column. In this case its vertex/head need to be added, as well as its total column.
            if(node.view)this.insertCategory(uncat);
            else this.categoryViews.push(uncat);
            return uncat;
        }
        return null;
    }
    
    nodeAdded(node){
        if(!this.isValidNode(node))return;
        var index = 1;
        for(var i=0;i<this.categoryViews.length;i++){
            var cv = this.categoryViews[i];
            if(cv.value==this.getCategoryFromNode(node)||(cv.value=="none"&&this.getCategoryFromNode(node)==null)){
                index+=cv.nodeViews.length-2;
                this.grandTotal.nodes.push(node);
                var nv = new OutcomeNodeview([node],false,cv);
                node.view = nv;
                cv.nodeAdded(node,index);
                break;
            }else{
                index+=cv.nodeViews.length;
            }
        }
        this.updateTable();
    }
    
    getCategoryFromNode(node){
        return node.lefticon;
    }
    
    populateTagBar(){
        this.makeInactive();
        this.makeActive();
    }
    
    
    tagSetsSwapped(i1,i2){
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
        container.parentElement.style.display="inline";
        while(container.firstChild)container.removeChild(container.firstChild);
        makeResizable(container.parentElement,"left");
        this.generateTagBar(container);
        
    }

    generateTagBar(){
        if(this.wf.getTagDepth()<0)return;
        
        var wf = this.wf;
        var p=wf.project;
        var header = document.createElement('h3');
        header.className="nodebarh3";
        header.innerHTML=LANGUAGE_TEXT.workflowview.outcomesheader[USER_LANGUAGE]+":";
        this.toolbarDiv.appendChild(header);
        
        
        
        
        var compSelect = document.createElement('select');
        this.tagSelect=compSelect;
        this.populateTagSelect(p.competencies,this.wf.getTagDepth());
        
        var addButton = document.createElement('button');
        addButton.innerHTML = LANGUAGE_TEXT.workflowview.assignoutcome[USER_LANGUAGE];
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
        opt.text =LANGUAGE_TEXT.workflowview.selectset[USER_LANGUAGE];
        opt.value = "";
        compSelect.add(opt);
        for(var i=0;i<allTags.length;i++){
            opt = document.createElement('option');
            opt.innerHTML = "&nbsp;".repeat(allTags[i].depth*4)+allTags[i].getType()[0]+" - "+allTags[i].name;
            opt.value = allTags[i].id;
            compSelect.add(opt);
        }
    }
    
    expandAllNodes(expand=true){
        for(var i=0;i<this.categoryViews.length;i++){
            if(expand)this.categoryViews[i].expand();
            else this.categoryViews[i].collapse();
        }
        for(var i=0;i<this.tagViews.length;i++){
            if(expand)this.tagViews[i].expand();
            else this.tagViews[i].collapse();
        }
    }
    
    print(){
        var div = this.container.parentElement;
        var newwindow = window.open('','_blank');
        
        newwindow.document.write('<!doctype html><html><head><title>' + document.title  + '</title>');
        newwindow.document.write('<link rel="stylesheet" href="cfstyle.css" type="text/css" />');
        newwindow.document.write('</head><body class="printpreview">');
        newwindow.document.write('<h1>' + this.wf.name  + '</h1>');
        newwindow.document.write(div.innerHTML);
        newwindow.document.write('</body></html>');
    }
    
}

class OutcomeCategoryview{
    constructor(data,wf){
        this.colgroup;
        this.wf=wf;
        this.tablehead;
        this.vertex;
        this.name;
        if(data.text.en)this.name = data.text[USER_LANGUAGE];
        else this.name = data.text;
        this.value = data.value;
        this.nodeViews = [new OutcomeNodeview([],false,this)];
        this.expandIcon=document.createElement('img');
    }
    
    createVertex(parent){
        this.vertex = document.createElement('colgroup');
        return this.vertex;
    }
    
    createTableHead(parent,createBefore=null){
        var cv = this;
        var catHead = document.createElement('th');
        catHead.classList.add('expanded');
        if(this.nodeViews.length>2)catHead.classList.add('haschildren');
        var wrapper = document.createElement('div');
        wrapper.classList.add("categoryhead");
        catHead.setAttribute("colspan",this.nodeViews.length);
        wrapper.innerHTML = this.name.replace(/\//g,"\/<wbr>");
        catHead.appendChild(wrapper);
        parent.insertBefore(catHead,createBefore);
        
        
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
            var node = new ACNode(wf);
            node.setColumn("SA");
            if(this.value!="none")node.setLeftIcon(this.value);
            node.week=week;
            week.addNode(node);
            if(wf.view)wf.view.nodeAdded(node);
        }
        
    }
    
    //The node, the overall index at which we want to place it, and the nodeview which comes directly after it - the totals column by default
    nodeAdded(node,index,lastnv){
        var cv = this;
        var nv = node.view;
        if(!lastnv)lastnv = cv.nodeViews[cv.nodeViews.length-1];
        cv.nodeViews[cv.nodeViews.length-1].nodes.push(node);
        cv.nodeViews.splice(cv.nodeViews.length-1,0,nv);
        
        
        this.tablehead.setAttribute("colspan",int(this.tablehead.getAttribute("colspan"))+1);
        this.tablehead.classList.add("haschildren");
        
        nv.insertSelf(lastnv);
        
    }
    
    
    nodeRemoved(node,index){
        var cv = this;
        var nv = node.view;
        nv.removeSelf();
        var totalview = cv.nodeViews[cv.nodeViews.length-1];
        totalview.nodes.splice(totalview.nodes.indexOf(node),1);
        cv.nodeViews.splice(cv.nodeViews.indexOf(node.view),1);
        this.tablehead.setAttribute("colspan",int(this.tablehead.getAttribute("colspan"))-1);
        if(this.nodeViews.length<=2){
            this.tablehead.classList.remove("haschildren");
            if(this.value=="none")this.wf.view.removeCategory(this);
        }
        
        
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
    constructor(nodes,isTotal=false,cv){
        this.nodes=nodes;
        this.vertex;
        this.tablehead;
        this.textdiv;
        this.namediv;
        this.cv = cv;
        this.isTotal=isTotal;
    }
    
    
    
    tagRemoved(){
        if(this.nodes[0].wf.view)this.nodes[0].wf.view.updateTable();
    }
    
    tagAdded(){
        console.log("tag added");
        if(this.nodes[0].wf.view)this.nodes[0].wf.view.updateTable();
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
        this.textdiv.onclick = function(evt){nv.openEditBar(evt);}
        this.namediv.classList.add("outcometableheadertext");
        this.textdiv.appendChild(this.namediv);
        if(this.isTotal){this.namediv.innerHTML = LANGUAGE_TEXT.outcomeview.total[USER_LANGUAGE];this.tablehead.classList.add("totalcell");}
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
    
    openEditBar(evt){
        if(!this.isTotal&&this.nodes.length==1){
            var node = this.nodes[0];
            var eb = node.wf.view.editbar;
            eb.enable(node);
            evt.stopPropagation();
            var listenerDestroyer = function(){document.removeEventListener("click",outsideClick);}
            var outsideClick = function(evt2){if(eb&&!eb.container.parentElement.contains(evt2.target)){eb.disable();listenerDestroyer();console.log("click");}else if(!eb)listenerDestroyer();}
            document.addEventListener("click",outsideClick);
            
        }
    }
    
    deleteClick(){
        var nv = this;
        var node = this.nodes[0];
        if(!node)return;
        if(mxUtils.confirm(LANGUAGE_TEXT.confirm.deletenode[USER_LANGUAGE])){
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
        else this.namediv.innerHTML = LANGUAGE_TEXT.node.defaulttext[USER_LANGUAGE];
    }
    
    leftIconUpdated(){this.categoryChanged();}
    rightIconUpdated(){}
    textUpdated(){}
    linkedWFUpdated(){}
    
    categoryChanged(){
        console.log(this);
        console.log(this.nodes[0]);
        console.log("category changed");
        var index = this.getOverallIndex();
        var node = this.nodes[0];
        this.cv.nodeRemoved(node,index);
        var cv = node.wf.view.getCategoryForNode(node);
        this.cv = cv;
        console.log("Adding to category " + cv.name);
        var lastnv;
        var weeks = node.wf.weeks;
        var weekindex = weeks.indexOf(node.week);
        for(var i=0;i<cv.nodeViews.length;i++){
            lastnv = cv.nodeViews[i];
            if(lastnv.nodes.length==0)continue;
            if(lastnv.isTotal)break;
            if(weeks.indexOf(lastnv.nodes[0].week)>weekindex)break;
            if(weeks.indexOf(lastnv.nodes[0].week)==weekindex&&weeks[weekindex].nodes.indexOf(lastnv.nodes[0])>weeks[weekindex].nodes.indexOf(node))break;
            
        }
        if(!lastnv)return;
        cv.nodeAdded(node,lastnv.getOverallIndex()-1,lastnv);
        cv.wf.view.updateTable();
    }
    
    deleted(){
        var node = this.nodes[0];
        var grandTotal = node.wf.view.grandTotal;
        var placement = this.getOverallIndex();
        if(placement>-1)this.cv.nodeRemoved(node,placement);
        grandTotal.nodes.splice(grandTotal.nodes.indexOf(node),1);
        node.wf.view.updateTable();
        
    }
    
    getOverallIndex(){
        var categoryViews = this.cv.wf.view.categoryViews;
        var index = 1;
        for(var i=0;i<categoryViews.length;i++){
            var cv = categoryViews[i];
            if(cv==this.cv){
                index+=cv.nodeViews.indexOf(this);
                console.log(index);
                return index;
            }else{
                index+=cv.nodeViews.length;
            }
        }
        console.log("oopsie");
        return -1;
        
    }
    
    
    insertSelf(lastnv){
        var nv = this;
        var vertexInsertBefore;
        var headInsertBefore;
        var vertexParent = nv.cv.vertex;
        var headParent = nv.cv.wf.view.headRow;
        if(lastnv){
            if(lastnv.cv==nv.cv)vertexInsertBefore=lastnv.vertex;
            headInsertBefore=lastnv.tablehead;
        }
        
        if(nv.vertex)vertexParent.insertBefore(nv.vertex,vertexInsertBefore);
        else nv.createVertex(vertexParent,vertexInsertBefore);
        if(nv.tablehead)headParent.insertBefore(nv.tablehead,headInsertBefore);
        else nv.createTableHead(headParent,headInsertBefore);
        
        var index = nv.getOverallIndex();
        console.log(index);
        var tableCells = this.cv.wf.view.tableCells;
        var tagViews = this.cv.wf.view.tagViews;
        for(var j=0;j<tableCells.length;j++){
            var newCell = new OutcomeTableCell(tagViews[j].tag,nv);
            newCell.createVertex(tagViews[j].vertex,tableCells[j][index-1].vertex);
            tableCells[j].splice(index-1,0,newCell);
        }
    }
    
    removeSelf(){
        var nv = this;
        var index = nv.getOverallIndex();
        nv.tablehead.parentElement.removeChild(nv.tablehead);
        nv.vertex.parentElement.removeChild(nv.vertex);
        var tableCells = this.cv.wf.view.tableCells;
        for(var j=0;j<tableCells.length;j++){
            tableCells[j][index].vertex.parentElement.removeChild(tableCells[j][index-1].vertex);
            tableCells[j].splice(index-1,1);
        }
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
        if(this.tag&&this.tag.children.length>0)vertex.classList.add("haschildren");
        vertex.classList.add("expanded");
        if(this.tag)vertex.classList.add("depth"+this.tag.depth);
        parent.appendChild(vertex);
        this.nameCell = document.createElement('div');
        var cell = document.createElement('td');
        cell.appendChild(this.nameCell);
        this.updateName()
        vertex.appendChild(cell);
        
        var expandDiv = document.createElement('div');
        expandDiv.className="expanddiv";
        this.expandIcon.src="resources/images/minus16.png";
        this.expandIcon.style.width='16px';
        this.expandIcon.onclick=function(){
            if(vertex.classList.contains("expanded")){tv.collapse();}
            else {tv.expand();}
        }
        expandDiv.appendChild(this.expandIcon);
        cell.appendChild(expandDiv);
        if(tv.tag&&tv.tag.depth<=wf.getTagDepth()){
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
            cell.appendChild(editdiv);
        }
        
        if(wf.tagSets.indexOf(this.tag)>=0){
            var move = document.createElement('div');
            move.className = "editlayoutdiv";
            var up = document.createElement('img');
            up.className="layoutchange";
            up.src = "resources/images/moveup16.png";
            up.onclick=function(){
                tv.moveTag(true);
            }
            move.appendChild(up);
            var down = document.createElement('img');
            down.className="layoutchange";
            down.src = "resources/images/movedown16.png";
            down.onclick=function(){
                tv.moveTag(false);
            }
            move.appendChild(down);
            cell.appendChild(move);
        }
        
        
    }
    
    moveTag(isup){
        var tagSets = this.wf.tagSets;
        if(tagSets.length<=1)return;
        var index1 = tagSets.indexOf(this.tag);
        var index2;
        if(index1< tagSets.length-1&&!isup){
            index2 = index1+1;
        }else if(index1>0&&isup){
            index2 = index1-1;
        }
        console.log(index1);
        console.log(index2);
        if(index2!=null)this.wf.swapTagSets(index1,index2);
    }
    
    
    expand(){
        if(this.tag==null)return;
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
        if(this.tag==null)return;
        this.vertex.classList.remove("expanded");
        for(var i=0;i<this.tag.children.length;i++){
            if(this.tag.children[i].view)this.tag.children[i].view.hideTag();
        }
        this.expandIcon.src="resources/images/plus16.png";
    }
    
    updateName(){
        var name="";
        if(this.tag){
            if(this.tag.parentTag)name+=(int(this.tag.parentTag.children.indexOf(this.tag))+1)+".  ";
            name += this.tag.name;
        }
        this.nameCell.innerHTML=name;
    }
    
    
    clearViews(){
        for(var i=0;i<this.tag.children.length;i++){
            if(this.tag.children[i].view)this.tag.children[i].view.clearViews();
        }
        this.tag.view = null;
    }
    
    terminologyUpdated(){
        
    }
    
    makeEditButton(container,node,editbar){
        var tag = this;
        var button = new EditBarTagButton(this.tag,container);
        button.makeEditable(false,false,true,node);
        button.b.onclick=null;
        return button.childdiv;
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
            if(this.nodeview.isTotal||!this.tag){checkbox.disabled=true;checkbox.classList.add("hidden");}
            checkbox.classList.add("outcomecheckbox");
            this.vertex.appendChild(checkbox);
            this.checkbox = checkbox;
            checkbox.onclick=function(){
                if(checkbox.checked){
                    node.addTag(tag,false,true);
                }else{
                    node.removeTag(tag,true);
                }
            }
            
            var validationImg = document.createElement('img');
            validationImg.classList.add("outcomecellicon");
            validationImg.style.width='16px';
            this.vertex.appendChild(validationImg);
            this.validationImg = validationImg;
        }
    }
    
    validateSelf(){
        if(this.nodeview.nodes.length==0||this.tag==null){
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
            if(completeness==0&&this.nodeview.isTotal&&this.nodeview==this.nodeview.cv.wf.view.grandTotal)this.validationImg.src = "resources/images/warningcheck16.png";
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

class ProgramOutcomeview extends Outcomeview{
    
    getNodeCategories(){
        var list = [];
        for(var i=0;i<this.wf.weeks.length;i++){
            var name = this.wf.weeks[i].name;
            if(!name)name=this.wf.weeks[i].getDefaultName();
            list.push({text:name,value:i});
        }
        return list;
    }
    
    createCategoryViews(){
        var nodeCategories = this.getNodeCategories();
        this.categoryViews = [];
        for(var i=0;i<nodeCategories.length;i++){
            var cgv = new ProgramOutcomeCategoryview(nodeCategories[i],this.wf);
            this.categoryViews.push(cgv);
        }
    }
    
    isValidNode(node){
        return true;
    }
    
    getCategoryFromNode(node){
        return node.wf.weeks.indexOf(node.week);
    }
    
    
    getCategoryForNode(node){
        var category = node.wf.weeks.indexOf(node.week);
        if(category==null)category="none";
        for(var i=0;i<this.categoryViews.length;i++){
            if(this.categoryViews[i].value==category)return this.categoryViews[i];
        }
        if(category=="none"){
            this.categoryViews.push(new OutcomeCategoryview({text:LANGUAGE_TEXT.outcomeview.uncategorized[USER_LANGUAGE],value:"none"},this.wf));
            return this.categoryViews[this.categoryViews.length-1];
        }
        return null;
    }
    
    
}

class ProgramOutcomeCategoryview extends OutcomeCategoryview{
    
    
    addNode(){
        var wf = this.wf;
        var week;
        if(this.value!=null) week = wf.weeks[this.value];
        if(week){
            var node = new CONode(wf);
            node.setColumn(wf.columns[0].name);
            node.week=week;
            week.addNode(node);
            if(wf.view)wf.view.nodeAdded(node);
        }
        
    }
}