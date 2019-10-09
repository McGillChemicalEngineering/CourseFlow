class Undo{
    constructor(wf,type,source){
        this.wf = wf;
        this.type = type;
        this.source = source;
        wf.saveXMLData();
        this.xml = wf.xmlData;
        
    }
    
    
    
    
    
}