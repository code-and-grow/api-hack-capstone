// API credentials
const API_URL = 'https://api.yummly.com/v1';
const APP_ID = '0163f367';
const APP_KEY = 'fe0abbd328e4ac7137fab9e9459fb9df';

// Undefined startup variables
let tags = [];
let searchTerms = [];
let allowedIng = [];
let excludedIng = [];
let allergyVal;
let dietVal;
let recipes = [];
let searchHasBeenRun = false;


// Bot message rendering 
function botMessage(html) {
	// Add bot message to conversation window
	$('#js-conversation').append(html)
											// Scroll conversation window to see the last appended message
											 .scrollTop(
											 	$('#js-conversation').prop('scrollHeight')
											 );
	// Add a small delay before showing bot message										 
	$('.currentMessage').hide();
	$('.currentMessage').delay(10).show('slide', 10);
	$('.currentMessage').removeClass('currentMessage');
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
		return false;
	});
}

// User answer rendering
function userMessage(input) {
	$('#js-conversation')
					.append(`<p>
										<span class="username">You:</span>
										<span class="user-message">${input}</span>
									</p>`)
					// Scroll conversation window to see the last appended message
					.scrollTop($('#js-conversation').prop('scrollHeight'));
}



// Greet user and ask what meal to search
function greetUser() {
	let greetMessage = `<p class="currentMessage">
												<span class="bot">Chef Cook:</span>
												<span class="bot-message">
													Howdy hungry pirate! Captain Cook here. I will help you find a recipe 
													to try from my extensive cookbook. Just follow the instructions that
													follow. Arrrright?
												</span>
							        </p>`;
	botMessage(greetMessage);
	setTimeout(function(){ instructUser(); }, 1000);
}


// Tell the user how to 
function instructUser() {
	let secondBotMessage = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
														<span class="bot-message">
															Please enter keywords that describe the meal you're looking for in the 
															field below. Typing a comma confirms the entered keyword or phrase. You 
															can delete tags with Backspace or by clicking the X next to the tag. 
															Press Enter when you're done or want to skip this part.
														</span>
													</p>`;			        
	botMessage(secondBotMessage);
	getTags(getAllowedIng);
	$('.main-input').focus();
}


// Ask what ingredients are allowed
function getAllowedIng() {
	if (tags.length >= 1) {
		searchTerms = tags.map(item => item.text).join().replace(/\W+/g, '+');
		let showSearchTerms = tags.map(item => item.text).join(' ');
		userMessage(showSearchTerms);
		$('.tags-input').empty();
		tags = [];
	} else {
		$('.tags-input').empty();
	}
	let askForAllowedIng = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
													  <span class="bot-message">Please enter ingredients to be included 
														  in the recipe separated with a comma in the text field below or 
														  press Enter to skip.
														</span>
									        </p>`;
	botMessage(askForAllowedIng);
	getTags(getExcludedIng);
	$('.main-input').focus();
}


// Ask what ingredients are excluded
function getExcludedIng() {
	if (tags.length >= 1) {
		allowedIng = tags.map(item => item.text);
		userMessage(allowedIng);
		$('.tags-input').empty();
		tags = [];
	} else {
		$('.tags-input').empty();
	}
	let askForExcludedIng = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
													  <span class="bot-message">What about ingredients you don't like? 
														  Enter them separated with a comma in the textbox below or press 
														  Enter to skip.
														</span>
									        </p>`;
	botMessage(askForExcludedIng);
	getTags(checkForAllergies);
	$('.main-input').focus();
}



// Ask user about allergies 
function checkForAllergies() {
	if (tags.length >= 1) {
		excludedIng = tags.map(item => item.text);
		userMessage(excludedIng);
		$('.tags-input').empty();
		tags = [];
	} else {
		$('.tags-input').empty();
	} 
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
	if (searchHasBeenRun) {
		$('#js-results').empty();
	}
	let startSearchNotification = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Thanks for your patience, hungry stranger.
										I have started the search and you'll see the results below in a jiffy
										If there's nothing you fancy in the current results, press 'Start Over' 
										to do new search.
										<button id="js-restart-button" data-restart>START OVER</button>
										</span>
									</p>`;
	botMessage(startSearchNotification);
	searchAPI(searchTerms, allowedIng, excludedIng, allergyVal, dietVal);
	$('#user-input').css('display', 'none');
	userRestart();
	searchHasBeenRun = true;
}



