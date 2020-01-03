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
        this.competencies=[];
        this.graph;
        this.activeWF;
        this.activeComp;
        this.container=container;
        this.sidenav = document.getElementById("sidenav");
        this.layout = document.getElementById("layout");
        this.newWFDiv = document.getElementById("newWFDiv");
        this.newWFButton;
        this.compDiv = document.getElementById("competencydiv");
        this.newCompDiv = document.getElementById("newCompDiv");
        this.newCompButton;
        this.nameDiv = document.getElementById("prname");
        var p = this;
        this.idNum=0;
        this.loadAppend=false;
        this.name = "New Project";
        this.readOnly=false;
        
        
        makeResizable(this.sidenav,"right");
        
        
        //Add the ability to edit the name of the project
        var nameIcon = document.createElement('img');
        nameIcon.src="resources/images/edit16.png";
        nameIcon.style.width='16px';
        var nameDiv = this.nameDiv;
        nameDiv.parentElement.onclick=function(){
            if(p.readOnly)return;
            var tempfunc = nameDiv.onclick;
            var name=p.name;
            if(name==null)name="";
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
            gaEvent('Workflow','Add',type,p.workflows.length);
            p.changeActive(p.workflows.length-1)
        }
        this.newWFButton = newWF;
        this.newWFDiv.appendChild(newWF);
        
        var newComp = document.createElement('button');
        newComp.innerHTML="Create New";
        newComp.onclick = function(){
            p.addCompetency();
            gaEvent('Outcome','Add','',p.competencies.length);
            p.changeActive(p.competencies.length-1,false);
        }
        this.newCompButton = newComp;
        this.newCompDiv.appendChild(newComp);
        
        
        
        var newfile = document.getElementById('new');
        newfile.onclick = function(){
            if(mxUtils.confirm("Are you sure you want to continue? You will lose any unsaved work.")){
                p.clearProject();
            }
        }
        
        var save = document.getElementById('save');
        save.onclick = function(){
            try{
                p.saveProject();
                gaEvent('Save/Open','Save',p.name,p.workflows.length+p.competencies.length);
            }catch(err){
                alert("Oops! The file could not be saved.");
                gaError("Save",err);
            }
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
                try{
                    p.fromXML(readData,p.loadAppend);
                    gaEvent('Save/Open','Open',p.name,p.workflows.length+p.competencies.length);
                }catch(err){
                    alert("Oops! The file could not be opened.");
                    gaError("Open",err);
                }
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
            gaEvent('Save/Open','Export',p.name,p.workflows.length+p.competencies.length);
            p.exportCurrent();
        }
        
        var importWF = document.getElementById('import');
        importWF.onclick = function(){
            if(p.readOnly)return;
            p.loadAppend=true;
            p.fileLoader.click();
            gaEvent('Save/Open','Import',p.name,p.workflows.length+p.competencies.length);
        }
        
        var saveReadOnly = document.getElementById('savereadonly');
        saveReadOnly.onclick = function(){
            gaEvent('Save/Open','Save Read Only',p.name,p.workflows.length+p.competencies.length);
            p.saveProject(true);
        }
        
        var printWF = document.getElementById("print");
        printWF.onclick = function(){
            p.printActiveWF();
            gaEvent('Save/Open','Print',p.name,p.workflows.length+p.competencies.length);
        }
        
        var undoButton = document.getElementById("undo");
        undoButton.onclick = function(){
            if(p.activeWF!=null&&!p.readOnly){
                try{
                    p.workflows[p.activeWF].undo();
                }catch(err){
                    alert("Oops! Something went wrong with the undo function.");
                    gaError('Undo',err);
                }
            }
        }
        
        var redoButton = document.getElementById("redo");
        redoButton.onclick = function(){
            if(p.activeWF!=null&&!p.readOnly){
                try{
                    p.workflows[p.activeWF].redo();
                }catch(err){
                    alert("Oops! Something went wrong with the redo function.");
                    gaError('Undo',err);
                }
            }
        }
        
        
        var expand = document.getElementById("expand");
        var collapse = document.getElementById("collapse");
        expand.onclick = function(){if(p.activeWF!=null)makeLoad(function(){p.workflows[p.activeWF].expandAllNodes();})};
        collapse.onclick = function(){if(p.activeWF!=null)makeLoad(function(){p.workflows[p.activeWF].expandAllNodes(false);})};
        
        var showLegend = document.getElementById("showlegend");
        showLegend.onclick = function(){if(p.activeWF!=null&&p.workflows[p.activeWF].view)p.workflows[p.activeWF].view.showLegend();};
        
        var outcomeView = document.getElementById("outcomeview");
        outcomeView.onclick = function(){
            if(p.activeWF!=null){
                var wf = p.workflows[p.activeWF];
                gaEvent('View','Outcomes Toggled',wf.getType(),wf.tagSets.length);
                if(wf.view instanceof Workflowview){
                    wf.makeInactive();
                    var view;
                    if(wf instanceof Programflow)view = new ProgramOutcomeview(p.container,wf);
                    else view = new Outcomeview(p.container,wf);
                    wf.makeActive(view);
                }else if(wf.view instanceof Outcomeview){
                    wf.makeInactive();
                    wf.makeActive(new Workflowview(p.container,wf));
                }
                
            }
        }
        
        var genHelp = document.getElementById("genhelp");
        genHelp.onclick = function(){p.showHelp("help.html");}
        var layoutHelp = document.getElementById("layouthelp");
        layoutHelp.onclick = function(){p.showHelp("layouthelp.html");}
        
        
        var helpDiv = document.getElementById("helpDiv");
        
        var dragHandle = document.createElement('div');
        $("#helpDiv").draggable({
            start: function(event, ui){
                ui.helper.append($("<div/>", {
                    id: "iframe-barrier",
                    css: {
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        "z-index": 10
                    }
                }));
            },stop: function(event, ui) {
                $("#iframe-barrier", ui.helper).remove();
            }
        });
        $("#helpDiv").resizable({
            start: function(event, ui){
                ui.element.append($("<div/>", {
                    id: "iframe-barrier",
                    css: {
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        "z-index": 10
                    }
                }));
            },stop: function(event, ui) {
                $("#iframe-barrier", ui.element).remove();
            }
        });
        
        var helpDivHide = document.getElementById("helpDivHide");
        helpDivHide.onclick = function(){document.getElementById("helpFrame").parentElement.classList.remove("active");}
        
        
        
        
        //Keyboard shortcuts
        document.addEventListener("keydown",function(evt){
            if(!evt.ctrlKey)return;
            switch(evt.key.toLowerCase()){
                case "z":
                    if(evt.shiftKey)redoButton.click();
                    else undoButton.click();
                    break;
                case "s":
                    evt.preventDefault();
                    save.click();
                    break;
                case "o":
                    open.click();
                    break;
                case "n":
                    evt.preventDefault();
                    newfile.click();
                    break;
                case "l":
                    evt.preventDefault();
                    showLegend.click();
                    break;
                case "q":
                    evt.preventDefault();
                    outcomeView.click();
                    break;
            }
            
        });
        
        document.addEventListener("click",function(evt){
            if(p.activeWF!=null&&!p.container.contains(evt.target)){
                var wf = p.workflows[p.activeWF];
                if(wf.view==null||wf.view.graph==null)return;
                if(!wf.view.editbar.container.parentElement.contains(evt.target))wf.view.graph.clearSelection();
            }
        });
        
        
        
		
    }
    
    saveProject(readOnly=false){
        this.toXML(readOnly);
        var filename = this.name;
        if(readOnly)filename+="_ReadOnly";
        filename+='.xml';
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
        var serializer = new XMLSerializer();
        var wf;
        if(this.activeWF!=null)wf = this.workflows[this.activeWF];
        else if(this.activeComp!=null)wf = this.competencies[this.activeComp];
        else return;
        var children=[];
        if(wf instanceof Workflow) children= this.getDependencies(wf);
        var exported=[];
        var xml = "";
        xml+=makeXML(wf.name,"prname");
        xml+=makeXML(this.idNum,"idnum");
        xml+=wf.toXML();
        for(var i=0;i<children.length;i++){
            if(exported.indexOf(children[i])>=0)continue;
            exported.push(children[i]);
            xml+=children[i].toXML();
        }
        xml = makeXML(xml,"project");
        var filename = wf.name+".xml";
        this.saveXML(xml,filename);
    }
    
    getDependencies(wf){
        var array = [];
        for(var i=0;i<wf.children.length;i++){
            array.push(wf.children[i]);
            array = array.concat(this.getDependencies(wf.children[i]));
        }
        if(wf.tagSets.length>0){
            for(i=0;i<wf.tagSets.length;i++){
                var tag = wf.tagSets[i];
                while (tag.depth>0)tag=tag.parentTag;
                array.push(tag);
            }
        }else if(wf.xmlData!=null){
            if(getXMLVal(wf.xmlData,"tagsetARRAY")!=null){
                var tagset = getXMLVal(wf.xmlData,"tagsetARRAY");
                for(i=0;i<tagset;i++){
                    var tag = this.getTagByID(tagset[i]);
                    while (tag.depth>0)tag=tag.parentTag;
                    array.push(tag);
                }
            }
        }
        return array;
    }
    
    makeReadOnly(readOnly){
        var p = this;
        if(p.readOnly==readOnly)return;
        p.readOnly=readOnly;
        p.newWFButton.disabled=readOnly;
        p.newCompButton.disabled=readOnly;
        if(readOnly)document.body.classList.add("readonly");
        else document.body.classList.remove("readonly");
    }
    
    duplicateActiveWF(){
        if(this.activeWF==null)return;
        var wf = this.workflows[this.activeWF];
        var xml = (new DOMParser()).parseFromString(this.assignNewIDsToXML(this.workflows[this.activeWF].toXML(),false),"text/xml");
        var wfcopy = this.addWorkflowFromXML(xml);
        wfcopy.setName(wf.name+" (Copy)");
        wfcopy.id = this.genID();
        wfcopy.children = wf.children;
        wfcopy.tagSets = wf.tagSets;
        for(var i=0;i<wfcopy.children.length;i++){
            wfcopy.children[i].addButton(wfcopy.buttons[0].childdiv);
        }
        
    }
    
    printActiveWF(){
        if(this.graph==null)return;
        var scale = mxUtils.getScaleForPageCount(1, this.graph)*0.9;
        var preview = new mxPrintPreview(this.graph, scale,mxConstants.PAGE_FORMAT_A4_PORTRAIT);
        preview.open();
    }
    
    setName(name){
        name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
        this.name=name;
        this.nameDiv.innerHTML=name;
    }
    
    
    
    toXML(readOnly=false){
        var xml = "";
        var serializer = new XMLSerializer();
        xml+=makeXML(this.name,"prname");
        xml+=makeXML(this.idNum,"idnum");
        if(readOnly)xml+=makeXML("true","readonly");
        for(var i=0;i<this.workflows.length;i++){
            xml+=this.workflows[i].toXML();
        }
        for(var i=0;i<this.competencies.length;i++){
            xml+=this.competencies[i].toXML();
        }
        this.xmlData = makeXML(xml,"project");
    }
    
    clearProject(){
        if(this.activeWF!=null){this.workflows[this.activeWF].makeInactive();this.activeWF=null;}
        if(this.activeComp!=null){this.competencies[this.activeComp].makeInactive(this.container);this.activeComp=null;}
        while(this.layout.childElementCount>0)this.layout.removeChild(this.layout.firstElementChild);
        this.workflows=[];
        while(this.compDiv.childElementCount>0)this.compDiv.removeChild(this.compDiv.firstElementChild);
        this.competencies=[];
        this.name="New Project";
        this.nameDiv.innerHTML = this.name;
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
            var readOnly = getXMLVal(xmlDoc,"readonly");
            if(readOnly)this.makeReadOnly(true);
            else this.makeReadOnly(false);
        }
        var startWF = this.workflows.length;
        var xmltags = [];
        for(var i=0;i<xmlDoc.childNodes[0].childNodes.length;i++){
            if(xmlDoc.childNodes[0].childNodes[i].tagName=="tag")xmltags.push(xmlDoc.childNodes[0].childNodes[i]);
        }
        for(i=0;i<xmltags.length;i++){
            this.addCompetencyFromXML(xmltags[i]);
        }
        var xmlwfs = xmlDoc.getElementsByTagName("workflow");
        for(i=0;i<xmlwfs.length;i++){
            this.addWorkflowFromXML(xmlwfs[i]);
        }
        for(i=startWF;i<this.workflows.length;i++){
            var wf = this.workflows[i];
            for(var j=0;j<wf.usedWF.length;j++){
                wf.addChild(this.getWFByID(wf.usedWF[j]),false);
            }
            if(wf.tagsetArray!=null)for(j=0;j<wf.tagsetArray.length;j++){
                wf.addTagSet(this.getTagByID(wf.tagsetArray[j]));
            }
        }
        this.xmlData = xmlData;
    }
    
    genID(){
        this.idNum=""+(int(this.idNum)+1);
        return ""+this.idNum;
    }
    
    addWorkflow(type){
        var wf;
        if(type=="activity")wf = new Activityflow(this.container,this);
        else if(type=="program")wf = new Programflow(this.container,this);
        else wf = new Courseflow(this.container,this);
        wf.addButton(this.layout);
        this.workflows.push(wf);
        return wf;
    }
    
    addCompetency(){
        var tag = new Tag(this,null);
        tag.addButton(this.compDiv);
        this.competencies.push(tag);
        return tag;
    }
    
    addWorkflowFromXML(xml){
        var wf = this.addWorkflow(getXMLVal(xml,"wftype"));
        wf.fromXML(xml);
        return wf;
    }
    
    addCompetencyFromXML(xml){
        var tag = this.addCompetency();
        tag.fromXML(xml);
    }
    
    
    
    
    getNumberOfDescendants(wfp,des){
        var children = wfp.getChildren();
        for(var i=0;i<children.length;i++){
            var wfc = children[i];
            if(des[wfc.getType()]==null)des[wfc.getType()]=1;
            else des[wfc.getType()]=des[wfc.getType()]+1;
            des = this.getNumberOfDescendants(wfc,des);
            
        }
        return des;
    }
    
    
    //Causes the workflow to delete itself and all its contents
    deleteWF(wf){
        for(var i=wf.children.length-1;i>=0;i--){
            wf.removeChild(wf.children[i]);
        }
        //Seek out all wf that use this one, remove it from children and from any nodes that use it
        for(i=0;i<this.workflows.length;i++){
            var wfp = this.workflows[i];
            wfp.purgeUsedWF(wf);
        }
        while(wf.buttons.length>0){
            wf.removeButton(wf.buttons[0]);
        }
        if(this.activeWF!=null){
            if(wf.isActive){
                this.workflows[this.activeWF].makeInactive();
                this.activeWF=null;
            }else if(this.workflows.indexOf(wf)<this.activeWF){
                this.activeWF--;
            }
        }
        this.workflows.splice(this.workflows.indexOf(wf),1);
    }
    
    //Causes the competency to delete itself and all its contents
    deleteComp(tag){
        //Seek out all wf that use this one, remove it from tags and from any nodes that use it
        for(var i=0;i<this.workflows.length;i++){
            var wf = this.workflows[i];
            wf.removeTagSet(tag);
        }
        for(i=0;i<tag.buttons.length;i++){
            tag.removeButton(tag.buttons[i]);
        }
        if(this.activeComp!=null){
            if(tag.isActive){
                this.competencies[this.activeComp].makeInactive(this.container);
                this.activeComp=null;
            }else if(this.competencies.indexOf(tag)<this.activeComp){
                this.activeComp--;
            }
        }
        this.competencies.splice(this.competencies.indexOf(tag),1);
        if(this.activeWF!=null&&this.workflows[this.activeWF].tagSelect!=null){
            this.workflows[this.activeWF].populateTagBar();
            this.workflows[this.activeWF].populateTagSelect(this.competencies);
        }
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
    
    getWFIndex(wf){
        return this.workflows.indexOf(wf);
    }
    
    getCompIndex(tag){
        return this.competencies.indexOf(tag);
    }
    
    getWFByID(id){
        for(var i=0;i<this.workflows.length;i++){
            if(this.workflows[i].id==id)return this.workflows[i];
        }
        return null;
    }
    
    getCompByID(id){
        for(var i=0;i<this.competencies.length;i++){
            if(this.competencies[i].id==id)return this.competencies[i];
        }
        return null;
    }
    
    getTagByID(id){
        for(var i=0;i<this.competencies.length;i++){
            var tag = this.competencies[i].getTagByID(id);
            if(tag!=null)return tag;
        }
        return null;
    }
    
    changeActive(index,isWF=true){
        var p = this;
        makeLoad(function(){
            if(p.activeWF!=null)p.workflows[p.activeWF].makeInactive();
            if(p.activeComp!=null)p.competencies[p.activeComp].makeInactive();
            if(isWF){
                p.activeComp = null;
                p.activeWF=index;
                p.workflows[p.activeWF].makeActive(new Workflowview(p.container,p.workflows[p.activeWF]));
            }else{
                p.activeWF = null;
                p.activeComp=index;
                p.competencies[p.activeComp].makeActive(new Tagbuilder(p.container,p.competencies[p.activeComp]));
            }
        });
    }
    
    showHelp(url){
        gaEvent('View','Help',url,this.workflows.length+this.competencies.length);
        var helpFrame = document.getElementById("helpFrame");
        helpFrame.src = "resources/helpdocs/"+url;
        helpFrame.parentElement.classList.add("active");
        
    }
    
    
    
    //Since this assigns a bunch of IDs without actually increasing idNum, it should only be called when an xml file is about to be imported into the project and IDs generated.
    assignNewIDsToXML(xml,doWorkflows=true){
        var xmlString = xml;//(new XMLSerializer()).serializeToString(xml);
        var id = int(this.idNum)+1;
        //Nodes
        while(xmlString.indexOf("<id>")>=0){
            var startIndex=xmlString.indexOf("<id>");
            var endIndex = xmlString.indexOf("</id>");
            var replaceId=xmlString.substring(startIndex+4,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<tempid>"+id+"</tempid>"+xmlString.substring(endIndex+5);
            //cycle through all the links. Linked IDs need to be updated, otherwise they'll link to random things.
            while(xmlString.indexOf("<topnode>"+replaceId+"</topnode>")>=0){xmlString = xmlString.replace("<topnode>"+replaceId+"</topnode>","<topnode>temporaryID"+id+"</topnode>");}
            while(xmlString.indexOf("<bottomnode>"+replaceId+"</bottomnode>")>=0){xmlString = xmlString.replace("<bottomnode>"+replaceId+"</bottomnode>","<bottomnode>temporaryID"+id+"</bottomnode>");}
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"fixedlinkARRAY",replaceId,""+id);
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
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"linkedwf",replaceId,""+id);
            id++;
        }
        if(doWorkflows)while(xmlString.indexOf("<tagid>")>=0){
            var startIndex=xmlString.indexOf("<tagid>");
            var endIndex = xmlString.indexOf("</tagid>");
            var replaceId=xmlString.substring(startIndex+7,endIndex);
            xmlString=xmlString.substring(0,startIndex)+"<tagtempid>"+id+"</tagtempid>"+xmlString.substring(endIndex+8);
            //cycle through all the links. Linked IDs need to be updated, otherwise they'll link to random things.
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"tagsetARRAY",replaceId,""+id);
            xmlString = this.assignNewIDsToXMLArrays(xmlString,"tagARRAY",replaceId,""+id);
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
