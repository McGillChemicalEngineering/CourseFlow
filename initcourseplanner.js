//Starts the program, and ensures the user cannot navigate away without confirmation.

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

//Start of the program, invoked by onLoad()
function main(container)
{
    
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported())
    {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else
    {
        if(window.navigator.language.substr(0,2)=='fr')USER_LANGUAGE='fr';
        var nav = LANGUAGE_TEXT.confirm.navigate[USER_LANGUAGE]
        window.onbeforeunload = function() {
          return nav;
        }
        setMenuLanguage();
        $("#english").get()[0].onclick = function(){USER_LANGUAGE='en';setMenuLanguage();};
        $("#french").get()[0].onclick = function(){USER_LANGUAGE='fr';setMenuLanguage();};
        makeSplashpage(container);
        
        //Create the popup menu
        document.addEventListener('contextmenu',function(evt){
            
            if(evt.shiftKey)return evt;
            evt.preventDefault();
            var target = evt.target;
            while(target.contextItem==null){
                target = target.parentElement;
                if(target==null)return;
            }
            var context = new CFContext(document.body,target.contextItem,evt.pageX,evt.pageY);
            context.populate();
            context.open();

        },false);
        
    }
} //End of main

function makeSplashpage(container){
    var splashpage = document.getElementById('splashpage');
    splashpage.style.display="inline";
    splashpage.firstElementChild.style.top='calc(50% - 160px)';
    var newfile = document.getElementById('splashnewfile');
    var openfile = document.getElementById('splashopenfile');
    newfile.onclick = function(){
        var project = new Project(container);
        project.requestName(LANGUAGE_TEXT.menus.newproject[USER_LANGUAGE]);
        setTimeout(function(){splashpage.style.opacity="0";splashpage.style.display="none";},500);
    }
    openfile.onclick = function(){
        var project = new Project(container);
        document.getElementById('open').click();
    }
    $('#new')[0].onclick = function(){newfile.click();}
    $('#open')[0].onclick = function(){openfile.click();}

}






