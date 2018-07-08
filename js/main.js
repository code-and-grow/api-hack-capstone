// API credentials
const API_URL = 'https://api.yummly.com/v1';
const APP_ID = '0163f367';
const APP_KEY = 'fe0abbd328e4ac7137fab9e9459fb9df';

// Undefined startup variables
let username;
let searchTerms;
let allowedIng;
let excludedIng;
let allergyVal;
let dietVal;
let recipes = [];
// Regular expression for splitting user input
let regExp = /\s*,\s*/;


// Bot message rendering 
function botMessage(text) {
	// Add bot message to conversation window
	$('#js-conversation').append(text)
											// Scroll conversation window to see the last appended message
											 .scrollTop(
											 	$('#js-conversation').prop('scrollHeight')
											 );
	// Add a small delay before showing bot message										 
	$('.currentMessage').hide();
	$('.currentMessage').delay(10).show('slide', 10);
	$('.currentMessage').removeClass('currentMessage');
}


// Select textarea placeholder value 
function setPlaceholder(value) {
	let newPlaceholder = $('#js-user-message').attr('placeholder', value);
}


// Set new textarea placeholder value with a delay 
function renderPlaceholder(value) {
	setTimeout(() => { setPlaceholder(value); }, 10);
}


// Get username 
function getUsername() {
	let greeting = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Howdy partner! 
										I am captain Cook and ready to help. 
										What is your name? You can press Enter to
										skip if you want to stay inkognito.</span>
									</p>`;
	botMessage(greeting);
	renderPlaceholder('Type your name here...');
	setFocusToTextBox();
}


// Focus the user message field 
function setFocusToTextBox(){
    $('#js-user-message').focus();
}


// Bot responses to user messages 
function botAi(message) {
	// Greet user and ask for desired recipe or meal name
	if (username === undefined) {
		if (message.length === 0) {
			username = 'Starvin\' Stranger';
		} else {
			username = message;
		}
		let greetUser = `<p class="currentMessage">
											<span class="bot">Chef Cook:</span>
											<span class="bot-message">Hello ${username}, feeling hungry eh? 
											Let's get going then. Enter what recipe you're looking for in the 
											text field below. Press Enter to skip if you haven't decided.</span>
										</p>`;
		botMessage(greetUser);
		renderPlaceholder('Spicy chicken soup ...');
	// Ask for allowed ingredients
	} else if (username.length >= 1 && searchTerms === undefined) {
		let readyForAllowedIng = `<p class="currentMessage">
																<span class="bot">Chef Cook:</span>
															  <span class="bot-message">Please enter ingredients to be included 
															  in the recipe separated with a comma in the text field below or 
															  press Enter to skip.</span>
														  </p>`;
		if(message === '') {
			searchTerms = message;
			console.log(searchTerms);
			botMessage(readyForAllowedIng);
			renderPlaceholder('Chicken, chili, parsley, ...');

		} else {
			searchTerms = message.toLowerCase().replace(/ /g, '+');
			console.log(searchTerms);
			botMessage(readyForAllowedIng);
			renderPlaceholder('Chicken, chili, parsley, ...');
		}
	// Ask for excluded ingredients
	} else if (username.length >= 1 && searchTerms !== undefined && allowedIng === undefined) {
		let readyForExcludedIng = `<p class="currentMessage">
																<span class="bot">Chef Cook:</span>
															  <span class="bot-message">What about ingredients you don't like? 
															  Enter them separated with a comma in the textbox below or press 
															  Enter to skip.</span>
		    										  </p>`;
		if (message === '') {
			allowedIng = [];
			botMessage(readyForExcludedIng);
			renderPlaceholder('Garlic, onions, thyme, ...');
			console.log(allowedIng);
		} else {
			allowedIng = message.toLowerCase().split(regExp);
			botMessage(readyForExcludedIng);
			renderPlaceholder('Garlic, onions, thyme, ...');
			console.log(allowedIng);
		}
	// Ask for allergies 
	} else if (excludedIng === undefined && searchTerms !== undefined) {

		if( message === '') {
			excludedIng = [];
			console.log(excludedIng);
		} else {
			excludedIng = message.toLowerCase().split(regExp);
			console.log(excludedIng);
			checkForAllergies();
		}
	}
}



// Ask user about allergies 
function checkForAllergies() {
	let checkAllergies = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Thanks, but what about allergies? 
										Press NEXT when you're done or no allergies apply.<br>
											<span id="checkboxlist">
											  <label><input type="checkbox" value="Dairy" class="allergy">Dairy</label>
										    <label><input type="checkbox" value="Egg" class="allergy">Egg</label>
										    <label><input type="checkbox" value="Gluten" class="allergy">Gluten</label>
										    <label><input type="checkbox" value="Peanut" class="allergy">Peanut</label>
										    <label><input type="checkbox" value="Seafood" class="allergy">Seafood</label>
										    <label><input type="checkbox" value="Sesame" class="allergy">Sesame</label>
										    <label><input type="checkbox" value="Soy" class="allergy">Soy</label>
										    <label><input type="checkbox" value="Sulfite" class="allergy">Sulfite</label>
										    <label><input type="checkbox" value="Tree Nut" class="allergy">Tree Nut</label>
										    <label><input type="checkbox" value="Wheat" class="allergy">Wheat</label>
										    <input type="button" value="NEXT" class="allergyButton">
									    </span>
								    </span>
									</p>`;
	botMessage(checkAllergies);
	getCheckedValues('allergy', allergyVal, true, checkForDiet);
}



