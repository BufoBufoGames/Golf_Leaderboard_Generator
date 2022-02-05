// ----------------------------------------------------------------
// filename: Golf_Leaderboard_Generator.js
// project:  Golf Leaderboard Generator
// author:   Nathan Dobby
// created:  2022-02-01
// ----------------------------------------------------------------

var backgroundLoaded = false;
var tilesetLoaded = false;
var pageLoaded = false;
var generateLeaderboardRequested = false;
var leaderboardImageGenerated = false;

var leaderboardDataText = null;
var previewCanvas = null;
var displayImage = null;

var backgroundImage = null;
var tilesetImage = null;
var processingCanvas = null;

const leaderboardPositions =  [ [ [54, 150], [172, 132], [194, 132], [217, 131], [240, 131], [263, 131], [287, 131], [309, 130], [333, 129], [357, 130], [383, 130], [407, 129], [430, 129], [454, 129], [477, 128], [501, 128], [524, 127], [548, 127], [572, 127] ],
								[ [54, 176], [172, 158], [194, 158], [217, 157], [240, 157], [263, 157], [287, 157], [309, 156], [333, 155], [357, 156], [383, 156], [407, 155], [430, 155], [454, 155], [477, 154], [501, 154], [524, 153], [548, 153], [572, 153] ],
								[ [54, 200], [171, 183], [194, 183], [217, 182], [240, 182], [263, 182], [287, 182], [309, 181], [333, 180], [357, 181], [383, 181], [407, 180], [430, 180], [454, 180], [477, 179], [501, 179], [524, 178], [548, 178], [572, 178] ],
								[ [54, 224], [171, 208], [194, 207], [217, 207], [240, 207], [263, 207], [287, 207], [309, 206], [333, 205], [357, 206], [383, 206], [407, 205], [430, 205], [454, 205], [477, 204], [501, 204], [524, 204], [548, 203], [572, 203] ],
								[ [53, 251], [171, 234], [194, 233], [217, 233], [240, 233], [263, 233], [286, 232], [309, 232], [332, 232], [356, 232], [383, 232], [407, 232], [430, 232], [454, 232], [477, 232], [501, 232], [524, 231], [548, 231], [572, 231] ],
								[ [53, 274], [171, 259], [194, 258], [217, 258], [240, 258], [263, 258], [286, 258], [309, 258], [332, 257], [357, 257], [383, 257], [407, 257], [430, 257], [454, 257], [477, 257], [501, 257], [524, 256], [548, 256], [572, 256] ],
								[ [53, 300], [171, 283], [194, 283], [217, 283], [240, 283], [263, 283], [286, 283], [309, 283], [332, 283], [357, 282], [383, 282], [407, 282], [430, 282], [454, 282], [477, 282], [501, 282], [524, 281], [548, 281], [572, 281] ],
								[ [54, 325], [171, 308], [194, 308], [217, 308], [240, 308], [263, 308], [286, 308], [309, 308], [332, 308], [356, 308], [383, 308], [407, 308], [430, 308], [454, 308], [477, 308], [501, 308], [524, 307], [548, 307], [572, 307] ],
								[ [54, 350], [171, 333], [194, 333], [217, 333], [240, 333], [263, 333], [286, 333], [309, 333], [332, 333], [356, 333], [383, 333], [407, 333], [430, 333], [454, 333], [477, 333], [501, 333], [524, 332], [548, 332], [572, 332] ],
								[ [53, 375], [172, 358], [194, 359], [217, 359], [240, 359], [263, 359], [286, 359], [309, 359], [332, 359], [356, 359], [383, 359], [407, 359], [430, 359], [454, 359], [477, 359], [501, 359], [524, 358], [548, 358], [572, 358] ] ];

const defaultPlayerData = "GILMORE 2 0 -1 -2 -4 -5 -6 -8 -10\nWEBB 0 -1 -1 -2 -2 -1 -2 -4 -5\nNIELSEN 0 1 2 3 2 1 0 -1 -2";

const backgroundURL = "leaderboard_template.png";
const tilesetURL = "number_tiles.png";

const tileWidth = 12;
const tileHeight = 20;
const maxScore = 20;
const maxPlayers = 10;
const maxData = 19;

// Load callbacks
window.onload = pageLoadedCallback;

// Create the images with load callbacks
var backgroundOnError = function() { backgroundLoadedCallback(false); }
var backgroundOnLoad = function() { backgroundLoadedCallback(true); }

