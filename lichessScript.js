	/*The script to be injected by lichessOpener*/ 

/*
 *This script requests a PGN, pastes it into the textArea, and clicks the import button.
 */


function pastePGN(PGN){
	let textArea = document.querySelector("#form3-pgn");
	textArea.value = PGN;
}

function clickImport(){
	importButton = document.querySelector(".submit button text[type = 'submit']");
	importButton.click();
}

//This message is handled by lichessOpener.js, and NOT messageHandler.js
chrome.runtime.sendMessage (undefined, "PGNForLichessScript", function(PGN){
	pastePGN(PGN);
	clickImport();
});