// Ask user for diet preferences 
function checkForDiet() {
	console.log(allergyVal);
	let checkDiet = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Grrreat but 
										are you on a diet? Press NEXT when you're
										done or no diets apply.<br>
											<span id="checkboxlist">
											  <label><input type="checkbox" value="Lacto vegetarian" class="diet">Lacto vegetarian</label>
										    <label><input type="checkbox" value="Ovo vegetarian" class="diet">Ovo vegetarian</label>
										    <label><input type="checkbox" value="Pescetarian" class="diet">Pescetarian</label>
										    <label><input type="checkbox" value="Vegan" class="diet">Vegan</label>
										    <label><input type="checkbox" value="Vegetarian" class="diet">Vegetarian</label>
										    <input type="button" value="NEXT" class="dietButton">
									    </span>
										</span>
									</p>`;
	botMessage(checkDiet);
	getCheckedValues('diet', dietVal, false, startingSearch);
}



// Notify the user that search has been started 
function startingSearch() {
	console.log(dietVal);
	let startSearchNotification = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Thanks for your patience.
										I have started the search and you'll see the 
										results below in a jiffy</span>
									</p>`;
	botMessage(startSearchNotification);
	searchAPI(searchTerms, allowedIng, excludedIng, allergyVal, dietVal);
}



// Track user message submit event 
function sendUserMessage() {
	// If 'Send with Enter' is checked
	enterKeyPressEqualsSend();
	// User message is sent
	userSendsMessage();
}



// User clicks Send button
function userSendsMessage() {
	$('#js-user-submit').click(event => {
		let newUserMessage;
		event.preventDefault();
		checkUserMessage(newUserMessage);
	});
}



// Allow user send message with Enter key when 'Send with Enter' is checked
function enterKeyPressEqualsSend() {
	$('#js-user-message').keypress(event => {
		if (event.which == 13) {
			if ($('#js-checkbox').prop('checked')) {
				event.preventDefault();
				$('#js-user-submit').click();
			}
		}
	});
}



// What to do when user leaves the textfield blank or has entered a message
function checkUserMessage(message) {
	// User has entered nothing in the textarea (separate function)
	if (!$('#js-user-message').val().trim().length) {
		message = '';

		if (username === undefined) {
			appendUserMessage('You can call me the Starvin\' Stranger.');

		} else if (searchTerms === undefined) {
			appendUserMessage('Dunno, gimme something!');

		} else if (searchTerms !== undefined && allowedIng === undefined) {
			appendUserMessage('Me is no picky pirate.');
				
		} else if (searchTerms !== undefined && allowedIng !== undefined && excludedIng === undefined) {
			appendUserMessage('Arr, I could eat a wooden leg right now!');
			checkForAllergies();
		}

		// Clear message field and placeholder text after message is sent
		clearUserMessageField();
		botAi(message);

	// If textarea has text inside it
	} else { 
		userAnswered();
	}
}



// When user enters a message 
function userAnswered() {
	newUserMessage = $('#js-user-message').val();
	// Send user message to conversation window
	appendUserMessage(`${newUserMessage}`);
	// Clear message field and placeholder text after message is sent
	clearUserMessageField();
	// Get answer from bot
	botAi(newUserMessage);
}



// Append user message to conversation window 
function appendUserMessage(string) {
	$('#js-conversation')
					.append(`<p>
										<span class="username">You:</span>
										<span class="user-message">${string}</span>
									</p>`)
					// Scroll conversation window to see the last appended message
					.scrollTop($('#js-conversation').prop('scrollHeight'));
}



// Clear message field and placeholder text after message is sent 
function clearUserMessageField() {
	$('#js-user-message').val('');
	$('#js-user-message').attr('placeholder', '');
}



// Get checked values 
function getCheckedValues (targetClass, checkedValues, isAllergy, callback) {
	// Click Next event listener
	$('#js-conversation').on('click', '.' + targetClass + 'Button', () => {
		// Declare variables to store checked item data
		let targetChecked = '.' + targetClass + ':checked';
		let checkedArray = [];
		// Loop through checked items and add them to array
		$(targetChecked).each(function() {
			checkedArray.push($(this).val().toLowerCase().replace(/ /g, '+'));
		});
		// Assign the array to function parameter
		checkedValues = checkedArray;
		// Assign the checked values to the parameter in question
		if (isAllergy) {
			allergyVal = checkedValues;
		} else {
			dietVal = checkedValues;
		}
		// Init the callback function
		callback();
	});
}



