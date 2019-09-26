class Layout{
    constructor(project){
        this.project = project;
        this.name = this.getDefaultName();
        this.id = this.project.genID();
        this.children=[];
        this.buttons=[];
        this.isActive=false;
    }
    
    clickButton(){
        this.project.changeActive(this.project.getIndex(this));
        
    }
    
    addChild(child){
        this.children.push(child);
    }
    
    removeChild(child){
        this.children.splic(this.children.indexOf(child));
    }
    
    
    
    
    
}