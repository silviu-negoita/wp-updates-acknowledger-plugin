<?php
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HTML INJECTOR SHORTCODE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

add_shortcode('include-html', 'include_html');
register_for_button_rendering("html_include_shortcode_button", "/js/wpih-shortcode-button.js");

function show_danger_alert($message) {
	?>
	<div class="alert alert-danger">
  	<strong>[include-html]</strong> <?php echo $message ?>
	</div>
	<?php
}


function include_html($attrs) {
  if (is_null($attrs[WPIH_SHORTCODE_PARAM_URL])) {
    show_danger_alert("Field '" . WPIH_SHORTCODE_PARAM_URL . "' not specified");
    return;
  }

  return '<div id = "' . WPIH_CONTAINER_ELEMENT_ID . '" url="' . $attrs[WPIH_SHORTCODE_PARAM_URL] . '"> TEST </div>';
}