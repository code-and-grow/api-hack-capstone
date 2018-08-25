

// API credentials
const API_URL = 'https://api.yummly.com/v1';
const APP_ID = 'XXXXXXXX';
const APP_KEY = 'XXXXXXXXXXXXXXXX';

// Undefined startup variables
let tags = [];
let searchTerms = [];
let allowedIng = [];
let excludedIng = [];
let allergyVal;
let dietVal;
let recipes = [];
let userInstructed = false;
let readyForAllergies = false;
let readyForDiet = false;
let searchHasBeenRun = false;
const botSays = {
	firstBotMessage : `<p class="currentMessage">
												<span class="bot">Chef Cook:</span>
												<span class="bot-message">
													Ahoy Jack! Greetings from Captain Cook, the infamous Chef of the Black Pearl. 
													I'll help ye find some tasty recipes!
												</span>
							        </p>`,
	secondBotMessage : `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
														<span class="bot-message">
															Ok matey, define me some search preferences first. Much obliged!
														</span>
													</p>`,
  gotResultsNotification : `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Hang on bucko, I have started the search! 
										Start over if there's nothing ye fancy in the current results.
										<button id="js-restart-button" data-restart>START OVER</button>
										</span>
									</p>`,
	noResultsNotification : `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Sorry Jack! I have no recipes that match the terms you entered! 
										<button id="js-restart-button" data-restart>START NEW SEARCH</button>
										</span>
									</p>`,
  restartGreet : `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
														<span class="bot-message">Go on matey, I'm ready to take your order!
														</span>
									        </p>`
}


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
	$('.currentMessage').delay(500).show('slide', 250);
	$('.currentMessage').removeClass('currentMessage');
}

// Bot message when there are results 
function resultsMessage(html) {
	// Add bot message to conversation window
	$('#js-conversation').append(html)
											// Scroll conversation window to see the last appended message
											 .scrollTop(
											 	$('#js-conversation').prop('scrollHeight')
											 );
	// Add a small delay before showing bot message										 
	$('.currentMessage').hide();
	$('.currentMessage').show();
	$('.currentMessage').removeClass('currentMessage');
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
	botMessage(botSays.firstBotMessage);
	setTimeout(function(){ 
		botMessage(botSays.secondBotMessage); 
		userInstructed = true;
	}, 4000);
	setTimeout(function(){ 
		if (userInstructed) {
			$('#user-input').css('display', 'block');
			$('.main-input').focus().attr('placeholder', 'Type in desired meal or skip with \'Enter\' or \'Send\'');
		}
  }, 4750);
	getMeal(getAllowedIng);
}



// Ask what ingredients are allowed
function getAllowedIng() {
	if (tags.length >= 1) {
		searchTerms = tags.join().replace(/\W+/g, '+');
		let showSearchTerms = tags;
		userMessage(showSearchTerms);
		$('.tags-input').empty();
		tags = [];
	} else {
		userMessage('Aah, me skipped the meal! Ain\'t that ironic...');
		$('.tags-input').empty();
	}
	//botMessage(botSays.askForAllowedIng);
	getTags(getExcludedIng);
	$('.main-input').focus().attr('placeholder', 'Type in allowed ingredients or skip with \'Enter\' or \'Send\'');
}


// Ask what ingredients are excluded
function getExcludedIng() {
	if (tags.length >= 1) {
		allowedIng = tags.map(item => item.text);
		userMessage(allowedIng);
		$('.tags-input').empty();
		tags = [];
	} else {
		userMessage('Yarr, I just could not leave out any of me hearties.');
		$('.tags-input').empty();
	}
	//botMessage(botSays.askForExcludedIng);
	getTags(checkForAllergies);
	$('.main-input').focus().attr('placeholder', 'Type in excluded ingredients or skip with \'Enter\' or \'Send\'');
	readyForAllergies = true;
}



// Ask user about allergies 
function checkForAllergies() {
	if (tags.length >= 1) {
		excludedIng = tags.map(item => item.text);
		userMessage(excludedIng);
		$('.tags-input').empty();
		tags = [];
	} else {
		userMessage('No hornswaggle I tell ya, me eats it all!');
		$('.tags-input').empty();
	} 
	$('#user-input').empty().html(`<div class="checkboxheader">Avast matey, do you have allergies? When yer
																	done choosing or no allergies apply press 'Enter' or 'Send'.<br>
																
																<form id="js-user-input">
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
															    <button id="js-user-submit" type="submit" class="allergyButton">Send</button>
														    </form>
														    </div>`);
	
	//botMessage(botSays.checkAllergies);
	if (readyForAllergies) {
		getCheckedValues('.allergy', allergyVal, true, checkForDiet);
		readyForDiet = true;
	} else {
		return false;
	}
	readyForAllergies = false;
}



// Ask user for diet preferences 
function checkForDiet() {
	if (allergyVal.length > 0) {
		userMessage(allergyVal);
	} else {
		userMessage('No men blown down today.');
	}
	$('#user-input').empty().html(`<div class="checkboxheader">Aye but are you on a diet? When yer
																	done choosing or no diets apply press 'Enter' or 'Show results'.<br>
																
																<form id="js-user-input">
																  <label><input type="checkbox" value="Lacto vegetarian" class="diet">Lacto vegetarian</label>
															    <label><input type="checkbox" value="Ovo vegetarian" class="diet">Ovo vegetarian</label>
															    <label><input type="checkbox" value="Pescetarian" class="diet">Pescetarian</label>
															    <label><input type="checkbox" value="Vegan" class="diet">Vegan</label>
															    <label><input type="checkbox" value="Vegetarian" class="diet">Vegetarian</label>
															    <button id="js-user-submit" type="submit" class="dietButton ">Show results</button>
														    </form>
														    </div>`);
	//botMessage(botSays.checkDiet);''
	
	if (readyForDiet) {
		getCheckedValues('.diet', dietVal, false, startingSearch);
	} else {
		return false;
	}
	readyForDiet = false;
}



