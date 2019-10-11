
//This message request is handled by controller.js, which then requests it from contentScript
function requestAnalysisForINPROGRESSGame(){
	const messengerObject = {
		message: "INPROGRESSANALYSISREQUEST"
	}
	chrome.runtime.sendMessage(messengerObject);
};

function createFormattedDate(date){
	let revivedDate = new Date(date)
	const formattedDate = `${revivedDate.getMonth() + 1}/${revivedDate.getDate()}/${revivedDate.getFullYear()}, ${revivedDate.getHours()}:${revivedDate.getMinutes()}`;
	return formattedDate;
}

function constructGameList(allGamesData){
	let gameList = document.createElement("ul");
	for (let i = allGamesData.length-1; i >= 0; i--){
		const formattedDate = createFormattedDate(allGamesData[i].date)
		const listItemTextContent = constructListItemTextContent(allGamesData[i], formattedDate);
		let gameListItem = document.createElement("li");
		gameListItem.textContent = listItemTextContent;
		gameListItem.id = allGamesData[i].id
		function handleClick() {
			const messengerObject = {
				message: "ANALYSESTOREDGAME",
				data: this.getAttribute("id")
			}
			chrome.runtime.sendMessage(undefined, messengerObject);
		}
		//gameListItem.addEventListener("click", handleClick);
		gameListItem.onclick = handleClick;
		gameListItem.className = "listItem";
		gameList.appendChild(gameListItem);
	}

	return gameList;
}

function constructListItemTextContent(gameData, formattedDate) {
	const listItemTextContent = `${gameData.whiteUser} vs. ${gameData.blackUser}, ${formattedDate}`
	return listItemTextContent;
}

let INPROGRESSAnalysisRequest = document.querySelector("#INPROGRESSAnalysis");
INPROGRESSAnalysisRequest.addEventListener("click", requestAnalysisForINPROGRESSGame);

//Turns out popup.js isn't accessible if the popup isn't open
//Therefore the best way to handle data is to simply ask for it whenever the popup opens
chrome.runtime.sendMessage(undefined, {message: "HYDRATEPOPUP"})

chrome.runtime.onMessage.addListener(messengerObject => {
	if(messengerObject.message === "CONSTRUCTGAMELIST"){
		const allGamesData = messengerObject.data
		let gameListContainer = document.querySelector("#listOfGamesContainer");
		let gameList = constructGameList(allGamesData);
		gameListContainer.appendChild(gameList);
	}
});