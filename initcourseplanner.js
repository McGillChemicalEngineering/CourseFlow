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
        var project = new Project(container);
        
        
    }
        
        


} //End of main










