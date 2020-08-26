//The classic "workflow" flowchart view, implementing an mxGraph instance.

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


class Workflowview{
    constructor(container, wf){
        this.wf = wf;
        this.container = container;
        this.graph;
        this.tagBarDiv;
        this.nodeBarDiv;
        this.weekSelect;
        this.bracketBarDiv;
        this.tagSelect;
        this.legend;
        this.editbar;
        this.titleNode;
        this.authorNode;
        this.descriptionNode;
        this.weekWidth=0;
        this.colFloat
    }
    
    nameUpdated(){
        this.graph.getModel().setValue(this.titleNode,this.wf.name);
    }
    
    authorUpdated(){
        this.graph.getModel().setValue(this.authorNode,this.wf.author);
    }
    
    descriptionUpdated(){
        this.graph.getModel().setValue(this.descriptionNode,this.wf.description);
    }
    
    makeConnectionsFromIds(){
        for(var i=0;i<this.wf.weeks.length;i++){
            for(var j=0;j<this.wf.weeks[i].nodes.length;j++){
                var node = this.wf.weeks[i].nodes[j];
                if(node.autoLinkOut)node.autoLinkOut.redraw();
                for(var k=0;k<this.wf.weeks[i].nodes[j].fixedLinksOut.length;k++){
                    var link = this.wf.weeks[i].nodes[j].fixedLinksOut[k];
                    node.view.fixedLinkAdded(link,null);
                }
            }
        }
    }
    
    
    makeActive(){
        this.initializeGraph();
        var graph = this.graph;
        var parent = graph.getDefaultParent();
        var minimap = document.getElementById('outlineContainer');
        
        this.toolbar = new WFToolbar(this.wf.project,document.getElementById('nbContainer'),"right","nodebar");
        this.toolbar.container.classList.add("nodebar");
        
        //create views for the tags
        for(var i=0;i<this.wf.tagSets.length;i++){
            this.wf.tagSets[i].view = new Tagview(this.graph,this.wf.tagSets[i],this.wf);
        }
        
        //Add the first cells
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try{
            //Create the title boxes
            this.createTitleNode();
            this.createLegend();
            this.createAuthorNode();
            this.createDescriptionNode();
            this.createSpanner();
            this.drawGraph();
            this.createLegendVertex();
        }
        finally{
            // Updates the display
            graph.getModel().endUpdate();
        }
        
        this.generateToolbars();
        this.generateColumnFloat();
        
        
        var wfview = this;
        // Installs a popupmenu handler.
        if(!this.wf.project.readOnly)graph.popupMenuHandler.factoryMethod = function(menu, cell, evt){
            if(evt.shiftKey)return;
            return wfview.createPopupMenu(menu, cell, evt);
        };
        this.container.contextItem={dummyObject:true};
        document.body.contextItem = this.wf;
        console.log(this.wf.settings.settingsKey.validation);
        if(this.wf.settings.settingsKey.validation.value){$("#validateviewbar").removeClass("disabled");}
        $("#expand").removeClass("disabled");
        $("#collapse").removeClass("disabled");
        $("#expandviewbar").removeClass("disabled");
        $("#collapseviewbar").removeClass("disabled");
        $("#print").removeClass("disabled");
        $("#showlegend").removeClass("disabled");
        
        
    }
    
    drawGraph(){
        var columns = this.wf.columns;
        var weeks = this.wf.weeks;
        var comments = this.wf.comments;
        var brackets = this.wf.brackets;
        
        for(var i=0;i<columns.length;i++){
            columns[i].view = new Columnview(this.graph,columns[i]);
            columns[i].view.createVertex();
        }
        this.positionColumns();
        
        for(var i=0;i<weeks.length;i++){
            var week = weeks[i];
            if(week instanceof WFArea)week.view = new WFAreaview(this.graph,week);
            else if(week instanceof Term)week.view = new Termview(this.graph,week);
            else week.view = new Weekview(this.graph,week);
            var y;
            if(i==0)y=columns[0].view.vertex.b()+cellSpacing;
            else y = weeks[i-1].view.vertex.b();
            week.view.createVertex(cellSpacing,y,this.weekWidth);
            week.view.fillNodes();
        }
        this.wf.updateWeekIndices();
        for(var i=0;i<brackets.length;i++){
            brackets[i].view = new Bracketview(this.graph,brackets[i]);
            brackets[i].view.createVertex();
            brackets[i].view.updateHorizontal();
            brackets[i].view.updateVertical();
        }
        
        for(var i=0;i<comments.length;i++){
            comments[i].view = new Commentview(this.graph,comments[i]);
            comments[i].view.createVertex();
        }
        this.bringCommentsToFront();
        
        this.makeConnectionsFromIds();
        
    }
    
    makeInactive(){
        this.toolbar.container.style.display="none";
        this.descriptionNode.parentElement.removeChild(this.descriptionNode);
        this.graph.stopEditing(false);
        $(".mxPopupMenu").remove();
        this.graph.clearSelection();
        for(var i=0;i<this.wf.tagSets.length;i++){
            if(this.wf.tagSets[i].view)this.wf.tagSets[i].view.clearViews();
        }
        if(this.colFloat)this.colFloat.parentElement.parentElement.removeChild(this.colFloat.parentElement);
        if(this.graph!=null)this.graph.destroy();
        this.container.contextItem=null;
        this.container.innerHTML="";
        document.body.contextItem = this.wf.project;
        
        $("#validateviewbar").addClass("disabled");
        $("#expand").addClass("disabled");
        $("#collapse").addClass("disabled");
        $("#expandviewbar").addClass("disabled");
        $("#collapseviewbar").addClass("disabled");
        $("#print").addClass("disabled");
        $("#showlegend").addClass("disabled");
    }
    
