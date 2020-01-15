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
        window.onbeforeunload = function() {
          return "Are you sure you want to navigate away?";
        }
        try{console.log(window.fileToOpen);}catch{}
        try{console.log(fileToOpen);}catch{}
        makeSplashpage(container);
        setTimeout(function(){try{console.log(window.fileToOpen)}catch{}},3000);
        setTimeout(function(){try{console.log(fileToOpen)}catch{}},3000);
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
        project.requestName("New Project");
        setTimeout(function(){splashpage.style.opacity="0";splashpage.style.display="none";},500);
    }
    openfile.onclick = function(){
        var project = new Project(container);
        document.getElementById('open').click();
    }
    $('#new')[0].onclick = function(){newfile.click();}
    $('#open')[0].onclick = function(){openfile.click();}

}






