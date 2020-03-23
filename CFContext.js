/*A customized context menu*/

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
    
class CFContext{
    constructor(container,target,x,y){
        this.container=container;
        this.target=target;
        this.x=x;
        this.y=y;
        this.items = [];
        this.div = document.createElement('div');
        var table = document.createElement('table');
        this.tbody = document.createElement('tbody');
        this.div.appendChild(table);
        table.appendChild(this.tbody);
        this.div.className = "mxPopupMenu";
        table.className = "mxPopupMenu";
    }

    populate(){
        if(this.target.dummyObject)return;
        this.target.populateMenu(this);
    }

    addItem(text,icon,clickfunc,submenu=null){
        var item;
        if(submenu==null){
            item = new CFMenuItem(this);
            this.items.push(item);
        } else {
            item = new CFMenuItem(submenu.submenu);
            submenu.submenu.items.push(item);
            if(submenu.submenu.items.length==1)submenu.makeSub();
        }
        item.makeLine(text,icon,clickfunc);
        return item;
    }

    open(parent = null){
        if(this.target.dummyObject)return;
        if(!parent)$("body>.mxPopupMenu").remove();
        if(parent){
            this.container = parent.row;
        }
        this.container.appendChild(this.div);
        var computed = window.getComputedStyle(this.div);
        var width = computed.width;
        var height = computed.height;
        var winwidth = window.innerWidth;
        var winheight = window.innerHeight;
        if(parent){
            var computedParent = window.getComputedStyle(parent.menu.div);
            this.x = int(computedParent.width);
            this.y = parent.row.offsetTop;
            winwidth=int(winwidth)-int(computedParent.left);
            winheight=int(winheight)-int(computedParent.top);
        }
        if(this.x+int(width)<=winwidth+window.scrollX)this.div.style.left=this.x+"px";
        else this.div.style.left = (int(winwidth)+window.scrollX - int(width))+"px";
        if(this.y+int(height)<=winheight+window.scrollY)this.div.style.top=this.y+"px";
        else this.div.style.top = (int(winheight)+window.scrollY - int(height))+"px";
        var menu = this;
        document.addEventListener("click",function(){menu.close();},true);
        document.addEventListener("contextmenu",function(){menu.close();},true);
    }

    close(){if(this.div.parentElement)this.div.parentElement.removeChild(this.div);}




}

class CFMenuItem{
    constructor(menu){
        this.menu = menu;
        this.subcell;
        this.row = document.createElement('tr');
        this.submenu = new CFContext(menu.container,menu.target,menu.x,menu.y);
    }
    
    makeLine(text,icon,clickfunc){
        var row = this.row;
        var iconcell = document.createElement('td');
        iconcell.className = 'mxPopupMenuIcon';
        var img = document.createElement('img');
        img.src = icon;
        iconcell.appendChild(img);
        var textcell = document.createElement('td');
        textcell.className = 'mxPopupMenuItem';
        textcell.innerHTML = text;
        this.subcell = document.createElement('td');
        this.subcell.className = 'mxPopupMenuItem';
        row.appendChild(iconcell);
        row.appendChild(textcell);
        row.appendChild(this.subcell);
        row.onclick = function(evt){evt.stopPropagation();clickfunc();};
        var sub = this;
        row.addEventListener('mouseenter',function(){
            if(sub.submenu.items.length>0)sub.submenu.open(sub);
        });
        row.addEventListener('mouseleave',function(){sub.submenu.close();});
        
        this.menu.tbody.appendChild(row);
        
    }
    
    makeSub(){
        var subicon = document.createElement('img');
        subicon.src = 'resources/mxgraph-master/javascript/src/images/submenu.gif';
        this.subcell.appendChild(subicon);
    }
}