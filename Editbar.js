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
    constructor(container){
        var eb = this;
        this.container=container;
        var quillDiv1 = document.createElement('div');
        quillDiv1.style.height='40px';
        document.getElementById("nameDiv").appendChild(quillDiv1);
        var toolbarOptions = null;
        var quill1 = new Quill(quillDiv1,{
            theme: 'bubble',
            modules: {
                toolbar: toolbarOptions
            }
        });
        quill1.on('text-change', function(delta, oldDelta, source) {
          if (source == 'user') {
            if(eb.node!=null){
                eb.node.setName(quill1.getText().slice(0,-1));
                eb.node.wf.makeUndo("Name Change",eb.node);
            }
          }
        });
        quillDiv1.firstChild.onfocus = function(){quill1.setSelection(0,quill1.getLength());};
        this.nameField=quill1;
        this.leftIcon = document.getElementById('leftIconSelect');
        this.rightIcon = document.getElementById('rightIconSelect');
        var quillDiv2 = document.createElement('div');
        quillDiv2.style.height='200px';
        document.getElementById("descriptionDiv").appendChild(quillDiv2);
        toolbarOptions = [['bold','italic','underline'],[{'list':'bullet'},{'list':'ordered'}],['link']];
        var quill2 = new Quill(quillDiv2,{
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            }
        });
        quill2.on('text-change', function(delta, oldDelta, source) {
          if (source == 'user') {
            if(eb.node!=null){
                eb.node.setText(quillDiv2.childNodes[0].innerHTML);
                eb.node.wf.makeUndo("Text Change",eb.node);
            }
          }
        });
        quillDiv2.firstChild.onfocus = function(){quill2.setSelection(0,quill2.getLength());};
        //Making some changes to the way link creation works. By default if the user has nothing selected, the link button simply does nothing; this is undesirable behaviour.
        var toolbar = quill2.getModule('toolbar');
        toolbar.defaultLinkFunction=toolbar.handlers['link'];
        toolbar.addHandler("link",function customLinkFunction(value){
            var select = quill2.getSelection();
            if(select['length']==0){
                quill2.insertText(select['index'],'link');
                quill2.setSelection(select['index'],4)
            }
           
            this.defaultLinkFunction(value);
        });
        //this.textField=quillDiv2.childNodes[0];
        this.textField = quill2;
        this.linkedWF = document.getElementById('linkedWFSelect');
        this.tagButtonsDiv = document.getElementById('tagButtonsDiv');
        this.tagSelect=document.getElementById('tagSelect');
        this.node;
        
    }
    
    enable(node){
        var eb = this;
        this.node=node;
        if(node.name!=null)this.nameField.setText(node.name);
        else this.nameField.setText("<Name>");
        if(node.text!=null)this.textField.clipboard.dangerouslyPasteHTML(node.text,"silent");
        else this.textField.clipboard.dangerouslyPasteHTML("Insert a description here.","silent");
        //if(node.text!=null)this.textField.innerHTML=node.text;
        //else this.textField.innerHTML="Insert a description here.";
        this.container.style.display="inline";
        this.container.style.width="400px";
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
            node.addTag(node.wf.getTagByID(this.value));
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
                tags[i].makeEditButton(this.tagButtonsDiv,this.node,this);
            }
        }
        while(this.tagSelect.length>0){this.tagSelect.remove(0);}
        var allTags = [];
        for(i=0;i<this.node.wf.tagSets.length;i++){
            allTags = this.node.wf.tagSets[i].getAllTags(allTags);
        }
        var opt0 = document.createElement('option');
        opt0.text = "Select a tag to add";
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
        parent.style.display="inline";
    }
    
    disable(){
        this.node=null;
        this.container.style.display="none";
        this.container.style.width="0px";
    }
    
    fillIconSelect(iconSelect,list){
        while(iconSelect.length>0){iconSelect.remove(0);}
        var opt0 = document.createElement('option');
        opt0.text = "None";
        opt0.value = "";
        iconSelect.add(opt0);
        for(var i=0;i<list.length;i++){
            var opt = document.createElement('option');
            opt.text = list[i][0];
            opt.value = list[i][1];
            iconSelect.add(opt);
        }
    }
    
    fillWFSelect(list){
        while(this.linkedWF.length>0){this.linkedWF.remove(0);}
        var opt0 = document.createElement('option');
        opt0.text = "None";
        opt0.value = "";
        this.linkedWF.add(opt0);
        for(var i=0;i<list.length;i++){
            var opt = document.createElement('option');
            opt.text = list[i][0];
            opt.value = list[i][1];
            this.linkedWF.add(opt);
        }
    }
    
    
    
    
    
    
}