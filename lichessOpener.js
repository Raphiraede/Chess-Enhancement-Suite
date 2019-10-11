async function openLichessAndPastePGN(PGN){
	const tabId = await openLichess();
	this.tabId = tabId
	
	chrome.storage.local.set({PGN}, () => { //Setting the PGN to local storage for lichessScript to retrieve
		chrome.tabs.executeScript(tabId, {
			file: "lichessScript.js"
		})
	})
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