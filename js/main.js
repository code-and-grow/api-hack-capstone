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
let recipes = [];

let readyForAllowedIng = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
													  <span class="bot-message">Please enter ingredients to be included 
													  in the recipe separated with a comma in the text field below or 
													  press Enter to skip.</span>
												  </p>`;
let readyForExcludedIng = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
													  <span class="bot-message">What about ingredients you don't like? 
													  Enter them separated with a comma in the textbox below or press 
													  Enter to skip.</span>
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
	$('.currentMessage').delay(10).show('slide', 10);
	$('.currentMessage').removeClass('currentMessage');
}


// * Select textarea placeholder value * //
function setPlaceholder(value) {
	let newPlaceholder = $('#js-user-message').attr('placeholder', value);
}


// * Set new textarea placeholder value with a delay * //
function renderPlaceholder(value) {
	setTimeout(() => { setPlaceholder(value); }, 10);
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
		if (message.length === 0) {
			username = 'Hungry Stranger';
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

	// Ask for allergies function
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


// * Ask user about allergies * //
function checkForAllergies() {
	let checkAllergies = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Thanks, but what about allergies? 
										Press NEXT when you're done or no allergies apply.<br>
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
										are you on a diet? Press NEXT when you're
										done or no diets apply.<br>
										${searchParameters.dietOptions}</span>
									</p>`;
	botMessage(checkDiet);
	getCheckedValues('diet', dietVal, false, startingSearch);
}

// * Notify the user that search has been started * //
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



// * Search API call * //
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


// * Get recipe data from API * //
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


// * Add recipe data to array * //
function saveRecipe(recipeData) {
  recipes.push({recipeData});
}



// * Render the result in html * //
function renderResult(result) {

	// Save recipe results to array
	getRecipeData(result.id, saveRecipe);

	// Convert cooking time from seconds to hours and minutes
  let h = Math.floor(result.totalTimeInSeconds / 3600);
  let m = Math.floor(result.totalTimeInSeconds % 3600 / 60);
  let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours ") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes") : "";
  let cookingTime =  hDisplay + mDisplay; 

  // loop through results and append each one, give each one unique id (result.id)
 
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


// * Display the results to user * //
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

	// Load the function that returns the recipe to user after selecting it
	showRecipeToUser();
}

// * Display the recipe user selects * //
function showRecipeToUser() {
	$('.js-result').on('click', function(event) {
		event.preventDefault();
		// Store the clicked recipe data
		const recipeClicked = recipes.find(recipe => recipe.recipeData.id === this.id);
		// Store recipe details that are to be rendered to variables
		const recipeName = recipeClicked.recipeData.name;
		const recipeImage = recipeClicked.recipeData.images[0].hostedLargeUrl;
		const recipeCourse = recipeClicked.recipeData.attributes.course;
		const recipeRating = recipeClicked.recipeData.rating;
		const recipeServings = recipeClicked.recipeData.yield;
		const totalTime = recipeClicked.recipeData.totalTime;
		const recipeIngredients = recipeClicked.recipeData.ingredientLines;
		const sourceName = recipeClicked.recipeData.source.sourceDisplayName;
		const sourceUrl = recipeClicked.recipeData.source.sourceRecipeUrl;
		const yummlyLogo = recipeClicked.recipeData.attribution.logo;
		const yummlyUrl = recipeClicked.recipeData.attribution.url;
		const contentHtml = `<p id="closeLightbox">[X] Close</p>
													<img src="${recipeImage}">
													<h2>${recipeName}</h2>
													<p>Course: ${recipeCourse}</p>
													<p>
														<span>Cooking time: ${totalTime} </span>
														<span>Rating: ${recipeRating}</span>
													</p>
													<p>${recipeIngredients}</p>
													<p>Visit original recipe by <em>${sourceName}</em> for detailed instructions <a href="${sourceUrl}" target="_blank">here</a>.</p>
												 `

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
						<p>Click to close</p>
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


// * Start your engines * //
function initBot() {
	getUsername();
	sendUserMessage();
}

$(initBot);