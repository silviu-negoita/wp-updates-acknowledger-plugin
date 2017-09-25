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
  wp_enqueue_script($handle, array(
    'jquery'
  ));
}

function loadStyleDependency($handle, $file_location_relative_to_plugin) {
	$widget_style_dep = plugin_dir_url(__FILE__) . $file_location_relative_to_plugin;
 	wp_enqueue_style( $handle, $widget_style_dep);
}

function isJson($string) {
  json_decode($string);
  return (json_last_error() == JSON_ERROR_NONE);
}