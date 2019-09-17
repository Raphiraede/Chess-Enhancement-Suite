
//This message request is handled by eventHandler.js, which then requests it from contentScript
function requestAnalysisForINPROGRESSGame(){
	const messengerObject = {
		message: "INPROGRESSAnalysisRequest"
	}
	chrome.runtime.sendMessage(messengerObject);
};


let INPROGRESSAnalysisRequest = document.querySelector("#INPROGRESSAnalysis");
INPROGRESSAnalysisRequest.addEventListener("click", requestAnalysisForINPROGRESSGame);
