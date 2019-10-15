	/*The script to be injected by lichessOpener*/ 

/*
 *This script requests a PGN, pastes it into the textArea, and clicks the import button.
 */


function pastePGN(PGN){
	let textArea = document.querySelector("#form3-pgn");
	textArea.value = PGN;
}

function clickImport(){
	importButton = document.querySelector(".submit");
	importButton.click();
}

//PGN is set by lichessOpener.js
chrome.storage.local.get("PGN", (PGNWrapper) => {
	const PGN = PGNWrapper.PGN;
	chrome.storage.local.remove("PGN");
	pastePGN(PGN);
	clickImport();
});