// Clear conversation and restart app 
function userRestart() {
	document.addEventListener('click', function(event) {

    if (event.target.dataset.restart != undefined) { 
    	$('#js-conversation').empty();
    	$('.tags-input').empty();
    	$('#user-input').css('display', 'block');
			let restartGreet = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
														<span class="bot-message">OK, let's search for something else. Enter
														 what meal you're looking for in the text field below. Press Enter when you're 
														 done or want to skip this part.
														</span>
									        </p>`;
			botMessage(restartGreet);
			searchTerms = [];
			allowedIng = [];
			excludedIng = [];
			allergyVal;
			dietVal;
			recipes = [];
			getTags(getAllowedIng);
    }
  });
	
}


// Get tags from user input
function getTags(callback) {
	[].forEach.call(document.getElementsByClassName('tags-input'), function (el) {
    let hiddenInput = document.createElement('input'),
        mainInput = document.createElement('input'),
        enteredTags = [];
    
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', el.getAttribute('data-name'));

    mainInput.setAttribute('type', 'text');
    mainInput.classList.add('main-input');

    // When user presses Backspace on their keyboard during entering of the search details
    mainInput.addEventListener('keydown', function (e) {
        let keyCode = e.which || e.keyCode;
        if (keyCode === 8 && mainInput.value.length === 0 && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    });

    // When user presses Enter or Comma during entering of the search details
    mainInput.addEventListener('keydown', function (e) {
        let keyCode = e.which || e.keyCode;
        if (keyCode === 13 || keyCode === 188) {
        	e.preventDefault();
        	enteredTag = mainInput.value;
        	if ( enteredTag.length > 0 ) {
	        	addTag(enteredTag);
	        	mainInput.value = '';
	        	return tags;
	        } else if ( enteredTag.length < 1 ) {
	        	callback();
	        }
        }
    });

    el.appendChild(mainInput);
    el.appendChild(hiddenInput);
    
    // Add entered tag before the search input and append/remove it to/from tags array
    function addTag (text) {
        let tag = {
            text: text,
            element: document.createElement('span'),
        };

        tag.element.classList.add('tag');
        tag.element.textContent = tag.text;

        let closeBtn = document.createElement('span');
        closeBtn.classList.add('close');
        closeBtn.addEventListener('click', function () {
            removeTag(tags.indexOf(tag));
        });
        tag.element.appendChild(closeBtn);

        tags.push(tag);

        el.insertBefore(tag.element, mainInput);

        refreshTags();
    }

    // Remove tag from tags array
    function removeTag (index) {
        let tag = tags[index];
        tags.splice(index, 1);
        el.removeChild(tag.element);
        refreshTags();
    }

    // Refresh tags in tags array
    function refreshTags () {
        let tagsList = [];
        tags.forEach(function (t) {
            tagsList.push(t.text);
        });
        hiddenInput.value = tagsList.join(',');
    }

    // Filter the entered tag
    function filterTag (tag) {
        return tag.replace(/[^\w -]/g, '').trim().replace(/\W+/g, ' ');
    }
	});
}



// Get checked values 
function getCheckedValues (targetClass, checkedValues, isAllergy, callback) {
	// Click Next event listener
	$('#js-conversation').off('click', '.' + targetClass + 'Button')
											 .on('click', '.' + targetClass + 'Button', () => {
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
	greetUser();
	sendUserMessage();
}

$(initBot);