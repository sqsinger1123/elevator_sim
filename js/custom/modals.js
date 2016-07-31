	function close_modal() {
		$(".modal").modal("hide");
	}

	function decode_optionals(optionals) {
		if(!optionals || optionals == {}) { return {}; }

		if(optionals['persist'] == true) {
			optionals['keyboard'] = false;
			optionals['backdrop'] = 'static';
		}
	}

	function display_modal(title_text,body_text,ok_text, optionals) {
		// Set all variable defaults.
		var title_default = "A message from ArtCoco";
		if(!title_text) { title_text	= title_default;								}
		if(!body_text)	{ body_text		= title_text; 		title_text = title_default;	}
		if(!ok_text)	{ ok_text		= "Ok";											}
		if(!optionals)	{ optionals		= {};											}

		// Might need to load it in :)
		if($(".modal").length < 1 || !optionals['no_retry']) {
			$.ajax("/templates/_modals.html").success(function(data,html) {
				$("#cache-area").append(data);
				optionals['no_retry'] = true;
				display_modal(title_text,body_text,ok_text, optionals);
			});
			return false;
		}

		$("#myModalLabel").html(title_text);
		$("#myModal .modal-body").html(body_text);
		$("#myModal").modal('show');
		$("#modal-ok").html(ok_text);
	}

	function display_gallery_modal(title_text, body_text) {
		var title_default = "ArtCoco Gallery";
		if(!title_text) { title_text	= title_default;								}
		if(!body_text)	{ body_text		= title_text; 		title_text = title_default;	}

		//$("#galleryModalLabel").html(title_text);
		$("#galleryModal .gallery-body").html(body_text);
		$("#galleryModal").modal('show');
	}

	function display_sidebar_modal(title_text,body_text,ok_text, optionals) {
		var title_default = "Neighborhood Sponsors";
		if(!title_text) { title_text	= title_default;								}
		if(!body_text)	{ body_text		= title_text; 		title_text = title_default;	}
		if(!ok_text)	{ ok_text		= "Close";										}
		if(!optionals)	{ optionals		= {};											}

		$("#sidebar_modalLabel").html(title_text);
		$("#sidebar_modal .modal-body").html(body_text);
		$("#sidebar_modal").modal('show');
		$("#sidebar_modal").bind("keypress", function() {
			$("#sidebar_modal").bind("keyup",function() {
				$("#sidebar_modal").modal("hide");
			});
		});
		$("#sidebar_modal .modal-ok").html(ok_text);
	}

	function display_option_modal(title_text, body_text, yes_action, no_action, yes_text, no_text, optionals) {
		// Set the vars correctly.
		if(!title_text	|| title_text == '')	{ title_text	= "You have a choice to make";	}
		if(!body_text	|| body_text == '')		{ body_text		= "Choose yes or no.";			}
		if(!yes_action	|| yes_action == '')	{ yes_action	= function() { var x = 1; };	}
		if(!no_action	|| no_action == '')		{ no_action		= function() { var x = 1; };	}
		if(!yes_text	|| yes_text == '')		{ yes_text		= "Yes";						}
		if(!no_text		|| no_text == '')		{ no_text		= "No";							}
		if(!optionals	|| optionals == '')		{ optionals		= {};							}

		// Remove any previous event bindings
		$("#optionModalYes").off("click tap");
		$("#optionModalNo").off("click tap");

		// Set up the text accordingly.
		$("#optionModalLabel").html(title_text);
		$("#optionModal .modal-body").html(body_text);
		$("#optionModalYes").html(yes_text);
		$("#optionModalNo").html(no_text);
		$("#optionModal").modal('show');

		// Bind actions for click, tap, or keyboard (enter and escape):
		$("#optionModalYes").on("click tap",yes_action);
		$("#optionModalNo").on("click tap",no_action);
	}

	// Pass in a DOM element for the image that you want to display.
	function display_image_modal(image, title_text, optionals) {
		// Set the vars correctly.
		if(!image)				{ image			= $("img")[0]; 									} // Will usually be an adroll img, 1x1 px.
		if(!title_text) 		{ title_text	= image.title || image.alt || "Untitled image";	}
		if(!optionals)			{ optionals		= {};											}

		// Set up the text accordingly.
		$("#imageModalLabel").html(title_text);
		$("#imageModal .modal-body").html($(image).clone());

		$("#imageModal").modal('show');
	}

	function load_url_to_modal(url,title, optionals) {
		if(!url		|| url == "")	{ return false; 						}
		if(!title	|| title == "")	{ title = "A message from ArtCoco";	}
		if(!optionals)				{ optionals		= {};					}

		$("#modal-content-holder").load(url, function() {
			display_modal(title,$("#modal-content-holder").html());
		});
	}
	function load_url_to_modal_with_two_buttons(url, title, func_callback, param1, optionals) {
		if(!url		|| url == "")	{ return false; 						}
		if(!title	|| title == "")	{ title = "A message from ArtCoco";	}
		if(!optionals)				{ optionals		= {};					}

		var defaults = {
			no_action:		false,
			yes_text:		'Submit',
			no_text:		'Cancel',
			onload_action: 	do_nothing,
		};
		var oD = new clsDefaulter(defaults,optionals);

		$("#optionModalYes").unbind();
		$("#optionModalNo").unbind();

		$("#modal-content-holder").html('');
		$("#modal-content-holder").load(url, function() {
			display_option_modal_ext(title, $("#modal-content-holder").html(), func_callback, oD.no_action, oD.yes_text, oD.no_text, param1, oD);
			setTimeout (function() {oD.onload_action()}, 500);
		});
	}

	// Very stupid function for placeholder purposes.
	function do_nothing() {
		return;
	}

