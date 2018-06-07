// Mandatory variables
let username = '';

// Select placeholder value
function setPlaceholder(value) {
	let newPlaceholder = $('#js-user-message').attr('placeholder', value);
}

// Set new placeholder value
function renderPlaceholder(value) {
	setTimeout(function() {setPlaceholder(value);}, 1800);
}

// Bot message
function botMessage(text) {
	$('#js-conversation').append(text);
	$('.currentMessage').hide();
	$('.currentMessage').delay(1600).show('slide', 300);
	$('.currentMessage').removeClass('currentMessage');
}

// Get username
function getUsername() {
	let greeting = `<p class="currentMessage">
										<span class="bot">Chef Cook:</span>
										<span class="bot-message">Howdy partner! I am captain Cook and ready to help. 
										What is your name?</span>
									</p>`;
	botMessage(greeting);
	renderPlaceholder('Type your name here...')
}

// Bot AI
function botAi(message) {
	if (username === '') {
		username = message;
		botMessage(`<p class="currentMessage">
									<span class="bot">Chef Cook:</span>
									<span class="bot-message">Hello ${username}, feeling hungry eh? 
									Just type in a meal or some of your favourite ingredients and I'll look up 
									a few tasty recipes for you to try out.</span>
								</p>`);
		renderPlaceholder('Type your ingredients here...')
	}
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

$(getUsername);
$(sendUserMessage);