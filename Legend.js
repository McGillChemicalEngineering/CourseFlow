//Legend class, where we define the icon legend for workflows.

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


class Legend{
    constructor(wf,graph){
        this.wf = wf;
        this.graph=graph;
        this.icons={};
        this.vertices=[];
        this.x;
        this.y;
    }
    
    createVertex(){
        if(this.wf.legendCoords){
            this.x = this.wf.legendCoords.x;
            this.y = this.wf.legendCoords.y;
        }else{
            this.x = this.wf.weeks[0].view.vertex.r()+cellSpacing+100;
            this.y = this.wf.weeks[0].view.vertex.y()+cellSpacing;
        }
       var vertex =  this.graph.insertVertex(this.graph.getDefaultParent(),null,LANGUAGE_TEXT.legend.legend[USER_LANGUAGE],this.x,this.y,200,44,defaultLegendStyle);
        vertex.isLegend=true;
        vertex.legend=this;
        this.vertex = vertex;
        this.graph.cellsToggled([this.vertex],false);
    }
    
    update(category,newvalue,oldvalue){
        var list = iconsList[category];
        if(list==null)return;
        if(this.icons[category]!=null&&oldvalue!=null){
            for(var i=0;i<this.icons[category].length;i++){
                if(this.icons[category][i].value==oldvalue){this.icons[category].splice(i,1);break;}
            }
        }
        var text="";
        for(var i=0;i<list.length;i++){
            if(list[i].value==newvalue){text=list[i].text;break;}
        }
        if(newvalue!=null){
            var icon = {value:newvalue, text:text};
            if(this.icons[category]==null){
                this.icons[category]=[icon];
            }else{
                this.icons[category].push(icon);
            }
        }
        if(!this.graph.isCellVisible(this.vertex))return;
        var legend = this;
        var debouncetime=200;
        var prevLegendCall=this.lastLegendCall;
        this.lastLegendCall=Date.now();
        //Debounce
        if(prevLegendCall&&this.lastLegendCall-prevLegendCall<=debouncetime){
            clearTimeout(this.lastLegendCallTimer);
        }
        this.lastLegendCallTimer = setTimeout(function(){legend.createDisplay()},debouncetime);
        
    }
    
    
    createDisplay(){
        var reducedList={};
        for(var prop in iconsList){
            if(this.icons[prop]!=null&&this.icons[prop].length>0){
                reducedList[prop]=[];
                for(var i=0;i<iconsList[prop].length;i++){
                    for(var j=0;j<this.icons[prop].length;j++){
                        if(iconsList[prop][i].value==this.icons[prop][j].value){
                            reducedList[prop].push(iconsList[prop][i]);
                            break;
                        }
                    }
                }
            }
        }
        this.graph.removeCells(this.vertices);
        var y = 36;
        for(var prop in reducedList){
            var line = this.graph.insertVertex(this.vertex,null,"",20,y,this.vertex.w()-40,2,defaultBracketBarStyle+"fillColor="+SALTISEBLUE+";strokeColor="+SALTISEBLUE+";");
            y+=12;
            var header = this.graph.insertVertex(this.vertex,null,LANGUAGE_TEXT.legend[prop][USER_LANGUAGE]+":",2,y,this.vertex.w()-4,24,defaultLegendLineStyle);
            y+=header.h()+2;
            this.vertices.push(header);
            for(var i=0;i<reducedList[prop].length;i++){
                var label = this.graph.insertVertex(this.vertex,null,reducedList[prop][i].text[USER_LANGUAGE],2,y,this.vertex.w()-4,24,defaultLegendLineStyle+"image="+iconpath+reducedList[prop][i].value+"24.png;fontColor=black;align=left;spacingLeft=40;");
                y+=label.h()+2;
                this.vertices.push(label);
            }
            y+=12;
        }
        this.graph.resizeCells([this.vertex],[new mxRectangle(this.vertex.x(),this.vertex.y(),this.vertex.w(),y)]);
        this.graph.orderCells(false,[this.vertex])
    }
    
    deleteSelf(){
        this.graph.removeCells([this.vertex]);
    }
}