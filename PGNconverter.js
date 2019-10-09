/*
 *PGN, not to be confused with PNG, stands for Portable Game Notation. It is the standard format for recording chess games.
 *An example PGN layout is provided below.
 *Although PGN might loosely resemble some kind of code, it is just plain text
 */

	/*Example PGN layout*/
/*
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2019.05.30"]
[Round "?"]
[White "someUsername"]
[Black "someOtherUsername"]
[Result "0-1"]

1. d4 Nf6 2. c4 d6 3. Nc3 g6 4. e4 Bg7 5. Bd3 0-1
*/

//Not all of gameData is converted to PGN, because PGN format doesn't support things like winner, or primaryUsername
//However, since comments are supported in PGN format, it is possible to include more data inside a comment
function convertToPGN(gameData){
	const white = gameData.whiteUser;
	const black = gameData.blackUser;
	const result = gameData.result;
	const moves = convertMovesToSAN(gameData.moves);
	const revivedDate = new Date(gameData.date);
	const PGNDate = convertDateToPGN(revivedDate);

	let PGN = ''
	PGN += '[Event "Live Chess"]\n';
	PGN += '[Site "Chess.com"]\n';
	PGN += '[Date "' + PGNDate + '"]\n';
	PGN += '[Round "?"]\n';
	PGN += '[White "' + white + '"]\n';
	PGN += '[Black "' + black + '"]\n';
	PGN += '[Result "' + result + '"]\n';
	PGN += '\n';
	PGN += moves;
	return PGN;
}

//SAN stands for Standard Algebraic Notation, which can be seen in the moves provided in the PGN example above. 
function convertMovesToSAN(moves){
	let convertedMoves = '';
	let moveNumber = 1;
	for (let i = 0; i < moves.length; i++){
		if (i%2 === 0 && moves[i] != "1-0" && moves[i] != "0-1" && moves[i] != "1/2-1/2"){
			convertedMoves += moveNumber + '. ';
			moveNumber ++;
		}
		convertedMoves += moves[i] + ' ';
	}
	return convertedMoves;
}

//Converts the revived date object to the yyyy.mm.dd format as seen in the PGN example above.
//Keep in mind, this is different from the mm.dd.yyyy format commonly used in America.
function convertDateToPGN(date){
	const year = date.getFullYear();
	const month = date.getMonth() + 1; //For some reason, getMonth returns a value from 0 to 11 instead of from 1 to 12
	const day = date.getDate();
	const PGNDate = year + '.' + month + '.' + day;
	return PGNDate;
}