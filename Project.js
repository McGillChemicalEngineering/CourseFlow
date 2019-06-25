
class Project{
    constructor(container){
        this.xmlData;
        this.workflows=[];
        this.graph;
        this.activeIndex;
        this.container=container;
        this.sidenav = document.getElementById("sidenav");
        this.layout = document.getElementById("layout");
        this.newWFDiv = document.getElementById("newWFDiv");
        var p = this;
        this.idNum=0;
        this.name = "New Project";
        
        var newWFSelect = document.createElement('select');
        this.fillWFSelect(newWFSelect);
        this.newWFDiv.appendChild(newWFSelect);
        var newWF = document.createElement('button');
        newWF.innerHTML="Add";
        newWF.onclick= function(){
            var type = newWFSelect.value;
            p.addWorkflow(type);
        }
        this.newWFDiv.appendChild(newWF);
        
        
        var minimap = document.getElementById('outlineContainer');
        
        var ebContainer = document.getElementById('ebContainer');
        ebContainer.style.top = int(minimap.style.top)+int(minimap.style.height)+6+"px";
        ebContainer.style.zIndex='3';
        ebContainer.style.width = '400px';
        
        var editbar = new EditBar(ebContainer);
        editbar.disable();
        
        this.editbar=editbar;
        
        var newfile = document.getElementById('new');
        newfile.onclick = function(){
            p.clearProject();
        }
        
        var save = document.getElementById('save');
        save.onclick = function(){
            p.saveProject();
        }
        
        var open = document.getElementById('open');
        var openProject = function(){
            var reader = new FileReader();
            reader.readAsText(p.fileLoader.files[0]);
            reader.onload = function(evt){
                var readData = evt.target.result;
                p.fromXML(readData);

            }
        }
        this.fileLoader = document.createElement("input");
        this.fileLoader.type="file";
        this.fileLoader.accept=".xml";
        this.fileLoader.addEventListener('change',openProject);
        open.onclick = function(){
            p.fileLoader.click();
        }
        
        
        
        
		
    }
    
    saveProject(){
        this.toXML();
        var file = new Blob([this.xmlData], {type: "data:text/xml;charset=utf-8;"});
        var filename = this.name+'.xml';
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            a.target="save as";
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
    
    setName(name){
        this.name=name;
    }
    
    
    
    toXML(){
        if(this.activeIndex!=null)this.workflows[this.activeIndex].toXML();
        var xml = "";
        var serializer = new XMLSerializer();
        xml+=makeXML(this.name,"prname");
        xml+=makeXML(this.idNum,"idnum");
        for(var i=0;i<this.workflows.length;i++){
            if(this.workflows[i].xmlData==null)this.workflows[i].toXML();
            xml+=serializer.serializeToString(this.workflows[i].xmlData.documentElement);
        }
        this.xmlData = makeXML(xml,"project");
    }
    
    clearProject(){
        if(this.activeIndex!=null){this.workflows[this.activeIndex].makeInactive();this.activeIndex=null;}
        while(this.layout.childElementCount>0)this.layout.removeChild(this.layout.firstElementChild);
        this.workflows=[];
        this.name=null;
        this.idNum="0";
        
    }
    
    fromXML(xmlData){
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlData,"text/xml");
        this.clearProject();
        this.setName(getXMLVal(xmlDoc,"prname"));
        this.idNum = int(getXMLVal(xmlDoc,"idnum"));
        var xmlwfs = xmlDoc.getElementsByTagName("workflow");
        for(var i=0;i<xmlwfs.length;i++){
            this.addWorkflowFromXML(xmlwfs[i]);
        }
        for(i=0;i<this.workflows.length;i++){
            var wf = this.workflows[i];
            for(var j=0;j<wf.usedWF.length;j++){
                this.addChild(wf,this.getWFByID(wf.usedWF[j]));
            }
        }
        this.xmlData = xmlData;
    }
    
    genID(){
        this.idNum+=1;
        return ""+this.idNum;
    }
    
    addWorkflow(type){
        var wf;
        if(type=="activity")wf = new Activityflow(this.container,this);
        else wf = new Courseflow(this.container,this);
        this.addButton(wf,this.layout);
        this.workflows.push(wf);
        return wf;
    }
    
    addWorkflowFromXML(xml){
        var wf = this.addWorkflow(getXMLVal(xml,"wftype"));
        wf.id=getXMLVal(xml,"wfid");
        wf.setName=getXMLVal(xml,"wfname");
        wf.usedWF = getXMLVal(xml,"usedwfARRAY");
        wf.xmlData=xml;
    }
    
    addChild(wfp,wfc){
        //If child is at the root level, remove its button
        if(wfc.buttons[0].parentElement.id=="layout"){
            wfc.buttons[0].parentElement.removeChild(wfc.buttons[0]);
            wfc.buttons.splice(0,1);
        }
        //Add it to the parent at all locations in the tree
        for(var i=0;i<wfp.buttons.length;i++){
            this.addButton(wfc,wfp.buttons[i]);
        }
    }
    
    removeChild(wfp,wfc){
        //Remove the button from all instances of the parent
        for(var i=0;i<wfp.buttons.length;i++){
            for(var j=0;j<wfc.buttons.length;j++){
                if(wfc.buttons[j].parentElement == wfp.buttons[i]){
                    wfp.removeUsedWF(wfc.id);
                    wfp.buttons[i].removeChild(wfc.buttons[j]);
                    wfc.buttons.splice(j,1)
                    break;
                }
            }
        }
        //if no instances still exist, move it back into the root
        if(wfc.buttons.length==0)this.addButton(wfc,this.layout);
    }
    