    createTitleNode(){
        var wf = this.wf;
        var title = "["+LANGUAGE_TEXT.workflow.inserttitle[USER_LANGUAGE]+"]";
        if(wf.name&&wf.name!=wf.getDefaultName())title = wf.name;
        this.titleNode = this.graph.insertVertex(this.graph.getDefaultParent(),null,title,wfStartX,wfStartY,400,24,defaultTitleStyle);
        this.titleNode.isTitle=true;
        this.titleNode.wf=wf;
        this.titleNode.valueChanged = function(value){
            var value1 = wf.setNameSilent(value);
            if(value1!=value)wf.view.graph.getModel().setValue(wf.view.titleNode,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
            
        }
    }
    
    
    createAuthorNode(){
        var wf = this.wf;
        var title = "["+LANGUAGE_TEXT.workflow.insertauthor[USER_LANGUAGE]+"]";
        if(wf.author)title = wf.author;
        this.authorNode = this.graph.insertVertex(this.graph.getDefaultParent(),null,title,wfStartX,wfStartY+40,400,20,defaultTitleStyle+"fontSize=14;fontStyle=3;");
        this.authorNode.isTitle=true;
        this.authorNode.wf=wf;
        this.authorNode.valueChanged = function(value){
            var value1 = wf.setAuthorSilent(value);
            if(value1!=value)wf.view.graph.getModel().setValue(wf.view.authorNode,value1);
            else mxCell.prototype.valueChanged.apply(this,arguments);
            
        }
    }
    
    createDescriptionNode(){
        var wf = this.wf;
        var title = "["+LANGUAGE_TEXT.workflow.insertdescription[USER_LANGUAGE]+"]";
        if(wf.description)title = wf.description;
        this.descriptionHeaderNode = this.graph.insertVertex(this.graph.getDefaultParent(),null,LANGUAGE_TEXT.workflow.description[USER_LANGUAGE]+":",wfStartX,wfStartY+90,800,16,defaultTitleStyle+"fontSize=14;verticalAlign=top;editable=0;selectable=0;");
        this.descriptionHeaderNode.noSelect=true;
        this.descriptionNode = document.createElement('div');
        var descriptionNode = this.descriptionNode;
        var quilldiv = document.createElement('div');
        this.descriptionNode.appendChild(quilldiv);
        this.descriptionNode.style.width = "800px";
        this.descriptionNode.style.height = "80px";
        this.descriptionNode.className = "descriptionnode";
        this.descriptionNode.style.left = (wfStartX+cellSpacing+100)+"px";
        this.descriptionNode.style.top = (wfStartY+70+40)+"px";
        this.descriptionNode.style.position="absolute";
        this.container.parentElement.appendChild(this.descriptionNode);
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
        var wfv = this;
        descriptionNode.oncontextmenu = function(evt){
            mxEvent.redirectMouseEvents(descriptionNode,wfv.graph,null)
            
            evt.preventDefault();
            evt.stopPropagation();
            /*var evt2 = new evt.constructor(evt.type,evt);
            wfv.container.firstElementChild.firstElementChild.dispatchEvent(evt);*/
        }
    }
    
    nodeAddedFromXML(node){
        node.view = new Nodeview(this.graph,node);
        node.view.createVertex(0,0);
        node.view.columnUpdated();
    }
    
    bracketAddedFromXML(bracket){
        bracket.view = new Bracketview(this.graph,bracket);
        bracket.view.createVertex();
        bracket.view.updateHorizontal();
        bracket.view.updateVertical();
    }
    
    finishedAddingNodesFromXML(week,endIndex){
        week.view.pushNodesFast(endIndex);
        this.bringCommentsToFront();
    }
    
    positionColumns(){
        var columns = this.wf.columns;
        for(var i=0;i<columns.length;i++){
            //columns[i].view = new Columnview(this.graph,columns[i]);
            //columns[i].view.createVertex();
            columns[i].view.pos = wfStartX+cellSpacing+defaultCellWidth/2+i*(defaultCellWidth-2*cellSpacing);
            columns[i].view.updatePosition();
        }
        this.updateWeekWidths();
    }
    
    columnAdded(col){
        var i = this.wf.columns.length-1;
        col.view = new Columnview(this.graph,col);
        col.view.pos = wfStartX+cellSpacing+defaultCellWidth/2+i*(defaultCellWidth-2*cellSpacing);
        col.view.createVertex();
        col.view.updatePosition();
        if(this.nodeBarDiv!=null&&col.name.substr(0,3)=='CUS')this.populateNodeBar();
        this.updateWeekWidths();
    }
    
    columnRemoved(col){
        this.positionColumns();
        for(var i=0;i<this.wf.brackets.length;i++){
            var bv = this.wf.brackets[i].view;
            if(bv)bv.updateHorizontal();
        }
        
    }
    
    findNearestColumn(x){
        var dist = 99999;
        var tdist = 0;
        var name = null;
        var columns = this.wf.columns;
        for(var i=0;i<columns.length;i++){
            tdist = Math.abs(columns[i].view.pos-x);
            if(tdist<dist){
                dist=tdist;
                name = columns[i].name;
            }
        }
        if(name!=null)return name;
        else return columns[0].name;
    }
    
    getColPos(name){
        for(var i=0;i<this.wf.columns.length;i++){
            if(this.wf.columns[i].name==name)return this.wf.columns[i].view.pos;
        }
        return this.wf.columns[this.wf.columns.length-1].view.pos;
    }
    
    weekAdded(week){
        //if(week instanceof Term) week.view = new Termview(this.graph,week);
        //else week.view = new Weekview(this.graph,week);
        //week.view.createVertex(cellSpacing,0,this.weekWidth);
        //week.view.makeFlushWithAbove(this.wf.weeks.indexOf(week));
        this.populateWeekBar();
    }
    
    
    weekDeleted(){}
    
    pushWeeks(startIndex){
        var weeks = this.wf.weeks;
        //this should never start at 0, the top week should not be moved
        if(startIndex==0) {weeks[0].view.makeFlushWithAbove(0);startIndex++}
        if(startIndex>weeks.length-1)return;
        var dy=weeks[startIndex-1].view.vertex.b()-weeks[startIndex].view.vertex.y();
        for(var i=startIndex;i<weeks.length;i++){
            weeks[i].view.moveWeek(dy);
        }
    }
    
    updateWeekWidths(){
        var oldWidth= this.weekWidth;
        var weeks = this.wf.weeks;
        if(this.wf.columns.length==0)return;
        this.weekWidth=this.wf.columns[this.wf.columns.length-1].view.pos+defaultCellWidth/2+cellSpacing-wfStartX;
        for(var i = 0;i<weeks.length;i++){
            if(weeks[i].view)weeks[i].view.vertex.resize(this.graph,this.weekWidth-oldWidth,0);
        }
        //if(weeks[0].view)this.graph.moveCells([this.authorNode],weeks[0].view.vertex.r()-this.authorNode.r());
        for(var i=0;i<this.wf.brackets.length;i++){
            if(this.wf.brackets[i].view)this.wf.brackets[i].view.updateHorizontal();
        }
        this.spanner.resize(this.graph,this.weekWidth-oldWidth,0);
        //this.graph.moveCells([this.spanner],2*cellSpacing+this.weekWidth-this.spanner.x(),0);
    }
    
    weekIndexUpdated(week){ 
        if(week.collapsed){
            this.graph.setCellStyles("fontColor","#777777;",[week.view.vertex]);
            this.graph.setCellStyles("fillColor","#bbbbbb;",[week.view.vertex]);
        }
        else{
            this.graph.setCellStyles("fillColor","#"+(0xe0e0e0+(week.index%2)*0x0F0F0F).toString(16)+";",[week.view.vertex]);
            this.graph.setCellStyles("fontColor","#000000;",[week.view.vertex]);
        }
    }
    
    weeksSwapped(week,week2,direction){
        week.view.moveWeek(week2.view.vertex.h()*direction);
        week2.view.moveWeek(-week.view.vertex.h()*direction);
        this.populateWeekBar();
    }
    
    //A significantly faster version of this function, which first computes what must be moved, then moves it all at once in a single call to moveCells
    pushWeeksFast(startIndex,dy=null){
        var weeks = this.wf.weeks;
        //this should never start at 0, the top week should not be moved
        if(startIndex==0) {weeks[0].view.makeFlushWithAbove(0);startIndex++}
        if(startIndex>weeks.length-1)return;
        if(dy==null)dy=weeks[startIndex-1].view.vertex.b()-weeks[startIndex].view.vertex.y();
        var vertices=[];
        var brackets=[];
        for(var i=startIndex;i<weeks.length;i++){
            vertices.push(weeks[i].view.vertex);
            for(var j=0;j<weeks[i].nodes.length;j++){
                vertices.push(weeks[i].nodes[j].view.vertex);
                for(var k=0;k<weeks[i].nodes[j].brackets.length;k++){
                    var bracket = weeks[i].nodes[j].brackets[k];
                    if(brackets.indexOf(bracket)<0)brackets.push(bracket);
                }
            }
        }
        this.graph.moveCells(vertices,0,dy);
        for(i=0;i<brackets.length;i++)brackets[i].view.updateVertical();
        
    }
    
    bracketAdded(bracket){
        bracket.view = new Bracketview(this.graph,bracket);
        bracket.view.createVertex();
        bracket.view.updateHorizontal();
        bracket.view.updateVertical();
    }
    
    
    
    bringCommentsToFront(){
        if(this.wf.comments.length==0)return;
        var com = [];
        for(var i=0;i<this.wf.comments.length;i++){
            com.push(this.wf.comments[i].view.vertex);
        }
        this.graph.orderCells(false,com);
    }
    
    
    
    createLegend(){
        this.legend = new Legend(this.wf,this.graph);
    }
    
    createLegendVertex(){
        this.legend.createVertex();
    }
    
    columnsSwitched(in1,in2){
        var columns = this.wf.columns;
        var weeks = this.wf.weeks;
        [columns[in1].view.pos,columns[in2].view.pos]=[columns[in2].view.pos,columns[in1].view.pos];
        columns[in1].view.updatePosition();
        columns[in2].view.updatePosition();
        for(var i=0;i<weeks.length;i++){
            for(var j=0;j<weeks[i].nodes.length;j++){
                weeks[i].nodes[j].view.columnUpdated();
            }
        }
    }
    
    
    showLegend(){
        if(this.legend!=null&&this.legend.vertex!=null){
            this.legend.createDisplay();
            this.graph.cellsToggled([this.legend.vertex],!this.graph.isCellVisible(this.legend.vertex));
        }
    }
    
    
    legendUpdate(category,newval,oldval){
        if(this.legend!=null)this.legend.update(category,newval,oldval);
    }
    
    scrollToWeek(week){
        if(week.view&&week.view.vertex)this.scrollToVertex(week.view.vertex);
    }
    
    scrollToVertex(vertex){
        var newy = vertex.y();
        $(".bodywrapper")[0].scrollTo(0,newy);
    }
    
    
    //Executed when we generate all the toolbars
    generateToolbars(){
        var toolbar = this.toolbar;
        if(this.wf.project.readOnly)toolbar.container.style.display="none";
        else toolbar.container.style.display="inline";
        this.generateNodeBar();
        if(this.wf instanceof Courseflow || this.wf instanceof Programflow)this.generateWeekBar();
        this.generateBracketBar();
        this.generateTagBar();
        this.toolbar.show();
        this.toolbar.toggleShow();
        this.toolbar.toggled=true;
    }
    
    
    generateNodeBar(){ 
        this.nodeBarDiv = this.toolbar.addBlock(LANGUAGE_TEXT.workflowview.nodeheader[USER_LANGUAGE],null,"nodebarh3");
        this.populateNodeBar();
    }
    
    generateWeekBar(){
        var weekDiv = this.toolbar.addBlock(LANGUAGE_TEXT.workflowview.jumpto[USER_LANGUAGE]);
        this.weekSelect = document.createElement('select');
        weekDiv.appendChild(this.weekSelect);
        var wfv = this;
        var weekSelect = this.weekSelect;
        this.weekSelect.onchange = function(){
            if(weekSelect.value!=""){
                var index = int(weekSelect.value);
                if(wfv.wf.weeks.length>index)wfv.scrollToWeek(wfv.wf.weeks[index]);
                weekSelect.selectedIndex=0;
            }
        }
        this.populateWeekBar();
        
    }
    
    
    generateBracketBar(){
        if(this.wf.getBracketList()==null)return;
        this.bracketBarDiv = this.toolbar.addBlock(LANGUAGE_TEXT.workflowview.strategiesheader[USER_LANGUAGE],null,"nodebarh3");
        this.populateBracketBar();
        
    }
    
    generateTagBar(){
        if(this.wf.getTagDepth()<0)return;
        
        var wf = this.wf;
        var p=wf.project;
        
        this.tagBarDiv = this.toolbar.addBlock(LANGUAGE_TEXT.workflowview.outcomesheader[USER_LANGUAGE],null,"nodebarh3");
        
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
        
        
        this.tagBarDiv.parentElement.appendChild(compSelect);
        this.tagBarDiv.parentElement.appendChild(addButton);
        
        this.populateTagBar();
    }
    
    
    populateNodeBar(){
        if(this.nodeBarDiv==null)return;
        this.nodeBarDiv.innerHTML = "";
        
        var nodebar = new mxToolbar(this.nodeBarDiv);
		nodebar.enabled = false;
        
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        var makeDropFunction=function(col,workflow){
            var dropfunction = function(graph, evt, filler, x, y)
            {
                var wf = workflow;
                var column=col;
                var cell = graph.getCellAt(x,y);
                graph.stopEditing(false);
                if(cell!=null && cell.isWeek){
                    var startIndex = cell.week.view.getNextIndexFromPoint(y,column);
                    var node=wf.createNodeOfType(column);
                    node.view = new Nodeview(graph,node);
                    node.view.createVertex(x,y);
                    node.setColumn(column);
                    node.setWeek(cell.week);
                    cell.week.addNode(node,0,startIndex);
                    wf.view.bringCommentsToFront();
                    wf.updated("Add Node",node);

                }
                this.lastCell=null;
            }
            return dropfunction;
        }
    
        var allColumns = this.wf.getPossibleColumns();
        for(var i=0;i<allColumns.length;i++){
            var button = this.addNodebarItem(this.nodeBarDiv,allColumns[i].nodetext,iconpath+allColumns[i].image+'.svg',makeDropFunction(allColumns[i].name,this.wf),null,function(cellToValidate){return (cellToValidate!=null&&cellToValidate.isWeek);});
            button.style.borderColor=allColumns[i].colour;
            button.style.borderWidth='3px';
        }
    }
    
    populateWeekBar(){
        if(this.weekSelect==null)return;
        while(this.weekSelect.length>0)this.weekSelect.remove(0);
        var opt = document.createElement('option');
        opt.text=LANGUAGE_TEXT.workflowview.jumpto[USER_LANGUAGE]+"...";
        opt.value="";
        this.weekSelect.appendChild(opt);
        for(var i=0;i<this.wf.weeks.length;i++){
            var week = this.wf.weeks[i];
            var opt = document.createElement('option');
            if(week.name)opt.text=week.name;
            else opt.text=week.getDefaultName();
            opt.value=i;
            this.weekSelect.appendChild(opt);
        }
    }
    
    populateBracketBar(){
        this.bracketBarDiv.innerHTML = "";
        var bracketList = this.wf.getBracketList();
        
        var bracketbar = new mxToolbar(this.tagBarDiv);
		bracketbar.enabled = false;
        
        var makeDropFunction=function(strat,workflow){
            var dropfunction = function(graph, evt, filler, x, y)
            {
                var wf = workflow;
                var strategy=strat['value'];
                var cell = graph.getCellAt(x,y);
                graph.stopEditing(false);
                if(cell!=null&&graph.isPart(cell))cell=graph.getModel().getParent(cell);
                if(cell!=null && cell.isNode){
                    gaEvent('Bracket','Add to Node',wf.name,wf.brackets.length);
                    wf.addBracket(strategy,cell.node);
                    wf.updated("Add Bracket",strategy);
                }
                if(cell!=null&&cell.isWeek){
                    gaEvent('Bracket','Add to Week',wf.name,wf.brackets.length);
                    var xml = findStrategyXML(strategy);
                    var startIndex = cell.week.view.getNextIndexFromPoint(y);
                    makeLoad(function(){
                        wf.addNodesFromXML(cell.week,startIndex,xml);
                        wf.updated("Add Strategy",strategy);
                    });
                }
                this.lastCell=null;

            }
            return dropfunction;
        }
        
        
        for(var i=0;i<bracketList.length;i++){
            this.addNodebarItem(this.bracketBarDiv,bracketList[i].text[USER_LANGUAGE],iconpath+bracketList[i]['value']+'.svg',makeDropFunction(bracketList[i],this.wf),null,function(cellToValidate){return (cellToValidate!=null&&(cellToValidate.isNode||cellToValidate.isWeek));});
        }
    }
    
    
    
    generateColumnFloat(){
        var colFloatContainer = document.createElement('div');
        var colFloat = document.createElement('div');
        colFloatContainer.className = "columnfloatcontainer";
        colFloat.className="columnfloat";
        this.container.parentElement.insertBefore(colFloatContainer,this.container);
        colFloatContainer.appendChild(colFloat);
        this.colFloat = colFloat;
        this.fillColumnFloat();
    }
    
    fillColumnFloat(){
        if(!this.colFloat)return;
        this.colFloat.innerHTML = "";
        for(var i=0;i<this.wf.columns.length;i++){
            var col = this.wf.columns[i];
            var title = document.createElement('div');
            title.className = "columnfloatheader";
            this.colFloat.appendChild(title);
            title.innerHTML=col.text.replace(/\n/g,"<br>");
            if(col.view)title.style.left = (col.view.pos-100)+"px";
        }
    }
    
    showColFloat(show){
        if(show)this.colFloat.classList.remove("hidden");
        else this.colFloat.classList.add("hidden");
    }
    
    tagSetAdded(tag){
        if(tag.view==null)tag.view = new Tagview(this.graph,tag,this.wf);
    }
    
    tagSetRemoved(tag){
        if(tag.view)this.removeAllHighlights(tag);
        this.populateTagBar();
        this.populateTagSelect(this.wf.project.workflows["outcome"],this.wf.getTagDepth());
    }
    
    removeAllHighlights(tag){
        tag.view.highlight(false);
        for(var i=0;i<tag.children.length;i++){
            this.removeAllHighlights(tag.children[i]);
        }
    }
    
    populateTagBar(){
        var tagSets = this.wf.tagSets;
        this.tagBarDiv.innerHTML="";
        for(var i=0;i<tagSets.length;i++){
            var tagDiv = document.createElement('div');
            this.tagBarDiv.appendChild(tagDiv);
            tagDiv.layout=this;
            this.populateTagDiv(tagDiv,tagSets[i]);
        }
        if(tagSets.length==0){
            this.tagBarDiv.classList.add("emptytext");
            this.tagBarDiv.innerHTML="<b>"+LANGUAGE_TEXT.workflowview.nooutcomes[USER_LANGUAGE]+"</b>"
        }else this.tagBarDiv.classList.remove("emptytext");
    }
    
    populateTagDiv(container,tag){
         var button = new Layoutbutton(tag,container);
        button.b.onclick=null;
        
        //Creates the function that is called when you drop it on something
        var makeDropFunction=function(addedtag,workflow){
            var dropfunction = function(graph, evt, filler, x, y)
            {
                var wf = workflow;
                var thistag =addedtag;
                var cell = graph.getCellAt(x,y);
                graph.stopEditing(false);
                while(cell!=null&&graph.isPart(cell)){cell=graph.getModel().getParent(cell);}
                if(cell!=null && cell.isNode){
                    cell.node.addTag(thistag,true,cell.node.wf instanceof Programflow);
                    wf.updated("Add Tag",cell.node);
                }else if(cell!=null && wf.settings.settingsKey.linktagging.value && cell.isLink){
                    cell.link.addTag(thistag,true,cell.link.wf instanceof Programflow);
                    wf.updated("Add Tag",cell.link);
                }
                this.lastCell=null;

            }
            return dropfunction;
        }
        console.log(tag.getIcon());
        this.addNodebarItem(button.bwrap,tag.name,iconpath+tag.getIcon()+".svg",makeDropFunction(tag,this.wf),button,function(cellToValidate){return (cellToValidate!=null&&(cellToValidate.isNode||(cellToValidate.isLink&&cellToValidate.link.node.wf.settings.settingsKey.linktagging.value)));});
        tag.view.addDrop(button);
        if(tag.depth<=this.wf.getTagDepth())button.makeEditable(false,false,true,this.wf);
        button.makeExpandable();
        button.makeNodeIndicators();
        button.layout.view.updateDrops();
        
        if(tag.depth<=this.wf.getTagDepth())for(var i=0;i<tag.children.length;i++){
            this.populateTagDiv(button.childdiv,tag.children[i]);
        }
        return button;
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
        opt.text = LANGUAGE_TEXT.workflowview.selectset[USER_LANGUAGE];
        opt.value = "";
        compSelect.add(opt);
        for(var i=0;i<allTags.length;i++){
            opt = document.createElement('option');
            opt.innerHTML = "&nbsp;".repeat(allTags[i].depth*4)+allTags[i].getNameType()[0]+" - "+allTags[i].name;
            opt.value = allTags[i].id;
            compSelect.add(opt);
        }
    }
    
    
    
    //Adds a drag and drop. If button is null, it creates one, if it is passed an existing button it simply makes it draggable.
    addNodebarItem(container,name,image, dropfunction,button=null,validtargetfunction=function(cellToValidate){return false;})
    {
        var wf = this.wf;
        var graph = this.graph;
        var line;
        var img;
        var namediv;
        if(button==null){
            line = document.createElement("button");
            img = document.createElement("img");
            namediv = document.createElement("div");
            img.setAttribute('src',image);
            img.style.width="24px";
            namediv.innerText = name;
            line.appendChild(img);
            line.appendChild(namediv);
            container.appendChild(line);
        }else {
            img=button.icon;
            line=button.b;
            namediv=button.namediv;
        }
        // Creates the image which is used as the drag icon (preview)
        var dragimg = img.cloneNode(true);
        dragimg.style.width="24px";
        
        console.log(dragimg);
        var draggable = mxUtils.makeDraggable(line, graph, dropfunction,dragimg,-12,-16);
        var defaultMouseMove = draggable.mouseMove;
        draggable.mouseMove = function(evt){
            var boundRect = $("#graphContainer")[0].getBoundingClientRect();
            var leftPos = boundRect.x;
            var topPos = boundRect.y;
            var cell = this.getDropTarget(graph,evt.pageX-leftPos,evt.pageY-topPos,evt);
            while(cell!=null&&graph.isPart(cell)){cell=graph.getModel().getParent(cell);}
            if(draggable.lastCell!=null&&cell!=draggable.lastCell){graph.view.getState(draggable.lastCell).shape.node.firstChild.classList.remove("validdrop");draggable.lastCell=null;}
            
            if(draggable.lastCell==null){
                if(validtargetfunction(cell)){
                    this.dragElement.style.outline="2px solid lightgreen";
                    var g = graph.view.getState(cell).shape.node;
                    if(g.firstChild!=null){
                        g.firstChild.classList.add("validdrop");
                        var hlRemove = function(){g.firstChild.classList.remove("validdrop");}
                        document.addEventListener("mouseup",hlRemove,{once:true});
                        draggable.lastCell = cell;
                    }
                }else{
                    this.dragElement.style.outline="2px solid red";
                }
            }
            return defaultMouseMove.apply(this,arguments);
        }
        

        return line;
    }
    
    
    
    
    
    //This creates an invisible box that spans the width of our workflow. It's useful to have the graph area automatically resize in the y direction, but we want to maintain a minimum width in the x direction so that the user can always see the right hand side even when the editbar is up, and so they can click the seemingly empty space to the right of the graph to deselect items, and this is sort of cheesy way around that.
    createSpanner(){
        this.spanner = this.graph.insertVertex(this.graph.getDefaultParent(),null,'',wfStartX+cellSpacing,this.descriptionHeaderNode.b()+120,this.weekWidth+250,1,invisibleStyle+"strokeColor=#DDDDDD;editable=0;constituent=0;");
        this.spanner.noSelect=true;
        
    }
    
    createPopupMenu(menu,cell,evt){
        var graph = this.graph;
        var wf = this.wf;
        var model = graph.getModel();
        
        if (cell != null){
            while (graph.isPart(cell)){cell=cell.getParent();}
        }
        menu.addItem(LANGUAGE_TEXT.workflowview.addcomment[USER_LANGUAGE],iconpath+'comment.svg',function(){
            var comparent =null;
            if(cell)if(cell.isNode)comparent=cell.node;
            else if(cell.isBracket)comparent=cell.bracket;
            else if(cell.isHead)comparent=cell.column;
            else if(cell.isWeek)comparent=cell.week;
            var boundRect = $("#graphContainer")[0].getBoundingClientRect();
            var leftPos = boundRect.x;
            var topPos = boundRect.y;
            var x = evt.pageX-leftPos;
            var y = evt.pageY-topPos;
            if(x<wfStartX)x=wfStartX;
            if(y<wf.weeks[0].view.vertex.y()-10)y=wf.weeks[0].view.vertex.y()-10;
            var com = new WFComment(wf,x,y,comparent);
            com.view = new Commentview(graph,com);
            com.view.createVertex();
            wf.addComment(com);
        });
        if(cell!=null){
            if(cell.isNode)cell.node.view.populateMenu(menu);
            else if(cell.isWeek)cell.week.view.populateMenu(menu);
            else if (cell.isHead)cell.column.view.populateMenu(menu);
            else if (cell.isComment)cell.comment.view.populateMenu(menu);
            else if (cell.isBracket)cell.bracket.view.populateMenu(menu);
            else if (cell.isLink)cell.link.view.populateMenu(menu);
            else this.populateMenu(menu);
        }else this.populateMenu(menu);

        /*menu.addItem(LANGUAGE_TEXT.workflowview.whatsthis[USER_LANGUAGE],iconpath+'/info.svg',function(){
            if(cell==null){
                if(wf instanceof Activityflow)wf.project.showHelp("activityhelp.html");
                else if (wf instanceof Courseflow)wf.project.showHelp("coursehelp.html");
                else if (wf instanceof Programflow)wf.project.showHelp("programhelp.html");
                else wf.project.showHelp("help.html");
            }else if(cell.isNode){
                wf.project.showHelp("nodehelp.html");
            }else if(cell.isComment){
                wf.project.showHelp("commenthelp.html");
            }else if(cell.isBracket){
                wf.project.showHelp("strategyhelp.html");
            }else if(cell.isWeek){
                if(wf instanceof Activityflow)wf.project.showHelp("activityhelp.html");
                else if (wf instanceof Courseflow)wf.project.showHelp("weekhelp.html");
                else if (wf instanceof Programflow)wf.project.showHelp("programhelp.html");
            }else if(cell.isHead){
                wf.project.showHelp("columnhelp.html");
            }else{
                wf.project.showHelp("help.html");
            }
        });*/
    }
    
    populateMenu(menu){
       var wfv = this;
        var graph = this.graph;
        menu.addItem(LANGUAGE_TEXT.workflowview.edittitle[USER_LANGUAGE],iconpath+'text.svg',function(){
            graph.startEditingAtCell(wfv.titleNode);
        });
        menu.addItem(LANGUAGE_TEXT.workflowview.editauthor[USER_LANGUAGE],iconpath+'text.svg',function(){
            graph.startEditingAtCell(wfv.authorNode);
        });
        menu.addItem(LANGUAGE_TEXT.workflowview.editdescription[USER_LANGUAGE],iconpath+'text.svg',function(){
            wfv.descriptionNode.edit();
        });
        
        this.wf.populateMenu(menu);
    }
    
    expandAllNodes(expand=true){
        this.makeInactive();
        var wf = this.wf;
        for(var i=0;i<wf.weeks.length;i++){
            var week = wf.weeks[i];
            if(week.collapsed && expand) week.collapsed = false;
            for(var j=0;j<week.nodes.length;j++){
                var node = week.nodes[j];
                node.isDropped=expand;
            }
        }
        /*for(var i=0;i<wf.weeks.length;i++){
            var week=wf.weeks[i];
            if(expand&&week.collapsed==expand)week.toggleCollapse();
            for(var j=0;j<week.nodes.length;j++){
                var node = week.nodes[j];
                if(node.isDropped!=expand)node.toggleDropDown();
            }
        }*/
        this.makeActive();
    }
    
    settingsChanged(){
        this.wf.project.changeActive(this.wf);
    }
    
    
    
    clearGraph(){
        while(this.wf.brackets.length>0){
            this.brackets[0].deleteSelf();
        }
        while(this.comments.length>0){
            this.comments[0].deleteSelf();
        }
        while(this.weeks.length>1){
            this.weeks[this.weeks.length-1].deleteSelf();
        }
        this.weeks[0].deleteSelf();
        while(this.wf.columns.length>0){
            this.wf.columns[this.wf.columns.length-1].deleteSelf();
        }
        this.legend.deleteSelf();
        
    }
    
    initializeGraph(){
        var container = this.container;
        // Creates the mxgraph instance inside the given container
        var graph = new mxGraph(container);
        var p = this.wf.project;
        var wfv = this;
		//create minimap
        var minimap = document.getElementById('outlineContainer');
        var outln = new mxOutline(graph, minimap);
        
        var ebContainer = document.getElementById('ebWrapper');
        if(ebContainer.nextElementSibling==null||!ebContainer.nextElementSibling.classList.contains("panelresizehandle"))makeResizable(ebContainer.parentElement,"left");
        //ebContainer.style.top = int(minimap.style.top)+int(minimap.style.height)+6+"px";
        ebContainer.parentElement.style.zIndex='5';
        ebContainer.parentElement.style.width = '400px';
        
        var editbar = new EditBar(ebContainer,this.wf);
        editbar.disable();
        
        this.editbar=editbar;
        
        //graph.panningHandler.useLeftButtonForPanning = true;
        if(p.readOnly){
            graph.cellsMovable=false;
            graph.cellsEditable=false;
            graph.cellsResizable=false;
            graph.isCellConnectable = function(){return false;}
            
        }
        //graph.cellsDisconnectable=false;
        graph.setAllowDanglingEdges(false);
        graph.connectionHandler.select = false;
        //graph.view.setTranslate(20, 20);
        graph.setHtmlLabels(true);
        graph.foldingEnabled = false;
        graph.setTooltips(true);
        graph.setGridSize(10);
        graph.setBorder(20);
        graph.constrainChildren = false;
        graph.extendParents = false;
        graph.resizeContainer=true;
        mxConstants.HANDLE_FILLCOLOR="#DDDDFF";
        
        //display a popup menu when user right clicks on cell, but do not select the cell
        graph.panningHandler.popupMenuHandler = false;
        //expand menus on hover
        graph.popupMenuHandler.autoExpand = true;
        //disable regular popup
        //mxEvent.disableContextMenu(this.container);
        
        
        
        //Disable cell movement associated with user events
        graph.moveCells = function (cells, dx,dy,clone,target,evt,mapping){
            if(cells.length==1&&(cells[0].isComment||cells[0].isLegend)){
                var comment = cells[0].comment;
                if(comment==null)comment=cells[0].legend;
                var wf = comment.wf;
                var x = comment.x+dx;
                var y = comment.y+dy;
                if(x<wfStartX)dx=wfStartX-comment.x;
                if(y<wf.weeks[0].view.vertex.y()-10)dy=wf.weeks[0].view.vertex.y()-10-comment.y;
                if(x>wf.weeks[wf.weeks.length-1].view.vertex.r()+200)dx=wf.weeks[wf.weeks.length-1].view.vertex.r()+200-comment.x;
                if(y>wf.weeks[wf.weeks.length-1].view.vertex.b()+200)dy=wf.weeks[wf.weeks.length-1].view.vertex.b()+200-comment.y;
                comment.x+=dx;
                comment.y+=dy;
                var parent = cells[0].parent;
                return mxGraph.prototype.moveCells.apply(this,[cells,dx,dy,clone,parent,evt,mapping]);
            }
            if(evt!=null && (evt.type=='mouseup' || evt.type=='pointerup' || evt.type=='ontouchend')){
                dx=0;dy=0;
            }
            return mxGraph.prototype.moveCells.apply(this,[cells,dx,dy,clone,target,evt,mapping]);
        }
        
        //Flag for layout being changed, don't update while true
        graph.ffL=false;
        //This overwrites the preview functionality when moving nodes so that nodes are automatically
        //snapped into place and moved while the preview is active.
        graph.graphHandler.updatePreviewShape = function(){
            if(this.shape!=null&&!graph.ffL){
                graph.ffL=true;
                //creates a new variable for the initial bounds,
                //otherwise once the node moves the preview will be
                //drawn relative to the NEW position but with the OLD
                //displacement, leading to a huge offset.
                if(this.shape.initboundx==null){this.shape.initboundx=this.pBounds.x;this.shape.offsetx=this.shape.initboundx-this.cells[0].getGeometry().x;}
                if(this.shape.initboundy==null){this.shape.initboundy=this.pBounds.y;this.shape.offsety=this.shape.initboundy-this.cells[0].getGeometry().y;}
                //redraw the bounds. This is the same as the original function we are overriding, however
                //initboundx has taken the place of pBound.x
                this.shape.bounds = new mxRectangle(Math.round(this.shape.initboundx + this.currentDx - this.graph.panDx),
                        Math.round(this.shape.initboundy + this.currentDy - this.graph.panDy), this.pBounds.width, this.pBounds.height);
                this.shape.redraw();
                //Get the selected cells
                var cells = this.cells;
                var preview = this.shape.bounds.getPoint();
                //Unfortunately, the preview uses the position relative to the current panned window, whereas everything else uses the real positions. So we figure out the offset between these
                //at the start of the drag.
                var newx = preview.x-this.shape.offsetx;
                var newy = preview.y-this.shape.offsety;
                //for single WFNodes, we will snap during the preview
                if(cells.length==1 && cells[0].isNode) {
                    var cell = cells[0];
                    var wf = cell.node.wf;
                    var columns=cell.node.wf.columns;
                    var weeks = cell.node.wf.weeks;
                    //It's more intuitive if we go from the center of the cells, especially since the column positions are measured relative to the center, so we do a quick redefinition of the position.
                    newx=newx+cell.w()/2;
                    newy=newy+cell.h()/2;
                    //Start by checking whether we need to move in the x direction
                    var colIndex=wf.getColIndex(cell.node.column);
                    var newColName = wf.view.findNearestColumn(newx);
                    if(newColName!=cell.node.column){
                        var oldColName=cell.node.column;
                        cell.node.setColumn(newColName);
                        cell.node.week.columnUpdated(cell.node,oldColName);
                        cell.node.wf.updated("Node Moved",cell.node);
                    }
                    //Check the y
                    //First we check whether we are inside a new week; if we are then it hardly matters where we are relative to the nodes within the old week.
                    var node = cell.node;
                    var week = node.week;
                    var weekChange=week.view.relativePos(newy);
                    if(weekChange==0){//proceed to determine whether or not the node must move within the week
                        var index = week.getIndexOf(node);
                        var newIndex = week.view.getNearestNode(newy,node.column);
                        if(index!=newIndex){
                            week.shiftNode(index,newIndex,node.column);
                            node.wf.updated("Node Moved",node);
                        }
                    }else{
                        node.changeWeek(weekChange,graph);
                        node.wf.updated("Node Moved",node);
                    }
                }else if(cells.length==1 && cells[0].isHead){
                    //as above but with only the horizontal movement
                    var cell = cells[0];
                    var wf = cell.column.wf;
                    var columns=wf.columns;
                    //start from center of this cell
                    newx=newx+cell.w()/2;
                    //column index
                    var colIndex=wf.columns.indexOf(cell.column);
                    if(colIndex>0 && Math.abs(columns[colIndex].view.pos-newx)>Math.abs(columns[colIndex-1].view.pos-newx)){
                        //swap this column with that to the left
                        wf.swapColumns(colIndex,colIndex-1);
                        wf.updated("Column Moved");
                    }
                    if(colIndex<columns.length-1 && Math.abs(columns[colIndex].view.pos-newx)>Math.abs(columns[colIndex+1].view.pos-newx)){
                        //swap this column with that to the right
                        wf.swapColumns(colIndex,colIndex+1);
                        wf.updated("Column Moved");
                    }
                    
                }
                graph.ffL=false;

            }

        }
        
        //Alters the way the drawPreview function is handled on resize, so that the brackets can snap as they are resized. Also disables horizontal resizing.
        mxVertexHandler.prototype.drawPreview = function(){
            var cell = this.state.cell;
            if(this.selectionBorder.offsetx==null){this.selectionBorder.offsetx=this.bounds.x-cell.x();this.selectionBorder.offsety=this.bounds.y-cell.y();}
            if(cell.isNode||cell.isBracket){
                this.bounds.width = this.state.cell.w();
                this.bounds.x = this.state.cell.x()+this.selectionBorder.offsetx;
            }
            if(this.state.cell!=null&&!graph.ffL){
                if(cell.isBracket){
                    graph.ffL=true;
                    var br = cell.bracket;
                    var wf = br.wf;
                    var bounds = this.bounds;
                    if(Math.abs(bounds.height-cell.h())>minCellHeight/2+cellSpacing){
                        var dy = bounds.y-cell.y()-this.selectionBorder.offsety;
                        var db = (bounds.height+bounds.y)-cell.b()-this.selectionBorder.offsety;
                        var dh = bounds.height-cell.h();
                        var isTop = (dy!=0);
                        var next = wf.findNextNodeOfSameType(br.getNode(isTop),int((dy+db)/Math.abs(dy+db)));
                        if(next!=null){
                            if(Math.abs(dh)>cellSpacing+next.view.vertex.h()/2){
                                var delta = (next.view.vertex.y()-cell.y())*(isTop) + (next.view.vertex.b()-cell.b())*(!isTop);
                                br.changeNode(next,isTop);
                                //Required because of the way in which mxvertex handler tracks rescales. I don't think this breaks anything else.
                                this.startY = this.startY +delta;
                            }
                        }
                        
                    }
                    graph.ffL=false;
                }

            }
            drawPreviewPrototype.apply(this,arguments);
        }
        //disable cell resize for the bracket
        var resizeCellPrototype = mxVertexHandler.prototype.resizeCell;
        mxVertexHandler.prototype.resizeCell = function(cell,dx,dy,index,gridEnabled,constrained,recurse){
            if(cell.isBracket)return;
            else return resizeCellPrototype.apply(this,arguments);
        }
        
        
        
        
        
        //Disable horizontal resize
        graph.resizeCell = function (cell, bounds, recurse){
            if(cell.isNode) {
                if(bounds.height<minCellHeight)bounds.height=minCellHeight;
                bounds.y=cell.y();
                bounds.x=cell.x();
                bounds.width=cell.w();
                var dy = bounds.height - cell.h();
                var returnval = mxGraph.prototype.resizeCell.apply(this,arguments);
                cell.node.resizeBy(dy);
                return returnval;
            }
            if(cell.isBracket){bounds.width=cell.w();bounds.x=cell.x();}
            return mxGraph.prototype.resizeCell.apply(this,arguments);
        }
        
        
        //handle the changing of the toolbar upon selection
        graph.selectCellForEvent = function(cell,evt){
            if(cell.noSelect){graph.clearSelection();return;}
            if(cell.isWeek){graph.clearSelection();return;}
            if(cell.isHead){wfv.showColFloat(false);}
            mxGraph.prototype.selectCellForEvent.apply(this,arguments);
        }
        graph.clearSelection = function(){
            this.stopEditing(false);
            if(editbar.node&&editbar.node.view)editbar.node.view.deselected();
            editbar.disable();
            wfv.showColFloat(true);
            $("body>.mxPopupMenu").remove();
            mxGraph.prototype.clearSelection.apply(this,arguments);
        }
        
        //function that checks if it is a constituent
        graph.isPart = function(cell){
            var state = this.view.getState(cell);
            var style = (state != null) ? state.style : this.getCellStyle(cell);
            return style['constituent']=='1';
        }
        //Redirect clicks and drags to parent
        var graphHandlerGetInitialCellForEvent = mxGraphHandler.prototype.getInitialCellForEvent;
        mxGraphHandler.prototype.getInitialCellForEvent = function(me){
            var cell = graphHandlerGetInitialCellForEvent.apply(this, arguments);
            while (this.graph.isPart(cell)){
                cell = this.graph.getModel().getParent(cell);
            }
            return cell;
        };
       
        //Adds an event listener to handle the drop down collapse/expand of nodes
        graph.addListener(mxEvent.CLICK,function(sender,evt){
            container.focus();
        });
        
        //Add an event listener to handle double clicks to nodes, which, if they have a linked wf, will change the active wf
        graph.addListener(mxEvent.DOUBLE_CLICK,function(sender,evt){
            var cell = evt.getProperty('cell');
           if(cell!=null){
               while (graph.isPart(cell)){cell = graph.getModel().getParent(cell);}
               if(cell.isNode){
                   var node = cell.node;
                   node.openLinkedWF();
               }
           }
        });
        
        //These will be used to distinguish between clicks and drags
        var downx=0;
        var downy=0;
        graph.addMouseListener(
            {
                mouseDown: function(sender,me){downx=me.graphX;downy=me.graphY;},
                mouseUp: function(sender,me){
                    var cell = me.getCell();
                    if(cell!=null&&me.evt.button==0){
                        //check if this was a click, rather than a drag
                        if(Math.sqrt(Math.pow(downx-me.graphX,2)+Math.pow(downy-me.graphY,2))<2){
                            if(cell.isDrop){
                                cell.node.toggleDropDown();
                            }else if(cell.isComment){
                                cell.comment.view.show();
                            }else{
                                while (graph.isPart(cell)){cell = graph.getModel().getParent(cell);}
                                //check if this was a click, rather than a drag
                                if(cell.isNode){
                                    if(editbar.node&&editbar.node.view)editbar.node.view.deselected();
                                    editbar.enable(cell.node);
                                    cell.node.view.selected();
                                }
                            }
                        }
                    }
                },
                mouseMove: function(sender,me){
                    var cell=me.getCell();
                    if(cell==null)return;
                    while (graph.isPart(cell)){if(cell.cellOverlays!=null)break;cell = graph.getModel().getParent(cell);}
                    if(cell.cellOverlays!=null){
                        if(graph.getCellOverlays(cell)==null){
                            //check if you are in bounds, if so create overlays. Because of a weird offset between the graph view and the graph itself, we have to use the cell's view state instead of its own bounds
                            var mouserect = new mxRectangle(me.getGraphX()-exitPadding/2,me.getGraphY()-exitPadding/2,exitPadding,exitPadding);
                            if(mxUtils.intersects(mouserect,graph.view.getState(cell))){
                                //Add link highlighting
                                if(cell.isNode&&cell.node.view)cell.node.view.mouseIn();
                                if(cell.isLink&&cell.link.view)cell.link.view.mouseIn();
                                //Add the overlays
                                if(!p.readOnly)for(var i=0;i<cell.cellOverlays.length;i++){
                                    graph.addCellOverlay(cell,cell.cellOverlays[i]);
                                }
                                //if it's a node with tags, also show those
                                var timeoutvar;
                                if(cell.isTagPreview&&cell.node.tags.length>0)timeoutvar = setTimeout(function(){if(cell.node.wf.view==wfv)cell.node.view.toggleTags(true);},200);
                                //add the listener that will remove these once the mouse exits
                                graph.addMouseListener({
                                    mouseDown: function(sender,me){},
                                    mouseUp: function(sender,me){},
                                    mouseMove: function(sender,me){
                                        if(graph.view.getState(cell)==null){graph.removeMouseListener(this);return;}
                                        var exitrect = new mxRectangle(me.getGraphX()-exitPadding,me.getGraphY()-exitPadding,exitPadding*2,exitPadding*2);
                                        if(!mxUtils.intersects(exitrect,graph.view.getState(cell))){
                                            /*if(cell.isNode&&graph.view.getState(cell.node.view.tagBox)!=null&&mxUtils.intersects(exitrect,graph.view.getState(cell.node.view.tagBox))){
                                                
                                                return;
                                            }*/
                                            //remove link highlighting
                                            if(cell.isNode&&cell.node.view)cell.node.view.mouseOut();
                                            if(cell.isLink&&cell.link.view)cell.link.view.mouseOut();
                                            graph.removeCellOverlay(cell);
                                            if(cell.isTagPreview||cell.isNode){cell.node.view.toggleTags(false);clearTimeout(timeoutvar);}
                                            if(cell.isLink){cell.link.view.toggleTags(false);clearTimeout(timeoutvar);}
                                            graph.removeMouseListener(this);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        );
        
        //Change default graph behaviour to make vertices not connectable
        graph.insertVertex = function(par,id,value,x,y,width,height,style,relative){
            var vertex = mxGraph.prototype.insertVertex.apply(this,arguments);
            vertex.setConnectable(false);
            return vertex;            
        }
        //Setting up ports for the cell connections
        graph.setConnectable(true);
        // Replaces the port image
			graph.setPortsEnabled(false);
			mxConstraintHandler.prototype.pointImage = new mxImage(iconpath+'port.svg', 10, 10);
        var ports = new Array();
        ports['OUTw'] = {x: 0, y: 0.6, perimeter: true, constraint: 'west'};
        ports['OUTe'] = {x: 1, y: 0.6, perimeter: true, constraint: 'east'};
        ports['OUTs'] = {x: 0.5, y: 1, perimeter: true, constraint: 'south'};
        ports['HIDDENs'] = {x: 0.5, y: 1, perimeter: true, constraint: 'south'};
        ports['INw'] = {x: 0, y: 0.4, perimeter: true, constraint: 'west'};
        ports['INe'] = {x: 1, y: 0.4, perimeter: true, constraint: 'east'};
        ports['INn'] = {x: 0.5, y: 0, perimeter: true, constraint: 'north'};
        // Extends shapes classes to return their ports
        mxShape.prototype.getPorts = function()
        {
            return ports;
        };
        
        // Disables floating connections (only connections via ports allowed)
        graph.connectionHandler.isConnectableCell = function(cell)
        {
           return false;
        };
        
        
        
        mxEdgeHandler.prototype.isConnectableCell = function(cell)
        {
            return graph.connectionHandler.isConnectableCell(cell);
        };
        // Disables existing port functionality
        graph.view.getTerminalPort = function(state, terminal, source)
        {
            return terminal;
        };
        
        // Returns all possible ports for a given terminal
        graph.getAllConnectionConstraints = function(terminal, source)
        {
            if (terminal != null && this.model.isVertex(terminal.cell))
            {
                if (terminal.shape != null)
                {
                    var ports = terminal.shape.getPorts();
                    var cstrs = new Array();

                    for (var id in ports)
                    {
                        if(id.indexOf("HIDDEN")>=0)continue;
                        if((id.indexOf("IN")>=0&&source)||id.indexOf("OUT")>=0&&!source)continue;
                        var port = ports[id];

                        var cstr = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
                        cstr.id = id;
                        cstrs.push(cstr);
                    }

                    return cstrs;
                }
            }

            return null;
        };

        // Sets the port for the given connection
        graph.setConnectionConstraint = function(edge, terminal, source, constraint)
        {
            if (constraint != null)
            {
                var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
                

                if (constraint == null || constraint.id == null)
                {
                    this.setCellStyles(key, null, [edge]);
                }
                else if (constraint.id != null)
                {
                    this.setCellStyles(key, constraint.id, [edge]);
                }
            }
        };

        // Returns the port for the given connection
        graph.getConnectionConstraint = function(edge, terminal, source)
        {
            var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
            var id = edge.style[key];
            if (id != null)
            {
                var c =  new mxConnectionConstraint(null, null);
                c.id = id;

                return c;
            }
            
            return null;
        };

        
        initializeConnectionPointForGraph(graph);
        
        //make the non-default connections through our own functions, so that we can keep track of what is linked to what. The prototype is saved in Constants, so that we don't keep overwriting it.
        mxConnectionHandler.prototype.insertEdge = function(parent,id,value,source,target,style){
            if(source.isNode&&target.isNode){
                for(var i=0;i<source.node.fixedLinksOut.length;i++){
                    if(source.node.fixedLinksOut[i].targetNode==target.node)return null;
                }
            }
            var edge = insertEdgePrototype.apply(this,arguments);
            if(source.isNode && target.isNode){
                graph.setCellStyle(defaultEdgeStyle,[edge]);
                source.node.addFixedLinkOut(target.node,edge);
            }
            return edge;
        }
        
        //Handle changing the edge's target or source
        mxEdgeHandler.prototype.connect = function(edge,terminal,isSource,isClone,me){
            
            var link = edge.link;
            if(!link||link instanceof WFAutolink)return;
            var newSource;
            var newTarget;
            if(isSource){newSource=terminal.node;newTarget=edge.link.targetNode;}
            else {newSource=edge.link.node;newTarget=terminal.node;}
            if(newSource&&newTarget)for(var i=0;i<newSource.fixedLinksOut.length;i++){
                if(newSource.fixedLinksOut[i].targetNode==newTarget)return;
            }
            
            var returnval = edgeConnectPrototype.apply(this,arguments);
            console.log(edge);
            console.log(link);
            try{
                var originalNode = link.node;
                if(isSource){
                    originalNode.fixedLinksOut.splice(originalNode.fixedLinksOut.indexOf(link),1);
                    link.node = terminal.node;
                    terminal.node.fixedLinksOut.push(link);
                }else{
                    link.targetNode.linksIn.splice(link.targetNode.linksIn.indexOf(link),1);
                    link.targetNode = terminal.node;
                    link.targetNode.linksIn.push(link);
                    link.id = link.targetNode.id;
                }
                var ps = link.view.getPortStyle();
                if(ps)link.portStyle = ps;
                
            }catch(err){console.log("there was a problem changing the edge");}
            console.log(returnval);
            return returnval;
        }
        
        this.graph = graph;
        
    }
    
    //Scale such that there is no horizontal overflow, vertical can break over pages
    print(){
        var graph = this.graph;
        if(graph==null)return;
        var des = graph.insertVertex(graph.getDefaultParent(),null,this.wf.description,(wfStartX+cellSpacing+20),(wfStartY+70+40),800,80,defaultTextStyle+"strokeColor=none;");
        var x = graph.getGraphBounds().width;
        var x0 = mxConstants.PAGE_FORMAT_A4_PORTRAIT.width;
        var scale = 0.95;
        if(x>x0)scale=scale*x0/x;
        var preview = new mxPrintPreview(graph, scale,mxConstants.PAGE_FORMAT_A4_PORTRAIT);
        preview.open();
        graph.removeCells([des])
    }
    
    
    
    
    
    
}