//Class for main project. Also controls most of what happens with regards to workflows, and as the top level object class includes a few logistical functions that didn't really fit as global.

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
        this.nameDiv = document.getElementById("prname")
        var p = this;
        this.idNum=0;
        this.loadAppend=false;
        this.name = "New Project";
        
        //Add the ability to edit the name of the project
        var nameIcon = document.createElement('img');
        nameIcon.src="resources/images/edit16.png";
        nameIcon.style.width='16px';
        var nameDiv = this.nameDiv;
        nameDiv.parentElement.onclick=function(){
            var tempfunc = nameDiv.onclick;
            //create an input, on enter or exit make that the new name
            nameDiv.innerHTML="<input type='text' class = 'fixedwidthinput' value = '"+p.name+"'placeholder='<type a new name here>'></input>";
            nameDiv.firstElementChild.focus();
            nameDiv.firstElementChild.select();
            nameDiv.onclick=null;
            container.onclick=function(){
                if(nameDiv.firstElementChild!=null)nameDiv.firstElementChild.blur();
                container.onclick=null;
            };
            nameDiv.firstElementChild.addEventListener("focusout",function(){
                nameDiv.onclick=tempfunc;
                console.log("focusout");
                if(nameDiv.firstElementChild.value=="")nameDiv.innerHTML=p.name;
                else p.setName(nameDiv.firstElementChild.value);
            });
        }
        var editNameDiv = document.createElement('div');
        editNameDiv.className="deletelayoutdiv";
        editNameDiv.appendChild(nameIcon);
        editNameDiv.style.display="inline-block";
        editNameDiv.style.top="0px";
        nameDiv.parentElement.style.position="relative";
        nameDiv.parentElement.appendChild(editNameDiv);
        
        
        
        var newWFSelect = document.createElement('select');
        this.fillWFSelect(newWFSelect);
        this.newWFDiv.appendChild(newWFSelect);
        var newWF = document.createElement('button');
        newWF.innerHTML="Add";
        newWF.onclick= function(){
            var type = newWFSelect.value;
            p.addWorkflow(type);
            p.changeActive(p.workflows.length-1)
        }
        this.newWFDiv.appendChild(newWF);
        
        
        var minimap = document.getElementById('outlineContainer');
        
        var ebContainer = document.getElementById('ebContainer');
        //ebContainer.style.top = int(minimap.style.top)+int(minimap.style.height)+6+"px";
        ebContainer.style.zIndex='3';
        ebContainer.style.width = '0px';
        
        var editbar = new EditBar(ebContainer);
        editbar.disable();
        
        this.editbar=editbar;
        
        var newfile = document.getElementById('new');
        newfile.onclick = function(){
            if(mxUtils.confirm("Are you sure you want to continue? You will lose any unsaved work.")){
                p.clearProject();
            }
        }
        
        var save = document.getElementById('save');
        save.onclick = function(){
            p.saveProject();
        }
        
        var duplicateWF = document.getElementById('duplicatewf');
        duplicateWF.onclick = function(){
            p.duplicateActiveWF();
        }
        
        var open = document.getElementById('open');
        var openProject = function(){
            var reader = new FileReader();
            reader.readAsText(p.fileLoader.files[0]);
            reader.onload = function(evt){
                var readData = evt.target.result;
                p.fromXML(readData,p.loadAppend);

            }
        }
        
        this.fileLoader = document.createElement("input");
        this.fileLoader.type="file";
        this.fileLoader.accept=".xml";
        this.fileLoader.addEventListener('change',openProject);
        open.onclick = function(){
            p.loadAppend=false;
            p.fileLoader.click();
        }
        
        
        
        var exportWF = document.getElementById('export');
        exportWF.onclick = function(){
            p.exportCurrent();
        }
        
        var importWF = document.getElementById('import');
        importWF.onclick = function(){
            p.loadAppend=true;
            p.fileLoader.click();
        }
        
        var printWF = document.getElementById("print");
        printWF.onclick = function(){
            p.printActiveWF();
        }
        
        var expand = document.getElementById("expand");
        var collapse = document.getElementById("collapse");
        expand.onclick = function(){if(p.activeIndex!=null)p.workflows[p.activeIndex].expandAllNodes();}
        collapse.onclick = function(){if(p.activeIndex!=null)p.workflows[p.activeIndex].expandAllNodes(false);}
		
    }
    
    saveProject(){
        this.toXML();
        var filename = this.name+'.xml';
        this.saveXML(this.xmlData,filename);
    }
    
    saveXML(xml,filename){
        var file = new Blob([xml], {type: "data:text/xml;charset=utf-8;"});
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
    
    exportCurrent(){
        if(this.activeIndex==null)return;
        var serializer = new XMLSerializer();
        var wf = this.workflows[this.activeIndex];
        var usedWF = this.getDependencies(wf);
        var exported=[];
        var xml = "";
        wf.toXML();
        xml+=makeXML(wf.name,"prname");
        xml+=makeXML(this.idNum,"idnum");
        xml+=serializer.serializeToString(wf.xmlData);
        for(var i=0;i<usedWF.length;i++){
            if(exported.indexOf(usedWF[i])>=0)continue;
            exported.push(usedWF[i]);
            if(this.getWFByID(usedWF[i]).xmlData==null)this.getWFByID(usedWF[i]).toXML();
            xml+=serializer.serializeToString(this.getWFByID(usedWF[i]).xmlData);
        }
        xml = makeXML(xml,"project");
        var filename = wf.name+".xml";
        this.saveXML(xml,filename);
    }
    
    getDependencies(wf){
        var array = wf.usedWF;
        for(var i=0;i<wf.usedWF.length;i++){
            array = array.concat(this.getDependencies(this.getWFByID(wf.usedWF[i])));
        }
        return array;
    }
    
    duplicateActiveWF(){
        var wf = this.workflows[this.activeIndex];
        wf.toXML();
        var xml = this.workflows[this.activeIndex].xmlData;
        xml.getElementsByTagName("wfname")[0].childNodes[0].nodeValue=xml.getElementsByTagName("wfname")[0].childNodes[0].nodeValue+" (Copy)";
        xml.getElementsByTagName("wfid")[0].childNodes[0].nodeValue=this.genID;
        var wfcopy = this.addWorkflowFromXML(xml,false);
        for(var i=0;i<wfcopy.usedWF.length;i++){
            this.addButton(this.getWFByID(wfcopy.usedWF[i]),wfcopy.buttons[0]);
        }
        
    }
    
    printActiveWF(){
        if(this.graph==null)return;
        var scale = mxUtils.getScaleForPageCount(1, this.graph);
        var preview = new mxPrintPreview(this.graph, scale);
        preview.open();
    }
    
    setName(name){
        name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
        this.name=name;
        this.nameDiv.innerHTML=name;
    }
    
    
    
    toXML(){
        if(this.activeIndex!=null)this.workflows[this.activeIndex].toXML();
        var xml = "";
        var serializer = new XMLSerializer();
        xml+=makeXML(this.name,"prname");
        xml+=makeXML(this.idNum,"idnum");
        for(var i=0;i<this.workflows.length;i++){
            if(this.workflows[i].xmlData==null)this.workflows[i].toXML();
            xml+=serializer.serializeToString(this.workflows[i].xmlData);
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
    
    //Import a project from xml. isAppend will create new workflows, otherwise we clear the project first.
    fromXML(xmlData,isAppend){
        var parser = new DOMParser();
        if(isAppend)xmlData = this.assignNewIDsToXML(xmlData);
        var xmlDoc = parser.parseFromString(xmlData,"text/xml");
        if(!isAppend){
            this.clearProject();
            this.setName(getXMLVal(xmlDoc,"prname"));
            this.idNum = int(getXMLVal(xmlDoc,"idnum"));
        }
        var startWF = this.workflows.length;
        var xmlwfs = xmlDoc.getElementsByTagName("workflow");
        for(var i=0;i<xmlwfs.length;i++){
            this.addWorkflowFromXML(xmlwfs[i]);
        }
        for(i=startWF;i<this.workflows.length;i++){
            var wf = this.workflows[i];
            for(var j=0;j<wf.usedWF.length;j++){
                console.log(wf.usedWF);
                this.addChild(wf,this.getWFByID(wf.usedWF[j]),false);
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
        else if(type=="program")wf = new Programflow(this.container,this);
        else wf = new Courseflow(this.container,this);
        this.addButton(wf,this.layout);
        this.workflows.push(wf);
        return wf;
    }
    
    addWorkflowFromXML(xml){
        var wf = this.addWorkflow(getXMLVal(xml,"wftype"));
        wf.id=getXMLVal(xml,"wfid");
        wf.setName(getXMLVal(xml,"wfname"));
        wf.usedWF = getXMLVal(xml,"usedwfARRAY");
        wf.xmlData=xml;
        return wf;
    }
    
    
    
    addChild(wfp,wfc,recurse=true){
        console.log(wfp.name);
        console.log(wfc.name);
        //If child is at the root level, remove its button
        if(wfc.buttons!=null&&wfc.buttons.length>0&&wfc.buttons[0].parentElement.id=="layout"){
            this.removeButton(wfc,wfc.buttons[0]);
        }
        //Add it to the parent at all locations in the tree
        console.log(wfp.buttons);
        console.log(wfc.buttons);
        for(var i=0;i<wfp.buttons.length;i++){
            console.log("adding button for "+wfc.name);
            this.addButton(wfc,wfp.buttons[i],recurse);
        }
    }
    
    updateHiddenChildren(wfp,button){
        var des={};
        des = this.getNumberOfDescendants(wfp,des);
        console.log(des);
        var text = "... ";
        for (var propt in des){
            var s = propt;
            if(des[propt]!=1){
                s=s.replace(/y$/,"ie");
                s+="s";
            }
            text+=des[propt]+" ";
            text+=s+", ";
        }
        text = text.replace(/, $/,"");
        button.hiddenchildren.innerHTML = text;
    }
    
    getNumberOfDescendants(wfp,des){
        var usedWF = wfp.usedWF;
        for(var i=0;i<usedWF.length;i++){
            var wfc = this.getWFByID(usedWF[i]);
            if(des[wfc.getType()]==null)des[wfc.getType()]=1;
            else des[wfc.getType()]=des[wfc.getType()]+1;
            des = this.getNumberOfDescendants(wfc,des);
            
        }
        return des;
    }
    
    removeChild(wfp,wfc){
        //Remove the button from all instances of the parent, but only once (we might use the same activity twice in one course)
        for(var i=0;i<wfp.buttons.length;i++){
            for(var j=0;j<wfc.buttons.length;j++){
                if(wfc.buttons[j].parentElement == wfp.buttons[i]){
                    this.removeButton(wfc,wfc.buttons[j]);
                    break;
                }
            }
        }
        //wfp.removeUsedWF(wfc.id);
        //if no instances still exist, move it back into the root
        if(wfc.buttons.length==0)this.addButton(wfc,this.layout);
    }
    
    //Causes the workflow to delete itself and all its contents
    deleteWF(wf){
        for(var i=wf.usedWF.length-1;i>=0;i--){
            this.removeChild(wf,this.getWFByID(wf.usedWF[i]));
        }
        //Seek out all wf that use this one, remove it from usedWF and from any nodes that use it
        for(i=0;i<this.workflows.length;i++){
            var wfp = this.workflows[i];
            wfp.purgeUsedWF(wf);
        }
        for(i=0;i<wf.buttons.length;i++){
            this.removeButton(wf,wf.buttons[i]);
        }
        if(this.workflows.indexOf(wf)==this.activeIndex){
            this.workflows[this.activeIndex].makeInactive();
            this.activeIndex=null;
        }else if(this.workflows.indexOf(wf)<this.activeIndex){
            this.activeIndex--;
        }
        this.workflows.splice(this.workflows.indexOf(wf),1);
    }
    
    fillWFSelect(select){
        var opt = document.createElement('option');
        opt.text="Activity";
        opt.value="activity";
        select.add(opt);
        opt = document.createElement('option');
        opt.text="Course";
        opt.value="course";
        select.add(opt);
        opt = document.createElement('option');
        opt.text="Program";
        opt.value="program";
        select.add(opt);
    }
    
    //moves the button up or down. If it's at the root level, this entails switching the workflow ordering and then switching the order of the buttons. If it's NOT at the root level, we have to switch it in usedWF of the parent, then switch the order of the buttons.
    moveButton(button,wf,up){
        var parent = button.parentElement;
        var wf2;
        var myindex = Array.prototype.indexOf.call(parent.childNodes,button);
        if(up&&myindex>0&&parent.childNodes[myindex-1].className==button.className){
            //move it up
            wf2 = parent.childNodes[myindex-1].wf;
            parent.insertBefore(parent.childNodes[myindex],parent.childNodes[myindex-1]);

        }else if(!up&&myindex<parent.childNodes.length-1&&parent.childNodes[myindex+1].className==button.className){
            //move it down
            wf2 = parent.childNodes[myindex+1].wf;
            parent.insertBefore(parent.childNodes[myindex+1],parent.childNodes[myindex]);
        }
        if(wf2!=null){
            if(parent.className!=button.className){
                [this.workflows[this.workflows.indexOf(wf)],this.workflows[this.workflows.indexOf(wf2)]] = [this.workflows[this.workflows.indexOf(wf2)],this.workflows[this.workflows.indexOf(wf)]];
            }else{
                var wfp = parent.wf;
                wfp.swapUsedIndices(wf.id,wf2.id);
                
            }
        }
    }
    
    addButton(wf,container,recurse=true){
        if(container.wf!=null)this.updateHiddenChildren(container.wf,container);
        var bdiv = document.createElement('div');
        var bwrap = document.createElement('div');
        var b = document.createElement('button');
        bdiv.className = "layoutdiv";
        bwrap.className = "layoutbuttonwrap";
        b.innerHTML=wf.name;
        if(wf instanceof Programflow)b.className="layoutprogram";
        else if(wf instanceof Courseflow)b.className="layoutcourse";
        else b.className="layoutactivity";
        var p = this;
        b.onclick=function(){
            p.changeActive(p.getWFIndex(wf));
        }
        bwrap.appendChild(b);
        var edit = document.createElement('div');
        edit.className = "editlayoutdiv";
        var up = document.createElement('a');
        up.className="layoutchange";
        up.innerHTML="&#708";
        up.href="#";
        up.onclick=function(){
            p.moveButton(bdiv,wf,true);
        }
        edit.appendChild(up);
        var down = document.createElement('a');
        down.className="layoutchange";
        down.innerHTML="&#709";
        down.href="#";
        down.onclick=function(){
            p.moveButton(bdiv,wf,false);
        }
        edit.appendChild(down);
        bwrap.appendChild(edit);
        var del = document.createElement('div');
        del.className="deletelayoutdiv";
        var nameIcon = document.createElement('img');
        nameIcon.src="resources/images/edit16.png";
        nameIcon.style.width='16px';
        nameIcon.onclick=function(){
            var tempfunc = b.onclick;
            //create an input, on enter or exit make that the new name
            b.innerHTML="<input type='text' value = '"+wf.name+"'placeholder='<type a new name here>'></input>";
            b.firstElementChild.focus();
            b.firstElementChild.select();
            b.onclick=null;
            p.container.onclick=function(){
                if(b.firstElementChild!=null)b.firstElementChild.blur();
                p.container.onclick=null;
            };
            b.firstElementChild.addEventListener("focusout",function(){
                b.onclick=tempfunc;
                if(b.firstElementChild.value=="")b.innerHTML=wf.name;
                else wf.setName(b.firstElementChild.value,true);
            });
        }
        del.appendChild(nameIcon);
        var delicon = document.createElement('img');
        delicon.src="resources/images/delrect16.png";
        delicon.style.width='16px';
        delicon.onclick=function(){
            if(mxUtils.confirm("Delete this workflow? Warning: this will all contents (but not any workflows used by it)!")){
                p.deleteWF(wf);
            }
        }
        del.appendChild(delicon);
        bwrap.appendChild(del);
        bdiv.appendChild(bwrap);
        var expandDiv = document.createElement('div');
        expandDiv.className="expanddiv";
        var expandIcon = document.createElement('img');
        expandIcon.src="resources/images/plus16.png";
        expandIcon.style.width='16px';
        expandIcon.onclick=function(){
            if(bdiv.classList.contains("expanded")){p.collapseButton(bdiv);}
            else {p.expandButton(bdiv);}
        }
        expandDiv.appendChild(expandIcon);
        bdiv.appendChild(expandDiv);
        bdiv.expandIcon = expandIcon;
        
        var hiddenchildren = document.createElement('div');
        hiddenchildren.className = "hiddenchildrendiv";
        hiddenchildren.onclick = expandIcon.onclick;
        bdiv.appendChild(hiddenchildren);
        bdiv.hiddenchildren=hiddenchildren;
        if(container.classList.contains("layoutdiv"))container.classList.add("haschildren");
        bdiv.wf=wf;
        container.appendChild(bdiv);
        wf.buttons.push(bdiv);
        if(recurse)for(var i=0;i<wf.usedWF.length;i++){
            this.addButton(this.getWFByID(wf.usedWF[i]),bdiv);
        }
    }
    
    collapseButton(button){
        button.classList.remove("expanded");
        button.expandIcon.src="resources/images/plus16.png";
    }
    expandButton(button){
        button.classList.add("expanded");
        button.expandIcon.src="resources/images/minus16.png";
    }
    
    removeButton(wfp,button){
        if(button.parentElement.wf!=null)this.updateHiddenChildren(button.parentElement.wf,button.parentElement);
        for(var i=0;i<wfp.usedWF.length;i++){
            var wfc = this.getWFByID(wfp.usedWF[i]);
            for(var j=0;j<wfc.buttons.length;j++){
                if(wfc.buttons[j].parentElement==button){
                    this.removeButton(wfc,wfc.buttons[j]);
                    
                }
            }
        }
        
        if(button.parentElement.classList.contains("layoutdiv")&&button.parentElement.wf.usedWF.length==0){button.parentElement.classList.remove("haschildren");button.parentElement.classList.remove("expanded");}
        wfp.buttons.splice(wfp.buttons.indexOf(button),1);
        button.parentElement.removeChild(button);
        
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
        var p = this;
		//create minimap
        var minimap = document.getElementById('outlineContainer');
        var outln = new mxOutline(graph, minimap);
        
        
        var editbar = this.editbar;
        
        //graph.panningHandler.useLeftButtonForPanning = true;
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
        
        
        //mxConnectionHandler.prototype.connectImage = new mxImage('resources/images/add24.png', 16, 16);
        
        //display a popup menu when user right clicks on cell, but do not select the cell
        graph.panningHandler.popupMenuHandler = false;
        //expand menus on hover
        graph.popupMenuHandler.autoExpand = true;
        //disable regular popup
        mxEvent.disableContextMenu(container);
        
        
        //Disable cell movement associated with user events
        graph.moveCells = function (cells, dx,dy,clone,target,evt,mapping){
            if(cells.length==1&&cells[0].isComment){
                cells[0].comment.x+=dx;
                cells[0].comment.y+=dy;
                return mxGraph.prototype.moveCells.apply(this,[cells,dx,dy,clone,target,evt,mapping]);
            }
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
                    var newColName = wf.findNearestColumn(newx);
                    if(newColName!=cell.node.column)cell.node.setColumn(newColName);
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
                }else if(cells.length==1 && cells[0].isHead){
                    //as above but with only the horizontal movement
                    var cell = cells[0];
                    var wf = cell.column.wf;
                    var columns=wf.columns;
                    //start from center of this cell
                    newx=newx+cell.w()/2;
                    //column index
                    var colIndex=wf.columns.indexOf(cell.column);
                    if(colIndex>0 && Math.abs(columns[colIndex].pos-newx)>Math.abs(columns[colIndex-1].pos-newx)){
                        //swap this column with that to the left
                        wf.swapColumns(colIndex,colIndex-1);
                    }
                    if(colIndex<columns.length-1 && Math.abs(columns[colIndex].pos-newx)>Math.abs(columns[colIndex+1].pos-newx)){
                        //swap this column with that to the right
                        wf.swapColumns(colIndex,colIndex+1);
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
                            if(Math.abs(dh)>cellSpacing+next.vertex.h()/2){
                                var delta = (next.vertex.y()-cell.y())*(isTop) + (next.vertex.b()-cell.b())*(!isTop);
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
            if(!cell.isNode){graph.clearSelection();return;};
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
        //Redirect clicks and drags to parent
        var graphHandlerGetInitialCellForEvent = mxGraphHandler.prototype.getInitialCellForEvent;
        mxGraphHandler.prototype.getInitialCellForEvent = function(me){
            var cell = graphHandlerGetInitialCellForEvent.apply(this, arguments);
            while (this.graph.isPart(cell)){
                cell = this.graph.getModel().getParent(cell)
            }
            return cell;
        };
       
        //Adds an event listener to handle the drop down collapse/expand of nodes
        graph.addListener(mxEvent.CLICK,function(sender,evt){
            var cell = evt.getProperty('cell');
           if(cell!=null&&cell.isDrop){
               cell.node.toggleDropDown();
           }else if (cell!=null&&cell.isComment){
               cell.comment.show();
           }
            container.focus();
        });
        
        //Add an event listener to handle double clicks to nodes, which, if they have a linked wf, will change the active wf
        graph.addListener(mxEvent.DOUBLE_CLICK,function(sender,evt){
            var cell = evt.getProperty('cell');
           if(cell!=null){
               while (graph.isPart(cell)){cell = graph.getModel().getParent(cell);}
               if(cell.isNode){
                   var node = cell.node;
                   var linkedWF = node.linkedWF;
                   if(linkedWF!=null)p.changeActive(p.workflows.indexOf(p.getWFByID(linkedWF)));
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
                    if(cell!=null){
                        while (graph.isPart(cell)){cell = graph.getModel().getParent(cell);}
                        //check if this was a click, rather than a drag
                        if(cell.isNode&&Math.sqrt(Math.pow(downx-me.graphX,2)+Math.pow(downy-me.graphY,2))<2){
                            editbar.enable(cell.node);
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
                                for(var i=0;i<cell.cellOverlays.length;i++){
                                    graph.addCellOverlay(cell,cell.cellOverlays[i]);
                                }
                                //add the listener that will remove these once the mouse exits
                                graph.addMouseListener({
                                    mouseDown: function(sender,me){},
                                    mouseUp: function(sender,me){},
                                    mouseMove: function(sender,me){
                                        if(graph.view.getState(cell)==null){graph.removeMouseListener(this);return;}
                                        var exitrect = new mxRectangle(me.getGraphX()-exitPadding/2,me.getGraphY()-exitPadding/2,exitPadding,exitPadding);
                                        if(!mxUtils.intersects(exitrect,graph.view.getState(cell))){
                                            graph.removeCellOverlay(cell);
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
			mxConstraintHandler.prototype.pointImage = new mxImage('resources/images/port24.png', 10, 10);
        var ports = new Array();
        ports['OUTw'] = {x: 0, y: 0.6, perimeter: true, constraint: 'west'};
        ports['OUTe'] = {x: 1, y: 0.6, perimeter: true, constraint: 'east'};
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
        
        //make the non-default connections through our own functions, so that we can keep track of what is linked to what. The prototype is saved in mxConstants, so that we don't keep overwriting it.
        mxConnectionHandler.prototype.insertEdge = function(parent,id,value,source,target,style){
            var edge = insertEdgePrototype.apply(this,arguments);
            if(source.isNode && target.isNode){
                graph.setCellStyle(defaultEdgeStyle,[edge]);
                source.node.addFixedLinkOut(target.node,edge);
            }
            return edge;
        }
        
        
        
        this.graph = graph;
        
    }
    //Since this assigns a bunch of IDs without actually increasing idNum, it should only be called when an xml file is about to be imported into the project and IDs generated.
    assignNewIDsToXML(xml,doWorkflows=true){
        var xmlString = xml;//(new XMLSerializer()).serializeToString(xml);
        var id = this.idNum+1;
        //Nodes
        while(xmlString.indexOf("<id>")>=0){
            var startIndex=xmlString.indexOf("<id>");
            var endIndex = xmlString.indexOf("</id>");
            var replaceId=xmlString.substring(startIndex+4,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<tempid>"+id+"</tempid>"+xmlString.substring(endIndex+5);
            //cycle through all the links. Linked IDs need to be updated, otherwise they'll link to random things.
            while(xmlString.indexOf("<topnode>"+replaceId+"</topnode>")>=0){xmlString = xmlString.replace("<topnode>"+replaceId+"</topnode>","<topnode>temporaryID"+id+"</topnode>");}
            while(xmlString.indexOf("<bottomnode>"+replaceId+"</bottomnode>")>=0){xmlString = xmlString.replace("<bottomnode>"+replaceId+"</bottomnode>","<bottomnode>temporaryID"+id+"</bottomnode>");}
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"fixedLinkARRAY",replaceId,""+id);
            id++;
        }
        //Weeks
        while(xmlString.indexOf("<weekid>")>=0){
            var startIndex=xmlString.indexOf("<weekid>");
            var endIndex = xmlString.indexOf("</weekid>");
            var replaceId=xmlString.substring(startIndex+8,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<weektempid>"+id+"</weektempid>"+xmlString.substring(endIndex+9);
            id++;
        }
        //Workflows
        if(doWorkflows)while(xmlString.indexOf("<wfid>")>=0){
            var startIndex=xmlString.indexOf("<wfid>");
            var endIndex = xmlString.indexOf("</wfid>");
            var replaceId=xmlString.substring(startIndex+6,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<wftempid>"+id+"</wftempid>"+xmlString.substring(endIndex+7);
            //cycle through all the links. Linked IDs need to be updated, otherwise they'll link to random things.
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"usedwfARRAY",replaceId,""+id);
            id++;
        }
        //replace all those temp id tage with real ones.
        while(xmlString.indexOf("tempid>")>=0)xmlString = xmlString.replace("tempid>","id>");
        while(xmlString.indexOf("temporaryID")>=0)xmlString = xmlString.replace("temporaryID","");
        //save the new id number
        this.idNum=id;
        //return as string
        return xmlString;
        
    }
    
    assignNewIDsToXMLArrays(xmlString,arrayName,oldID,newID){
        var currentIndex=0;
        while(xmlString.indexOf("<"+arrayName+">",currentIndex)>=0){
            currentIndex = xmlString.indexOf("<"+arrayName+">",currentIndex);
            var endIndex = xmlString.indexOf("</"+arrayName+">",currentIndex);
            var indexArray= xmlString.substring(currentIndex+("<"+arrayName+">").length,endIndex).split(",");
            while(indexArray.indexOf(oldID)>=0){indexArray.splice(indexArray.indexOf(oldID),1,newID+"temporaryID");}
            xmlString = xmlString.substring(0,currentIndex+("<"+arrayName+">").length) + indexArray.join(',') + xmlString.substring(endIndex);
            currentIndex=endIndex;
        }
        return xmlString;
    }
}
