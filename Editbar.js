//The bar that is used to edit nodes

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

class EditBar{
    constructor(container,wf){
        this.wf = wf;
        this.width=400;
        var readOnly = wf.project.readOnly;
        var eb = this;
        this.container=container;
        container.innerHTML='<h3>'+LANGUAGE_TEXT.editbar.editnode[USER_LANGUAGE]+'</h3>';
        
        //Title div
        var nameDiv = document.createElement('div');
        nameDiv.innerHTML = '<h4>'+LANGUAGE_TEXT.editbar.title[USER_LANGUAGE]+':</h4>';
        var quillDiv1 = document.createElement('div');
        quillDiv1.style.height='40px';
        nameDiv.appendChild(quillDiv1);
        var toolbarOptions = null;
        var quill1 = new Quill(quillDiv1,{
            theme: 'bubble',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder:LANGUAGE_TEXT.editbar.nameplaceholder[USER_LANGUAGE]
        });
        quill1.on('text-change', function(delta, oldDelta, source) {
          if (source == 'user') {
            if(eb.node!=null){
                eb.node.setName(quill1.getText().slice(0,-1));
                eb.node.wf.makeUndo("Name Change",eb.node);
            }
          }
        });
        //quillDiv1.firstChild.onfocus = function(){quill1.setSelection(0,quill1.getLength());};
        this.nameField=quill1;
        container.appendChild(nameDiv);
        
        //Icons
        var iconDiv = document.createElement('div');
        var leftIconDiv = document.createElement('div');
        leftIconDiv.innerHTML='<h4>'+LANGUAGE_TEXT.editbar.lefticon[USER_LANGUAGE]+':</h4>';
        this.leftIcon = document.createElement('select');
        leftIconDiv.appendChild(this.leftIcon);
        var rightIconDiv = document.createElement('div');
        rightIconDiv.innerHTML='<h4>'+LANGUAGE_TEXT.editbar.righticon[USER_LANGUAGE]+':</h4>';
        this.rightIcon = document.createElement('select');
        rightIconDiv.appendChild(this.rightIcon);
        iconDiv.appendChild(leftIconDiv);
        iconDiv.appendChild(rightIconDiv);
        container.appendChild(iconDiv);
        
        //description
        var descriptionDiv = document.createElement('div');
        descriptionDiv.innerHTML='<h4>'+LANGUAGE_TEXT.editbar.description[USER_LANGUAGE]+':</h4>';
        var quillDiv2 = document.createElement('div');
        quillDiv2.style.height='200px';
        descriptionDiv.appendChild(quillDiv2);
        toolbarOptions = [['bold','italic','underline'],[{'script':'sub'},{'script':'super'}],[{'list':'bullet'},{'list':'ordered'}],['link'],['formula']];
        var quill2 = new Quill(quillDiv2,{
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder:LANGUAGE_TEXT.editbar.insertdescription[USER_LANGUAGE]
        });
        quill2.on('text-change', function(delta, oldDelta, source) {
          if (source == 'user') {
            if(eb.node!=null){
                eb.node.setText(quillDiv2.childNodes[0].innerHTML.replace(/\<p\>\<br\>\<\/p\>\<ul\>/g,"\<ul\>"));
                eb.node.wf.makeUndo("Text Change",eb.node);
            }
          }
        });
        //quillDiv2.firstChild.onfocus = function(){quill2.setSelection(0,quill2.getLength());};
        //Making some changes to the way link creation works. By default if the user has nothing selected, the link button simply does nothing; this is undesirable behaviour.
        var toolbar = quill2.getModule('toolbar');
        toolbar.defaultLinkFunction=toolbar.handlers['link'];
        toolbar.addHandler("link",function customLinkFunction(value){
            var select = quill2.getSelection();
            if(select['length']==0&&!readOnly){
                quill2.insertText(select['index'],'link');
                quill2.setSelection(select['index'],4);
            }
           
            this.defaultLinkFunction(value);
        });
        //this.textField=quillDiv2.childNodes[0];
        this.textField = quill2;
        container.appendChild(descriptionDiv);
        
        //Time
        var timeDiv = document.createElement('div');
        timeDiv.innerHTML='<h4>'+LANGUAGE_TEXT.editbar.time[USER_LANGUAGE]+':</h4>';
        var timeSelect = document.createElement('input');
        timeSelect.type="number";
        var unitSelect = document.createElement('select');
        for(var prop in LANGUAGE_TEXT.timeunits){
            var opt = document.createElement('option');
            opt.text=LANGUAGE_TEXT.timeunits[prop][USER_LANGUAGE];
            opt.value=prop;
            unitSelect.appendChild(opt);
        }
        timeDiv.appendChild(timeSelect);
        timeSelect.style.width="50%";
        timeSelect.style.height="30px";
        unitSelect.style.width="50%";
        unitSelect.style.height="30px";
        timeSelect.style.boxSizing = "border-box";
        timeDiv.appendChild(unitSelect);
        timeSelect.oninput = function(){if(eb.node)eb.node.setTime(this.value);}
        unitSelect.onchange = function(){if(eb.node)eb.node.setTimeUnits(unitSelect.value);}
        this.timeSelect = timeSelect;
        this.unitSelect = unitSelect;
        container.appendChild(timeDiv);
        
        //linked wf
        var wfDiv = document.createElement('div');
        wfDiv.innerHTML='<h4>'+LANGUAGE_TEXT.editbar.linkedwf[USER_LANGUAGE]+':</h4>';
        this.linkedWF = document.createElement('select');
        wfDiv.appendChild(this.linkedWF);
        container.appendChild(wfDiv);
        
        //tags
        var tagsDiv = document.createElement('div');
        tagsDiv.innerHTML = '<h4>'+LANGUAGE_TEXT.editbar.tags[USER_LANGUAGE]+':</h4>';
        this.tagButtonsDiv = document.createElement('div');
        this.tagSelect=document.createElement('select');
        tagsDiv.appendChild(this.tagButtonsDiv);
        tagsDiv.appendChild(this.tagSelect);
        container.appendChild(tagsDiv);
        
        this.node;
        
        //disable everything if read-only
        if(readOnly){
            quill1.disable();
            quill2.disable();
            this.linkedWF.disabled=true;
            this.tagSelect.disabled=true;
            this.leftIcon.disabled=true;
            this.rightIcon.disabled=true;
        }
    }
    
