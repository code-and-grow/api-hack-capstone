// * Predefined objects * //
const searchParameters = {
			 allergyOptions:  `<span id="checkboxlist">
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
										    </span>`,
					dietOptions:  `<span id="checkboxlist">
												  <label><input type="checkbox" value="Lacto vegetarian" class="diet">Lacto vegetarian</label>
											    <label><input type="checkbox" value="Ovo vegetarian" class="diet">Ovo vegetarian</label>
											    <label><input type="checkbox" value="Pescetarian" class="diet">Pescetarian</label>
											    <label><input type="checkbox" value="Vegan" class="diet">Vegan</label>
											    <label><input type="checkbox" value="Vegetarian" class="diet">Vegetarian</label>
											    <input type="button" value="NEXT" class="dietButton">
										    </span>`
}


// * Startup variables *

// API credentials
const API_URL = 'https://api.yummly.com/v1';
const APP_ID = '0163f367';
const APP_KEY = 'fe0abbd328e4ac7137fab9e9459fb9df';

// API search input
let username;
let searchTerms;
let allowedIng;
let excludedIng;
let allergyVal;
let dietVal;

let readyForAllowedIng = `<p class="currentMessage">
																  <span class="bot">Chef Cook:</span>
																  <span class="bot-message">Now please enter your preferred 
																  ingredients separated with a comma in the text field 
																  below.<br>
															  </p>`;
let readyForExcludedIng = `<p class="currentMessage">
																  <span class="bot">Chef Cook:</span>
																  <span class="bot-message">And what about ingredients you don't like? 
																  Enter these as well separated with a comma in the textbox below 
																  just like before.</span>
															  </p>`;

// Regular expression for splitting user input
let regExp = /\s*,\s*/;


// * Bot message rendering * //
function botMessage(text) {
	// Add bot message to conversation window
	$('#js-conversation').append(text)
											// Scroll conversation window to see the last appended message
											 .scrollTop($('#js-conversation').prop('scrollHeight'));
	// Add a small delay before showing bot message										 
	$('.currentMessage').hide();
	$('.currentMessage').delay(1500).show('slide', 400);
	$('.currentMessage').removeClass('currentMessage');
}


// * API call * //
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


// * Select textarea placeholder value * //
function setPlaceholder(value) {
	let newPlaceholder = $('#js-user-message').attr('placeholder', value);
}


// * Set new textarea placeholder value with a delay * //
function renderPlaceholder(value) {
	setTimeout(() => { setPlaceholder(value); }, 1900);
}


