//The node and link classes, as well as the many extensions of each node. Each distinct node type is a separate extension of the base class, characterized by the ways in which it differs from default behaviours.

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

class CFNode {
    constructor(wf){
        this.lefticon;
        this.righticon;
        this.name;
        this.column;
        this.week;
        this.text;
        this.textHeight=100;
        this.isDropped=false;
        this.wf=wf;
        this.linkedWF;
        this.id = this.wf.project.genID();
        this.autoLinkOut = new WFAutolink(this);
        this.autoLinkOut.portStyle="sourcePort=HIDDENs;targetPort=INn;";
        this.fixedLinksOut=[];
        this.brackets=[];
        this.tags=[];
        this.view;
    }
    
    makeAutoLinks(){return false;}
    
    addFixedLinkOut(target,edge=null){
        var link = new WFLink(this,edge);
        link.setTarget(target);
        this.fixedLinksOut.push(link)
        if(this.view)this.view.fixedLinkAdded(link,edge);
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.name,"name",true);
        xml+=makeXML(this.id,"id");
        xml+=makeXML(this.lefticon,"lefticon");
        xml+=makeXML(this.righticon,"righticon");
        xml+=makeXML(this.column,"column");
        xml+=makeXML(this.text,"textHTML",true);
        xml+=makeXML(this.linkedWF,"linkedwf");
        xml+=makeXML(this.textHeight,"textheight");
        if(this.isDropped)xml+=makeXML("true","isdropped");
        if(this.autoLinkOut==null){xml+=makeXML("true","noautolink");}
        for(var i=0;i<this.fixedLinksOut.length;i++){
            if(this.fixedLinksOut[i].id!=null){
                xml+=this.fixedLinksOut[i].toXML();
            }
        }
        /*var linksOut =[];
        var linkOutPorts=[];
        for(var i=0;i<this.fixedLinksOut.length;i++){
            if(this.fixedLinksOut[i].id!=null){
                linksOut.push(this.fixedLinksOut[i].id);
                linkOutPorts.push(this.fixedLinksOut[i].getPortStyle());
            }
        }
        xml+=makeXML(linksOut,"fixedlinkARRAY");
        xml+=makeXML(linkOutPorts,"linkportARRAY");*/
        var tagArray=[];
        for(i=0;i<this.tags.length;i++){
            tagArray.push(this.tags[i].id);
        }
        xml+=makeXML(tagArray.join(","),"tagARRAY");
        return makeXML(xml,"node");
    }
    
    fromXML(xml){
        this.setName(getXMLVal(xml,"name",true));
        this.id = getXMLVal(xml,"id");
        this.setColumn(getXMLVal(xml,"column"));
        this.setText(getXMLVal(xml,"textHTML",true));
        this.setLeftIcon(getXMLVal(xml,"lefticon"));
        this.setRightIcon(getXMLVal(xml,"righticon"));
        this.linkedWF = getXMLVal(xml,"linkedwf");
        var textHeight =getXMLVal(xml,"textheight");
        if(textHeight!=null)this.textHeight=int(textHeight);
        var isDropped = getXMLVal(xml,"isdropped");
        if(isDropped)this.isDropped=true;
        var noAutoLink = getXMLVal(xml,"noautolink");
        if(noAutoLink){this.autoLinkOut=null;}
        //Old linking style (deprecated)
        var linksOut = getXMLVal(xml,"fixedlinkARRAY");
        var linkOutPorts = getXMLVal(xml,"linkportARRAY");
        if(linksOut){
            console.log("Savefile has older node linking style, attempting to recover...");
            for(var i=0;i<linksOut.length;i++){
                var link = new WFLink(this);
                link.id=linksOut[i];
                if(linkOutPorts[i]!=null)link.portStyle=linkOutPorts[i];
                this.fixedLinksOut.push(link);
            }
        }
        //New linking style
        var xmlLinks = xml.getElementsByTagName("link");
        for(var i=0;i<xmlLinks.length;i++){
            var link = new WFLink(this);
            link.fromXML(xmlLinks[i]);
            this.fixedLinksOut.push(link);
        }
        var tagArray = getXMLVal(xml,"tagARRAY");
        if(tagArray!=null)for(i=0;i<tagArray.length;i++){
            this.addTag(this.wf.getTagByID(tagArray[i]),false);
        }
        this.refreshLinkedTags();
        
        
        
    }
    
    setColumn(col){
        this.wf.ensureColumn(col);
        if(this.column!=col){
            this.column=col;
            if(this.view)this.view.columnUpdated();
        }
    }
    
    
    setName(name){
        if(name!=null){
            name = this.setNameSilent(name);
            if(this.view)this.view.nameUpdated();
        }
    }
    
    setNameSilent(name){
        if(name!=null){
            //name = name.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.name=name;
        }
        return this.name;
        
    }
    
    setText(text){
        this.text=text;
        if(this.view&&text!=null)this.view.textUpdated();
        
    }
    
    setLinkedWF(value){
        var autoswitch=false;
        if(value=="")value=null;
        else if(value!=null&&value.substr(0,3)=="NEW"){
            value = this.wf.project.addWorkflow(value.substr(value.indexOf("_")+1)).id;
            autoswitch=true;
        }
        var oldvalue = null;
        if(value!=this.linkedWF){
            if(this.linkedWF!=null){
                var oldwf = this.wf.project.getWFByID(this.linkedWF)
                oldvalue = oldwf.name;
                this.wf.removeChild(oldwf);
            }
            this.linkedWF = value;
            
            if(value!=null){
                var wfc = this.wf.project.getWFByID(value);
                this.wf.addChild(wfc);
                if(this.name==null||this.name==""||this.name==oldvalue)this.setName(wfc.name);
                var addTags=false;
                if(this.tags.length>0&&oldvalue==null)addTags = mxUtils.confirm(LANGUAGE_TEXT.confirm.linkwf[USER_LANGUAGE]);
                if(this.view)this.view.linkedWFUpdated(value,oldvalue);
                this.refreshLinkedTags(addTags);
                
                
                if(autoswitch)wfc.project.changeActive(wfc);
            }else{
                if(this.view)this.view.linkedWFUpdated(value,oldvalue);
                if(this.tags.length>0){
                    if(mxUtils.confirm(LANGUAGE_TEXT.confirm.unlinkwf[USER_LANGUAGE]))while(this.tags.length>0)this.removeTag(this.tags[0],false);
                }
            }
        }
        
    }
    
    setIcon(value,icon){
        if(icon=="left")this.setLeftIcon(value);
        if(icon=="right")this.setRightIcon(value);
    }
    
    setLeftIcon(value){
        var oldvalue = this.lefticon;
        if(value=="")value=null;
        this.lefticon=value;
        if(this.view)this.view.leftIconUpdated(oldvalue);
    }
    setRightIcon(value){
        var oldvalue = this.righticon;
        if(value=="")value=null;
        this.righticon=value;
        if(this.view)this.view.rightIconUpdated(oldvalue);
    }
    
    setWeek(week){
        this.week=week;
    }
    
    changeWeek(y){
        var weekIndex=this.wf.weeks.indexOf(this.week);
        this.week.removeNode(this,y);
        this.week=this.wf.weeks[weekIndex+y];
        this.week.addNode(this,y,0);
        
    }
    
    getLeftIconList(){return iconsList[this.getIconCategory('left')];}
    getRightIconList(){return iconsList[this.getIconCategory('right')];}
    getIconCategory(icon){return null;}
    
    
    
    resizeBy(dy){
        if(this.isDropped&&this.textHeight+dy>0)this.textHeight=this.textHeight+dy;
        if(this.view)this.view.vertexResized(dy);
    }
    
    openLinkedWF(){
        var p = this.wf.project;
        var linkedWF = this.linkedWF;
        if(linkedWF!=null)p.changeActive(p.getWFByID(linkedWF));
    }
    
    
    styleForColumn(){}
    
    toggleDropDown(){
        if(this.view)this.view.dropDownToggled();
        this.isDropped=(!this.isDropped);
    }
    
    
    deleteSelf(){
        this.setLinkedWF(null);
        this.setLeftIcon(null);
        this.setRightIcon(null);
        for(var i=0;i<this.brackets.length;i++)this.brackets[i].cellRemoved(this);
        for(var i=0;i<this.tags.length;i++){
            this.removeTag(this.tags[i]);
        }
        this.week.removeNode(this);
        if(this.autoLinkOut&&this.autoLinkOut.targetNode!=null)this.autoLinkOut.targetNode.makeAutoLinks();
        if(this.view)this.view.deleted();
    }
    
    insertBelow(){
        var node = this.wf.createNodeOfType(this.column);
        if(this.view){
            node.view = new this.view.constructor(this.view.graph,node);
            node.view.insertedBelow(this);
        }
        if(this.wf.view)this.wf.view.bringCommentsToFront();
        node.setColumn(this.column);
        node.setWeek(this.week);
        this.week.addNode(node,0,this.week.nodes.indexOf(this)+1);
        this.wf.makeUndo("Add Node",node);
        return node;
    }
    
    duplicateNode(){
        var node = this.wf.createNodeOfType(this.column);
        node.setWeek(this.week);
        node.fromXML((new DOMParser).parseFromString(this.wf.project.assignNewIDsToXML(this.toXML()),"text/xml"));
        if(node.linkedWF!=null)node.linkedWF=null;
        if(this.view){
            node.view = new this.view.constructor(this.view.graph,node);
            node.view.insertedBelow(this);
            node.view.columnUpdated();
            node.view.fillTags();
        }
        this.week.addNode(node,0,this.week.nodes.indexOf(this)+1);
        this.wf.makeUndo("Add Node",node);
    }
    
    getVertexStyle(){return '';}
    
    
    getLinkedWFList(){}

    getAcceptedWorkflowType(){return "";}
    
    autoLinkNodes(n1,n2){
        if(n1==null||n1.autoLinkOut==null)return;
        if(n2==null)n1.autoLinkOut.setTarget(null);
        else if(n1.autoLinkOut.id!=n2.id){
            n1.autoLinkOut.setTarget(n2);
        }
        n1.redrawLinks();
    }
    
    autoLinkSameType(){
        var next = this.wf.findNextNodeOfSameType(this,1);
        var last = this.wf.findNextNodeOfSameType(this,-1);
        
        this.autoLinkNodes(this,next);
        this.autoLinkNodes(last,this);
    }
    
    
    redrawLinks(){
        this.autoLinkOut.redraw();
        //for(var i=0;i<this.fixedLinksOut.length;i++){this.fixedLinksOut[i].redraw();}
    }
    
    addBracket(br){
        this.brackets.push(br);
    }
    
    removeBracket(br){
        this.brackets.splice(this.brackets.indexOf(br),1);
    }
    
    addTag(tag,show=true,addToLinked=false){
        if(this.tags.indexOf(tag)>=0)return;
        var n = this;
        //Remove any children of the tag we are adding
        var allTags = tag.getAllTags([]);
        for(var i=0;i<this.tags.length;i++){
            if(allTags.indexOf(this.tags[i])>=0){
                this.removeTag(this.tags[i],false);
                i--;
            }
        }
        //Add the tag
        this.tags.push(tag);
        if(this.view)this.view.tagAdded(tag,show);
        if(addToLinked&this.linkedWF!=null){
            this.wf.project.getWFByID(this.linkedWF).addTagSet(tag,true);
            //this.refreshLinkedTags();
        }
        //Check to see if we have all children of the parent, if the parent exists
        var parentTag = tag.parentTag;
        if(parentTag!=null){
            var children = parentTag.getAllTags([],parentTag.depth+1);
            children.splice(0,1);
            var addParent=true;
            for(i=0;i<children.length;i++){
                if(this.tags.indexOf(children[i])<0){
                    addParent=false;
                    break;
                }
            }
            if(addParent)this.addTag(parentTag);
        }
    }
    
    removeTag(tag,removeFromLinked=false){
        if(this.tags.indexOf(tag)>=0){
            this.tags.splice(this.tags.indexOf(tag),1);
        }else if(tag.parentTag!=null){
            this.removeTag(tag.parentTag,false);
            for(var i=0;i<tag.parentTag.children.length;i++){
                if(tag.parentTag.children[i]!=tag)this.addTag(tag.parentTag.children[i],false);
            }
        }
        if(this.linkedWF!=null&&removeFromLinked){
             this.wf.project.getWFByID(this.linkedWF).removeTagSet(tag);
        }
        if(this.view)this.view.tagRemoved(tag);
    }
    
    
    
    
    
    refreshLinkedTags(addToLinked=false){
        if(this.linkedWF!=null){
            var wf = this.wf.project.getWFByID(this.linkedWF);
            //Remove/add tags that aren't assigned to the linked workflow
            for(var i=0;i<this.tags.length;i++){
                if(wf.tagSets.indexOf(this.tags[i])<0){
                    if(addToLinked){wf.addTagSet(this.tags[i]);}
                    else{this.removeTag(this.tags[i],false);i--;}
                }
                
            }
            if(wf.tagSets.length==0)return;
            var allID=[];
            for(var i=0;i<this.wf.tagSets.length;i++){
                allID=this.wf.tagSets[i].getAllID(allID);
            }
            //Add tags that are present in the linked workflow but not in this one.
            for(var i=0;i<wf.tagSets.length;i++){
                if(allID.indexOf(wf.tagSets[i].id)>=0&&this.tags.indexOf(wf.tagSets[i])<0)this.addTag(wf.tagSets[i],false,false);
            }
        }
    }
    
}

