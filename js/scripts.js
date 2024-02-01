$(document).ready(function () {

	// Toggle content-info
	$(".content-info__button").on('click', function () {
		$('.content-info__more-info').slideToggle("slow");
		$('.content-info__arrow').toggleClass('active');
	});

	// Event Delegation for select__item clicks
	$(".select").on('click', '.select__item', function (e) {
		e.preventDefault();
		const itemClass = $(this).attr('class');

		if (itemClass.includes('remembered-card')) {
			$('.modal--remembered-card').addClass('active');
			$('.modal--card-list').removeClass('active');
		} else if (itemClass.includes('card-input')) {
			$('.modal--card-input').addClass('active');
			$('.modal--card-list').removeClass('active');
		} else {
			$('.modal--card-list').addClass('active');
		}

		$('.overlay, .select__icon').addClass('active');
	});

	// Close modal on overlay click
	$('.overlay').on('click', function () {
		$('.modal, .overlay, .select__icon').removeClass('active');
	});

	// Toggle language sublist
	$('.language').on('click', function () {
		$('.language__sublist, .language__list, .language__icon').toggleClass('active');
	});

	// SMS Auth Input Handling
	const input = $(".sms-content__input");
	const items = $("form").find('[name^=num]');

	input.on({
		input: function () {
			const nextIndex = input.index(this) + 1;
			if (this.value && nextIndex < input.length) {
				input.eq(nextIndex).focus();
			}
		},
		keydown: function (ev) {
			const index = input.index(this);

			if (ev.which === 8 && !this.value && index > 0) {
				input.eq(index - 1).focus();
			}

			if (!(ev.which === 8 || ev.which === 46) && (ev.which < 48 || ev.which > 57)) {
				ev.preventDefault();
			}
		}
	});

	items.slice(1).on('focus', function (event) {
		const index = items.index(this);
		const prevItem = items.eq(index - 1);

		if (!prevItem.val().trim()) {
			event.preventDefault();
			prevItem.focus();
		}
	});

	// Prevent Default for select__item clicks
	$(".select__item").click(function (e) {
		e.preventDefault();
	});

	// Input Mask for card-phone
	const cardPhoneInput = $('#card-phone');
	const smsContentText = $('.sms-content__text');

	let cardPhoneValue = '+7';
	updateSmsContentText();
	cardPhoneInput.val(cardPhoneValue);


	const firstTwoDigits = cardPhoneValue.slice(2, 5);
	const lastTwoDigits = cardPhoneValue.slice(-2);

	smsContentText.eq(1).text(`+7 ${firstTwoDigits} *** ** ${lastTwoDigits}`);

	cardPhoneInput.on('keydown', function (e) {
		if ((e.key === 'Backspace' || e.key === 'Delete') && cardPhoneInput[0].selectionStart <= '+7'.length) {
			e.preventDefault();
		}
	});

	cardPhoneInput.on('input', function () {
		let inputValue = cardPhoneInput.val();

		if (!inputValue.startsWith('+7')) {
			cardPhoneInput.val('+7' + inputValue.substring(2));
			inputValue = cardPhoneInput.val();
		}

		if (inputValue.length > 12) {
			cardPhoneInput.val(inputValue.slice(0, 12));
		}

		cardPhoneValue = cardPhoneInput.val();
		updateSmsContentText()

	});
	function updateSmsContentText() {
		const firstTwoDigits = cardPhoneValue.slice(2, 5);
		const lastTwoDigits = cardPhoneValue.slice(-2);

		$('#card-phone-sms').val(cardPhoneValue);
		smsContentText.eq(1).text(`+7 ${firstTwoDigits} *** ** ${lastTwoDigits}`);
	}


	// Restrict Input Function
	function restrictInput(inputElement, pattern, maxLength) {
		inputElement.on('input', function () {
			let inputValue = $(this).val();

			inputValue = inputValue.replace(pattern, '');

			if (inputElement.attr('id') === 'card-number') {
				inputValue = inputValue.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
			}

			if (inputElement.attr('id') === 'card-name') {
				inputValue = inputValue.toUpperCase();
			}

			if (inputElement.attr('id') === 'card-date') {
				inputValue = inputValue.replace(/[^0-9]/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').slice(0, 5);

				if (inputValue.length >= 7 && !dateValidation(inputValue).result) {
					setError('card-date', { message: dateValidation(inputValue).message });
				} else {
					clearError('card-date');
				}
			}

			if (inputValue.length > maxLength) {
				inputValue = inputValue.slice(0, maxLength);
			}

			$(this).val(inputValue);
		});
	}

	// Apply Restrict Input to Elements
	restrictInput($('#card-number'), /[^0-9]/g, 19);
	restrictInput($('#card-cvv'), /[^0-9]/g, 3);
	restrictInput($('#card-cvv-remembered-card'), /[^0-9]/g, 3);
	restrictInput($('#card-date'), /[^0-9/]/g, 5);
	restrictInput($('#card-name'), /[^а-яА-Яa-zA-Z\s]/g, 30);

	// Form Submission Handling
	$('form.card').submit(function (event) {
		const minLengths = {
			'card-number': 16,
			'card-cvv': 3,
			'card-date': 4,
		};

		let validationPassed = true;

		for (const field in minLengths) {
			const fieldValue = $('#' + field).val().trim();

			if (fieldValue.length < minLengths[field]) {
				$('#' + field).addClass('error');
				validationPassed = false;
			}
		}

		if (!validationPassed) {
			event.preventDefault();
		}
	});

	// Form Handling for SMS Confirmation
		$('#button-sms').click(function (event) {
			const form = $(this).closest('form.card');
			if (form[0].checkValidity()) {
				event.preventDefault();
				showLoader();

				setTimeout(function () {
					$('#confirm').show();
					$('#try-payment').hide();
					hideLoader();
				}, 500);
			}
		});

	// Other form submissions...

	// Tab Switching
	$("#balanceForm").show();
	$("#cardForm").hide();

	$("#cardTab").click(function () {
		$("#form-balance").show();
		$("#form-card").hide();
		$("#form-sms").hide();
		$(this).addClass("active");
		$("#balanceTab").removeClass("active");
	});

	$("#balanceTab").click(function () {
		$("#form-card").show();
		$("#form-balance").hide();
		$(this).addClass("active");
		$("#cardTab").removeClass("active");
	});

	// Handle card-phone-submit click
	$("#card-phone-submit").on("click", function (event) {
		event.preventDefault();
		showLoader();
		setTimeout(function () {
			$("#form-sms").show();
			$("#form-card").hide();
			hideLoader();
		}, 500);
	});

	// Form Confirmation Handling
		$('#button-confirm').click(function (event) {
			const form = $(this).closest('form.card');
			if (form[0].checkValidity()) {
				event.preventDefault();
				showLoader();
				setTimeout(function () {
					$('#confirm').hide();
					$('#success').show();
					hideLoader();
				}, 500);
			}
		});

		$('#button-sms').click(function (event) {
			const form = $(this).closest('form.card');
			if (form[0].checkValidity()) {
				event.preventDefault();
				showLoader();

				setTimeout(function () {
					$('#success').show();
					$('#confirm').hide();
					$('#try-payment').hide();
					hideLoader();
				}, 500);
			}
		})

		$('#button-cvc-code').click(function (event) {
			const form = $(this).closest('form.card');
			if (form[0].checkValidity()) {
				event.preventDefault();
				showLoader();

				setTimeout(function () {
					$('#confirm').show();
					$('#try-payment').hide();
					$('.modal, .overlay, .select__icon').removeClass('active');
					hideLoader();
				}, 500);
			}
		})

		$('#button-card-payment').click(function (event) {
			const form = $(this).closest('form.card');
			if (form[0].checkValidity()) {
				event.preventDefault();
				showLoader();

				setTimeout(function () {
					$('#confirm').show();
					$('#try-payment').hide();
					$('.modal, .overlay, .select__icon').removeClass('active');
					hideLoader();
				}, 500);
			}
		})
	})

// Date Validation Function (Assumed)
function dateValidation(dateString) {
	// Replace this with your date validation logic
	// Example: Check if the date is in the future
	const currentDate = new Date();
	const inputDate = new Date(dateString);

	if (inputDate < currentDate) {
		return { result: false, message: 'Date should be in the future' };
	} else {
		return { result: true };
	}
}

// setError and clearError functions (Assumed)
function setError(elementId, error) {
	// Replace this with your error handling logic
	$('#' + elementId).addClass('error');
	console.error('Error:', error.message);
}

function clearError(elementId) {
	// Replace this with your error clearing logic
	$('#' + elementId).removeClass('error');
}
function hideLoader() {
	$('.fake-loader').fadeOut(500);
}

function showLoader() {
	$('.fake-loader').fadeIn(500);
}