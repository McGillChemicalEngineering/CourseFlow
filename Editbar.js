class EditBar{
    constructor(container){
        var eb = this;
        this.container=container;
        var quillDiv1 = document.createElement('div');
        quillDiv1.style.height='40px';
        this.container.appendChild(quillDiv1);
        var toolbarOptions = null;
        var quill1 = new Quill(quillDiv1,{
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            }
        });
        quill1.on('text-change', function(delta, oldDelta, source) {
          if (source == 'user') {
            if(eb.node!=null)eb.node.setName(quill1.getText().slice(0,-1));
          }
        });
        this.nameField=quill1;
        this.leftIcon = document.createElement('select');
        this.rightIcon = document.createElement('select');
        this.container.appendChild(this.leftIcon);
        this.container.appendChild(this.rightIcon);
        var quillDiv2 = document.createElement('div');
        quillDiv2.style.height='200px';
        this.container.appendChild(quillDiv2);
        toolbarOptions = [['bold','italic','underline'],[{'list':'bullet'},{'list':'ordered'}]];
        var quill2 = new Quill(quillDiv2,{
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            }
        });
        quill2.on('text-change', function(delta, oldDelta, source) {
          if (source == 'user') {
            if(eb.node!=null)eb.node.setText(quillDiv2.childNodes[0].innerHTML);
          }
        });
        this.textField=quillDiv2.childNodes[0];
        this.linkedWF = document.createElement('select');
        this.container.appendChild(this.linkedWF);
        this.node;
        
    }
    
    enable(node){
        if(node.name!=null)this.nameField.setText(node.name);
        else this.nameField.setText("<Name>");
        if(node.text!=null)this.textField.innerHTML=node.text;
        else this.textField.innerHTML="Insert a description here.";
        this.container.style.display="inline";
        var iconList = node.getLeftIconList();
        if(iconList!=null){
            this.leftIcon.style.display="inline";
            this.fillIconSelect(this.leftIcon,iconList);
            if(node.lefticon!=null)this.leftIcon.value=node.lefticon;
            this.leftIcon.onchange = function(){
                node.setLeftIcon(this.value);
            };
        }else this.leftIcon.style.display="none";
        iconList = node.getRightIconList();
        if(iconList!=null){
            this.rightIcon.style.display="inline";
            this.fillIconSelect(this.rightIcon,iconList);
            if(node.righticon!=null)this.rightIcon.value=node.righticon;
            this.rightIcon.onchange = function(){
                node.setRightIcon(this.value);
            };
        }else this.rightIcon.style.display="none";
        var linkedWFList = node.getLinkedWFList();
        if(linkedWFList!=null){
            this.linkedWF.style.display="inline";
            this.fillWFSelect(linkedWFList);
            if(node.linkedWF!=null)this.linkedWF.value = node.linkedWF;
            this.linkedWF.onchange = function(){
                node.setLinkedWF(this.value);
            }
        }else this.linkedWF.style.display="none";
        this.node=node;
    }
    
    disable(){
        this.node=null;
        this.container.style.display="none";
    }
    
    fillIconSelect(iconSelect,list){
        while(iconSelect.length>0){iconSelect.remove(0);}
        var opt0 = document.createElement('option');
        opt0.text = "None";
        opt0.value = "";
        iconSelect.add(opt0);
        for(var i=0;i<list.length;i++){
            var opt = document.createElement('option');
            opt.style = 'data-imagesrc="'+iconpath+list[i][1]+'24.png";';
            opt.text = list[i][0];
            opt.value = list[i][1];
            iconSelect.add(opt);
        }
        //iconSelect.ddslick();
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