// Search API call 
function searchAPI(searchTerms, allowedIng, excludedIng, allergyVal, dietVal) {
	// Set up API call settings
  const settings = {
    url: API_URL + '/api/recipes?_app_id=' + APP_ID + '&_app_key=' + APP_KEY,
    data: {
    	q: searchTerms,
    	allowedIngredient: allowedIng,
    	excludedIngredient: excludedIng,
    	allowedAllergy: allergyVal,
    	allowedDiet: dietVal
    },
    dataType: 'jsonp',
    type: 'GET',
    success: displayResults
  };
  // Make the API call
  $.ajax(settings);
}



// Get recipe data from API 
function getRecipeData(recipeId, callback) {
	// Set up recipe API call settings
  const settings = {
    url: API_URL + '/api/recipe/' + recipeId + '?_app_id=' + APP_ID + '&_app_key=' + APP_KEY,
    recipe: {},
    dataType: 'jsonp',
    type: 'GET',
    success: callback
  };
  // Make the recipe API call
  $.ajax(settings);
}



// Add recipe data to array 
function saveRecipe(recipeData) {
  recipes.push({recipeData});
}



// Render the result in html 
function renderResult(result) {
	// Save recipe results to array
	getRecipeData(result.id, saveRecipe);
	// Convert cooking time from seconds to hours and minutes
  let h = Math.floor(result.totalTimeInSeconds / 3600);
  let m = Math.floor(result.totalTimeInSeconds % 3600 / 60);
  let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours ") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes") : "";
  let cookingTime =  hDisplay + mDisplay; 
  // Append recipe to DOM
  $('#js-results')
  	.append(`<a class="js-result" id="${result.id}">
							<img src="images/Loading_icon.gif">
							<h2>${result.recipeName}</h2>
							<p>
								<span>Rating: ${result.rating} </span>
								<span>Cooking time: ${cookingTime}</span>
							</p>
							<p>${result.ingredients}</p>
							<hr>
			 			</a>`);
	
}



// Display the results to user 
function displayResults(data) {
	// Loop through the results and render them 
	data.matches.map( (item, index) => renderResult(item) );
	// Add images from recipes array
	setTimeout(function() {
		for (let i = 0; i < recipes.length; i++) {
			$('#js-results')
				.find(`#${recipes[i].recipeData.id} img`)
				.attr('src', recipes[i].recipeData.images[0].hostedLargeUrl);
		}
	}, 1500);
	console.log(recipes);
	// Open recipe in a lightbox after user click
	showRecipeToUser();
}



// Display the recipe user selects 
function showRecipeToUser() {
	$('.js-result').on('click', function(event) {
		event.preventDefault();
		// Store the clicked recipe data
		const recipeClicked = recipes.find(recipe => recipe.recipeData.id === this.id);
		// Store recipe details that are to be rendered to variables
		const recipeDetails = {
													name: recipeClicked.recipeData.name,
													image: recipeClicked.recipeData.images[0].hostedLargeUrl,
													course: recipeClicked.recipeData.attributes.course,
													rating: recipeClicked.recipeData.rating,
													servings: recipeClicked.recipeData.yield,
													totalTime: recipeClicked.recipeData.totalTime,
													ingredients: recipeClicked.recipeData.ingredientLines,
													sourceName: recipeClicked.recipeData.source.sourceDisplayName,
													sourceUrl: recipeClicked.recipeData.source.sourceRecipeUrl,
													yummlyLogo: recipeClicked.recipeData.attribution.logo,
													yummlyUrl: recipeClicked.recipeData.attribution.url
												}
		// Lightbox recipe details html
		const contentHtml = `<p id="closeLightbox">[X] Close</p>
													<img src="${recipeDetails.image}">
													<h2>${recipeDetails.name}</h2>
													<p>Course: ${recipeDetails.course}</p>
													<p>
														<span>Cooking time: ${recipeDetails.totalTime} </span>
														<span>Rating: ${recipeDetails.rating}</span>
													</p>
													<p>${recipeDetails.ingredients}</p>
													<p>Visit original source by <b>${recipeDetails.sourceName}</b> 
													for detailed instructions 
													<a href="${recipeDetails.sourceUrl}" target="_blank">here</a>.
												</p>`
		// If lightbox exists
		if ($('#lightbox').length > 0) { 
			$('#content').html(contentHtml);
			// Show lightbox window 
			$('#lightbox').show();
		// If lightbox does not exist
		} else { 
			//create HTML markup for lightbox window
			const lightbox = 
					`<div id="lightbox">
						<div id="content">${contentHtml}</div>	
					</div>`;
			//insert lightbox HTML into page
			$('body').append(lightbox);
		}
		// Click anywhere on the page to get rid of lightbox window
		$('#closeLightbox').on('click', function() {
			$('#lightbox').hide();
		});
	});
}


// Start your engines 
function initBot() {
	getUsername();
	sendUserMessage();
}

$(initBot);