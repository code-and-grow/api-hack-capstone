// Predefined objects
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


// Startup variables
const API_URL = 'https://api.yummly.com/v1';
const APP_ID = '0163f367';
const APP_KEY = 'fe0abbd328e4ac7137fab9e9459fb9df';


let username;
let searchTerms;
let excludedIngredients;
let allergyValues;
let dietValues;


// Connect to the API
function searchAPI(searchTerms, excludedIngredients, allergyValues, dietValues, callback) {
  const settings = {
    url: API_URL + '/api/recipes?_app_id=' + APP_ID + '&_app_key=' + APP_KEY,
    data: {
    	q: searchTerms,
    	excludedIngredient: excludedIngredients,
    	allowedAllergy: allergyValues,
    	allowedDiet: dietValues,
      requirePictures: true
    },
    dataType: 'jsonp',
    type: 'GET',
    success: callback
  };

  $.ajax(settings);
}


// Select textarea placeholder value
function setPlaceholder(value) {
	let newPlaceholder = $('#js-user-message').attr('placeholder', value);
}


// Set new textarea placeholder value
function renderPlaceholder(value) {
	setTimeout(() => { setPlaceholder(value); }, 1900);
}


// Bot message
function botMessage(text) {
	$('#js-conversation').append(text)
											 .scrollTop($('#js-conversation').prop('scrollHeight'));
	$('.currentMessage').hide();
	$('.currentMessage').delay(1500).show('slide', 400);
	$('.currentMessage').removeClass('currentMessage');
}


// Get username
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

// Bot responds to user messages
function botAi(message) {

	if (username === undefined) {
		username = message;
		let greetUser = `<p class="currentMessage">
											<span class="bot">Chef Cook:</span>
											<span class="bot-message">Hello ${username}, feeling hungry eh? 
											Let's get going then. Enter your preferred ingredients separated
											with a comma in the text field below.<br>
										</p>`;
		botMessage(greetUser);
		renderPlaceholder('Salami, tomatoes, garlic, ...');

	} else if (username.length >= 1 && searchTerms === undefined) {
		searchTerms = message;
		let readyForExcludedIng = `<p class="currentMessage">
															  <span class="bot">Chef Cook:</span>
															  <span class="bot-message">And what about ingredients you don't like? 
															  Enter these as well separated with a comma in the textbox below 
															  just like before.</span>
														  </p>`
		botMessage(readyForExcludedIng);
		renderPlaceholder('Garlic, sausage, cucumber...');
		console.log(searchTerms);

	} else if (excludedIngredients === undefined && searchTerms.length >=1) {
		excludedIngredients = message;
		console.log(excludedIngredients);
		checkForAllergies();
	}
	
}


// Get checked values
function getCheckedValues (targetClass, checkedValues, isAllergy, callback) {
	$('#js-conversation').on('click', '.' + targetClass + 'Button', () => {
		let targetChecked = '.' + targetClass + ':checked';
		let checkedArray = [];
		let checked;
	
		$(targetChecked).each(function() {
			checkedArray.push($(this).val());
		});
		
		checked = checkedArray.join(', ');
		
		if (checked.length > 0) {
			checkedValues = checked;
			
		} else {
			checkedValues = null;	
			
		}

		if (isAllergy) {
			allergyValues = checkedValues;
		} else {
			dietValues = checkedValues;
		}

		callback();

	});
}


// Ask user about allergies
function checkForAllergies() {
	let checkAllergies = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Thanks, but what about allergies? 
										Press NEXT if you're done or no allergies apply.<br>
										${searchParameters.allergyOptions}</span>
									</p>`;
	botMessage(checkAllergies);
	getCheckedValues('allergy', allergyValues, true, checkForDiet);

}


// Ask user for diet preferences
function checkForDiet() {
	let checkDiet = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Grrreat but 
										are you on a diet? Press NEXT if you're
										done or no diets apply.<br>
										${searchParameters.dietOptions}</span>
									</p>`;
	botMessage(checkDiet);
	getCheckedValues('diet', dietValues, false, showSearchResults);

}


// Get the search results
function showSearchResults(data) {
	console.log(`I'm searching for recipes with ${searchTerms} and no ${excludedIngredients}. 
		Recipes found are suitable for ${allergyValues} free and ${dietValues}  diets`);
}


// Track user message submission
function sendUserMessage() {

	// User presses Enter key
	$('#js-user-message').keypress(event => {
		if (event.which == 13) {
			if ($('#js-checkbox').prop('checked')) {
				event.preventDefault();
				$('#js-user-submit').click();
			}
		}
	});

	// User clicks Send button
	$('#js-user-submit').click(event => {

		event.preventDefault();

		if (!$('#js-user-message').val().trim().length) {
			return false;
		} else {
			let newUserMessage = $('#js-user-message').val();

			$('#js-conversation')
				.append(`<p>
									<span class="username">You:</span>
									<span class="user-message">${newUserMessage}</span>
								</p>`)
				.scrollTop($('#js-conversation').prop('scrollHeight'));
			$('#js-user-message').val('');
			$('#js-user-message').attr('placeholder', '');

			botAi(newUserMessage);

		}
	});

}


// Start your engines
function initBot() {
//	searchAPI('banana', 'cinnamon', 'desserts', showSearchResults);
	getUsername();
	sendUserMessage();
}

$(initBot);