backgroundImage = new Image();
backgroundImage.onerror = backgroundOnError;
backgroundImage.onload = backgroundOnLoad;
backgroundImage.src = backgroundURL;

var tilesetOnError = function() { tilesetLoadedCallback(false); }
var tilesetOnLoad = function() { tilesetLoadedCallback(true); }

tilesetImage = new Image();
tilesetImage.onerror = tilesetOnError;
tilesetImage.onload = tilesetOnLoad;
tilesetImage.src = tilesetURL;

function isEverythingLoaded()
{
	return ((backgroundLoaded == true) && (tilesetLoaded == true) && (pageLoaded == true));
}

function backgroundLoadedCallback(loadResult)
{
	if (loadResult == true)
	{
		backgroundLoaded = true;
		
		attemptGenerateLeaderboard();
	}
	else
	{
		alert("Failed loading resources.");
	}
}

function tilesetLoadedCallback(loadResult)
{
	if (loadResult == true)
	{
		tilesetLoaded = true;
		
		attemptGenerateLeaderboard();
	}
	else
	{
		alert("Failed loading resources.");
	}
}

function pageLoadedCallback()
{
	pageLoaded = true;
	
	// Cache page elements
	leaderboardDataText = document.getElementById('leaderboardDataText');
	previewCanvas = document.getElementById('previewCanvas');
	displayImage = document.getElementById('displayImage');
	
	// Set event handlers
	document.getElementById('generate').onclick = onGenerateButtonClicked;
	document.getElementById('download').onclick = onDownloadButtonClicked;
	
	attemptGenerateLeaderboard();
}

// On submit button pressed, generate gif
function attemptGenerateLeaderboard()
{
	if (generateLeaderboardRequested == true)
	{
		if (isEverythingLoaded())
		{
			generateLeaderboardRequested = false;
			
			generateLeaderboard();
		}
	}
}

function onGenerateButtonClicked()
{
	generateLeaderboardRequested = true;
	
	attemptGenerateLeaderboard();
}

function onDownloadButtonClicked()
{
	if (isEverythingLoaded() && leaderboardImageGenerated)
	{
		let downloadLink = document.createElement('a');
		
		downloadLink.setAttribute('download', 'leaderboard.png');
		
		let dataURL = previewCanvas.toDataURL('image/png');
		
		let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
		
		downloadLink.setAttribute('href', url);
		downloadLink.click();
	}
}

function generateLeaderboard()
{
	var previewContext = previewCanvas.getContext('2d');
	
	previewContext.fillStyle = 'rgba(0, 0, 0, 1.0)';
	previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
	
	previewContext.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, 0, 0, backgroundImage.width, backgroundImage.height);
	
	previewContext.font = "600 condensed 18px Bahnschrift";
	previewContext.fillStyle = 'rgba(0, 0, 0, 1.0)';
	
	// Grab the player data
	var playerArray = leaderboardDataText.value.split(/\r\n|\r|\n/);
	
	// Defaults for testing / display
	if (leaderboardDataText.value == "")
	{
		playerArray = defaultPlayerData.split(/\r\n|\r|\n/);
	}
	
	let numPlayers = Math.min(maxPlayers, playerArray.length);
	let maxTileOffset = (maxScore * tileWidth);
	
	for (let player = 0; player < numPlayers; player++)
	{
		let playerDataArray = playerArray[player].split(/[\s,]+/);
		
		let numData = Math.min(maxData, playerDataArray.length);
		
		if (numData > 0)
		{
			// First datum is player name
			previewContext.fillText(playerDataArray[0], leaderboardPositions[player][0][0], leaderboardPositions[player][0][1]);
			
			for (let data = 1; data < numData; data++)
			{
				let score = parseInt(playerDataArray[data]);
				let xOff = 0;
				let yOff = 0;
				
				if (score >= 0)
				{
					xOff = Math.min((score * tileWidth), maxTileOffset);
					yOff = 0;
				}
				else
				{
					xOff = Math.min(((score * -1) * tileWidth), maxTileOffset);
					yOff = tileHeight;
				}
				
				previewContext.drawImage(tilesetImage, xOff, yOff, tileWidth, tileHeight, leaderboardPositions[player][data][0], leaderboardPositions[player][data][1], tileWidth, tileHeight);
			}
		}
	}
	
	leaderboardImageGenerated = true;
}