    enable(node){
        if(this.node)this.disable();
        var eb = this;
        this.node=node;
        var containerParent = eb.container.parentElement;
        containerParent.style.width='0px';
        containerParent.style.display="inline";
        containerParent.style.transition='width 0.1s';
        setTimeout(function(){
            if(eb&&eb.node&&containerParent)containerParent.style.width=Math.max(eb.width,100)+'px';
            setTimeout(function(){
                if(containerParent)containerParent.style.transition='none';
            },100);
        },10);
        if(node.name!=null)this.nameField.setText(node.name);
        else this.nameField.setText("");
        if(node.text!=null)this.textField.clipboard.dangerouslyPasteHTML(node.text,"silent");
        else this.textField.clipboard.dangerouslyPasteHTML("","silent");
        //if(node.text!=null)this.textField.innerHTML=node.text;
        //else this.textField.innerHTML="Insert a description here.";
        var iconList = node.getLeftIconList();
        if(iconList!=null){
            this.showParent(this.leftIcon);
            this.fillIconSelect(this.leftIcon,iconList);
            if(node.lefticon!=null)this.leftIcon.value=node.lefticon;
            this.leftIcon.onchange = function(){
                node.setLeftIcon(this.value);
                node.wf.makeUndo("Icon Change",node);
            }
        }else this.hideParent(this.leftIcon);
        iconList = node.getRightIconList();
        if(iconList!=null){
            this.showParent(this.rightIcon);
            this.fillIconSelect(this.rightIcon,iconList);
            if(node.righticon!=null)this.rightIcon.value=node.righticon;
            this.rightIcon.onchange = function(){
                node.setRightIcon(this.value);
                node.wf.makeUndo("Icon Change",node);
            }
        }else this.hideParent(this.rightIcon);
        this.timeSelect.value=int(node.time.value);
        this.unitSelect.value=node.time.unit;
        
        var linkedWFList = node.getLinkedWFList();
        if(linkedWFList!=null){
            this.showParent(this.linkedWF);
            this.fillWFSelect(linkedWFList);
            if(node.linkedWF!=null)this.linkedWF.value = node.linkedWF;
            this.linkedWF.onchange = function(){
                node.setLinkedWF(this.value);
                node.wf.makeUndo("Linked Workflow Change",node);
            }
        }else this.hideParent(this.linkedWF);
        if(node.wf.tagSets.length>0){
            this.showParent(this.tagButtonsDiv);
            this.populateTags();
        }else this.hideParent(this.tagButtonsDiv);
        this.tagSelect.onchange = function(){
            if(this.value=="")return;
            node.addTag(node.wf.getTagByID(this.value),true,node.wf instanceof Programflow);
            eb.populateTags();
            node.wf.makeUndo("Add Tag",node);
        }
        
    }
    
