<?php
/**
 * Method usefull to debug
 */
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