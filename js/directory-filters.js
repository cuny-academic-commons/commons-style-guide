(function($){
	var $body;
	var $filterContainer;
	var $directoryDropdowns;
	var $directoryFilterInputs;
	var $orderbyDropdown;

	var $directoryOptionsClose;

	var $directoryForm;

	var $resetButton;
	var $submitButton;

	var cleanFilters = {};
	var cleanOrderby = '';

	var calculateCurrentFilters = function() {
		var filterValues = {};

		$directoryFilterInputs.each( function() {
			var value;
			if ( 'checkbox' === this.type ) {
				value = $(this).is(':checked');
			} else {
				value = this.value;
			}

			filterValues[ this.id ] = value;
		} );

		return filterValues;
	}

	var calculateButtonStates = function() {
		var currentFilters = calculateCurrentFilters();

		$directoryDropdowns.each( function() {
			var $input = $(this);

			if ( $input.find(':checked').length ) {
				$input.addClass('has-active-filters');
			} else {
				$input.removeClass('has-active-filters');
			}
		} );

		if ( isDirty() ) {
			$submitButton.removeAttr('disabled');
		} else {
			$submitButton.attr('disabled', 'disabled');
		}

		var activeFilterExists = false;
		$directoryFilterInputs.each( function() {
			var value;
			if ( 'checkbox' === this.type && $(this).is(':checked')) {
				activeFilterExists = true;
				return false;
			} else if ( 'text' === this.type && this.value.length > 0 ) {
				activeFilterExists = true;
				return false;
			}
		} );

		if ( activeFilterExists ) {
			$resetButton.removeAttr('disabled');
		} else {
			$resetButton.attr('disabled', 'disabled');
		}
	}

	var isDirty = function() {
		var filtersAreDirty = JSON.stringify(cleanFilters) !== JSON.stringify(calculateCurrentFilters());
		var orderbyIsDirty = cleanOrderby !== $orderbyDropdown.val();

		return filtersAreDirty || orderbyIsDirty;
	}

	var toggleDropdown = function( $dropdown, action ) {
		var $button = $dropdown.find( 'button' );

		if ( 'close' === action ) {
			$button.attr('aria-expanded', 'false').attr('aria-selected', 'false');
			$dropdown.find('.directory-filter-options').attr('aria-hidden', 'true');
			$body.removeClass('has-open-filter-dropdown');
		} else {
			reorderOptions( $dropdown );
			$button.attr('aria-expanded', 'true').attr('aria-selected', 'true');
			$dropdown.find('.directory-filter-options').attr('aria-hidden', 'false');
			$body.addClass('has-open-filter-dropdown');
		}
	}

	var reorderOptions = function( $dropdown ) {
		var checkedEls = [];
		var uncheckedEls = [];
		var counter = 1;

		$dropdown.find('li').each(function(){
			var $theCheckbox = $(this).find('input');
			if ( $theCheckbox.is(':checked') ) {
				checkedEls.push( $theCheckbox.attr('id') );
			} else {
				uncheckedEls.push( $theCheckbox.attr('id') );
			}
		});

		for ( var i in checkedEls ) {
			$( '#' + checkedEls[i] ).closest( 'li' ).css( 'order', counter );
			counter++;
		}

		for ( var i in uncheckedEls ) {
			$( '#' + uncheckedEls[i] ).closest( 'li' ).css( 'order', counter );
			counter++;
		}
	}

	var closeAllDropdowns = function() {
		$directoryDropdowns.each(function(){
			toggleDropdown( $(this), 'close' );
		});

		calculateButtonStates();
	}

	// Todo: Swap with AJAX?
	var submitForm = function() {
		$directoryForm.submit();
	}

	$(document).ready(function(){
		$body = $('body');
		$filterContainer = $('.filter-container');
		$directoryDropdowns = $('.directory-filter-dropdown');
		$directoryFilterInputs = $('.directory-filter-input');
		$orderbyDropdown = $('#order-by');

		$directoryForm = $('.directory-filter-form');
		$directoryOptionsClose = $('.directory-filter-options-close button');

		$submitButton = $('.directory-filter-submit');
		$resetButton = $('.directory-filter-reset');

		cleanFilters = calculateCurrentFilters();
		cleanOrderby = $orderbyDropdown.val();

		calculateButtonStates();

		$directoryDropdowns.on('click', 'button', function( e ) {
			var $clicked = $(this);
			var $theDropdown = $clicked.closest('.directory-filter-dropdown');

			if ( 'true' === $clicked.attr( 'aria-expanded' ) ) {
				// Clicking on an open item closes that item.
				toggleDropdown( $theDropdown, 'close' );
			} else {
				// Clicking a closed item must close other items before opening the one that's been clicked
				closeAllDropdowns();
				toggleDropdown( $theDropdown, 'open' );
			}
		});

		// Close open filters if clicking X or elsewhere on the document.
		$(document).on( 'click', function( e ) {
			var $target = $(e.target);

			if ( $target.closest( '.directory-filter-options-close' ).length ) {
				closeAllDropdowns();
				return;
			}

			// If we've gotten here, we're looking for clicks outside of the -dropdown.
			if ( ! $target.closest( '.directory-filter-dropdown' ).length ) {
				closeAllDropdowns();
				return;
			}
		} );

		// Hitting escape should close current filter.
		$(document).on('keydown', function( e ) {
			if ( e.keyCode === 27 ) {
				closeAllDropdowns();
			}
		} );

		$('.directory-filter-input, #order-by').on( 'change keyup', function( e ) {
			if ( isDirty() ) {
				$filterContainer.addClass('has-dirty-filters');
			} else {
				$filterContainer.removeClass('has-dirty-filters');
			}
			calculateButtonStates();
		} );

		// Reset button behavior.
		$resetButton.on('click', function() {
			$directoryFilterInputs.each( function() {
				if ( 'checkbox' === this.type ) {
					$(this).prop('checked', false);
				} else {
					this.value = '';
				}
			} );

			submitForm();
		});

		// Refresh on Order By dropdown change.
		$orderbyDropdown.on('change', submitForm);
	});
}(jQuery));
