
//This message request is handled by eventHandler.js, which then requests it from contentScript
function requestAnalysisForINPROGRESSGame(){
	const messengerObject = {
		message: "INPROGRESSANALYSISREQUEST"
	}
	chrome.runtime.sendMessage(messengerObject);
};

let INPROGRESSAnalysisRequest = document.querySelector("#INPROGRESSAnalysis");
INPROGRESSAnalysisRequest.addEventListener("click", requestAnalysisForINPROGRESSGame);

//Turns out popup.js isn't accessible if the popup isn't open
//Therefore the best way to handle data is to simply ask for it whenever the popup opens
chrome.runtime.sendMessage(undefined, {message: "HYDRATEPOPUP"})

chrome.runtime.onMessage.addListener(messengerObject => {
	if(messengerObject.message === "CONSTRUCTGAMELIST"){
		const gameListData = messengerObject.data
		let gameList = document.querySelector("#listOfGames");
		gameListData.forEach(gameObject => {
			let gameListItem = document.createElement("p");
			gameListItem.textContent = gameObject.primaryUsername;
			gameList.appendChild(gameListItem)
		})
	}
});