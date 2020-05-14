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
        this.toolbar;
        this.displayBar;
        this.editbar;
        this.tbody;
        this.legendDiv;
        this.sortType;
        if(this.wf.outcomeSortType!=null)this.sortType=this.wf.outcomeSortType;
        else this.sortType = this.getDefaultSortType();
    }
    
    nameUpdated(){
        this.titleInput.value = this.wf.name;
    }
    
    createTitleNode(){
        var wf = this.wf;
        var readOnly = wf.project.readOnly;
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
        titleInput.readOnly=true;
        titleInput.ondblclick = function(){if(readOnly)return;titleInput.readOnly=false;titleInput.select();}
        titleInput.addEventListener("focusout",function(){titleInput.readOnly=true;});
        
    }
    
    createAuthorNode(){
        var wf = this.wf;
        var readOnly = wf.project.readOnly;
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
        authorInput.readOnly=true;
        authorInput.ondblclick = function(){if(readOnly)return;authorInput.readOnly=false;authorInput.select();}
        authorInput.addEventListener("focusout",function(){authorInput.readOnly=true;});
        
    }
    
    /*createDescriptionNode(){
        var wf = this.wf;
        var title = "["+LANGUAGE_TEXT.workflow.insertdescription[USER_LANGUAGE]+"]";
        if(wf.description)title = wf.description;
        var descriptionheadDiv = document.createElement('div');
        descriptionheadDiv.innerHTML = LANGUAGE_TEXT.workflow.description[USER_LANGUAGE]+":";
        this.container.appendChild(descriptionheadDiv);
        descriptionheadDiv.className = "outcometabletitleinput outcometabledescriptionhead";
        var descriptionDiv = document.createElement('div');
        this.container.appendChild(descriptionDiv);
        var descriptionInput = document.createElement('textarea');
        descriptionInput.value=title;
        descriptionInput.onchange=function(){wf.setDescriptionSilent(descriptionInput.value)};
        descriptionInput.className = "outcometabledescription outcometabletitleinput";
        this.descriptionInput = descriptionInput;
        descriptionDiv.appendChild(descriptionInput);
        descriptionInput.readOnly=true;
        descriptionInput.ondblclick = function(){descriptionInput.readOnly=false;descriptionInput.select();}
        descriptionInput.addEventListener("focusout",function(){descriptionInput.readOnly=true;});
        this.container.appendChild(document.createElement('hr'));
        
    }*/
    
    createDescriptionNode(){
        var wf = this.wf;
        var title = "["+LANGUAGE_TEXT.workflow.insertdescription[USER_LANGUAGE]+"]";
        if(wf.description)title = wf.description;
        var descriptionheadDiv = document.createElement('div');
        descriptionheadDiv.innerHTML = LANGUAGE_TEXT.workflow.description[USER_LANGUAGE]+":";
        this.container.appendChild(descriptionheadDiv);
        descriptionheadDiv.className = "outcometabletitleinput outcometabledescriptionhead";
        this.descriptionNode = document.createElement('div');
        var descriptionNode = this.descriptionNode;
        var quilldiv = document.createElement('div');
        this.descriptionNode.appendChild(quilldiv);
        this.descriptionNode.style.width = "800px";
        this.descriptionNode.style.height = "80px";
        this.descriptionNode.style.position = "absolute";
        this.descriptionNode.className = "descriptionnode";
        this.descriptionNode.style.marginTop = -40+"px";
        this.descriptionNode.style.marginLeft = 40+"px";
        this.descriptionNode.style.marginBottom = 75+"px";
        this.container.appendChild(this.descriptionNode);
        var toolbarOptions = [['bold','italic','underline'],[{'script':'sub'},{'script':'super'}],[{'list':'bullet'},{'list':'ordered'}],['link'],['formula']];
        var quill = new Quill(quilldiv,{
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder:LANGUAGE_TEXT.editbar.insertdescription[USER_LANGUAGE]
        });
        quill.on('text-change', function(delta, oldDelta, source) {
          if (source == 'user') {
            if(wf){
                wf.setDescriptionSilent(quilldiv.childNodes[0].innerHTML.replace(/\<p\>\<br\>\<\/p\>\<ul\>/g,"\<ul\>"));
            }
          }
        });
        var allowedattrs = ['link','bold','italic','underline','script','list'];
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
            for(var i=0;i<delta.ops.length;i++){
                var op = delta.ops[i];
                if(op.attributes){
                    for(var attr in op.attributes){
                        if(allowedattrs.indexOf(attr)<0)op.attributes[attr]=null;
                    }
                }
            }
            return delta;
        });
        var readOnly = wf.project.readOnly;
        var toolbar = quill.getModule('toolbar');
        toolbar.defaultLinkFunction=toolbar.handlers['link'];
        toolbar.addHandler("link",function customLinkFunction(value){
            var select = quill.getSelection();
            if(value&&select['length']==0&&!readOnly){
                quill.insertText(select['index'],'link');
                quill.setSelection(select['index'],4);
            }
           
            this.defaultLinkFunction(value);
        });
        this.descriptionNode.edit = function(){quilldiv.firstElementChild.contentEditable=true;quilldiv.firstElementChild.focus();descriptionNode.classList.add('active');}
        if(wf.description!=null)quill.clipboard.dangerouslyPasteHTML(wf.description,"silent");
        else quill.clipboard.dangerouslyPasteHTML("","silent");
        
        quilldiv.firstElementChild.contentEditable=false;
        quilldiv.firstElementChild.ondblclick = function(){if(readOnly)return;quilldiv.firstElementChild.contentEditable=true;quilldiv.firstElementChild.focus();descriptionNode.classList.add('active');}
        descriptionNode.firstElementChild.onmousedown = function(evt){evt.preventDefault();}
        quilldiv.addEventListener("focusout",function(evt){
            //check if related target is within the quillified div
            var target = evt.relatedTarget;
            if(target == null)target = evt.explicitOriginalTarget;
            while(target!=null){
                if(target.parentElement==quilldiv)return;
                else(target = target.parentElement);
            }
            quilldiv.firstElementChild.contentEditable=false;
            descriptionNode.classList.remove('active');
        });
        quilldiv.firstElementChild.blur();
        
        var hr = document.createElement('hr');
        this.container.appendChild(hr);
        hr.style.marginTop = "120px";
        
}
    
    makeActive(){
        this.container.style.width="";
        this.container.style.height="";
        this.toolbar = new WFToolbar(this.wf.project,document.getElementById('nbContainer'),"right","nodebar36");
        this.toolbar.container.classList.add("nodebar");
        
        this.createTitleNode();
        this.createAuthorNode();
        this.createDescriptionNode();
        
        this.table = document.createElement('table');
        this.table.classList.add("outcometable");
        this.container.appendChild(this.table);
        
        
        this.generateToolbars();
        
        this.drawGraph();
        
        var ebContainer = document.getElementById('ebWrapper');
        if(ebContainer.nextElementSibling==null||!ebContainer.nextElementSibling.classList.contains("panelresizehandle"))makeResizable(ebContainer.parentElement,"left");
        ebContainer.parentElement.style.zIndex='5';
        ebContainer.parentElement.style.width = '400px';
        var editbar = new EditBar(ebContainer,this.wf);
        this.editbar = editbar;
        
        document.body.contextItem = this;
        
        
        $("#print").removeClass("disabled");
        $("#exportcsv").removeClass("disabled");
        $("#expand").removeClass("disabled");
        $("#expandviewbar").removeClass("disabled");
        $("#collapse").removeClass("disabled");
        $("#collapseviewbar").removeClass("disabled");
        $("#showlegend").removeClass("disabled");
        
    }
    
    makeInactive(){
        this.editbar.disable();

        this.toolbar.container.style.display="none";
        for(var i=0;i<this.wf.tagSets.length;i++){
            if(this.wf.tagSets[i].view)this.wf.tagSets[i].view.clearViews();
        }
        this.tableCells=[];
        this.tagViews=[];
        this.categoryViews=[];
        for(var i=0;i<this.wf.weeks.length;i++){
            for(var j=0;j<this.wf.weeks[i].nodes.length;j++){
                this.wf.weeks[i].nodes[j].view=null;
            }
        }
        this.container.innerHTML="";
        
        document.body.contextItem = this.wf.project;
        
        $("#print").addClass("disabled");
        $("#exportcsv").addClass("disabled");
        $("#expand").addClass("disabled");
        $("#expandviewbar").addClass("disabled");
        $("#collapse").addClass("disabled");
        $("#collapseviewbar").addClass("disabled");
        $("#showlegend").addClass("disabled");
    }
    
    
    
    drawGraph(){
        var table = this.table;
        this.createCategoryViews();
        this.createNodeViews();
        this.createTagViews();
        this.wf.updateWeekIndices();
        
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
        this.drawLegend(headBase);
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
        this.tbody = tbody;
        
        
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
            this.tagViews[i].cellRow = cellRow;
            this.tableCells.push(cellRow);
        }
        
        for(var i=0;i<this.tagViews.length;i++){
            if(this.tagViews[i].tag&&this.tagViews[i].tag.collapsed)this.tagViews[i].collapse();
        }
        
        for(var i=0;i<this.categoryViews.length;i++){
            if(this.sortType=="week"&&this.categoryViews[i].value.collapsed)this.categoryViews[i].collapse();
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
    
    drawLegend(container){
        var legendDiv = document.createElement('div');
        legendDiv.className = "outcomelegend";
        container.appendChild(legendDiv);
        var legHead = document.createElement('h4');
        legHead.innerHTML=LANGUAGE_TEXT.legend.legend[USER_LANGUAGE];
        legendDiv.appendChild(legHead);
        legendDiv.appendChild(document.createElement('hr'));
        this.drawLegendLine(legendDiv,LANGUAGE_TEXT.outcomeview.complete[USER_LANGUAGE],"check");
        this.drawLegendLine(legendDiv,LANGUAGE_TEXT.outcomeview.partial[USER_LANGUAGE],"nocheck");
        this.drawLegendLine(legendDiv,LANGUAGE_TEXT.outcomeview.incomplete[USER_LANGUAGE],"warningcheck");
        this.legendDiv = legendDiv;
    }
    
    drawLegendLine(container,title,image){
        var lineDiv = document.createElement('div');
        lineDiv.classList="legendline";
        container.appendChild(lineDiv);
        var titleDiv = document.createElement('div');
        titleDiv.innerHTML = title;
        var img = document.createElement('img');
        img.src = "resources/images/"+image+"16.png";
        lineDiv.appendChild(img);
        lineDiv.appendChild(titleDiv);
    }
    
    showLegend(){
        if(this.legendDiv){
            $(".outcomelegend").toggle();
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
        return (this.wf.columns[this.wf.getColIndex(node.column)].outcomeVisibility);
    }
    
    getNodeCategories(){
        var list;
        switch(this.sortType){
            case "icon":
                list = iconsList['assessment'].slice(0);
                break;
            case "week":
                list=[];
                for(var i=0;i<this.wf.weeks.length;i++){
                    var name = this.wf.weeks[i].name;
                    if(!name)name=this.wf.weeks[i].getDefaultName();
                    list.push({text:name,value:this.wf.weeks[i]});
                }
                break;
            case "column":
                list=[];
                for(var i=0;i<this.wf.columns.length;i++){
                    var name = this.wf.columns[i].text;
                    list.push({text:name,value:this.wf.columns[i].name});
                }
                break;
                
        }
        return list;
    }
    
    insertCategory(cv,index=-1){
        var lastcv;
        if(index<0) lastcv = this.categoryViews[this.categoryViews.length-1];
        else lastcv = this.categoryViews[index];
        cv.createVertex();
        this.table.insertBefore(cv.vertex,lastcv.vertex);
        this.categoryViews.splice(this.categoryViews.indexOf(lastcv),0,cv);
        cv.nodeViews[0].insertSelf(lastcv.nodeViews[0]);
        cv.nodeViews.push(new OutcomeNodeview([],true,cv));
        cv.nodeViews[1].insertSelf(lastcv.nodeViews[0]);
        cv.createTableHead(lastcv.tablehead.parentElement,lastcv.tablehead);
        
    }
    
    removeCategory(cv){
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
        category="none";
        //second pass in case we just had an invalid icon
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
        for(var i=0;i<this.categoryViews.length;i++){
            var cv = this.categoryViews[i];
            if(cv.value==this.getCategoryFromNode(node)||(cv.value=="none"&&this.getCategoryFromNode(node)==null)){
                this.grandTotal.nodes.push(node);
                var nv = new OutcomeNodeview([node],false,cv);
                node.view = nv;
                cv.nodeAdded(node,nv.getCategoryPlacement());
                break;
            }
        }
        this.updateTable();
    }
    
    getCategoryFromNode(node){
        switch(this.sortType){
            case "icon":
                return node.lefticon;
            case "week":
                return node.week;
            case "column":
                return node.column;
        }
    }
    
    populateTagBar(){
        this.populateTagSelect(this.wf.project.workflows["outcome"],this.wf.getTagDepth());
    }
    
    nodeMovedTo(node1,node2,isAfter=true){
        node1.view.categoryChanged();   
    }
    
    
    tagSetsSwapped(i1,i2){
        var min = Math.min(i1,i2);
        var max = Math.max(i1,i2);
        var tags1 =[];
        var tags2 =[];
        tags1 = this.wf.tagSets[min].getAllTags(tags1);
        tags2 = this.wf.tagSets[max].getAllTags(tags2);
        var vertices1 = [];
        var vertices2 = [];
        for(var i = 0;i<tags1.length;i++)vertices1.push(tags1[i].view.vertex);
        for(var i = 0;i<tags2.length;i++)vertices2.push(tags2[i].view.vertex);
        for(var i = 0;i<vertices2.length;i++)vertices2[i].parentElement.insertBefore(vertices2[i],vertices1[0]);
        var nextEl = this.wf.tagSets[min+1].view.vertex;
        for(var i = 0;i<vertices1.length;i++)vertices1[i].parentElement.insertBefore(vertices1[i],nextEl);
        
        
    }
    
    tagSetAdded(tag){
        var allTags = [];
        allTags = tag.getAllTags(allTags);
        for(i=0;i<allTags.length;i++){
            if(allTags[i].view)this.tagSetRemoved(allTags[i]);
            allTags[i].view = new OutcomeTagview(allTags[i],this.wf);
            this.tagViews.push(allTags[i].view);
        }
        //Create all the rows
        for(var i=0;i<allTags.length;i++){
            var cellRow=[];
            allTags[i].view.createVertex(this.tbody);
            for(var j=0;j<this.categoryViews.length;j++){
                for(var k=0;k<this.categoryViews[j].nodeViews.length;k++){
                    var nv = this.categoryViews[j].nodeViews[k];
                    var tc = new OutcomeTableCell(allTags[i],nv);
                    tc.createVertex(allTags[i].view.vertex);
                    cellRow.push(tc);
                }
            }
            allTags[i].view.cellRow = cellRow;
            this.tableCells.push(cellRow);
        }
        
        
        this.updateTable();
    }
    
    tagSetRemoved(tag){
        var allTags = [];
        if(tag.view){
            allTags = tag.getAllTags(allTags);
            for(var i=0;i<allTags.length;i++){
                var cellRow = allTags[i].view.cellRow;
                this.tableCells.splice(this.tableCells.indexOf(cellRow),1);
                allTags[i].view.vertex.parentElement.removeChild(allTags[i].view.vertex);
                var tv = allTags[i].view;
                this.tagViews.splice(this.tagViews.indexOf(tv),1);
            }
            tag.view.clearViews();
        }
        this.populateTagBar();
    }

    generateToolbars(){
        var toolbar = this.toolbar;
        if(this.wf.project.readOnly)toolbar.container.style.display="none";
        else toolbar.container.style.display="inline";
       
        this.generateNodeBar();
        this.generateTagBar();
        this.generateDisplayBar();
        this.generateSortBar();
        this.toolbar.show();
        this.toolbar.toggleShow();
        this.toolbar.toggled=true;
        
    }
    
    generateNodeBar(){
        this.nodeBarDiv = this.toolbar.addBlock(LANGUAGE_TEXT.workflowview.nodeheader[USER_LANGUAGE],null,"nodebarh3");
        this.populateNodeBar();
    }
    
    populateNodeBar(){
        if(this.nodeBarDiv==null)return;
        this.nodeBarDiv.innerHTML = "";
        var wf = this.wf;
    
        var allColumns = this.wf.getPossibleColumns();
        for(var i=0;i<allColumns.length;i++){
            var button = this.createDropButton(this.nodeBarDiv,allColumns[i].nodetext,'resources/data/'+allColumns[i].image+'24.png');
            button.style.borderColor=allColumns[i].colour;
            button.style.borderWidth='3px';
            button.id = 'NEW-'+allColumns[i].name;
            button.ondragstart = function(evt){
                evt.dataTransfer.setData("text",this.id);
            }
            button.ondragend = function(evt){
                this.nodeBeingDropped=null;
                if(wf.view.nodeBarDiv)wf.view.populateNodeBar();
                if(wf.view.displayBar)wf.view.populateDisplayBar();
            }
            
        }
    }
    
    createDropButton(container,name,image){
        var button = document.createElement('button');
        var img = document.createElement('img');
        var namediv = document.createElement('div');
        img.src = image;
        namediv.innerHTML = name;
        button.appendChild(img);
        button.appendChild(namediv);
        container.appendChild(button);
        img.draggable=false;
        button.draggable=true;
        
        return button;
    }
    

    generateTagBar(){
        if(this.wf.getTagDepth()<0)return;
        
        var wf = this.wf;
        var p=wf.project;
        
        var tagBarDiv = this.toolbar.addBlock(LANGUAGE_TEXT.workflowview.outcomesheader[USER_LANGUAGE],null);
        
        var compSelect = document.createElement('select');
        this.tagSelect=compSelect;
        this.populateTagSelect(p.workflows["outcome"],this.wf.getTagDepth());
        
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
        
        
        tagBarDiv.parentElement.appendChild(compSelect);
        tagBarDiv.parentElement.appendChild(addButton);
        
    }
    
    generateDisplayBar(){
        
        this.displayBar = this.toolbar.addBlock(LANGUAGE_TEXT.outcomeview.displayheader[USER_LANGUAGE]);       
        this.populateDisplayBar();
        
    }
    
    populateDisplayBar(){
        var wf = this.wf;
        this.displayBar.innerHTML=null;
        for(var i=0;i<wf.columns.length;i++){
            var col = wf.columns[i];
            col.view = new OutcomeColumnview(col);
            col.view.createVertex(this.displayBar);
        }
    }
    
    generateSortBar(){
        var wf = this.wf;
        
        var sortDiv = this.toolbar.addBlock(LANGUAGE_TEXT.outcomeview.sortbyheader[USER_LANGUAGE]);
        
        
        
        for(var prop in LANGUAGE_TEXT.outcomeview.sortradio){
            if(this instanceof ProgramOutcomeview&&prop=="icon")continue;
            sortDiv.appendChild(this.createSortRadio(prop));
        }
    }
    
    createSortRadio(type){
        var wfv = this;
        var sortradio = document.createElement("input");
        sortradio.type="radio";
        sortradio.name="sortradiobuttons";
        sortradio.value=type;
        sortradio.className="outcomesortradio";
        if(this.sortType == type)sortradio.checked=true;
        sortradio.onchange = function(){
            wfv.setSortType(type);
        }
        var text = document.createElement("div");
        text.innerHTML = LANGUAGE_TEXT.outcomeview.sortradio[type][USER_LANGUAGE];
        text.className="outcomesorttext";
        var line = document.createElement("div");
        line.appendChild(sortradio);
        line.appendChild(text);
        line.className="outcomesortline";
        return line;
        
    }
    
    setSortType(type){
        if(type==this.getDefaultSortType())this.wf.outcomeSortType=null;
        else this.wf.outcomeSortType = type;
        this.makeInactive();
        this.sortType=type;
        this.makeActive();
    }
    
    columnAdded(col){
        col.outcomeVisibility=true;
        if(this.sortType=="column"){
            var newcat = new OutcomeCategoryview({text:col.text,value:col.name},this.wf);
            this.insertCategory(newcat);
        }
        
    }
    
    weekAdded(week){
        if(this.sortType=="week"){
            var name = week.name;
            if(!name)name=week.getDefaultName();
            var newcat = new OutcomeCategoryview({text:name,value:week},this.wf);
            this.insertCategory(newcat,week.index);
            for(var i=0;i<week.nodes.length;i++)this.wf.view.nodeAdded(week.nodes[i]);
            for(var i=0;i<this.categoryViews.length-1;i++)this.categoryViews[i].nameChanged();
        }
        
    }
    
    columnRemoved(col){
        for(var i=0;i<this.categoryViews.length;i++){
            if(this.categoryViews[i].value==col.name){
                this.removeCategory(this.categoryViews[i]);
                break;
            }
        }
    }
    
    weekIndexUpdated(week){
    }
    
    weekDeleted(){
        this.makeInactive();
        this.makeActive();
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
            opt.innerHTML = "&nbsp;".repeat(allTags[i].depth*4)+allTags[i].getNameType()[0]+" - "+allTags[i].name;
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
    
    getDefaultSortType(){return "icon";}
    
    populateMenu(menu){
        var ocv = this;
        menu.addItem(LANGUAGE_TEXT.workflowview.edittitle[USER_LANGUAGE],'resources/images/text24.png',function(){
            ocv.titleInput.readOnly=false;
            ocv.titleInput.select();
        });
        menu.addItem(LANGUAGE_TEXT.workflowview.editauthor[USER_LANGUAGE],'resources/images/text24.png',function(){
            ocv.authorInput.readOnly=false;
            ocv.authorInput.select();
        });
        menu.addItem(LANGUAGE_TEXT.workflowview.editdescription[USER_LANGUAGE],'resources/images/text24.png',function(){
            ocv.descriptionNode.edit();
        });
        var layout = this.wf;
        
        layout.populateMenu(menu);
        
    }
    
    toCSV(){
        var table = this.table;
        var items = table.childNodes;
        var rows = [];
        //Find all the rows
        for(var i=0;i<items.length;i++){
            if(items.item(i).nodeName=="TBODY"){
                var bodyitems = items.item(i).childNodes;
                for(var j=0;j<bodyitems.length;j++){
                    if(bodyitems.item(j).nodeName=="TR")rows.push(bodyitems.item(j));
                }
            }
        }
        var csv = "\""+this.wf.name+"\"";
        for(var i=0;i<this.categoryViews.length;i++){
            csv+=",,\""+this.categoryViews[i].name+"\"";
            csv+=(",").repeat(this.categoryViews[i].nodeViews.length-2);
        }
        csv+="\n"
        for(var i=0;i<this.categoryViews.length;i++){
            for(var j=0;j<this.categoryViews[i].nodeViews.length;j++){
                csv+=",\""+this.categoryViews[i].nodeViews[j].namediv.innerHTML+"\""
            }
        }
        csv+="\n";
        for(var i=0;i<rows.length;i++){
            var cells = rows[i].childNodes;
            for(var j=0;j<cells.length;j++){
                var cell = cells.item(j);
                if(j>0)csv+=",";
                if(cell.classList.contains("tagcell")){
                    csv+="\""+$(cell).children(".tagtext")[0].innerHTML+"\"";
                }else if(cell.csvtext)csv+=cell.csvtext;
            }
            csv+="\n";
            
        }
        return csv;
        
    }
    
}

class OutcomeCategoryview{
    constructor(data,wf){
        this.colgroup;
        this.wf=wf;
        this.tablehead;
        this.vertex;
        this.name;
        this.headerwrap;
        if(data.text.en)this.name = data.text[USER_LANGUAGE];
        else this.name = data.text;
        this.value = data.value;
        this.nodeViews = [new OutcomeNodeview([],false,this)];
        this.expandIcon=document.createElement('img');
    }
    
    createVertex(parent){
        this.vertex = document.createElement('colgroup');
        this.vertex.classList.add('expanded');
        return this.vertex;
    }
    
    createTableHead(parent,createBefore=null){
        var cv = this;
        var catHead = document.createElement('th');
        var wrapper = document.createElement('textarea');
        wrapper.classList.add("categoryhead");
        catHead.setAttribute("colspan",this.nodeViews.length);
        wrapper.value = this.name.replace(/\//g,"\/<wbr>");
        catHead.appendChild(wrapper);
        parent.insertBefore(catHead,createBefore);
        if(cv.wf.view.sortType=="week")wrapper.onchange = function(){cv.value.setNameSilent(wrapper.value);}
        else if(cv.wf.view.sortType=="column")wrapper.onchange = function(){cv.wf.columns[cv.wf.getColIndex(cv.value)].setTextSilent(wrapper.value);}
        else wrapper.readOnly=true;
        this.headerwrap = wrapper;
        catHead.contextItem = this;
        
        
        if(this.value!="grandtotal"){
            var newChildDiv = document.createElement('div');
            newChildDiv.classList.add("createlayoutdiv");
            newChildDiv.innerHTML = "+"+LANGUAGE_TEXT.outcomeview.addnode[USER_LANGUAGE];
            newChildDiv.onclick = function(){
                cv.addNode();
            }
            catHead.appendChild(newChildDiv);
        }
        wrapper.readOnly = true;

        this.tablehead = catHead;
        catHead.cv = this;
        
        if(this.value!="grandtotal"&&(this.wf.view.sortType=="week"||this.wf.view.sortType=="column")){
            var movehandle = document.createElement('div');
            var moveimg = document.createElement('img');
            moveimg.src = 'resources/images/movehandle24.png';
            movehandle.appendChild(moveimg);
            catHead.appendChild(movehandle);
            moveimg.draggable=false;
            movehandle.className="movehandle";
            movehandle.onmousedown = function(evt){
                if(evt.buttons>1)return;
                catHead.draggable=true;
                catHead.classList.add("dragging");
            }
            movehandle.onmouseup = function(){
                catHead.draggable=false;
                catHead.classList.remove("dragging");
            }
            
            wrapper.addEventListener("focusout",function(){wrapper.readOnly=true;});
            wrapper.ondblclick = function(){wrapper.readOnly=false;wrapper.select();}
        }
        
        catHead.draggable=false;
        catHead.ondragstart = function(evt){
            var id = 'drag-'+Date.now();
            catHead.id=id;
            evt.dataTransfer.setData("text",id);
            evt.stopPropagation();
        }
        catHead.ondragover = function(evt){
            evt.stopPropagation();
            var source = document.getElementById(evt.dataTransfer.getData("text"));
            if(source==null||source.cv==null)return;
            evt.preventDefault();
            var sourcecv = source.cv;
            if(sourcecv == cv)return;
            var currentTime = Date.now();
            if(sourcecv.lastDragged!=null&&(sourcecv.nextNewDrop>currentTime||(sourcecv.lastDragged==catHead&&sourcecv.nextSameDrop>currentTime)))return;
            sourcecv.lastDragged=catHead;
            sourcecv.nextNewDrop = currentTime+300;
            sourcecv.nextSameDrop = currentTime+500;
            sourcecv.attemptToDrop(cv);
        }
        
        catHead.ondrop = function(evt){
            evt.preventDefault();
        }
        catHead.ondragend = function(evt){
            catHead.draggable=false;
            catHead.classList.remove('dragging');
        }
        
        
        
        
    }
    
    nameChanged(){
        if(this.wf.view.sortType=='week'){
            var name = this.value.name;
            if(!name)name=this.value.getDefaultName();
            this.headerwrap.value = name.replace(/\//g,"\/<wbr>");
        }
    }
    
    addNode(col){
        var wf = this.wf;
        var week;
        if(wf.view==null)return;
        if(wf.view.sortType=="week")week = this.value;
        else week = wf.weeks[wf.weeks.length-1];
        var column;
        if(col!=null&&wf.getColIndex(col)>=0)column=col;
        else if(wf.view.sortType=="column")column = this.value;
        else if(wf.getColIndex("SA")>=0)column = "SA";
        else column=wf.columns[0].name;
        var icon;
        if(wf.view.sortType=="icon"&&this.value!="none")icon = this.value;
        if(week){
            var node = new ACNode(wf);
            node.setColumn(column);
            if(icon)node.setLeftIcon(icon);
            node.week=week;
            week.addNode(node);
            wf.view.nodeAdded(node);
            return node;
        }
    }
    
    //The node, the overall index at which we want to place it, and the nodeview which comes directly after it - the totals column by default
    nodeAdded(node,lastnv){
        var cv = this;
        var nv = node.view;
        if(!lastnv)lastnv = cv.nodeViews[cv.nodeViews.length-1];
        cv.nodeViews[cv.nodeViews.length-1].nodes.push(node);
        cv.nodeViews.splice(cv.nodeViews.indexOf(lastnv),0,nv);
        
        
        this.tablehead.setAttribute("colspan",int(this.tablehead.getAttribute("colspan"))+1);
        this.expandIcon.classList.add("haschildren");
        
        nv.insertSelf(lastnv);
        this.expand();
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
            this.expandIcon.classList.remove("haschildren");
            if(this.value=="none")this.wf.view.removeCategory(this);
        }
        
        
    }
    
    expand(){
        if(this.wf.view.sortType=="week"&&this.value!="grandtotal")this.value.collapsed=false;
        this.vertex.classList.add("expanded");
        for(var i=1;i<this.nodeViews.length-1;i++){
            this.nodeViews[i].vertex.classList.remove("hidden");
            this.nodeViews[i].textdiv.classList.remove("hidden");
        }
        this.expandIcon.src="resources/images/arrowdown16.png";
    }
    
    collapse(){
        if(this.wf.view.sortType=="week"&&this.value!="grandtotal")this.value.collapsed=true;
        this.vertex.classList.remove("expanded");
        for(var i=1;i<this.nodeViews.length-1;i++){
            this.nodeViews[i].vertex.classList.add("hidden");
            this.nodeViews[i].textdiv.classList.add("hidden");
        }
        this.expandIcon.src="resources/images/arrowright16.png";
    }
    
    populateMenu(menu){
        var cv = this;
        var item = this.getItem();
        if(item==null)item=this.wf.view;
        else{
            menu.addItem(LANGUAGE_TEXT.column.modifytext[USER_LANGUAGE], 'resources/images/text24.png', function(){
                    cv.headerwrap.readOnly=false;
                    cv.headerwrap.select();
            });
        }
        item.populateMenu(menu);
    }
    
    getItem(){
        var wf = this.wf;
        var sortType = wf.view.sortType;
        if(sortType=="week")return this.value;
        else if(sortType=="column")return wf.columns[wf.getColIndex(this.value)];
        else return null;
    }
    
    attemptToDrop(target){
        
        this.moveTo(target);
        
    }
    
    moveTo(target){
        var cvs = this.wf.view.categoryViews;
        var isAfter=false;
        var myindex = cvs.indexOf(this);
        var tableindex = 0;
        for(var i=0;i<cvs.length;i++){
            if(cvs[i]==this)break;
            else tableindex=tableindex+cvs[i].nodeViews.length;
        }
        var targetindex = cvs.indexOf(target);
        if(target.value!="grandtotal"&&targetindex>myindex)isAfter=true;
        var lastcv;
        if(isAfter)lastcv = cvs[targetindex+1];
        else lastcv = target;
        this.insertSelf(lastcv);
        cvs.splice(myindex,1);
        cvs.splice(cvs.indexOf(lastcv),0,this);
        var lastnv = lastcv.nodeViews[0];
        for(var i=0;i<this.nodeViews.length;i++){
            var nv = this.nodeViews[i];
            nv.tablehead.parentElement.insertBefore(nv.tablehead,lastnv.tablehead);
        }
        
        var newtableindex = 0;
        for(var i=0;i<cvs.length;i++){
            if(cvs[i]==this)break;
            else newtableindex=newtableindex+cvs[i].nodeViews.length;
        }
        var cutlength = this.nodeViews.length;
        //if(tableindex<newtableindex)newtableindex-=cutlength;
        
        var tableCells = this.wf.view.tableCells;
        for(var i=0;i<tableCells.length;i++){
            
            var cut = tableCells[i].splice(tableindex,cutlength);
            var nextCell = tableCells[i][newtableindex];
            for(var j=0;j<cut.length;j++){
                tableCells[i].splice(newtableindex+j,0,cut[j]);
                cut[j].vertex.parentElement.insertBefore(cut[j].vertex,nextCell.vertex);
            }
        }
        
        var sortType = this.wf.view.sortType;
        var sortarray;
        if(sortType=="column")sortarray = this.wf.columns;
        else if(sortType=="week")sortarray = this.wf.weeks;
        else return;
        var myitem = this.getItem();
        var targetitem = target.getItem();
        sortarray.splice(sortarray.indexOf(myitem),1);
        if(targetitem=="grandtotal")sortarray.push(myitem);
        else sortarray.splice(sortarray.indexOf(targetitem)+isAfter,0,myitem);
        if(sortType=="week"){
            this.wf.updateWeekIndices();
            for(var i=0;i<cvs.length-1;i++)cvs[i].nameChanged();
            this.wf.makeUndo("Week Moved",myitem);
        }else if(sortType=="column"){
            this.wf.view.populateDisplayBar();
            this.wf.makeUndo("Column Moved",myitem);
        }
        
    }
    
    insertSelf(lastcv){
        var lastvertex;
        var lasthead;
        if(lastcv!=null){
            lastvertex = lastcv.vertex;
            lasthead = lastcv.tablehead;
        }
        this.vertex.parentElement.insertBefore(this.vertex,lastvertex);
        this.tablehead.parentElement.insertBefore(this.tablehead,lasthead);
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
        if(this.nodes[0].wf.view)this.nodes[0].wf.view.updateTable();
    }
    
    createVertex(parent,createBefore=null){
        var nv = this;
        this.vertex = document.createElement('col');
        parent.insertBefore(this.vertex,createBefore);
    }
    
    timeUpdated(){}
    
    
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
        this.textdiv.onclick = function(evt){$(".selected").removeClass("selected");nv.openEditBar(evt);}
        this.namediv.classList.add("outcometableheadertext");
        this.textdiv.appendChild(this.namediv);
        if(this.isTotal){
            var cv = this.cv;
            var catVertex = cv.vertex;
            this.namediv.innerHTML = LANGUAGE_TEXT.outcomeview.total[USER_LANGUAGE];
            this.tablehead.classList.add("totalcell");
            
            var expandDiv = document.createElement('div');
            expandDiv.className="expanddiv";
            if(cv.nodeViews.length>2)cv.expandIcon.classList.add('haschildren');
            cv.expandIcon.src="resources/images/arrowdown16.png";
            cv.expandIcon.style.width='16px';
            cv.expandIcon.onclick=function(evt){
                if(catVertex.classList.contains("expanded")){cv.collapse();}
                else {cv.expand();}
                evt.stopPropagation();
            }
            expandDiv.appendChild(cv.expandIcon);
            this.textdiv.onclick = function(){cv.expandIcon.click();}
            this.textdiv.appendChild(expandDiv);

        }
        else if(this.nodes.length==0){this.namediv.innerHTML = "";this.tablehead.classList.add("emptycell");}
        else {
            this.nameUpdated();
            var renameDiv = document.createElement('div');
            renameDiv.className = "deletelayoutdiv";
            var deleteIcon = document.createElement('img');
            deleteIcon.src = "resources/images/delrect16.png";
            deleteIcon.style.width='16px';
            deleteIcon.onclick = function(evt){
                nv.deleteClick();
                evt.stopPropagation();
            }
            renameDiv.append(deleteIcon);
            this.textdiv.appendChild(renameDiv);
            this.textdiv.contextItem = this;
            this.textdiv.node = this.nodes[0];
            
            if(!this.cv.wf.project.readOnly)this.namediv.draggable="true";
            
            this.namediv.style.cursor="move";
            
            this.namediv.ondragstart = function(evt){
                var id = 'nodedrag-'+Date.now();
                nv.textdiv.id = id;
                evt.dataTransfer.setData("text",id);
            }
            
            
            this.textdiv.ondblclick = function(evt){nv.nodes[0].openLinkedWF();}
            
            
            
        }
        parent.insertBefore(this.tablehead,createBefore);
        
        if(this.cv.value!="grandtotal"&&(this.isTotal||this.nodes.length>0))this.textdiv.ondragover = function(evt){
            var node;
            var data = evt.dataTransfer.getData("text");
            if(data.substr(0,3)=="NEW"){
                var source = document.getElementById(data);
                if(source.nodeBeingDropped){
                    node = source.nodeBeingDropped;
                    if(nv.cv.wf.view.sortType=="column"&&nv.cv.value!=node.column)return;
                }
                else {
                    node = nv.cv.addNode(evt.dataTransfer.getData("text").substr(4));
                    source.nodeBeingDropped = node;
                    return;
                }
            }
            else {
                var source = document.getElementById(data);
                node = source.node;
            }
            if(node==null)return;
            evt.preventDefault();
            if(node.view){
                var snv = node.view;
                var target = nv;
                //throttle the function. We want it to be droppable with another node in 300 ms, and droppable with the same node in 0.5s.
                var currentTime = Date.now();
                if(snv.lastDragged!=null&&(snv.nextNewDrop>currentTime||(snv.lastDragged==target&&snv.nextSameDrop>currentTime)))return;
                snv.lastDragged=target;
                snv.nextNewDrop = currentTime+300;
                snv.nextSameDrop = currentTime+500;
                node.view.attemptToDrop(nv);
            }
        }
        this.textdiv.ondrop = function(evt){
            evt.preventDefault();
        }
        this.styleForColumn();
    }
    
    styleForColumn(){
        if(this.nodes.length>0&&!this.isTotal){
            this.textdiv.firstChild.style.background = this.nodes[0].getColumnStyle();
            this.textdiv.firstChild.style.border="1px solid black";
            this.textdiv.firstChild.style.color="white";
        }
    }
    
    startTitleEdit(){
        this.openEditBar();
    }
    
    attemptToDrop(target){
        var wf = this.nodes[0].wf;
        var sort = wf.view.sortType;
        //If we're looking at the same nodeview this is invalid
        if(this==target)return;
        //For the icon and column sort methods, we don't move nodes individually, we just change their category
        if(sort=="icon"||sort=="column"){
            //if categories are already the same, no need to change anything
            if(this.cv==target.cv)return;
            if(sort=="icon"){
                this.nodes[0].setLeftIcon(target.cv.value);
                wf.makeUndo("Icon Changed",node);
                return;
            }
            if(sort=="column"){
                this.nodes[0].setColumn(target.cv.value);
                wf.makeUndo("Node Moved",node);
                return;
            }
        }
        if(sort=="week"){
            var node = this.nodes[0];
            var week = node.week;
            var node2;
            if(!target.isTotal&&target.nodes.length==1)node2=target.nodes[0];
            
            if(node2){
                var isAfter=false;
                if(week.nodesByColumn==null&&week.nodes.indexOf(node2)==week.nodes.indexOf(node)+1)isAfter=true;
                else if(week.nodesByColumn!=null){
                    if(node.column==node2.column){
                        if(week.nodesByColumn[node.column].indexOf(node2)==week.nodesByColumn[node.column].indexOf(node)+1)isAfter=true;
                    }else{
                        if(week.nodesByColumn[node.column].indexOf(node)==week.nodesByColumn[node.column].length-1&&wf.getColIndex(node2.column)>wf.getColIndex(node.column))return;
                    }
                }
                wf.moveNodeTo(node,node2,isAfter);
            }else {
                var week2 = target.cv.value;
                week.removeNode(node);
                node.week=week2;
                week2.addNode(node);
                this.categoryChanged();
            }
        }
        
    }
    
    openEditBar(evt){
        if(!this.isTotal&&this.nodes.length==1){
            var node = this.nodes[0];
            var eb = node.wf.view.editbar;
            var td = this.textdiv;
            td.classList.add("selected");
            eb.enable(node);
            if(evt)evt.stopPropagation();
            var listenerDestroyer = function(){document.removeEventListener("click",outsideClick);}
            var outsideClick = function(evt2){if(eb&&!eb.container.parentElement.contains(evt2.target)){eb.disable();if(td)td.classList.remove("selected");listenerDestroyer();}else if(!eb)listenerDestroyer();}
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
        },{once:true});
    }
    
    
    nameUpdated(){
        if(this.nodes[0].name)this.namediv.innerHTML = this.nodes[0].name;
        else this.namediv.innerHTML = LANGUAGE_TEXT.node.defaulttext[USER_LANGUAGE];
    }
    
    leftIconUpdated(){this.categoryChanged();}
    rightIconUpdated(){}
    columnUpdated(){this.categoryChanged();this.styleForColumn();}
    textUpdated(){}
    linkedWFUpdated(){}
    
    categoryChanged(){
        var index = this.getOverallIndex();
        var node = this.nodes[0];
        this.cv.nodeRemoved(node,index);
        var cv = node.wf.view.getCategoryForNode(node);
        this.cv = cv;
        var lastnv = this.getCategoryPlacement();
        
        if(!lastnv)return;
        cv.nodeAdded(node,lastnv);
        cv.wf.view.updateTable();
    }
    
    getCategoryPlacement(){
        var cv = this.cv;
        var lastnv;
        var node = this.nodes[0];
        var weeks = node.wf.weeks;
        var weekindex = weeks.indexOf(node.week);
        for(var i=0;i<cv.nodeViews.length;i++){
            lastnv = cv.nodeViews[i];
            if(lastnv.nodes.length==0)continue;
            if(lastnv.isTotal)break;
            var lastweekindex = weeks.indexOf(lastnv.nodes[0].week);
            if(lastweekindex>weekindex)break;
            if(lastweekindex==weekindex){
                if(node.week.nodesByColumn!=null){
                    if(node.wf.getColIndex(lastnv.nodes[0].column)>node.wf.getColIndex(node.column))break;
                    else if(weeks[weekindex].nodesByColumn[node.column].indexOf(lastnv.nodes[0])>weeks[weekindex].nodesByColumn[node.column].indexOf(node))break;
                }else if(weeks[weekindex].nodes.indexOf(lastnv.nodes[0])>weeks[weekindex].nodes.indexOf(node))break;
            }
            
        }
        return lastnv;
    }
    
    categoryChangedProgram(){
        var index = this.getOverallIndex();
        var node = this.nodes[0];
        this.cv.nodeRemoved(node,index);
        var cv = node.wf.view.getCategoryForNode(node);
        this.cv = cv;
        var lastnv;
        var week = node.week;
        var cols = [];
        for(var i=0;i<node.wf.columns.length;i++)cols.push(node.wf.columns[i].name);
        var colindex = cols.indexOf(node.column);
        for(var i=0;i<cv.nodeViews.length;i++){
            lastnv = cv.nodeViews[i];
            if(lastnv.nodes.length==0)continue;
            if(lastnv.isTotal)break;
            var lastcolindex = cols.indexOf(lastnv.nodes[0].column);
            if(lastcolindex>colindex)break;
            if(lastcolindex==colindex){
                var nodes = week.nodesByColumn[node.column];
                if(!nodes)continue;
                if(nodes.indexOf(lastnv.nodes[0])>nodes.indexOf(node))break;
            }
            
            
        }
        if(!lastnv)return;
        cv.nodeAdded(node,lastnv);
        cv.wf.view.updateTable();
    }
    
    deleted(){
        var node = this.nodes[0];
        var grandTotal = node.wf.view.grandTotal;
        var placement = this.getOverallIndex();
        if(placement>-1)this.cv.nodeRemoved(node,placement);
        grandTotal.nodes.splice(grandTotal.nodes.indexOf(node),1);
        this.cv.wf.view.editbar.disable();
        node.wf.view.updateTable();
        
    }
    
    insertBelow(node){
        node.wf.view.nodeAdded(node);
    }
    
    
    getOverallIndex(){
        var categoryViews = this.cv.wf.view.categoryViews;
        var index = 1;
        for(var i=0;i<categoryViews.length;i++){
            var cv = categoryViews[i];
            if(cv==this.cv){
                index+=cv.nodeViews.indexOf(this);
                return index;
            }else{
                index+=cv.nodeViews.length;
            }
        }
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
    
    populateMenu(menu){
        var node = this.nodes[0];
        node.populateMenu(menu);
    }
    
}



class OutcomeTagview{
    constructor(tag,wf){
        this.tag=tag;
        this.wf = wf;
        this.vertex;
        this.cellrow;
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
        if(wf.tagSets.indexOf(this.tag)>=0)vertex.classList.add("toplevel")
        if(this.tag)vertex.classList.add("depth"+this.tag.depth);
        parent.appendChild(vertex);
        var img = document.createElement('img');
        if(this.tag)img.src = "resources/data/"+this.tag.getIcon()+"24.png";
        this.nameCell = document.createElement('div');
        this.nameCell.classList.add("tagtext");
        var cell = document.createElement('td');
        cell.classList.add("tagcell");
        cell.appendChild(img);
        cell.appendChild(this.nameCell);
        this.updateName()
        vertex.appendChild(cell);
        vertex.tagView = this;
        
        var expandDiv = document.createElement('div');
        expandDiv.className="expanddiv";
        this.expandIcon.src="resources/images/arrowdown16.png";
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
        
        var vertex = this.vertex;
        vertex.ondragover = function(evt){
            var source = document.getElementById(evt.dataTransfer.getData("text"));
            if(source==null)return;
            //throttle function
            if(int(source.id.substr(5))+1000>Date.now())return;
            var stv = source.tagView;
            evt.stopPropagation();
            if(stv==null)return;
            var target = vertex.tagView;
            if(target==null||target.tag==null)return;
            evt.preventDefault();
            if(target.tag.depth<stv.tag.depth||target.tag.getParentWithDepth(stv.tag.depth)!=stv.tag){
                //throttle the function. We want it to be droppable with another tag in 300 ms, and droppable with the same tag in 0.5s.
                var currentTime = Date.now();
                if(stv.lastDragged!=null&&(stv.nextNewDrop>currentTime||(stv.lastDragged==target&&stv.nextSameDrop>currentTime)))return;
                stv.lastDragged=target;
                stv.nextNewDrop = currentTime+300;
                stv.nextSameDrop = currentTime+500;
                stv.attemptToDrop(target);
            }
        }
        
        vertex.ondrop = function(evt){
            evt.preventDefault();
        }
        vertex.ondragend = function(evt){
            vertex.draggable=false;
            var allTags=[];
            allTags = vertex.tagView.tag.getAllTags(allTags);
            for(var i=0;i<allTags.length;i++){
                if(allTags[i].view&&allTags[i].view.vertex)allTags[i].view.vertex.classList.remove("dragging");
            }
        }
        
        if(wf.tagSets.indexOf(this.tag)>=0){
            vertex.draggable=false;
            vertex.ondragstart = function(evt){
                var id = 'drag-'+Date.now();
                vertex.id=id;
                evt.dataTransfer.setData("text",id);
                evt.stopPropagation();
                var allTags=[];
                allTags = vertex.tagView.tag.getAllTags(allTags);
                for(var i=0;i<allTags.length;i++){
                    if(allTags[i].view&&allTags[i].view.vertex)allTags[i].view.vertex.classList.add("dragging");
                }
            }
            
            
            
            
            
            var movehandle = document.createElement('div');
            movehandle.className = "movehandle";
            var up = document.createElement('img');
            up.src = "resources/images/movehandle24.png";
            up.draggable=false;
            up.onmousedown=function(evt){
                if(evt.buttons>1)return;
                vertex.draggable=true;
            }
            up.onmouseup = function(){
                vertex.draggable=false;
            }
            movehandle.appendChild(up);
            cell.appendChild(movehandle);
        }
        
        
    }
    
    attemptToDrop(target){
        var wf = this.wf;
        while(wf.tagSets.indexOf(target.tag)<0){
            var targetTag = target.tag.parentTag;
            if(targetTag==null)return;
            target = targetTag.view;
            if(target==null)return;
        }
        this.moveTo(target);
        
    }

    moveTo(target){
        var wf = this.wf;
        var isAfter=false;
        if(wf.tagSets.indexOf(target.tag)>wf.tagSets.indexOf(this.tag))isAfter=true;
        var tagArray=[];
        tagArray = this.tag.getAllTags(tagArray);
        var tvtarget;
        if(isAfter)tvtarget = target.tag.getLastDescendant().view.vertex.nextElementSibling;
        else tvtarget = target.vertex;
        for(var i=0;i<tagArray.length;i++){
            this.vertex.parentElement.insertBefore(tagArray[i].view.vertex,tvtarget);
        }
        wf.moveChild(this.tag,target.tag,isAfter);
        wf.makeUndo("Tagset Moved",this.tag);
        
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
        if(index2!=null)this.wf.swapTagSets(index1,index2);
    }
    
    
    expand(){
        if(this.tag==null)return;
        this.tag.collapsed=false;
        this.vertex.classList.add("expanded");
        this.showTag();
        this.expandIcon.src="resources/images/arrowdown16.png";
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
        this.tag.collapsed=true;
        this.vertex.classList.remove("expanded");
        for(var i=0;i<this.tag.children.length;i++){
            if(this.tag.children[i].view)this.tag.children[i].view.hideTag();
        }
        this.expandIcon.src="resources/images/arrowright16.png";
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
        this.vertex.csvtext="";
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
                    node.addTag(tag,false,node.wf instanceof Programflow);
                    node.wf.makeUndo("Add Tag",node);
                }else{
                    node.removeTag(tag,node.wf instanceof Programflow);
                    node.wf.makeUndo("Remove Tag",node);
                }
            }
            if(tag&&tag.project.readOnly)checkbox.disabled=true;
            
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
            this.vertex.csvtext="(Y)";
        }else{
            this.checkbox.checked=false;
            if(completeness==0&&this.nodeview.isTotal&&this.nodeview==this.nodeview.cv.wf.view.grandTotal){
                this.validationImg.src = "resources/images/warningcheck16.png";
                this.vertex.csvtext="(N)";
            }else if(completeness>0){
                this.validationImg.src = "resources/images/nocheck16.png";
                this.vertex.csvtext="(P)";
            }else {
                this.validationImg.src = "";
                this.vertex.csvtext="";
            }
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
    
    
    
    createCategoryViews(){
        var nodeCategories = this.getNodeCategories();
        this.categoryViews = [];
        for(var i=0;i<nodeCategories.length;i++){
            var cgv = new ProgramOutcomeCategoryview(nodeCategories[i],this.wf);
            this.categoryViews.push(cgv);
        }
    }
    
    
    createNodeViews(){
        for(var i=0;i<this.wf.weeks.length;i++){
            for(var j=0;j<this.wf.columns.length;j++){
                var nodes = this.wf.weeks[i].nodesByColumn[this.wf.columns[j].name];
                if(!nodes)continue;
                for(var k=0;k<nodes.length;k++){
                    var node = nodes[k];
                    if(this.isValidNode(node))this.addNodeView(node);
                }
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
    
    
    
    
    
    getDefaultSortType(){return "week";}
    
}

class ProgramOutcomeCategoryview extends OutcomeCategoryview{
    
    
    addNode(col){
        var wf = this.wf;
        var week;
        if(wf.view==null)return;
        if(wf.view.sortType=="week")week = this.value;
        else week = wf.weeks[wf.weeks.length-1];
        var column;
        if(col!=null&&wf.getColIndex(col)>=0)column=col;
        else if(wf.view.sortType=="column")column = this.value;
        else column = wf.columns[0].name;
        if(week){
            var node = new CUSNode(wf);
            node.setColumn(column);
            node.week=week;
            week.addNode(node);
            wf.view.nodeAdded(node);
            wf.makeUndo("Node Added",node);
            return node;
        }
        
    }
}

class OutcomeColumnview{
    constructor(column){
        this.column = column;
        this.vertex;
    }
    
    createVertex(container){
        var column = this.column;
        var line = document.createElement("div");
        var check = document.createElement("input");
        check.type="checkbox";
        check.checked = column.outcomeVisibility;
        check.className="outcomesortradio";
        var textbox = document.createElement("div");
        textbox.innerHTML = column.text;
        textbox.className="outcomesorttext";
        line.appendChild(check);
        line.appendChild(textbox);
        line.className="outcomesortline";
        container.appendChild(line);
        
        check.onchange = function(){
            column.setVisible(check.checked);
        }
    }
    
    deleted(){
        this.column.wf.view.populateNodeBar();
        this.column.wf.view.populateDisplayBar();
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
        wf.view.populateNodeBar();
        wf.view.populateDisplayBar();
    }
    
    imageUpdated(){
        this.column.wf.view.populateNodeBar();
        this.column.wf.view.populateDisplayBar();
    }
    
    nodeTextChanged(){
        this.column.wf.view.populateNodeBar();
        this.column.wf.view.populateDisplayBar();
    }
    
    visibilityChanged(){
        this.column.wf.view.makeInactive();
        this.column.wf.view.makeActive();
    }
}