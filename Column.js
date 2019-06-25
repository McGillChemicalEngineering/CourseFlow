
class Column {
    constructor(graph,wf,name,text,image){
        this.name=name;
        this.text=text;
        this.image=image;
        this.head;
        this.pos=0;
        this.graph=graph;
        this.wf=wf;
        
    }
    
    
    createHead(y){
        this.head = this.graph.insertVertex(this.graph.getDefaultParent(), null,this.text,this.pos,3*cellSpacing, colIconSize, colIconSize,defaultHeadStyle+'image=resources/data/'+this.image+'.png;');
        this.head.isHead=true;
        this.head.column=this;
    }
    
    updatePosition(){
        this.graph.moveCells([this.head],this.pos-this.head.w()/2-this.head.x());
    }
}



