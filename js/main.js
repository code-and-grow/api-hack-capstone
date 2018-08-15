

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
let userInstructed = false;
let readyForAllergies = false;
let readyForDiet = false;
let readyForMeal = false;
let readyForAllowed = false;
let searchHasBeenRun = false;
const botSays = {
										loader : `<div class='current-message message'>
															 <div class="bot-icon">
					 												<img src='images/pirate.png' aria-hidden="true" alt="Captain Cook textbox icon">
					 											</div>
					 											<p class="bot-message">
					 											  <img src="images/typing.svg" alt="Captain Cook is typing animation">
					 											</p>
															</div>`,
					 firstBotMessage : `<div class="bot-icon">
				 												<img src='images/pirate.png' aria-hidden="true" alt="Captain Cook textbox icon">
				 											</div>
				 											<p class="bot-message">
																	Ahoy Jack!
																	<br>Greetings from Captain Cook! 
																	I'll help ye find some tasty recipes!
													    </p>`,
					secondBotMessage : `<div class="bot-icon">
				 												<img src='images/pirate.png' aria-hidden="true" alt="Captain Cook textbox icon">
				 											</div>
				 											<p class="bot-message">
																Ok matey, define the five search preferences 
																that follow. Much obliged!
														  </p>`,
	  gotResultsNotification : `<div class='current-message message'>
		  													<div class="bot-icon">
					 												<img src='images/pirate.png' aria-hidden="true" alt="Captain Cook textbox icon">
					 											</div>
					 											<p class="bot-message">
																	Me started the search and result will appear below. 
																	<br>Ye can start over if there's nothing ye fancy on the list.
																	<button id="js-restart-button" data-restart>
																		START OVER
																	</button>
																</p>
															</div>`,
     noResultsNotification : `<div class='current-message message'>
     														<div class="bot-icon">
					 												<img src='images/pirate.png' aria-hidden="true" alt="Captain Cook textbox icon">
					 											</div>
					 											<p class="bot-message">
	     				  									Sorry Jack! I have no recipes that match the terms you entered! 
						  										<button id="js-restart-button" data-restart>
					  												START NEW SEARCH
				  												</button>
	      												</p>
	      											</div>`,
						  restartGreet : `<div class='current-message message'>
					 											<div class="bot-icon">
					 												<img src='images/pirate.png' aria-hidden="true">
					 											</div>
					 											<p class="bot-message">
																 Go on matey, I'm ready to take your order!
															  </p>
															</div>`
}


// Bot message rendering 
function botMessage(text1, text2, timeout) {
	// Add bot message to conversation window
	$('#js-conversation').append(text1)
											// Scroll conversation window to see the last appended message
											 .scrollTop(
											 	$('#js-conversation').prop('scrollHeight')
											 );
	// Add a small delay before showing bot message	
	setTimeout(function(){ 									 
		$('.current-message').html(text2);
		$('.current-message').removeClass('current-message');
	}, timeout);
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
	$('.current-message').hide();
	$('.current-message').show();
	$('.current-message').removeClass('current-message');
}


// User answer rendering
function userMessage(input) {
	$('#js-conversation')
					.append(`<div class="message">
										<div class="user-icon">
											<img src='images/skull.png' width='40px' aria-hidden="true" alt="User textbox icon">
										</div>
										<p class="user-message">
											${input}
										</p>
									</div>`)
					// Scroll conversation window to see the last appended message
					.scrollTop($('#js-conversation').prop('scrollHeight'));
}


// Userflow icons and instructions rendering
function userFlow(imgSrc, instructions) {
	$('#user-input').prepend(`<div id='user-flow'>
													    <div id='user-flow-img'>
															  <img src='${imgSrc}' aria-hidden="true" alt="Captain Cook recipe finder user steps visual representation">
														  </div>
													  	<p>${instructions}</p>
													 </div>`
									);
}


// Greet user and ask what meal to search
function greetUser() {
	botMessage(botSays.loader, botSays.firstBotMessage, 3000);
	setTimeout(function(){ 
		botMessage(botSays.loader, botSays.secondBotMessage, 3200); 
		userInstructed = true;
	}, 3700);
	setTimeout(function(){ 
		if (userInstructed) {
			$('#user-input').css('display', 'block');
			readyForAllergies = true;
			checkForAllergies();
		}
  }, 6800);
}




// Ask user about allergies 
function checkForAllergies() {
	$('#user-input').empty().html(`<div class="checkboxheader">
																<form id="js-user-input" class="checkboxlist">
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
															    <button id="js-user-submit" type="submit" class="allergyButton">Next</button>
														    </form>
														    </div>`);
	// $('#user-flow').remove();
	userFlow('images/allergy-green.jpg', 'Avast matey, do you have allergies?<br>When yer done choosing or no allergies apply press \'Next\'.');
	if (readyForAllergies) {
		getCheckedValues('.allergy', allergyVal, true, checkForDiet);
		readyForDiet = true;
	} else {
		return false;
	}
	//readyForAllergies = false;
}



