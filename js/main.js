// API credentials
const API_URL = 'https://api.yummly.com/v1';
const APP_ID = '0163f367';
const APP_KEY = 'fe0abbd328e4ac7137fab9e9459fb9df';

// Undefined startup variables
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



// Greet user and ask what meal to search
function greetUser() {
	let greeting = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Howdy hungry pirate! 
											I am captain Cook and ready to help. Enter what sort 
											recipe you're looking for in the text field below. 
											Press Enter when you're done or want to skip this part.
										</span>
										<span class="username">You:</span>
				            <span class="search-tags" data-name="search-tags" data-search-tags></span>
					        </p>`;
	botMessage(greeting);
	getTags(searchTerms, 'search-tags', 'search-input', getAllowedIng);
}


// Ask what ingredients are allowed
function getAllowedIng() {
	if (searchTerms.length >= 1) {
		searchTerms = searchTerms.map(item => item.text).join('+');
	}
	let askForAllowedIng = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
													  <span class="bot-message">Please enter ingredients to be included 
														  in the recipe separated with a comma in the text field below or 
														  press Enter to skip.
														</span>
														<span class="username">You:</span>
								            <span class="allowed-tags" data-name="allowed-tags"></span>
									        </p>`;
	botMessage(askForAllowedIng);
	getTags(allowedIng, 'allowed-tags', 'allowed-input', getExcludedIng);
}


// Ask what ingredients are excluded
function getExcludedIng() {
	if (allowedIng.length >= 1) {
		allowedIng = allowedIng.map(item => item.text);
	} 
	let askForExcludedIng = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
													  <span class="bot-message">What about ingredients you don't like? 
														  Enter them separated with a comma in the textbox below or press 
														  Enter to skip.
														</span>
														<span class="username">You:</span>
								            <span class="excluded-tags" data-name="excluded-tags"></span>
									        </p>`;
	botMessage(askForExcludedIng);
	getTags(excludedIng, 'excluded-tags', 'excluded-input', checkForAllergies);
	if (excludedIng.length >= 1) {
		excludedIng = excludedIng.map(item => item.text);
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
	userRestart();
	searchHasBeenRun = true;
}



// Clear conversation and restart app 
function userRestart() {
	document.addEventListener('click', function(event) {

    if (event.target.dataset.restart != undefined) { 
    	$('#js-conversation').empty();

			let restartGreet = `<p class="currentMessage">
														<span class="bot">Chef Cook:</span>
														<span class="bot-message">OK, let's search for something else. Enter
														 what meal you're looking for in the text field below. Press Enter when you're 
														 done or want to skip this part.
														</span>
														<span class="username">You:</span>
								            <span class="search-tags" data-name="search-tags"></span>
									        </p>`;
			botMessage(restartGreet);
			searchTerms = [];
			allowedIng = [];
			excludedIng = [];
			allergyVal;
			dietVal;
			recipes = [];
			getTags(searchTerms, 'search-tags', 'search-input', getAllowedIng);
    }
  });
	
}


// Get tags from user input
function getTags(array, inputClass, mainInputClass, callback) {
	[].forEach.call(document.getElementsByClassName(inputClass), function (el) {
    let hiddenInput = document.createElement('input'),
        mainInput = document.createElement('input'),
        tags = array;
    
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', el.getAttribute('data-name'));

    mainInput.setAttribute('type', 'text');
    mainInput.classList.add(mainInputClass);

    mainInput.addEventListener('input', function () {
      let enteredTags = mainInput.value.split('	');
      if (enteredTags.length > 1) {
          enteredTags.forEach(function (t) {
              let filteredTag = filterTag(t);
              if (filteredTag.length > 0)
                  addTag(filteredTag);
          });
          mainInput.value = '';
      	}
    });

    mainInput.addEventListener('keydown', function (e) {
        let keyCode = e.which || e.keyCode;
        if (keyCode === 8 && mainInput.value.length === 0 && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    });

    mainInput.addEventListener('keydown', function (e) {
        let keyCode = e.which || e.keyCode;
        if (keyCode === 13 && e.shiftKey) {
        	callback();
        	return tags;
        }
    });

    el.appendChild(mainInput);
    el.appendChild(hiddenInput);
    

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

    function removeTag (index) {
        let tag = tags[index];
        tags.splice(index, 1);
        el.removeChild(tag.element);
        refreshTags();
    }

    function refreshTags () {
        let tagsList = [];
        tags.forEach(function (t) {
            tagsList.push(t.text);
        });
        hiddenInput.value = tagsList.join(',');
    }

    function filterTag (tag) {
        return tag.replace(/[^\w -]/g, '').trim().replace(/\W+/g, '+');
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
	
}

$(initBot);