    fillWFSelect(select){
        var opt = document.createElement('option');
        opt.text="Course";
        opt.value="course";
        select.add(opt);
        opt = document.createElement('option');
        opt.text="Activity";
        opt.value="activity";
        select.add(opt);
    }
    
    
    
    addButton(wf,container){
        var bdiv = document.createElement('div');
        var b = document.createElement('button');
        bdiv.className = "LayoutDiv";
        b.innerHTML=wf.name;
        b.className="Layout";
        var p = this;
        b.onclick=function(){
            p.changeActive(p.getWFIndex(wf));
        }
        bdiv.appendChild(b);
        container.appendChild(bdiv);
        wf.buttons.push(bdiv);
    }
    
    getWFIndex(wf){
        return this.workflows.indexOf(wf);
    }
    
    getWFByID(id){
        for(var i=0;i<this.workflows.length;i++){
            if(this.workflows[i].id==id)return this.workflows[i];
        }
        return null;
    }
    
    changeActive(index){
        if(this.activeIndex!=null)this.workflows[this.activeIndex].makeInactive();
        this.initializeGraph(this.container);
        this.activeIndex=index;
        this.workflows[this.activeIndex].makeActive(this.graph);
    }
    
    initializeGraph(container){
        // Creates the graph inside the given container
        var graph = new mxGraph(container);
        
		//create minimap
        var minimap = document.getElementById('outlineContainer');
        var outln = new mxOutline(graph, minimap);
        
        
        var editbar = this.editbar;
        
        //graph.panningHandler.useLeftButtonForPanning = true;
        graph.setAllowDanglingEdges(false);
        graph.connectionHandler.select = false;
        graph.view.setTranslate(20, 20);
        graph.setHtmlLabels(true);
        graph.foldingEnabled = false;
        graph.setTooltips(true);
        graph.setGridSize(10);
        graph.setBorder(20);
        graph.constrainChildren = false;
        graph.extendParents = false;
        graph.resizeContainer=true;
        
        //connections
        graph.setConnectable(true);
        mxConnectionHandler.prototype.connectImage = new mxImage('resources/images/add24.png', 16, 16);
        
        //display a popup menu when user right clicks on cell, but do not select the cell
        graph.panningHandler.popupMenuHandler = false;
        //expand menus on hover
        graph.popupMenuHandler.autoExpand = true;
        //disable regular popup
        mxEvent.disableContextMenu(container);
        
        
        //Disable cell movement associated with user events
        graph.moveCells = function (cells, dx,dy,clone,target,evt,mapping){
            if(evt!=null && (evt.type=='mouseup' || evt.type=='pointerup')){
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
                    if(colIndex>0 && Math.abs(columns[colIndex].pos-newx)>Math.abs(columns[colIndex-1].pos-newx)){cell.node.setColumn(columns[colIndex-1].name,graph);}
                    if(colIndex<columns.length-1 && Math.abs(columns[colIndex].pos-newx)>Math.abs(columns[colIndex+1].pos-newx)){cell.node.setColumn(columns[colIndex+1].name,graph);}
                    //Check the y
                    //First we check whether we are inside a new week; if we are then it hardly matters where we are relative to the nodes within the old week.
                    var node = cell.node;
                    var week = node.week;
                    var weekChange=cell.node.week.relativePos(newy);
                    if(weekChange==0){//proceed to determine whether or not the node must move within the week
                        var index = node.week.nodes.indexOf(node);
                        var newIndex = week.getNearestNode(newy);
                        if(index!=newIndex)week.shiftNode(index,newIndex,graph);
                    }else{
                        cell.node.changeWeek(weekChange,graph);
                    }
                }
                graph.ffL=false;

            }

        }
        
        mxConnectionHandler.prototype.connect = function(source, target, evt, dropTarget){
            if(source.isNode && target.isNode){
                source.node.addFixedLinkOut(target.node);
            }
        }
        
        //Change default graph behaviour to make vertices not connectable
        graph.insertVertex = function(par,id,value,x,y,width,height,style,relative){
            var vertex = mxGraph.prototype.insertVertex.apply(this,arguments);
            vertex.setConnectable(false);
            return vertex;            
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
            return mxGraph.prototype.resizeCell.apply(this,arguments);
        }
        
        
        //handle the changing of the toolbar upon selection
        graph.selectCellForEvent = function(cell,evt){
            if(cell.isWeek){graph.clearSelection();return;};
            if(cell.isNode)editbar.enable(cell.node);
            mxGraph.prototype.selectCellForEvent.apply(this,arguments);
        }
        graph.clearSelection = function(){
            editbar.disable();
            mxGraph.prototype.clearSelection.apply(this,arguments);
        }
        
        //function that checks if it is a constituent
        graph.isPart = function(cell){
            var state = this.view.getState(cell);
            var style = (state != null) ? state.style : this.getCellStyle(cell);
            return style['constituent']=='1';
        }
        //Redirect drag to parent
        var graphHandlerGetInitialCellForEvent = mxGraphHandler.prototype.getInitialCellForEvent;
        mxGraphHandler.prototype.getInitialCellForEvent = function(me){
            var cell = graphHandlerGetInitialCellForEvent.apply(this, arguments);
            if (this.graph.isPart(cell)){
                cell = this.graph.getModel().getParent(cell)
            }
            return cell;
        };
        
        this.graph = graph;
        
    }
}