// * Get username * //
function getUsername() {
	let greeting = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Howdy partner! 
										I am captain Cook and ready to help. 
										What is your name?</span>
									</p>`;
	botMessage(greeting);
	renderPlaceholder('Type your name here...');
}


// * Bot responses to user messages * //
function botAi(message) {

	// Greet user and ask for desired recipe or meal name
	if (username === undefined) {
		username = message;
		let greetUser = `<p class="currentMessage">
											<span class="bot">Chef Cook:</span>
											<span class="bot-message">Hello ${username}, feeling hungry eh? 
											Let's get going then. Enter what recipe you're looking for in the 
											text field below. Press Enter if you have no clue.
											<br>
										</p>`;
		botMessage(greetUser);
		renderPlaceholder('Spicy chicken soup ...');

	// Ask for allowed ingredients
	} else if (username.length >= 1 && searchTerms === undefined) {
		
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
	} else if (username.length >= 1 && searchTerms.length !== undefined && allowedIng === undefined) {

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

	// Call ask for allergies function
	} else if (excludedIng === undefined && searchTerms.length >=1) {

		if( message === '') {
			excludedIng = [];
			console.log(excludedIng);
			checkForAllergies();
		} else {
			excludedIng = message.toLowerCase().split(regExp);
			console.log(excludedIng);
			checkForAllergies();
		}
	}
}


// * Track user message submit event * //
function sendUserMessage() {

	// User presses Enter key
	$('#js-user-message').keypress(event => {
		if (event.which == 13) {

			// If the 'Send message with Enter' checkbox is selected, message gets sent
			if ($('#js-checkbox').prop('checked')) {
				event.preventDefault();
				$('#js-user-submit').click();
			}
		}
	});

	// User clicks Send button
	$('#js-user-submit').click(event => {

		let newUserMessage;
		event.preventDefault();

		// User has entered nothing in the textarea
		if (!$('#js-user-message').val().trim().length) {
			newUserMessage = '';

			if (searchTerms === undefined) {
				$('#js-conversation')
					.append(`<p>
										<span class="username">You:</span>
										<span class="user-message">Dunno, gimme something :)</span>
									</p>`)
					// Scroll conversation window to see the last appended message
					.scrollTop($('#js-conversation').prop('scrollHeight'));

			} else if (searchTerms !== undefined && allowedIng === undefined) {
				$('#js-conversation')
					.append(`<p>
										<span class="username">You:</span>
										<span class="user-message">Me is no picky pirate ;)</span>
									</p>`)
					// Scroll conversation window to see the last appended message
					.scrollTop($('#js-conversation').prop('scrollHeight'));
					
			} else if (searchTerms !== undefined && allowedIng !== undefined && excludedIng === undefined) {
				$('#js-conversation')
					.append(`<p>
										<span class="username">You:</span>
										<span class="user-message">I could eat yer wooden leg right now :D</span>
									</p>`)
					// Scroll conversation window to see the last appended message
					.scrollTop($('#js-conversation').prop('scrollHeight'));
					checkForAllergies();
			}

			// Clear message field and placeholder text after message is sent
			$('#js-user-message').val('');
			$('#js-user-message').attr('placeholder', '');
			botAi(newUserMessage);

		// If textarea has text inside it
		} else {
			newUserMessage = $('#js-user-message').val();

	 // Send user message to conversation window
			$('#js-conversation')
				.append(`<p>
									<span class="username">You:</span>
									<span class="user-message">${newUserMessage}</span>
								</p>`)
				// Scroll conversation window to see the last appended message
				.scrollTop($('#js-conversation').prop('scrollHeight'));

			// Clear message field and placeholder text after message is sent
			$('#js-user-message').val('');
			$('#js-user-message').attr('placeholder', '');

			// Get answer from bot
			botAi(newUserMessage);

		}
	});

}


// * Get checked values * //
function getCheckedValues (targetClass, checkedValues, isAllergy, callback) {

	// Click Next event listener
	$('#js-conversation').on('click', '.' + targetClass + 'Button', () => {

		let targetChecked = '.' + targetClass + ':checked';
		let checkedArray = [];

		$(targetChecked).each(function() {
			checkedArray.push($(this).val().toLowerCase().replace(/ /g, '+'));
		});

		checkedValues = checkedArray;

		if (isAllergy) {
			allergyVal = checkedValues;
		} else {
			dietVal = checkedValues;
		}

		callback();

	});
}


// * Ask user about allergies * //
function checkForAllergies() {
	let checkAllergies = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Thanks, but what about allergies? 
										Press NEXT if you're done or no allergies apply.<br>
										${searchParameters.allergyOptions}</span>
									</p>`;
	botMessage(checkAllergies);
	getCheckedValues('allergy', allergyVal, true, checkForDiet);
}


// * Ask user for diet preferences * //
function checkForDiet() {
	console.log(allergyVal);
	let checkDiet = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Grrreat but 
										are you on a diet? Press NEXT if you're
										done or no diets apply.<br>
										${searchParameters.dietOptions}</span>
									</p>`;
	botMessage(checkDiet);
	getCheckedValues('diet', dietVal, false, startingSearch);
}

// * Notify the user that search has been started * //
function startingSearch() {
	console.log(dietVal);
	let startNotification = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Thanks for your patience.
										I have started the search and you'll see the 
										results below in a jiffy</span>
									</p>`;
	botMessage(startNotification);
	searchAPI(searchTerms, allowedIng, excludedIng, allergyVal, dietVal);
}


// * Render the result in html * //
function renderResult(result) {

	// Convert cooking time from seconds to hours and minutes
  let h = Math.floor(result.totalTimeInSeconds / 3600);
  let m = Math.floor(result.totalTimeInSeconds % 3600 / 60);
  let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours ") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes") : "";
  let cookingTime =  hDisplay + mDisplay; 

  // HTML for item in the results
	return `<div>
					<h2>${result.recipeName}</h2>
					<p><span>Rating: ${result.rating} </span><span>Cooking time: ${cookingTime}</span></p>
					<p>${result.ingredients}</p>
					<hr>
				 </div>`; 
}


// * Display the results to user * //
function displayResults(data) {

	// Show preloader gif
	$('#js-results').html('<img style="margin-left:auto; margin-right:auto;" src="images/Loading_icon.gif">');
	console.log(data);

	// Loop through the results and render each item
	const results = data.matches.map( (item, index) => renderResult(item) );
	setTimeout(() => { $('#js-results').html(results); }, 3500);
}


// Create a function to present default recipes if nothing is entered
// Create a function for the case where the search has no results - Try to combine these


// * Start your engines * //
function initBot() {
	getUsername();
	sendUserMessage();
}

$(initBot);