//Definition of global variables and functions for ease of use.

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

//A few logistical functions to more quickly grab the dimensions and sides of a cell
mxCell.prototype.x = function(){return this.getGeometry().x;}
mxCell.prototype.y = function(){return this.getGeometry().y;}
mxCell.prototype.w = function(){return this.getGeometry().width;}
mxCell.prototype.h = function(){return this.getGeometry().height;}
mxCell.prototype.r = function(){return this.x()+this.w();}
mxCell.prototype.b = function(){return this.y()+this.h();}
mxCell.prototype.resize = function(graph,dx,dy){
    graph.resizeCells([this],[new mxRectangle(this.x(),this.y(),this.w()+dx,this.h()+dy)]);
}
//Makes a function activate the start load first, then run asynchronously. Useful for things that take a lot of time.
function makeLoad(toLoad){
    startLoad();
    setTimeout(function(){toLoad();endLoad();},20);
}
function startLoad(){
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '* {cursor:wait !important;}';
    style.id = "waitingStyle";
    document.getElementsByTagName("head")[0].appendChild(style);

}
function endLoad(){
    var style = document.getElementById("waitingStyle");
    if(style!=null)style.parentElement.removeChild(style);
}

//A function to map the weeks' vertices into an array
function mapWeekVertices(value,index,array){
    return value.vertex;
}
//casts to int, using a default base 10
int = function(x){return parseInt(x,10);}

