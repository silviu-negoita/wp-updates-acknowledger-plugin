<?php
/**
* Plugin Name: Wordpress JS DOM Customizer
* Description: Customize our dom
* Author: Anca Barbu
* Author URI: https://github.com/henkelb
* Version: 1.1.7
*/

function wp_customizer_scripts_basic()
{		
	// we do check if a post is rendered
	// the scripts shouldn't be enqueued for a page
	if (is_singular('post') ) {	 
		// Register the scripts atfer jQuery dep
		wp_register_script('customizer_script', plugins_url('js/customizer.js', __FILE__ ), array( 'jquery' ));
		wp_enqueue_script('customizer_script');	
	}
}
add_action('wp_enqueue_scripts', 'wp_customizer_scripts_basic' );

function wp_customizer() {
    include('wp_customizer_import_admin.php');
}

function wp_customizer_admin_actions() {
    add_options_page("Wordpress JS DOM Customizer", "Wordpress JS DOM Customizer", 1, "Wordpress JS DOM Customizer", "wp_customizer");
}
 
add_action('admin_menu', 'wp_customizer_admin_actions');


function insert_in_header() {
	echo '<script type="text/javascript" src="', plugins_url('js/headscripts.js', __FILE__ ), '"></script>';
	echo '<script type="text/javascript">',
	"perform_redirection(", '"', get_option('root'), '"', ", ", '"', get_option('redirect_to'), '");',
	'</script>';
}
add_action('wp_head', 'insert_in_header');
?>