<?php
/**
 * Method usefull to debug
 */
 
$GLOBALS['buttons_registry_array'] = [];

function log_me($message) {
  if (WP_DEBUG === true) {
    if (is_array($message) || is_object($message)) {
      error_log(print_r($message, true));
    }
    else {
      error_log($message);
    }
  }
}

function loadJsDependency($handle, $file_location_relative_to_plugin) {
  $widget_js_dep = plugin_dir_url(__FILE__) . $file_location_relative_to_plugin;
  wp_register_script($handle, $widget_js_dep);
  wp_enqueue_script($handle, $widget_js_dep, array('jquery'), '', true);
}

function loadStyleDependency($handle, $file_location_relative_to_plugin) {
	$widget_style_dep = plugin_dir_url(__FILE__) . $file_location_relative_to_plugin;
 	wp_enqueue_style( $handle, $widget_style_dep);
}

function isJson($string) {
  json_decode($string);
  return (json_last_error() == JSON_ERROR_NONE);
}

function get_single_post_meta($article_id, $key) {
  //this seems a bug because when i request a single custom field value(the 3rd true parameter) and it not exists anywhere, it returns an array() instead of empty string
  $result = get_post_meta($article_id, $key, true);
  if (is_array($result) || empty($result) ) {
    return;
  } 
  return $result;
}


// Filter Functions with Hooks
function load_resources_for_shortcode_buttons() {
  // Check if user have permission
  if ( !current_user_can( 'edit_posts' ) && !current_user_can( 'edit_pages' ) ) {
    return;
  }

  // Check if WYSIWYG is enabled
  if ( 'true' == get_user_option( 'rich_editing' ) ) {
    add_filter( 'mce_external_plugins', 'load_html_inject_js' );
    add_filter( 'mce_buttons', 'register_buttons' );
  }
}
add_action('admin_head', 'load_resources_for_shortcode_buttons');

// Function for shortcode buttons
function load_html_inject_js($plugin_array ) {
	foreach ($GLOBALS['buttons_registry_array'] as $key => $value) {
		$plugin_array[$key] = plugin_dir_url(__FILE__) .$value;
	}
	return $plugin_array;
}

// Register buttons in the editor
function register_buttons($buttons) {
	foreach ($GLOBALS['buttons_registry_array'] as $key => $value) {
		array_push($buttons, $key);
	}
  return $buttons;
}

function register_for_button_rendering($jsButtonName, $jsFile){
	$GLOBALS['buttons_registry_array'][$jsButtonName] = $jsFile;
}