<?php
/**
* This files contains all wpua shortcodes, the server side. If you need a button for this shortcode, declare them in js/wpua-shortcodes.js(client side).
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INCLUDE HTML BUTTON SHORTCODE (besides wpua-shortcodes.js, see wpih-main.js)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

add_shortcode('include-html', 'include_html');
// link with js button
register_for_button_rendering("html_include_shortcode_button", "/js/wpua-shortcodes.js");

/*
* Function which will sanitize and extract body tag from a html
*/
function sanitize_and_extract_html_body($request) {
  return tidy_repair_string($request,array(
                           'indent'         => true,
                           'output-html'   => true,
                           'wrap'           => 80,
                           'show-body-only' => true,
                           'clean' => true,
                           'input-encoding' => 'utf8',
                           'output-encoding' => 'utf8',
                           'logical-emphasis' => false,
                           'bare' => true,
                            ));
}

function show_danger_alert($message) {
	?>
	<div class="alert alert-danger">
  	<strong>[include-html]</strong> <?php echo $message ?>
	</div>
	<?php
}

function process_html_content($requst) {
  $full_html_content = urldecode($_POST[WPIH_SHORTCODE_PARAM_HTML_CONTENT]);

  $html_body = sanitize_and_extract_html_body($full_html_content);

  return $html_body;
}

function include_html($attrs) {
  if (is_null($attrs[WPIH_SHORTCODE_PARAM_URL])) {
    show_danger_alert("Field '" . WPIH_SHORTCODE_PARAM_URL . "' not specified");
    return;
  }
  return '<div class ="' . WPIH_SCONTAINER_CLASS . '" url="' . $attrs[WPIH_SHORTCODE_PARAM_URL] . '"></div>';
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HTML5 SHOWER PRESENTATION BUTTON SHORTCODE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

add_shortcode('html5-presentation', 'html5_shower_presentation');
// link with js button
register_for_button_rendering("html5_shower_presentation_button", "/js/wpua-shortcodes.js");

function html5_shower_presentation($attrs) {
    return '<div id="html5-presentation-button" class="alert alert-danger"> <button type="button" class="btn btn-danger" onclick="openPresentation()"><i class="glyphicon glyphicon-eye-open"></i> <span class="text">  Open as presentation </span></button></div>';
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CROSS REFERENCE ANCHOR BUTTON SHORTCODE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

add_shortcode('cross-ref-anchor', 'cross_reference_anchor');
// link with js button
register_for_button_rendering("cross_reference_anchor_button", "/js/wpua-shortcodes.js");

function cross_reference_anchor($attrs) {
    return '<a id="' . $attrs['id'] . '" href="#' . $attrs['id'] . '">cross ref anchor; don\'t delete!</a>';
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OVERVIEW PAGE SHORTCODE SHORTCODE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

add_shortcode('overview_page', "overview_widget_shortcode");
function overview_widget_shortcode($attrs) {
    return '<div id="wpua_overview_page_container_id"></div>';
}