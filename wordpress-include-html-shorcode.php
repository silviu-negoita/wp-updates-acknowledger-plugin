<?php
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INCLUDE HTML LOGIC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

add_shortcode('include-html', 'include_html');

/*
* Callback from REST controller which returns an html body from given url
*/
function load_external_html_body($request) {
   $html_url = $_GET[WPIH_SHORTCODE_PARAM_URL];

  $d = new DOMDocument;
  $mock = new DOMDocument;
  $d->loadHTML(file_get_contents($html_url));
  $body = $d->getElementsByTagName('body')->item(0);
  foreach ($body->childNodes as $child){
    $mock->appendChild($mock->importNode($child, true));
  }

  return $mock->saveHTML();
}

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

  return '<div id = "' . WPIH_CONTAINER_ELEMENT_ID . '" url="' . $attrs[WPIH_SHORTCODE_PARAM_URL] . '"></div>';
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

// Filter Functions with Hooks
function html_include_shortcode_button() {
  // Check if user have permission
  if ( !current_user_can( 'edit_posts' ) && !current_user_can( 'edit_pages' ) ) {
    return;
  }

  // Check if WYSIWYG is enabled
  if ( 'true' == get_user_option( 'rich_editing' ) ) {
    add_filter( 'mce_external_plugins', 'load_html_inject_js' );
    add_filter( 'mce_buttons', 'register_html_include_shortcode_button' );
  }
}
add_action('admin_head', 'html_include_shortcode_button');

// Function for new button
function load_html_inject_js( $plugin_array ) {
  $plugin_array['html_include_shortcode_button'] = plugin_dir_url(__FILE__) .'/js/wpih-shortcode-button.js';
  return $plugin_array;
}

// Register new button in the editor
function register_html_include_shortcode_button( $buttons ) {
  array_push( $buttons, 'html_include_shortcode_button' );
  return $buttons;
}