class ACNode extends CFNode {
    
    
    getIconCategory(icon){
        if(icon=="left")if(this.column=='SA')return "assessment"; else return "strategy";
        else return null;
    }
    
    
    getLinkedWFList(){
        var wfs = this.wf.project.workflows;
        var list=[];
        for(var i=0;i<wfs.length;i++){
            if( wfs[i] instanceof Activityflow)list.push([wfs[i].name,wfs[i].id]);
        }
        return list;
    }
    
    getAcceptedWorkflowType(){return "activity";}
    
    makeAutoLinks(){
        //this.autoLinkSameType();
        //return true;
        return false;
    }
    
    getColumnStyle(){
        return this.wf.columns[this.wf.getColIndex(this.column)].colour;
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    
}

class CONode extends CFNode {
    
    
    
    
    getLinkedWFList(){
        var wfs = this.wf.project.workflows;
        var list=[];
        for(var i=0;i<wfs.length;i++){
            if( wfs[i] instanceof Courseflow)list.push([wfs[i].name,wfs[i].id]);
        }
        return list;
    }
    
    
    
    getIconCategory(icon){
        return null;
    }
    
    
    getAcceptedWorkflowType(){return "course";}
    
    makeAutoLinks(){
        //this.autoLinkSameType();
        //return true;
        return false;
    }
    