// --------------------------------------------- Added by Alex -----------------------------------------------------
function display_option_modal_ext(title_text, body_text, yes_action, no_action, yes_text, no_text, param_yes, optionals) {
	// Set the vars correctly.
	if(!title_text) { title_text	= "You have a choice to make";	}
	if(!body_text)	{ body_text		= "Choose yes or no.";			}
	if(!yes_action) { yes_action	= function() { var x = 1; };	}
	if(!no_action)	{ no_action		= function() { var x = 1; };	}
	if(!yes_text)	{ yes_text		= "Yes";						}
	if(!no_text)	{ no_text		= "No";							}
	if(!optionals)	{ optionals		= {};							}

	var defaults = {
		onload_action: 	do_nothing,
	};
	var oD = new clsDefaulter(defaults,optionals);

	// Remove any previous event bindings
	$("#optionModalYes").off("click tap");
	$("#optionModalNo").off("click tap");

	// Set up the text accordingly.
	$("#optionModalLabel").html(title_text);
	$("#optionModal .modal-body").html(body_text);
	$("#optionModalYes").html(yes_text);
	$("#optionModalNo").html(no_text);
	$("#optionModal").modal('show');

	$("#optionModalYes").attr("data-dismiss","modal");

	// Bind actions for click, tap, or keyboard (enter and escape):
	$("#optionModalYes").bind("click tap", function() {
		fnCallFunc(yes_action, [param_yes]);
	});
	$("#optionModalNo").bind("click tap", no_action);
}
function fnCallFunc(fn, args) {
	fn = (typeof fn == "function") ? fn : window[fn];
	return fn.apply(this, args || []);
}

// Section added 2015-04-30

// Make a modal uncloseable - optionally pass in jQuery selector
function modal_no_dismiss(selector, optionals) {
	if(!selector	|| selector		== '')		{ selector		= '.modal';	}
	if(!optionals	|| optionals	== '')		{ optionals		= {};		}

	// First, let's add the attributes of data-keyboard and data-backdrop, such that the modal cannot be closed by clicking outside or by tapping a key.
	$(selector).removeAttr('data-keyboard data-backdrop'); // Remove the old ones first, just in case.
	$(selector)	.attr("data-keyboard", "false")
				.attr("data-backdrop", "static");

	// Next, let's use the built-in Bootstrap-JS solution here.
	$(selector).modal({
		keyboard: false,
		backdrop: 'static',
		show: false
	});

	// Next, hide the little 'x' in the top right that would indicate a closing spot.
	$(selector).find('.close').addClass("hidden");

	// For anything with the html attribute that would dismiss the modal: store the appropriate value, but disable.
	$(selector).find("[data-dismiss]").each(function() {
		var selected	= $(this);
		var val			= selected.attr("data-dismiss");

		selected.attr("data-stored-dismiss",val);
		selected.removeAttr("data-dismiss");
	});
}

function modal_enable_dismiss(selector, optionals) {
	if(!selector	|| selector		== '')		{ selector		= '.modal';	}
	if(!optionals	|| optionals	== '')		{ optionals		= {};		}

	$(selector).removeAttr('data-keyboard data-backdrop');
	$(selector).find('.close').removeClass("hidden");

	$(selector).modal({
		keyboard: true,
		backdrop: true,
		show: false
	});

	// Re-enable the data-dismiss modal hiders (html buttons and such to hide modals)
	$(selector).find("[data-stored-dismiss]").each(function() {
		var selected	= $(this);
		var val			= selected.attr("data-stored-dismiss");

		selected.attr("data-dismiss",val);
		selected.removeAttr("data-stored-dismiss");
	});
}

// Event listener: When a modal is closed, remove any attr's that would otherwise make it uncloseable; also restore data-dismiss attr's.
$(document).on("hidden.bs.modal", '.modal', function() {
	modal_enable_dismiss();
	/*
	// Get elem just closed, give it a unique ID (in data- attr), then call enable_dismiss with that used as selector.
	var selected		= $(this);
	var date			= new Date();
	var timestring		= date.getTime();

	selected.attr("data-modal-special-timestring", timestring);
	var selector = "[data-modal-special-timestring=" + timestring + "]";
	modal_enable_dismiss(selector);
	*/
});