//creates an xml line for the given name and value
makeXML = function(value,name,isHTML=false){
    if(value==null)value="undefined"
    value = purgeInvalidCharacters(""+value);
    if(isHTML||name.indexOf("HTML")>=0)value = cleanHTML(value);
    return "<"+name+">"+value+"</"+name+">\n";
}
getXMLVal = function(xml,name,isHTML=false){
    var isARRAY = (name.indexOf("ARRAY")>=0);
    if(!isHTML)isHTML = (name.indexOf("HTML")>=0);
    var tags = xml.getElementsByTagName(name)[0];
    if(tags==null)return null;
    if(tags.childNodes.length==0)if(isARRAY)return [];else return null;
    var value = tags.childNodes[0].nodeValue;
    if(isHTML)value = makeHTML(tags.innerHTML);
    if(value == "undefined"){return null;}
    else if(isARRAY){
        value = value.split(",");
        if(value.length==1&&value[0]=="")return [];
        else return value;
    }
    else return value;
}
cleanHTML = function(text){
    text = text.replace(/&/g,"&amp;");
    text = text.replace(/'/g,"&apos;");
    text = text.replace(/"/g,"&quot;");
    text = text.replace(/</g,"&lt;");
    text = text.replace(/>/g,"&gt;");
    return text;
}
makeHTML = function(text){
    text = text.replace(/&apos;/g,"\'");
    text = text.replace(/&quot;/g,"\"");
    text = text.replace(/&lt;/g,"<");
    text = text.replace(/&gt;/g,">");
    text = text.replace(/&amp;/g,"&");
    return text;
}


//constants declaration
const cellSpacing = 20;
const emptyWeekSize=60;
const colIconSize=100;
const defaultCellWidth=280;
const minCellHeight=50;
const cellDropdownHeight=16;
const cellDropdownPadding=0;
const wfStartX=cellSpacing;
const wfStartY=cellSpacing;
const defaultIconPadding=12;
const defaultTextPadding=0;
const defaultIconWidth=36;
const bracketWidth=10;
const bracketTabWidth=80;
const bracketTabHeight=80;
const bracketTriangleWidth=30;
const defaultCommentSize=36;
const exitPadding=cellSpacing;
const tagBoxPadding = 5;
const tagHeight = 20;

//Colours
const SALTISEGREEN = '#369934';
const SALTISEBLUE = '#1976bc';
const SALTISERED = '#cc3c23';
const SALTISEORANGE = '#cc922d';
const SALTISELIGHTBLUE = '#1293b3';
// default values:
//const SALTISEGREEN = '#46c443';
//const SALTISEBLUE = '#1976bc';
//const SALTISERED = '#ed4528';
//const SALTISEORANGE = '#eba833';
//const SALTISELIGHTBLUE = '#54c0db';

//Styles
const defaultWeekStyle = 'fillColor=#e6e6e6;movable=0;resizable=0;strokeColor=none;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=13;fontStyle=1;fontColor=black;spacingLeft=20;';
const defaultWFAreaStyle = 'editable=0;fillColor=#FFFFFF;movable=0;resizable=0;strokeColor=black;verticalAlign=ALIGN_TOP;align=ALIGN_LEFT;fontSize=14;fontStyle=1;fontColor=black;';
const defaultLegendStyle = 'shape=label;editable=0;fillColor=#FFFFFF;resizable=0;strokeColor='+SALTISEBLUE+';strokeWidth=4;verticalAlign=ALIGN_TOP;fontSize=14;fontStyle=1;fontColor='+SALTISEBLUE+';spacingTop=8';
const defaultLegendLineStyle = 'shape=label;editable=0;fillColor=#FFFFFF;resizable=0;strokeColor=none;fontSize=12;fontStyle=1;fontColor='+SALTISEBLUE+';constituent=1;imageAlign=left;imageWidth=24;imageHeight=24;overflow=hidden;';
const defaultHeadStyle = "shape=label;fillColor=none;strokeColor=none;imageVerticalAlign=top;verticalAlign=bottom;imageAlign=center;resizable=0;imageWidth="+(colIconSize-40)+";imageHeight="+(colIconSize-40)+";fontSize=16;fontStyle=5;fontColor=black;";
const defaultNameStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=none;fontSize=14;fontColor=white;fillColor=none;overflow=hidden;editable=0;fontStyle=1;fontFamily=arial;";
const defaultWFNodeStyle="whiteSpace=wrap;strokeColor=black;strokeWidth=2;editable=0;fontColor=black;resizable=0;";
const defaultIconStyle="shape=image;constituent=1;resizable=0;editable=0;strokeColor=none;fillColor=none;";
const defaultTextStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=black;strokeWidth=2;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=left;verticalAlign=top;";
const defaultTitleStyle="whiteSpace=nowrap;resizable=0;movable=0;fontSize=22;fontStyle=1;fontColor=black;fillColor=none;strokeColor=none;align=left;";
const defaultTagBoxStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeColor=none;fontSize=12;fontColor=black;fillColor=none;overflow=hidden;editable=0;align=left;verticalAlign=top;";
const defaultTagStyle="whiteSpace=wrap;constituent=1;resizable=0;strokeWidth=3;fontSize=12;fontColor=black;fillColor=white;overflow=hidden;editable=0;align=left;verticalAlign=top;rounded=1;arcSize=50;spacingLeft=20;";
const defaultDropDownStyle="constituent=1;resizable=0;spacingTop=-20;spacingLeft=10;editable=0;strokeColor=black;fontSize=40;align=left;strokeWidth=2;fillColor=#FFFFFF;shape=label;imageWidth=12;imageHeight=4;imageAlign=center;";
const defaultBracketStyle="editable=0;fillColor=none;strokeColor=none;";
const defaultBracketBarStyle="constituent=1;editable=0;fillColor=black;strokeColor=black;resizable=0;";
const invisibleStyle = "editable=0;movable=0;resizable=0;fillColor=none;strokeColor=none;constituent=1;"
const bracketTriangleStyle = "shape=triangle;editable=0;movable=0;resizable=0;fillColor=#ed4528;strokeColor=none;rotation=180;constituent=1;";
const bracketSquareStyle = "shape=label;editable=0;movable=0;resizable=0;imageAlign=right;fillColor=#ed4528;strokeColor=#ed4528;constituent=1;";
const bracketCircleStyle = "shape=ellipse;fillColor=white;strokeColor=#ed4528;editable=0;movable=0;resizable=0;constituent=1;";
const bracketIconStyle = "shape=label;fillColor=none;strokeColor=none;editable=0;movable=0;resizable=0;imageAlign=center;imageWidth=48;imageHeight=48;constituent=1;"
const defaultEdgeStyle = "editable=0;movable=0;resizable=0;bendable=0;edgeStyle=orthogonalEdgeStyle;strokeColor=black;rounded=1;fontColor=black;labelBackgroundColor=white;labelBorderColor=black;labelPadding=2;";
const defaultCommentStyle = "shape=label;imageAlign=center;padding=4;editable=0;resizable=0;whiteSpace=wrap;fillColor=#ffff88;strokeColor=black;image=resources/images/comment32.png;";

//Icons
const iconsList={
    strategy:[
        {text:{en:'Jigsaw',fr:"Groupe d'experts"},value:'jigsaw'},
        {text:{en:'Peer Instruction',fr:"Enseignement par les pairs"},value:'peer-instruction'},
        {text:{en:'Case Studies',fr:"Étude de cas"},value:'case-studies'},
        {text:{en:'Gallery Walk',fr:"Galerie"},value:'gallery-walk'},
        {text:{en:'Reflective Writing',fr:"Écriture réflexive"},value:'reflective-writing'},
        {text:{en:'Two-Stage Exam',fr:"Examen en deux temps"},value:'two-stage-exam'},
        {text:{en:'Toolkit',fr:"Boite à outils"},value:'toolkit'},
        {text:{en:'One Minute Paper',fr:"Papier-minute"},value:'one-minute-paper'},
        {text:{en:'Distributed Problem Solving',fr:"Atelier de résolution de problème"},value:'distributed-problem-solving'},
        {text:{en:'Peer Assessment',fr:"Évaluation par les pairs"},value:'peer-assessment'}
    ],
    context:[
        {text:{en:'Individual Work',fr:"Travail Individuel"},value:'solo'},
        {text:{en:'Work in Groups',fr:"Travail en Groupe"},value:'group'},
        {text:{en:'Whole Class',fr:"Classe"},value:'class'}
    ],
    task:[{text:{en:'Gather Information',fr:"Collecter Des Informations"},value:'research'},
          {text:{en:'Discuss',fr:"Discuter"},value:'discuss'},
          {text:{en:'Problem Solve',fr:"Résolution de Problèmes"},value:'problem'},
          {text:{en:'Analyze',fr:"Analyser"},value:'analyze'},
          {text:{en:'Assess/Review Peers',fr:"Examiner Ses Pairs"},value:'peerreview'},
          {text:{en:'Evaluate Peers',fr:"Évaluer Ses Pairs"},value:'evaluate'},
          {text:{en:'Debate',fr:"Débat"},value:'debate'},
          {text:{en:'Game/Roleplay',fr:"Jeu"},value:'play'},
          {text:{en:'Create/Design',fr:"Créer/Concevoir"},value:'create'},
          {text:{en:'Revise/Improve',fr:"Réviser/Améliorer"},value:'practice'},
          {text:{en:'Read',fr:"Lire"},value:'reading'},
          {text:{en:'Write',fr:"Écrire"},value:'write'},
          {text:{en:'Present',fr:"Présentation"},value:'present'},
          {text:{en:'Experiment/Inquiry',fr:"Expérience/Enquête"},value:'experiment'},
          {text:{en:'Quiz/Test',fr:"Quiz/Test"},value:'quiz'},
          {text:{en:'Resource Curation/Preparation',fr:"Préparation Des Ressources"},value:'curation'},
          {text:{en:'Instructor Decision',fr:"Décision (Instructeur)"},value:'decision'},
          {text:{en:'Orchestration',fr:"Orchestration"},value:'orchestration'},
          {text:{en:'Other',fr:"Autre"},value:'other'}
         ],
    assessment:[
        {text:{en:'Formative',fr:"Exercices/Quiz"}, value:'exercise'},
        {text:{en:'Summative',fr:"Tests/Projets"},value:'test'},
        {text:{en:'Comprehensive',fr:"Exhaustif"},value:'exam'}
    ],
    column:[
        {text:{en:'Home',fr:"Hors Classe"},value:'home'},
        {text:{en:'Instructor',fr:"Instructeur"},value:'instructor'},
        {text:{en:'Students',fr:"Étudiants"},value:'students'},
        {text:{en:'Activity',fr:"Activité"},value:'lesson'},
        {text:{en:'Assessment',fr:"Évaluation"},value:'assessment'},
        {text:{en:'Preparation',fr:"Préparation"},value:'homework'},
        {text:{en:'Artifact',fr:"Artefact"},value:'artifact'},
        {text:{en:'Individual',fr:"Individuel"},value:'solo'},
        {text:{en:'Group',fr:"Groupe"},value:'group'},
        {text:{en:'Class',fr:"Classe"},value:'class'}
    ]
};

const iconpath='resources/data/';


//Language
var USER_LANGUAGE = 'en';
const LANGUAGE_TEXT = {
    menus:{
        file:{en:'File',fr:'Fichier'},
        edit:{en:'Edit',fr:'Édition'},
        view:{en:'View',fr:'Vue'},
        language:{en:"Language",fr:"Langue"},
        help:{en:'Help',fr:'Aide'},
        newproject:{en:'New Project',fr:'Nouveau Projet'},
        saveproject:{en:'Save Project',fr:'Enregistrer'},
        openproject:{en:'Open Project',fr:'Ouvrir'},
        exportwf:{en:'Export Current Workflow',fr:'Exporter'},
        importwf:{en:'Import a Workflow',fr:'Importer'},
        readonly:{en:'Save Read Only',fr:'Copie Lecture Seule'},
        undo: {en:'Undo',fr:'Annuler'},
        redo: {en:'Redo',fr:' Rétablir'},
        duplicate:{en:'Duplicate Current Workflow',fr:"Dupliquer Tracé"},
        expand:{en:'Expand All',fr:"Développer Tout"},
        collapse:{en:'Collapse All',fr:" Réduire tout"},
        printerfriendly:{en:'Printer Friendly Version',fr:"Version Imprimante"},
        legend:{en:'Show/Hide Legend',fr:"Afficher/Masquer La Légende"},
        toggleoutcome:{en:'Toggle Outcome View',fr:"Basculer L’affichage Résultats"},
        terminology:{en:'Terminology',fr:"Terminologie"},
        terminologystandard:{en:'Standard',fr:"Standard"},
        terminologycegep:{en:'CEGEP',fr:"CÉGEP"},
        genhelp:{en:'General Help',fr:"Aide Generale"},
        layouthelp:{en:'About the Layout',fr:"Aide du Layout"},
        privacypolicy:{en:'Privacy Policy',fr:"Politique de Confidentialité"}
    },
    layoutnav:{
        project:{en:'Project',fr:"Projet"},
        projectreanmetitle:{en:"Rename Project",fr:"Renommer Le Projet"},
        projectrename:{en:'Enter a name for your project',fr:"Entrez un nom pour votre projet"},
        layout:{en:"Layout",fr:"Structure"},
        cancel:{en:'Cancel',fr:'Annuler'},
        addwf:{en:'Add Workflow',fr:"Adjouter un Tracé"},
        outcomes:{en:'Outcomes',fr:'Les Résultats'},
        createnew:{en:'Create New',fr:'Créer Un Nouveau'}
    },
    workflow:{
        activity:{en:"Activity",fr:"Activité"},
        course:{en:"Course",fr:"Cours"},
        program:{en:"Program",fr:"Programme"},
        newactivity:{en:"New Activity",fr:"Nouvelle Activité"},
        newcourse:{en:"New Course",fr:"Nouveau Cours"},
        newprogram:{en:"New Program",fr:"Noveau Programme"},
        inserttitle:{en:"Insert Title Here",fr:'Placez Le Titre Ici'},
        insertauthor:{en:"Insert Author Here",fr:"Placez Le Nom de L'Auteur Ici"}
    },
    editbar:{
        editnode:{en:'Edit Node',fr:'Modifier Le Noeud'},
        title:{en:'Title',fr:'Titre'},
        description:{en:'Description',fr:'Description'},
        righticon:{en:'Right Icon',fr:'Icône de Droite'},
        lefticon:{en:'Left Icon',fr:'Icône Gauche'},
        linkedwf:{en:'Linked Workflow',fr:'Tracé en lien'},
        tags:{en:'Outcomes',fr:'Résultats'},
        none:{en:'None',fr:'Aucun'},
        chooseone:{en:"Select a tag to add",fr:'Choisissez-en un à ajouter'},
        createnew:{en:"Create new ",fr:"Créer nouveau "},
        insertdescription:{en:"Insert a description here.",fr:"Insérez la description ici."},
        nameplaceholder:{en:"<Name>",fr:"<Nom>"}
    },
    workflowview:{
        nodeheader:{en:"Nodes",fr:"Noeuds"},
        jumpto:{en:"Jump To",fr:"Raccourcis"},
        strategiesheader:{en:"Strategies",fr:"Stratégies"},
        outcomesheader:{en:"Outcomes",fr:"Résultats"},
        assignoutcome:{en:"Assign Outcome",fr:"Attribuer"},
        nooutcomes:{en:"No outcomes have been added yet! Use the buttons below to add one.",fr:"Aucun résultat a été ajouté! Utilisez les boutons ci-dessous pour en ajouter un."},
        selectset:{en:"Select set to add",fr:'Choisissez-en un à ajouter'},
        addcomment:{en:"Add Comment",fr:"Ajouter un commentaire"},
        edittitle:{en:"Edit Title",fr:"Modifier le titre"},
        whatsthis:{en:"What's This?",fr:"Aide"},
        draganddrop:{en:"\A Drag and drop to add",fr:"\A Glisser-déplacer pour ajouter"}
    },
    outcomeview:{
        total:{en:"Total",fr:"Totale"},
        grandtotal:{en:"Grand Total",fr:"Somme Finale"},
        uncategorized:{en:"Uncategorized",fr:"Non-Classé"},
        complete:{en:"Complete",fr:"Complet"},
        incomplete:{en:"Incomplete",fr:"Incomplet"},
        partial:{en:"Partial",fr:"Partiel"},
        displayheader:{en:"Display",fr:"Affichage"},
        sortbyheader:{en:"Sort By",fr:"Trier Par"},
        sortradio:{
            week:{en:"Week",fr:"Semaine"},
            icon:{en:"Icon",fr:"Icône"},
            column:{en:"Column",fr:"Colonne"}
        }
    },
    tag:{
        deletetext:{en:"Delete this learning outcome? Warning: this will delete all contents and remove them from all workflows!",fr:"Supprimer ce Résulat? Attention: cela supprimera tous les contenus et les supprimera de tous les tracé!"},
        unassigntext:{en:"Unassign this learning outcome? Note: this will NOT delete the learning outcome, but WILL remove all references to it from the workflow.",fr:"Annuler l'attribution de ce Résultat? Attention: cela ne supprimera PAS le Résultat, mais supprimera toutes les références à celui-ci du tracé."},
        standard:{
            depth0:{en:"Program Outcome",fr:"Résultat de Programme"},
            depth1:{en:"Course Outcome",fr:"Résultat de Cours"},
            depth2:{en:"Activity Outcome",fr:"Résultat d'Activité"},
            depth3:{en:"Tag",fr:"Tag"}
        },
        cegep:{
            depth0:{en:"Competency",fr:"Compétence"},
            depth1:{en:"Element of Competency",fr:"Éléments de compétence"},
            depth2:{en:"Learning Outcome",fr:"Objectif d'apprentissage"},
            depth3:{en:"Tag",fr:"Tag"}
        },
        new:{en:"New",fr:"Nouveau"},
        tagbuilder:{en:"<h3 class='hideforprint'>Learning Outcomes:</h3><p class='hideforprint'>This page allows you to create outcomes. For an explanation of the outcomes, click here:",fr:"<h3 class='hideforprint'>Objectifs d'apprentissage:</h3><p class='hideforprint'>Cette page vous permet de créer des Résultats. Pour une explication des Résultats, cliquez ici:"}
        
    
    },
    column:{
        HW:{
            text:{en:'Preparation',fr:'Preparation'},
            nodetext:{en:'Preparation',fr:'Preparation'}
        },
        AC:{
            text:{en:'Lessons',fr:'Leçons'},
            nodetext:{en:'Lesson',fr:'Leçon'}
        },
        SA:{
            text:{en:'Assessments',fr:'Évaluations'},
            nodetext:{en:'Assessment',fr:'Évaluation'}
        },
        FA:{
            text:{en:'Artifacts',fr:'Artefacts'},
            nodetext:{en:'Artifact',fr:'Artefact'}
        },
        OOC:{
            text:{en:'Out of Class (Students)',fr:'Hors Classe (Étudiants)'},
            nodetext:{en:'Home (Students)',fr:'Hors Classe (Étudiants)'}
        },
        ICI:{
            text:{en:'In Class (Instructor)',fr:'En Classe (Instructeur)'},
            nodetext:{en:'Instructor',fr:'Instructeur'}
        },
        OOCI:{
            text:{en:'Out of Class (Instructor)',fr:'Hors Classe (Instructeur)'},
            nodetext:{en:'Home (Instructor)',fr:'Hors Classe (Instructeur)'}
        },
        ICS:{
            text:{en:'In Class (Students)',fr:'En Classe (Étudiants)'},
            nodetext:{en:'Students',fr:'Étudiants'}
        },
        CO:{
            text:{en:'Courses',fr:'Cours'},
            nodetext:{en:'Course',fr:'Cour'}
        },
        CUS:{
            text:{en:'Custom Column',fr:'Colonne Personnalisée'},
            nodetext:{en:'New Custom',fr:'Nouvelle Colonne'}
        },
        CUSP:{
            text:{en:'Course Category',fr:'Catégorie de Cours'},
            nodetext:{en:'New Category',fr:'Nouvelle Catégorie'}
        },
        modifytext:{en:'Edit label',fr:"Modifier l'étiquette"},
        colourpicker:{en:'Colour',fr:"Couleur"},
        delete:{en:'Delete column',fr:"Supprimer la colonne"},
        deletelast:{en:"You can't delete the last column!",fr:"Vous ne pouvez pas supprimer la dernière colonne!"},
        icon:{en:"Icon",fr:"Icône"}
    },
    week:{
        week:{en:"Week",fr:"Semaine"},
        term:{en:"Term",fr:"Session"},
        part:{en:"Part",fr:"Partie"},
        modifytext:{en:'Edit label',fr:"Modifier l'étiquette"},
        duplicate:{
            week:{en:'Duplicate Week',fr:"Dupliquer cette semaine"},
            term:{en:'Duplicate Term',fr:"Dupliquer cette session"},
            part:{en:'Duplicate Part',fr:"Dupliquer cette partie"}
        },
        delete:{
            week:{en:'Delete Week',fr:"Supprimer cette semaine"},
            term:{en:'Delete Term',fr:"Supprimer cette session"},
            part:{en:'Delete Part',fr:"Supprimer cette partie"}
        },
        collapse:{
            week:{en:'Collapse Week',fr:"Réduire cette semaine"},
            term:{en:'Collapse Term',fr:"Réduire cette session"},
            part:{en:'Collapse Part',fr:"Réduire cette partie"}
        },
        createbelow:{
            week:{en:'Insert week below',fr:"Insérer une semaine"},
            term:{en:'Insert term below',fr:"Insérer une session"},
            part:{en:'Insert part below',fr:"Insérer une partie"}
        },
        move:{
            week:{en:'Move week',fr:"Déplacer la semaine"},
            term:{en:'Move term',fr:"Déplacer la session"},
            part:{en:'Move part',fr:"Déplacer la partie"}
        },
        options:{en:"Style",fr:"Style"},
        simple:{en:"Simple",fr:"Simple"},
        parts:{en:"Parts",fr:"En Parties"}
    },
    node:{
        defaulttext:{en:"Click to edit",fr:"Cliquez pour modifier"},
        delete:{en:"Delete Node",fr:"Supprimer ce noeud"},
        duplicate:{en:"Duplicate Node",fr:"Dupliquer ce noeud"},
        createbelow:{en:'Insert node below',fr:"Insérer un noeud"},
        righticon:{en:'Right Icon',fr:'Icône de Droite'},
        lefticon:{en:'Left Icon',fr:'Icône Gauche'},
        modifytext:{en:'Edit label',fr:"Modifier l'étiquette"},
        showhide:{en:"Show/Hide Description",fr:"Afficher/masquer la description"},
        setlinkedwf:{en:"Set Linked WF",fr:"Tracé en lien"}
    },
    bracket:{
        delete:{en:"Delete Bracket",fr:"Supprimer cette stratégie"}
    },
    comment:{
        addcomment:{en:"Add Comment",fr:"Ajouter un commentaire"},
        delete:{en:"Delete Comment",fr:"Supprimer ce commentaire"},
        show:{en:"Show",fr:"Afficher"}
    },
    confirm:{
        navigate:{en:'Are you sure you want to navigate away?',fr:'Êtes-vous sûr de vouloir quitter?'},
        newproject:{en:"Are you sure you want to continue? You will lose any unsaved work.",fr:"Êtes-vous sûr de vouloir continuer? Vous perdrez tout travail non enregistré."},
        deleteworkflow:{en:"Delete this workflow? Warning: this will delete all contents (but not any workflows used by it)!",fr:"Supprimer ce tracé? Ceci supprimera tout le contenu."},
        unassignworkflow:{en:"Unassign this workflow? Note: this will NOT delete the workflow, but WILL remove this reference to it from the parent workflow.",fr:"Annuler l'attribution de ce tracé? Cela ne supprimera PAS le tracé mais supprimera cette référence du parent."},
        deletecolumn:{en:"Delete this column?",fr:"Supprimer cette colonne?"},
        deleteweek:{
            week:{en:"Delete this week? Warning: this will delete any nodes still inside!",fr:"Supprimer cette semain? Attention: cela supprimera tous les nœuds encore à l'intérieur!"},
            term:{en:"Delete this term? Warning: this will delete any nodes still inside!",fr:"Supprimer cette session? Attention: cela supprimera tous les nœuds encore à l'intérieur!"},
            part:{en:"Delete this part? Warning: this will delete any nodes still inside!",fr:"Supprimer cette partie? Attention: cela supprimera tous les nœuds encore à l'intérieur!"}
        },
        linkwf:{en:"This node already has outcomes assigned to it. Do you want to assign these to the newly linked workflow?",fr:"Ce noeud a déjà des résultats qui lui sont attribuer. Voulez-vous les attribuer au tracé nouvellement lié?"},
        unlinkwf:{en:"You've unlinked a workflow from a node with outcomes. Do you want to clear the outcomes from the node?",fr:"Vous avez dissocié un tracé d'un noeud avec des outcomes. Voulez-vous effacer les tracé du noeud?"},
        deletenode:{en:"Delete this node?",fr:"Supprimer ce noeud?"},
        deletecomment:{en:"Delete this comment?",fr:"Supprimer ce commentaire?"},
    },
    legend:{
        legend:{en:"Legend",fr:"Légende"},
        task:{en:"Task Icons",fr:"Icônes de Tâche"},
        context:{en:"Context Icons",fr:"Icônes de Contexte"},
        strategy:{en:"Strategy Icons",fr:"Icônes de Stratégie"},
        assessment:{en:"Assessment Icons",fr:"Icônes d'Évaluation"},
        column:{en:"Column Icons",fr:"Icônes de Colonne"}
    },
    errors:{
        openoutcome:{en:"Oops! The outcome could not be opened.",fr:"Oups! Le résultat n'a pas pu être ouvert."},
        filesave:{en:"Oops! The file could not be saved.",fr:"Oups! Le fichier n'a pas pu être enregistré."},
        fileopen:{en:"Oops! The file could not be opened.",fr:"Oups! Impossible d'ouvrir le fichier."},
        undo:{en:"Oops! Something went wrong with the undo function.",fr:"Oups! Quelque chose s'est mal passé avec la fonction d'annulation."},
        redo:{en:"Oops! Something went wrong with the redo function.",fr:"Oups! Quelque chose s'est mal passé avec la fonction de rétablissement."},
        wfopen:{en:"Oops! The workflow could not be opened.",fr:"Oups! Impossible d'ouvrir le tracé."},
        printchrome:{en:"Warning: based on your browser, you may need to change your paper size (to A4) from the default when printing. Failing to do so can result in a blank page.",fr:"Avertissement: en fonction de votre navigateur, vous devrez peut-être modifier le format du papier (en A4) lors de l'impression. Si vous ne le faites pas, cela peut entraîner une page vierge."}
        
    }
}

const columnValues={
    HW:{image:"homework",colour:SALTISELIGHTBLUE},
    AC:{image:"lesson",colour:SALTISEGREEN},
    SA:{image:"assessment",colour:SALTISERED},
    FA:{image:"artifact",colour:SALTISEORANGE},
    OOC:{image:"home",colour:SALTISELIGHTBLUE},
    ICI:{image:"instruct",colour:SALTISEORANGE},
    OOCI:{image:"ooci",colour:SALTISERED},
    ICS:{image:"students",colour:SALTISEGREEN},
    CO:{image:"instruct",colour:SALTISEGREEN},
    CUS:{image:"instruct",colour:"#a3b9df"},
    CUSP:{image:"other",colour:SALTISEGREEN}
}

function setMenuLanguage(){
    $("#file").html(LANGUAGE_TEXT.menus.file[USER_LANGUAGE]);
    $("#new").children().first().html(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
    $("#open").children().first().html(LANGUAGE_TEXT.menus.openproject[USER_LANGUAGE]);
    $("#save").children().first().html(LANGUAGE_TEXT.menus.saveproject[USER_LANGUAGE]);
    $("#export").children().first().html(LANGUAGE_TEXT.menus.exportwf[USER_LANGUAGE]);
    $("#import").children().first().html(LANGUAGE_TEXT.menus.importwf[USER_LANGUAGE]);
    $("#savereadonly").children().first().html(LANGUAGE_TEXT.menus.readonly[USER_LANGUAGE]);
    $("#edit").html(LANGUAGE_TEXT.menus.edit[USER_LANGUAGE]);
    $("#undo").children().first().html(LANGUAGE_TEXT.menus.undo[USER_LANGUAGE]);
    $("#redo").children().first().html(LANGUAGE_TEXT.menus.redo[USER_LANGUAGE]);
    $("#duplicatewf").children().first().html(LANGUAGE_TEXT.menus.duplicate[USER_LANGUAGE]);
    $("#view").html(LANGUAGE_TEXT.menus.view[USER_LANGUAGE]);
    $("#expand").children().first().html(LANGUAGE_TEXT.menus.expand[USER_LANGUAGE]);
    $("#collapse").children().first().html(LANGUAGE_TEXT.menus.collapse[USER_LANGUAGE]);
    $("#print").children().first().html(LANGUAGE_TEXT.menus.printerfriendly[USER_LANGUAGE]);
    $("#showlegend").children().first().html(LANGUAGE_TEXT.menus.legend[USER_LANGUAGE]);
    $("#outcomeview").children().first().html(LANGUAGE_TEXT.menus.toggleoutcome[USER_LANGUAGE]);
    $("#terminology").children().first().html(LANGUAGE_TEXT.menus.terminology[USER_LANGUAGE]);
    $("#terminologystandard").children().first().html(LANGUAGE_TEXT.menus.terminologystandard[USER_LANGUAGE]);
    $("#terminologycegep").children().first().html(LANGUAGE_TEXT.menus.terminologycegep[USER_LANGUAGE]);
    $("#language").html(LANGUAGE_TEXT.menus.language[USER_LANGUAGE]);
    $("#help").html(LANGUAGE_TEXT.menus.help[USER_LANGUAGE]);
    $("#genhelp").children().first().html(LANGUAGE_TEXT.menus.genhelp[USER_LANGUAGE]);
    $("#layouthelp").children().first().html(LANGUAGE_TEXT.menus.layouthelp[USER_LANGUAGE]);
    $("#privacy").children().first().html(LANGUAGE_TEXT.menus.privacypolicy[USER_LANGUAGE]); $("#splashnewproject").html(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
    $("#splashopenproject").html(LANGUAGE_TEXT.menus.openproject[USER_LANGUAGE]);
    $("#splashrenametext").html(LANGUAGE_TEXT.layoutnav.projectrename[USER_LANGUAGE]);
    $("#projectheader").html(LANGUAGE_TEXT.layoutnav.project[USER_LANGUAGE]+":");
    $("#cancelrename").html(LANGUAGE_TEXT.layoutnav.cancel[USER_LANGUAGE]);
    $("#prrename").html(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
    $("#layoutheader").html(LANGUAGE_TEXT.layoutnav.layout[USER_LANGUAGE]+":");
    $("#outcomesheader").html(LANGUAGE_TEXT.layoutnav.outcomes[USER_LANGUAGE]+":");
    $("#addwfheader").html(LANGUAGE_TEXT.layoutnav.addwf[USER_LANGUAGE]+":");
    $("#newwfbutton").html(LANGUAGE_TEXT.layoutnav.createnew[USER_LANGUAGE]);
    $("#newcompbutton").html(LANGUAGE_TEXT.layoutnav.createnew[USER_LANGUAGE]);
    $("html").attr("lang",USER_LANGUAGE);
   
    
}

function purgeInvalidCharacters(input){
    input =  input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,'');
    return input;
}


/*This function would usually be called inside the graph initialization function of Project. However, for reasons I cannot seem to understand, it simply does not work inside the scope of a class function. I therefore define the function out here and call it.*/
function initializeConnectionPointForGraph(graph){
    // Returns the actual point for a port by redirecting the constraint to the port
        graph.getConnectionPoint = function(vertex, constraint)
        {
            if (constraint.id != null && vertex != null && vertex.shape != null)
            {
                var port = vertex.shape.getPorts()[constraint.id];

                if (port != null)
                {
                    constraint = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
                }
            }

            return mxGraph.prototype.getConnectionPoint.apply(this, arguments);
        }
        
        
}

//Overwrite Quill's default link sanitization to add http
var Link = Quill.import('formats/link');
var builtInFunc = Link.sanitize;
Link.sanitize = function customSanitizeLinkInput(linkValueInput) {
    var val = linkValueInput;

    // do nothing, since this implies user's already using a custom protocol
    if (/^\w+:/.test(val));
    else if (!/^https?:/.test(val))
        val = "http://" + val;

    return builtInFunc.call(this, val); // retain the built-in logic
};

// These should be defined only once, otherwise they end up iterating through themselves multiple times.
var insertEdgePrototype = mxConnectionHandler.prototype.insertEdge;
var drawPreviewPrototype = mxVertexHandler.prototype.drawPreview;


//Make a div resizable either to the left or right
function makeResizable(div,direction){
        
    var handle = document.createElement("div");
    handle.className="panelresizehandle";

    var getWidth = function(x,bound){return null;}
    var padding = int(getComputedStyle(div)["padding-left"])+int(getComputedStyle(div)["padding-right"]);
    switch(direction){
            case 'left':
                handle.style.width="5px";
                handle.style.height="100%";
                handle.style.top="0px";
                handle.style.left="0px";
                getWidth = function(x,bound){return bound.right-x;} 
                break;
            case 'right':
                handle.style.width="5px";
                handle.style.height="100%";
                handle.style.top="0px";
                handle.style.right="0px";
                getWidth = function(x,bound){return x-bound.left;} 
                break;

    }

    function resize(evt){
        var newWidth = getWidth(evt.clientX,div.getBoundingClientRect())-padding;
        if(newWidth<100)newWidth=100;
        if(newWidth>window.innerWidth-200)newWidth = window.innerWidth-200;
        div.style.width = newWidth+"px";
    }
    function stopResize(evt){
        window.removeEventListener("mousemove",resize);
    }



    handle.addEventListener("mousedown",function(e){
        e.preventDefault();
        window.addEventListener("mousemove",resize);
        window.addEventListener("mouseup",stopResize,true);
    });
    div.appendChild(handle);
}


/*Send an event to Google Analytics.
Categories: 
    Save/Open
    Workflow
    Outcome
    Node
    Bracket
    Column
    Week
    Comment
    Outcome
    View
*/
function gaEvent(category,action,label,value){
    gtag('event',action,{'event_category':category,'event_label':label/*,'event_value':value*/});
}

function gaError(source,err){
    var errormessage = err.name+": "+err.message;
    if(err.fileName)errormessage+=" file "+err.fileName;
    if(err.lineNumber)errormessage+=" line "+err.lineNumber;
    gtag('event',source,{'event_category':'Error','event_label':errormessage});
}