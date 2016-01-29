/*
CLICKY v0.2.00
createJS support
*/

define(function (require, exports, module) {
    
    //"use strict";
    
    
    var CommandManager = brackets.getModule("command/CommandManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        EditorManager  = brackets.getModule("editor/EditorManager"),
        Menus          = brackets.getModule("command/Menus");
    
    var DocumentManager = brackets.getModule("document/DocumentManager"),
        ProjectManager  = brackets.getModule("project/ProjectManager");

    function addMeta(){
        var re = /\d+[x]\d+/; 
        var filenaam=DocumentManager.getCurrentDocument().file.name;
        var editor = EditorManager.getFocusedEditor();

        filenaam=filenaam.split("_");
        var m;
        var n;
        var w,h;
        for(i=0;i<filenaam.length;i++){            
            if ((m = re.exec(filenaam[i])) !== null) {
                if (m.index === re.lastIndex) {
                    re.lastIndex++;
                    n=m[0].split("x");
                    w=n[0];
                    h=n[1];
                    for (j = 0; j < 5; j++) {
                        if((editor.document.getLine(j)==="<head>")||(editor.document.getLine(j).substr(1,editor.document.getLine(j).length)==="<head>")||(editor.document.getLine(j).substr(2,editor.document.getLine(j).length)==="<head>")){
                            editor.document.replaceRange("\n<meta name=\"ad.size\" content=\"width="+w+",height="+h+"\">", {line: j}, {line: j});
                        }
                    }
                    
                }
            }
        }  
    }
    function init(){
        var files=DocumentManager.getAllOpenDocuments();
        
        files.forEach(function(bestand){
            console.log(bestand.file._name);
        });

        
     //   DocumentManager.closeAll();
    }
    // Function to run when the menu item is clicked
    function handleClicky() {

        var editor = EditorManager.getFocusedEditor();
        var numLines = 200;
        var i;
        var ranOnce=false;
        var reTitle = /.*\<title\>.*/;
        var reHead = /.*\<head\>.*/;
        var rehttpSwiff=/.*\<script type="text\/javascript" src="http:.*/;
        var reSwiffy = /.*\<div id="swiff.*/;
        var reSwiffyobject = /.*swiffyobject =.*/;
        var reScripthttp=/.*\<script src="http:.*/;
        var reBodyInit= /.*\<body onload="init\(\).*/;
        var reCreateJsCanvas = /.*createjs\.Ticker\.addEventListener\("tick", stage\);.*/;
        var reEdgeTag=/.*\<div id="Stage" class="EDGE.*/;
        var rehttpEdge=/.*\<script type="text\/javascript" charset="utf-8" src="http:.*/;    
        var reEnd = /.*\<\/body\>/;
        var endOfDoc=false;
        var tmpString;
        var tmpLineNumber;
        
        for (i = 1; i < numLines; i++) {
            
            var lijntje= editor.document.getLine(i);
            if(reSwiffyobject.exec(lijntje)!==null){
                console.log("found a swiffy!");
                tmpString=lijntje;
                lijntje="";
                tmpLineNumber=i;   
                editor.document.replaceRange("\n", {line:(i-1)},{line:i});
            }
            
            //createJS http issue
            if((reScripthttp.exec(lijntje) !== null)&&(!ranOnce)){
                editor.document.replaceRange("\n<script src=\"https:"+lijntje.substring(18,lijntje.length), {line:(i-1)},{line:i});
            }
            //createJS a-tag
            if((reBodyInit.exec(lijntje) !== null)&&(!ranOnce)){
                addClickTag(i+1);
                if(lijntje==="<body onload=\"init();\" style=\"background-color:#D4D4D4\">"){
                    editor.document.replaceRange("\n<body onload=\"init();\" style=\"background-color:#FFFFFF;margin:0;padding:0;\">", {line: i-1},{line: i});
                }
                i++;
            }
            //createJS canvas script
            if((reCreateJsCanvas.exec(lijntje) !== null)&&(!ranOnce)){
                editor.document.replaceRange("\n\n  \/\/ ASN EDIT -->\n if (window.devicePixelRatio) {\n        var height = canvas.getAttribute('height');\n       var width = canvas.getAttribute('width');\n     canvas.setAttribute('width', Math.round(width * window.devicePixelRatio));\n        canvas.setAttribute('height', Math.round( height * window.devicePixelRatio));\n     canvas.style.width = width+\"px\";\n        canvas.style.height = height+\"px\";\n      stage.scaleX = stage.scaleY = window.devicePixelRatio;\n    }\n \/\/\/\/\/\/\/\/\/", {line: i}, {line: i});
            }
            //edge a-tag
            if((reEdgeTag.exec(lijntje) !== null)&&(!ranOnce)){
                addClickTag(i);
                i++;
            }
            //edge http-issue
            if((rehttpEdge.exec(lijntje) !== null)&&(!ranOnce)){
                console.log(lijntje);
                console.log("\n<script type=\"text\/javascript\" charset=\"utf-8\" src=\"https: ----"+lijntje.substring(69,lijntje.length));
                editor.document.replaceRange("\n<script type=\"text\/javascript\" charset=\"utf-8\" src=\"https:"+lijntje.substring(61,lijntje.length), {line:(i-1)},{line:i});
            }
            //swiffy http issue
            if((rehttpSwiff.exec(lijntje) !== null)&&(!ranOnce)){
                editor.document.replaceRange("\n<script type=\"text\/javascript\" src=\"https:"+lijntje.substring(45,lijntje.length), {line:(i-1)},{line:i});
            }
            //swiffy a-Tag
            if((reSwiffy.exec(lijntje) !== null)&&(!ranOnce)){
                addClickTag(i);
                i++;
            }
            //title + clicktag script
            if(lijntje!="<title>AdSomeNoise output<\/title>"){
                if((reTitle.exec(lijntje)!==null)&&(!ranOnce)){
                     editor.document.replaceRange("\n\n<!-- ASN EDIT -->\n<title>AdSomeNoise output<\/title>\n<script type=\"text\/javascript\">\n  !function(){var a=\"\",i=function(i){try{var n=JSON.parse(i.data)}catch(e){return}if(n.isInitClickTag){if(n.clickTags)for(var c=0;c<n.clickTags.length;c++){var t=n.clickTags[c];window[t.name]=t.url}else n.clickTag&&(window.clickTag=n.clickTag);a=n.relegateNavigation}};open.call&&(window.open=function(i){return function(n,e,c){if(\"parent\"===a){var t={clickTag:n,isPostClickTag:!0};parent.postMessage(JSON.stringify(t),\"*\")}else{var o=[n,e];c&&o.push(c),i.apply(window,o)}}}(window.open)),window.addEventListener?window.addEventListener(\"message\",i,!1):window.attachEvent(\"onmessage\",i)}();var clickTag=\"https:\/\/www.google.com\"; \n<\/script>\n<!-- ASN EDIT -->\n\n", {line: i-1}, {line: i});
                }
            }
            //add metaTag
            if((reHead.exec(lijntje) !== null)&&(!ranOnce)){
                addMeta(i);   
                i+=2;
            }
            //ending a-tag (everywhere)
            if((reEnd.exec(lijntje) !== null)&&(!ranOnce)){
                editor.document.replaceRange("\n  <\/a>", {line: (i - 1) });
                ranOnce=true;
                
                if(tmpString!=null){
                    console.log(tmpLineNumber);
                    editor.document.replaceRange("\n"+tmpString+"\n",{line: tmpLineNumber}, {line: tmpLineNumber});
                }
                console.log("ended");
                break;
            }
            
        }//for Loop end

        // END   
    }
    function addClickTag(i){
        //this function adds a clicktag BEFORE the given line (i)
        var editor = EditorManager.getFocusedEditor();
        editor.document.replaceRange("\n  <a href=\"javascript:window.open(window.clickTag)\">", {line: i-1},{line: i-1});
    }
    
    function addMeta(i){
        var editor = EditorManager.getFocusedEditor();
        var re = /\d+[x]\d+/; 
        var filenaam=DocumentManager.getCurrentDocument().file.name;
        filenaam=filenaam.split("_");
        var m;
        var n;
        var w,h;
        for(i=0;i<filenaam.length;i++){            
            if ((m = re.exec(filenaam[i])) !== null) {
                if (m.index === re.lastIndex) {
                    re.lastIndex++;
                    n=m[0].split("x");
                    w=n[0];
                    h=n[1];
                    
                    editor.document.replaceRange("\n<meta name=\"ad.size\" content=\"width="+w+",height="+h+"\">\n", {line: (i+1)}, {line: (i+1)});
                }
            }
        }  
    }
    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "asn.clicky";   // package-style naming to avoid collisions
    CommandManager.register("Clicky", MY_COMMAND_ID, handleClicky);
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-Enter");
    
});
