//A class which creates a toolbar which can sit on either side of the project, and can be collapsed or expanded.

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

class WFToolbar{
    constructor(project,container,direction="left",icon="pin36"){
        this.blocks=[];
        this.width="240px";
        this.project=project;
        this.container=container;
        this.container.innerHTML="";
        this.shown = false;
        this.transitioning = false;
        this.toggled = false;
        this.container.className = "wftoolbar";
        this.container.style[direction] = "0px";
        this.direct=direction;
        this.contentWrapper = document.createElement('div');
        this.contentWrapper.className = "contentwrapper";
        this.showhide = document.createElement('div');
        this.showhide.className = "showhide";
        var wft = this;
        this.showhide.onclick = function(){
            wft.toggleShow();
            if(wft.toggled&&!wft.shown)wft.show(0);
            else if(!wft.toggled&&wft.shown)wft.hide(0);
        }
        //Add on-hover opening and closing;
        /*container.addEventListener("mouseenter",function(evt){
            this.mousein=true;
            if(!wft.shown)wft.show(500);
            
        });
        container.addEventListener("mouseleave",function(evt){
            this.mousein=false;
            if(!wft.toggled&&wft.shown)wft.hide(500);
        });*/
        container.appendChild(this.contentWrapper);
        container.appendChild(this.showhide);
        if(direction=="right"){
            this.showhide.style.left="-48px";
            makeResizable(this.container,"left");
        }else if(direction=="left"){
            this.showhide.style.right="-48px";
            makeResizable(this.container,"right");
        }
        this.container.style.width="0px";
        var showicon = document.createElement('img');
        showicon.src="resources/images/"+icon+".png";
        this.showhide.appendChild(showicon);
    }
    
    toggleShow(){
        this.toggled=(!this.toggled);
        if(this.toggled)this.showhide.classList.add("toggled");
        else this.showhide.classList.remove("toggled");
    }
    
    addBlock(title,appendafter,headerClass,headertype='4'){
        if(this.blocks.length>0)this.contentWrapper.appendChild(document.createElement('hr'));
        var blockdiv = document.createElement('div');
        blockdiv.className = "blockwrapper";
        this.contentWrapper.appendChild(blockdiv);
        var header = document.createElement('h'+headertype);
        var headertext = document.createElement('div');
        headertext.innerHTML = title+":";
        header.appendChild(headertext);
        if(headerClass)header.className = headerClass;
        if(headertype=="4"){
            var headercollapse = document.createElement('div');
            headercollapse.classList.add("expandheaderdiv");
            var headercollapseimg = document.createElement('img');
            headercollapseimg.src = "resources/images/arrowdown16.png";
            headercollapse.appendChild(headercollapseimg);
            header.appendChild(headercollapse);
            header.onclick = function(){
                if(div.style.display=="none"){
                    div.style.display="";
                    headercollapseimg.src = "resources/images/arrowdown16.png";
                }else{
                    div.style.display="none";
                    headercollapseimg.src = "resources/images/arrowright16.png";
                }


            }
        }
        var div = document.createElement('div');
        blockdiv.appendChild(header);
        blockdiv.appendChild(div);
        if(appendafter!=null){
            blockdiv.appendChild(appendafter);
            appendafter.addEventListener("click",function(){
                if(div.style.display=="none")header.click(); 
            });
        }
        this.blocks.push(blockdiv);
        div.headertext = headertext;
        return div;
    }
    
    
    hide(delaytime){
        var wft = this;
        setTimeout(function(){
            if(!wft.shown)return;
            if(wft.container.mousein&&delaytime>0)return;
            if(!wft.transitioning)wft.width=window.getComputedStyle(wft.container).width;
            if(int(wft.width)<100)wft.width="100px";
            wft.transitioning=true;
            wft.container.style.transition='width 0.1s';
            setTimeout(function(){
                if(wft&&wft.container)wft.container.style.width="0px";
                wft.shown=false;
                setTimeout(function(){
                    if(wft&&wft.container)wft.container.style.transition='none';
                    wft.transitioning=false;
                },100);
            },10);
        },delaytime);
    }
    
    show(delaytime){
        var wft = this;
        setTimeout(function(){
            if(wft.shown)return;
            if(!wft.container.mousein&&delaytime>0)return;
            wft.transitioning=true;
            wft.container.style.transition='width 0.1s';
            setTimeout(function(){
                if(wft&&wft.container)wft.container.style.width=wft.width;
                wft.shown=true;
                setTimeout(function(){
                    if(wft&&wft.container)wft.container.style.transition='none';
                    wft.transitioning=false;
                },100);
            },10);
        },delaytime);
    }
    

}