// Ask user for diet preferences 
function checkForDiet() {
	if (allergyVal.length > 0) {
		userMessage(allergyVal);
	} else {
		userMessage('No men blown down today.');
	}
	$('#user-input').empty().html(`<div class="checkboxheader">
																<form id="js-user-input" class="checkboxlist">
																  <label><input type="checkbox" value="Lacto vegetarian" class="diet">Lacto vegetarian</label>
															    <label><input type="checkbox" value="Ovo vegetarian" class="diet">Ovo vegetarian</label>
															    <label><input type="checkbox" value="Pescetarian" class="diet">Pescetarian</label>
															    <label><input type="checkbox" value="Vegan" class="diet">Vegan</label>
															    <label><input type="checkbox" value="Vegetarian" class="diet">Vegetarian</label>
															    <button id="js-user-submit" type="submit" class="dietButton ">Next</button>
														    </form>
														    </div>`);
	$('#user-flow').remove();
	userFlow('images/diet-green.jpg', 'Aye but are you on a diet?<br>When yer done choosing or no diets apply press \'Next\'.');
	
	if (readyForDiet) {
		getCheckedValues('.diet', dietVal, false, getMeal);
		readyForMeal = true;
	} else {
		return false;
	}
	readyForDiet = false;
}


// Get meal from user input
function getMeal() {
	if (dietVal.length > 0) {
		userMessage(dietVal);
	} else {
		userMessage('Oh, thy magic bowel!');
	}
	$('#user-input').empty().html(`<form id="js-user-input">
																			<fieldset>
																				<div class="tags-input" data-name="tags-input">
																				</div>
																				<br>
																				<input id="js-checkbox" aria-label="Send with Enter checkbox" type="checkbox" name="checkbox" checked="">
																				<label for="checkbox">
																					Send message with Enter
																				</label>
																				<br>
																				<button id="js-user-submit" type="submit">Next</button>
																			</fieldset>
																		</form>`);

	$('#user-flow').remove();
	userFlow('images/meal-green.jpg', 'Type desired meal below or skip with \'Next\'.');

	const tagsInput = document.getElementsByClassName('tags-input');
	let mainInput = document.createElement('input');

  mainInput.setAttribute('type', 'text');
  mainInput.setAttribute('aria-label', 'Type in desired meal or skip with Enter')
  mainInput.classList.add('main-input');

	$(tagsInput).append(mainInput);
	$('.main-input').focus().attr('placeholder', 'Type desired meal here...');
	
	// When user presses Enter or Comma during entering of the search details
  $(mainInput).off('keydown').on('keydown', function (e) {
      let keyCode = e.which || e.keyCode;
      if (keyCode === 13) {
      	e.preventDefault();
      	$('#js-user-submit').click();
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
      	getAllowedIng();
      	return tags;
      } else if ( enteredMeal.length < 1 ) {
      	getAllowedIng();
      }
    }
  }

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
	$('#user-flow').remove();
	userFlow('images/allowed-green.jpg', 'Type allowed ingredients below or skip with \'Next\'.');
	getTags(getExcludedIng);
	$('.main-input').focus()
									.attr('placeholder', 'Type allowed ingredients here')
									.attr('aria-label', 'Type allowed ingredients here');
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
	$('#user-flow').remove();
	userFlow('images/excluded-green.jpg', 'Type excluded ingredients below or skip with \'Next\'.');
	getTags(startingSearch);
	$('.main-input').focus()
									.attr('placeholder', 'Type excluded ingredients here')
									.attr('aria-label', 'Type excluded ingredients here');
}


// Notify the user that search has been started 
function startingSearch() {
	if (tags.length >= 1) {
		excludedIng = tags.map(item => item.text);
		userMessage(excludedIng);
		$('.tags-input').empty();
		tags = [];
	} else {
		userMessage('No hornswaggle, me eats it all.');
		$('.tags-input').empty();
		readyForAllergies = true;
	}
	if (searchHasBeenRun) {
		$('#js-results').empty();
		readyForAllergies = true;
	}
	searchAPI(searchTerms, allowedIng, excludedIng, allergyVal, dietVal);
	
	$('#user-input').css('display', 'none');
	userRestart();
	searchHasBeenRun = true;
}