    getColumnStyle(){
        return this.wf.columns[this.wf.getColIndex(this.column)].colour;
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    
}

class WFNode extends CFNode {     
    
    getIconCategory(icon){
        if(icon=="left")return "context";
        if(icon=="right")return "task";
    }
    
    getColumnStyle(){
        return this.wf.columns[this.wf.getColIndex(this.column)].colour;
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
    makeAutoLinks(){
        this.autoLinkSameType();
        return true;
    }
    
}

class CUSNode extends CFNode {
    
    
    
    getLinkedWFList(){
        if(this.wf instanceof Activityflow)return null;
        var wfs = this.wf.project.workflows;
        var list=[];
        if(this.wf instanceof Courseflow){
            for(var i=0;i<wfs.length;i++){
                if( wfs[i] instanceof Activityflow)list.push([wfs[i].name,wfs[i].id]);
            }
            return list;
        }
        if(this.wf instanceof Programflow){
            for(var i=0;i<wfs.length;i++){
                if( wfs[i] instanceof Courseflow)list.push([wfs[i].name,wfs[i].id]);
            }
            return list;
        }
    }
    
    
    getAcceptedWorkflowType(){
        if(this.wf instanceof Courseflow)return "activity";
        if(this.wf instanceof Programflow)return "course";
    }
    
