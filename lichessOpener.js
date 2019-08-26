function openLichessAndPastePGN(PGN){
	const tabId = openLichess();
	//Will handle the PGN request which lichessScript.js will send.
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
		if (message === "PGNForLichessScript"){
			sendResponse({PGN:PGN});
		}
	});
	chrome.tabs.executeScript(tabId, {file:'lichessScript.js'});
};


function openLichess(){
	const createProperty = {
		url: "https://lichess.org/paste"
	};
	let tabId;
	chrome.tabs.create (createProperty, function(tab){
		tabId = tab.id;
	});
	return tabId;
};