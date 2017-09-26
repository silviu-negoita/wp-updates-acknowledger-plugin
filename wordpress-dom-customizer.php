<?php
/**
* Wordpress JS DOM Customizer
* Author: Anca Barbu
*/

function wp_customizer_scripts_basic()
{		
	// we do check if a post is rendered
	// the scripts shouldn't be enqueued for a page
	if (is_singular('post') ) {	 
		// Register the scripts atfer jQuery dep
		loadJsDependency('wpdc-customizer', 'js/wpdc-customizer.js');
	}
}
add_action('wp_enqueue_scripts', 'wp_customizer_scripts_basic' );

function wp_customizer() {
    include('wordpress-dom-customizer-import-admin.php');
}

function wp_customizer_admin_actions() {
    add_options_page("Wordpress JS DOM Customizer", "Wordpress JS DOM Customizer", 1, "Wordpress JS DOM Customizer", "wp_customizer");
}
 
add_action('admin_menu', 'wp_customizer_admin_actions');


function insert_in_header() {
	echo '<script type="text/javascript" src="', plugins_url('js/wpdc-headscripts.js', __FILE__ ), '"></script>';
	echo '<script type="text/javascript">',
	"perform_redirection(", '"', get_option('root'), '"', ", ", '"', get_option('redirect_to'), '");',
	'</script>';
}
add_action('wp_head', 'insert_in_header');

/**
*	wp-json/wpua/api/getArticleVersions
*/
function get_article_versions() {
	$article_id = $_GET[ARTICLE_PARAMETER_NAME];
	$result = array();
	$result[REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD] = get_article_versions_internal(4);
	return $result;
}
?>