    getIconCategory(icon){
        if(icon=="left"){
            if(this.wf instanceof Activityflow) return "context";
            else if(this.wf instanceof Programflow) return null;
            else return "strategy";
        }
        if(icon=="right"){
            if(this.wf instanceof Activityflow) return "task";
            else if(this.wf instanceof Programflow) return null;
            else return null;
        }
    }
    
    getColumnStyle(){
        return this.wf.columns[this.wf.getColIndex(this.column)].colour;
    }
    
    getVertexStyle(){
        return defaultWFNodeStyle;
    }
    
}

class WFLink{
    constructor(node){
        this.node=node;
        this.id;
        this.portStyle=null;
        this.targetNode;
        this.text;
        this.style;
        this.view;
    }
    
    toXML(){
        var xml = "";
        xml+=makeXML(this.id,"targetid");
        xml+=makeXML(this.getPortStyle(),"portstyle");
        if(this.text)xml+=makeXML(this.text,"linktext",true);
        if(this.style)xml+=makeXML(this.style,"linkstyle");
        return makeXML(xml,"link");
    }
    
    fromXML(xml){
        var targetid = getXMLVal(xml,"targetid");
        var portStyle = getXMLVal(xml,"portstyle");
        var text = getXMLVal(xml,"linktext",true);
        var style = getXMLVal(xml,"linkstyle");
        this.id = targetid;
        this.targetNode = null;
        if(text)this.text = text;
        if(portStyle)this.portStyle=portStyle;
        if(style)this.style=style;
    }
    
    setTextSilent(value){
        if(value!=null){
            //value = value.replace(/&/g," and ").replace(/</g,"[").replace(/>/g,"]");
            this.text=value;
        }
        return this.text;
        
    }
    
    setTarget(node){
        this.targetNode = node;
        if(node==null)this.id=null;
        else this.id = node.id;
    }
    
    getPortStyle(){
        if(this.portStyle==null&&this.view)this.portStyle = this.view.getPortStyle();
        if(this.portStyle!=null)return this.portStyle;
        return "";
    }
    
    redraw(){
        if(this.id!=null&&this.targetNode==null) {
            this.targetNode = this.node.wf.findNodeById(this.id);
            //if the node is still null after this the connection is probably garbage (for example a connection to a node that has been destroyed).
            if(this.targetNode==null){this.id=null;return;}
        }
        if(this.view)this.view.redraw();
    }
    
    changeStyle(style){
        this.style=style;
        if(this.view)this.view.redraw();
    }
    
    
    
    
    deleteSelf(){
        if(this.view)this.view.deleted();
        this.node.fixedLinksOut.splice(this.node.fixedLinksOut.indexOf(this),1);
    }
    
    
}

class WFAutolink extends WFLink{
    deleteSelf(){
        if(this.view)this.view.deleted();
        this.node.autoLinkOut = null;
    }
}