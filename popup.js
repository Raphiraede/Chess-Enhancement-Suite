function openLichessAndPastePGN(){
	
};


function openLichess(){
	const createProperty = {
		url: "https://lichess.org/paste"
	}
	chrome.tabs.create (createProperty);
};


//This message request is handled by eventHandler.js, which then requests it from contenScript
function requestPGNForINPROGRESSGame(){
	chrome.runtime.sendMessage("INPROGRESSAnalysisRequest");
};


let INPROGRESSAnalysisRequest = document.querySelector("#INPROGRESSAnalysis");
INPROGRESSAnalysisRequest.addEventListener("click", function(){
	chrome.runtime.sendMessage("INPROGRESSAnalysisRequest");
});