// Notify the user that search has been started 
function startingSearch() {
	if (dietVal.length > 0) {
		userMessage(dietVal);
	} else {
		userMessage('Oh, thy magic bowel!');
	}
	if (searchHasBeenRun) {
		$('#js-results').empty();
	}
	searchAPI(searchTerms, allowedIng, excludedIng, allergyVal, dietVal);
	
	$('#user-input').css('display', 'none');
	userRestart();
	searchHasBeenRun = true;
}



// Clear conversation and restart app 
function userRestart() {
	// When user presses Enter or Comma during entering of the search details
    document.addEventListener('keydown', function (e) {
        let keyCode = e.which || e.keyCode;
        if (keyCode === 13) {
        	e.preventDefault();
        } 

    });
	document.addEventListener('click', function(event) {

    if (event.target.dataset.restart != undefined) { 
    	$('#js-conversation').empty();
    	$('.tags-input').empty();
    	$('#user-input').empty().html(`<form id="js-user-input">
																			<fieldset>
																				<div class="tags-input" data-name="tags-input">
																				</div>
																				<br>
																				<input id="js-checkbox" type="checkbox" name="checkbox" checked="">
																				<label for="checkbox">
																					Send message with Enter
																				</label>
																				<br>
																				<button id="js-user-submit" type="submit">Send</button>
																			</fieldset>
																		</form>`);
			botMessage(botSays.restartGreet);
			searchTerms = [];
			allowedIng = [];
			excludedIng = [];
			allergyVal;
			dietVal;
			recipes = [];
			let readyForAllergies = false;
			let readyForDiet = false;
			getMeal(getAllowedIng);
			$('#user-input').css('display', 'block');
			$('.main-input').focus().attr('placeholder', 'Type in desired meal or press \'Enter\' to skip');
    }
  }, false);
	
}


// Get meal from user input
function getMeal(callback) {
	const tagsInput = document.getElementsByClassName('tags-input');
	let mainInput = document.createElement('input');

  mainInput.setAttribute('type', 'text');
  mainInput.classList.add('main-input');

	$(tagsInput).append(mainInput);

	// When user presses Enter or Comma during entering of the search details
    mainInput.addEventListener('keydown', function (e) {
        let keyCode = e.which || e.keyCode;
        if (keyCode === 13) {
        	e.preventDefault();
        	userEnteredMeal();
        } 

    });

    $('#js-user-submit').off('click')
											  .on('click', (e) => {
								        		e.preventDefault();
								        		userEnteredMeal();
								        	});

		// What happens when user enters meal
    function userEnteredMeal() {
    	let emptyRegExp = /^ +$/;
    	let enteredMeal = mainInput.value;
    	if (userInstructed) {
	    	if (emptyRegExp.test(enteredMeal)) {
				  mainInput.value = '';
				} else if ( enteredMeal.length > 0 ) {
	      	tags.push(enteredMeal);
	      	mainInput.value = '';
	      	callback();
	      	return tags;
	      } else if ( enteredMeal.length < 1 ) {
	      	callback();
	      }
	    }
    }

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
        	userEntered();
        } 

    });

    $('#js-user-submit').off('click')
											  .on('click', (e) => {
								        		e.preventDefault();
								         		userEntered();
								        	});

    el.appendChild(mainInput);
    el.appendChild(hiddenInput);


    // What happens when user enters text
    function userEntered() {
    	let emptyRegExp = /^ +$/;
    	let enteredTag = mainInput.value;
    	if (userInstructed) {
	    	if (emptyRegExp.test(enteredTag)) {
				  mainInput.value = '';
				} else if ( enteredTag.length > 0 ) {
	      	addTag(enteredTag);
	      	mainInput.setAttribute('placeholder', 'Type another tag or use \'Enter\' to move forward');
	      	mainInput.value = '';
	      	return tags;
	      } else if ( enteredTag.length < 1 ) {
	      	callback();
	      }
	    }
    }
    
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
	if (readyForAllergies || readyForDiet) {
		// Declare variables to store checked item data
		let targetChecked = targetClass + ':checked';
		let checkedArray = [];
		
    $(document).off().on('keypress',  function (e) {
        let keyCode = e.which || e.keyCode;
        if (keyCode === 13) {
        	e.preventDefault();
        	lookForCheckedValues();
        } 

    });

    $('#js-user-submit').off('click')
											  .on('click', (e) => {
											  		e.preventDefault();
								         		lookForCheckedValues();
								        	});



		function lookForCheckedValues() {
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
		}
	}
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
	if (data.matches.length > 0) {
		resultsMessage(botSays.gotResultsNotification);
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
	} else {
		resultsMessage(botSays.noResultsNotification);
	}
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
													<p>For detailed instructions visit <a href="${recipeDetails.sourceUrl}" target="_blank">${recipeDetails.sourceName}</a>.
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
}

$(initBot);