// Clear conversation and restart app 
function userRestart() {
  document.addEventListener('keydown', function (e) {
  	if (e.target.dataset.restart != undefined) { 
        let keyCode = e.which || e.keyCode;
        if (keyCode === 13) {
        	e.preventDefault();
        } 
      }
    });
	document.addEventListener('click', function(e) {

    if (e.target.dataset.restart != undefined) { 
    	$('#results img').remove();
    	$('#js-results').empty();
    	$('#js-conversation').empty();
    	$('.tags-input').empty();
    	botMessage(botSays.loader, botSays.restartGreet, 1200);
			searchTerms = [];
			allowedIng = [];
			excludedIng = [];
			allergyVal;
			dietVal;
			recipes = [];
			userFlow('images/allergy-green.jpg', 'Avast matey, do you have allergies?<br>When yer done choosing or no allergies apply press \'Next\'.');
			checkForAllergies();
			$('#user-input').css('display', 'block');
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
  $('#js-results').append(`<a class="js-result col-6" id="${result.id}">
							  						<div>
															<img src="images/Loading_icon.gif" alt="Loading recipe image animation"  aria-hidden="true">
															<h3>${result.recipeName}</h3>
															<div class="result-info">
																<p class="js-rating-container"></p>
																<p class="clock">${cookingTime}</p>
																<p class="ingredients">Ingredients:</p>
																<ul class="ingredients-list">${ingredientsList(result.ingredients)}</ul>
															</div>
														</div>
										 			 </a>`);
}



// Display the results to user 
function displayResults(data) {
	if (data.matches.length > 0) {
		resultsMessage(botSays.gotResultsNotification);
		$('#results img').remove();
		$('#results').prepend(`<img id='result-head-img' src='images/results301x185-300dpi.png' alt='Results image - source: https://www.freepik.com/free-vector/pirate-skull-and-a-map-on-the-wall_1296860.htm - Designed by Freepik'>`);
		// Loop through the results and render them 
		data.matches.map( (item, index) => renderResult(item) );
		// Add images from recipes array
		setTimeout(function() {
			for (let i = 0; i < recipes.length; i++) {
				$('#js-results')
					.find(`#${recipes[i].recipeData.id} img`)
					.attr('src', recipes[i].recipeData.images[0].hostedLargeUrl)
					.attr('alt', recipes[i].recipeData.name);
				$('#js-results')
					.find(`#${recipes[i].recipeData.id} p#js-rating-container`)
					.html(starRating(recipes[i].recipeData.rating));
			}
		}, 2200);
		// Open recipe in a lightbox after user click
		showRecipeToUser();
	} else {
		$('#results h2').remove();
		resultsMessage(botSays.noResultsNotification);

	}
}

// Return ingredients ul list items
function ingredientsList(ingredientArray) {
	let resultIngList = '';
  for (let i = 0; i < ingredientArray.length; i++) {
  	resultIngList += '<li class="ingredients-item">';
  	resultIngList += ingredientArray[i];
  	resultIngList += '</li>';
  }
  return resultIngList;
}


// Add stars to rating display
function starRating(ratingValue) {
	let stars = '';
  for (let i = 0; i < ratingValue; i++) {
  	stars += '<img class="star" src="images/star.png" alt="" aria-hidden="true">';
  }
  return stars;
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
		function checkCourse() {
			if (recipeDetails.course) {
				recipeDetailsData = recipeDetails.course.join(', ');
				return recipeDetailsData;
			} else {
				return 'Yarr-arr, me dunno..';
			}
		}
		function checkYield() {
			if (recipeDetails.servings) {
				return recipeDetails.servings;
			} else {
				return 'Me can\'t remembarr..';
			}
		}
		// Lightbox recipe details html
		const contentHtml = `<p id="closeLightbox">X</p>
													<img src="${recipeDetails.image}" alt="${recipeDetails.name}"  aria-hidden="true">
													<h2>${recipeDetails.name}</h2>
													<p class="rating">${starRating(recipeDetails.rating)}<span>${recipeDetails.rating} star rating</span></p>
													<p class="clock">${recipeDetails.totalTime}</p>
													<p class="course"> ${checkCourse()}</p>
													<p class="yield">${checkYield()}</p>
													<p class="ingredients">Ingredients:</p>
													<ul>
														${ingredientsList(recipeDetails.ingredients)}
													</ul>
												<p class="source">
													For detailed instructions visit 
													<a href="${recipeDetails.sourceUrl}" target="_blank" aria-label="For detailed instructions visit ${recipeDetails.sourceName}.">
														${recipeDetails.sourceName}
													</a>.
												</p>
												<p class="yummly-ref">
													<a href="${recipeDetails.yummlyUrl}" target="_blank" aria-label="Link to selected recipe Yummly page">
														<img id="yummly-logo" src="${recipeDetails.yummlyLogo}" alt="Link to selected recipe Yummly page">
													</a>
												</p>`
		// If lightbox exists
		if ($('#lightbox').length > 0) { 
			$('#lightbox-content').html(contentHtml);
			// Show lightbox window 
			$('#lightbox').show();
		// If lightbox does not exist
		} else { 
			//create HTML markup for lightbox window
			const lightbox = 
					`<div id="lightbox">
						<div id="lightbox-content">${contentHtml}</div>	
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