    populateTags(){
        var i;
        this.tagButtonsDiv.innerHTML="";
        var tags = this.node.tags;
        if(tags.length>0){
            for(i=0;i<tags.length;i++){
                tags[i].view.makeEditButton(this.tagButtonsDiv,this.node,this);
            }
        }
        while(this.tagSelect.length>0){this.tagSelect.remove(0);}
        var allTags = [];
        for(i=0;i<this.node.wf.tagSets.length;i++){
            allTags = this.node.wf.tagSets[i].getAllTags(allTags);
        }
        var opt0 = document.createElement('option');
        opt0.text = LANGUAGE_TEXT.editbar.chooseone[USER_LANGUAGE];
        opt0.value="";
        this.tagSelect.add(opt0);
        for(i=0;i<allTags.length;i++){
            if(tags.indexOf(allTags[i])>=0)continue;
            var opt = document.createElement('option');
            opt.innerHTML = "&nbsp;".repeat(allTags[i].depth*4)+allTags[i].getType()[0]+" - "+allTags[i].name;
            opt.value = allTags[i].id;
            this.tagSelect.add(opt);
        }
        
    }
    
    hideParent(element){
        var parent = element.parentElement;
        parent.style.display="none";
    }
    showParent(element){
        var parent = element.parentElement;
        parent.style.display="block";
    }
    
    disable(){
        if(this.node!=null){
            this.node=null;
            this.width = int(this.container.parentElement.style.width);
            this.container.parentElement.style.transition='width 0.1s';
            this.container.parentElement.style.width='0px';
            var eb=this;
            var containerParent = eb.container.parentElement;
            setTimeout(function(){
                if(eb&&eb.container&&eb.node==null)eb.container.parentElement.style.display="none";
                if(containerParent)containerParent.style.transition='none';
            },200);
        }
    }
    
    fillIconSelect(iconSelect,list){
        while(iconSelect.length>0){iconSelect.remove(0);}
        var opt0 = document.createElement('option');
        opt0.text = LANGUAGE_TEXT.editbar.none[USER_LANGUAGE];
        opt0.value = "";
        iconSelect.add(opt0);
        for(var i=0;i<list.length;i++){
            var opt = document.createElement('option');
            opt.text = list[i].text[USER_LANGUAGE];
            opt.value = list[i].value;
            iconSelect.add(opt);
        }
    }
    
    fillWFSelect(list){
        while(this.linkedWF.length>0){this.linkedWF.remove(0);}
        var opt0 = document.createElement('option');
        opt0.text = LANGUAGE_TEXT.editbar.none[USER_LANGUAGE];
        opt0.value = "";
        this.linkedWF.add(opt0);
        for(var i=0;i<list.length;i++){
            var opt = document.createElement('option');
            opt.text = list[i][0];
            opt.value = list[i][1];
            this.linkedWF.add(opt);
        }
        var optNEW = document.createElement('option');
        optNEW.text = LANGUAGE_TEXT.editbar.createnew[USER_LANGUAGE]+" "+this.node.getAcceptedWorkflowType();
        optNEW.value = "NEW_"+this.node.getAcceptedWorkflowType();
        this.linkedWF.add(optNEW);
    }
    
    
    
    
    
    
}