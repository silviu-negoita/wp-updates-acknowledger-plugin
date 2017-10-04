<?php
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INCLUDE HTML LOGIC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/*
* Callback from REST controller which returns an html body from given url
*/
function load_external_html_body($request) {
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

function get_html_body_from_full_html_content($full_html_content) {
  $d = new DOMDocument;
  $mock = new DOMDocument;
  $d->loadHTML($full_html_content);
  $body = $d->getElementsByTagName('body')->item(0);
  foreach ($body->childNodes as $child){
    $mock->appendChild($mock->importNode($child, true));
  }

  return $mock->saveHTML();
}

function process_html_content($requst) {
  $full_html_content = urldecode($_POST[WPIH_SHORTCODE_PARAM_HTML_CONTENT]);

  $html_body = get_html_body_from_full_html_content($full_html_content);

  return $html_body;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INCLUDE HTML BUTTON SHORTCODE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

add_shortcode('include-html', 'include_html');

register_for_button_rendering("html_include_shortcode_button", "/js/wpih-shortcode-button.js");

$GLOBALS['wpih_shortcute_index'] = 0

function include_html($attrs) {
  if (is_null($attrs[WPIH_SHORTCODE_PARAM_URL])) {
    show_danger_alert("Field '" . WPIH_SHORTCODE_PARAM_URL . "' not specified");
    return;
  }
  log_me("enters");
  return '<div id = "' . $GLOBALS['wpih_shortcute_index'] . ' id="wpih_id' . $GLOBALS['wpih_shortcute_index'] . '" url="' . $attrs[WPIH_SHORTCODE_PARAM_URL] . '"></div>';
}