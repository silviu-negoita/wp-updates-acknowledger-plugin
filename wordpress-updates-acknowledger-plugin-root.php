<?php
/**
 * Plugin Name: Wordpress Updates Ancknowledger
 * Description: Main plugin for custom wordpress functionalities: overview-page, overview-side-widget, include-html, dom-customizer, some other shortcodes etc.
 * Author: Silviu Negoita, Anca Barbu
 * Author URI: https://github.com/silviu-negoita
 * Version: 3.1.1
 */

include_once "wordpress-updates-acknowledger-common-utils.php";
// load overview side widget
include_once "wordpress-updates-acknowledger-overview-side-widget.php";
// load overview content
include_once "wordpress-updates-acknowledger-overview-content.php";
// load old 'Js Dom Customizer' plugin
include_once "wordpress-dom-customizer.php";
// load all shortcodes defintion
include_once "wordpress-updates-acknowledger-shortcodes.php";


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PLUGIN MAIN PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Function called form both plugin and rest controller. When is called from plugin, it also init cosntants to JS. This represnts a messy workaround to init common constants between JS(client) and PHP(server).
 */
function register_constants($jsInit) {
  if (!defined('WPUA_CONTANTS_REGISTERED')) {
    define('WPUA_API_ROUTE', 'wpua/api/');
    define('WPUA_CONTANTS_REGISTERED', true);
     // key to custom_field which records all acks
    define('WPUA_DATA_FIELD_KEY', "wpua_data_field");
    define('WPUA_ARTICLE_VERSIONS_KEY', "wpua_article_versions");
    define('WPUA_WIDGET_TITLE', "Updates Ancknowledger");

    // define common constants
    define('WIDGET_BODY_ID', "wpua_tableId");
    define('ARTICLE_PARAMETER_NAME', "articleId");
    define('WPUA_OVERVIEW_PAGE_CONTAINER_ID', "wpua_overview_page_container_id");

    // value of custom_field which records all acks
    define('ARTICLE_DATA_FIELD_VALUE', "articleDataFieldValue");
    define('REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD', "restWidgetResultDataAllUsersField");
    define('REST_WIDGET_RESULT_DATA_RECORDED_STATISTICS_FIELD', "restWidgetResultDataRecordedStatisiticsField");
    define('REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD', "restWidgetResultDataAllArticleVersionsField");
    define('REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD', "restWidgetResultDataAllArticleRecoredAcksField");
    define('REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD', "restOverviewPageResultCategoriesField");
    define('LOGGED_USER_PARAMETER_NAME', "loggedUserParameterName");
    define('IS_ADMIN_LOGGED_USER', "isAdminLoggedParameterName");
    define('RELATIVE_SITE_URL', get_site_url(null, null, 'relative'));
    define('WPIH_SHORTCODE_PARAM_URL', 'url');
    define('WPIH_SHORTCODE_PARAM_HTML_CONTENT', 'html_content');
    define('WPIH_CONTAINER_CLASS', 'wpih_class');
  }

  // now link them to JS part. conisder to replace with a method
  if ($jsInit) {
?> 
      <script>
          var WPUAConstants = {
              WPUA_API_ROUTE : "<?php echo '/wp-json/' . WPUA_API_ROUTE ?>",
              WIDGET_BODY_ID: "<?php echo WIDGET_BODY_ID ?>",
              ARTICLE_PARAMETER_NAME: "<?php echo ARTICLE_PARAMETER_NAME ?>",
              ARTICLE_DATA_FIELD_VALUE : "<?php echo ARTICLE_DATA_FIELD_VALUE ?>",
              REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD : "<?php echo REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD ?>",
              REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD : "<?php echo REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD ?>",
              REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD : "<?php echo REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD ?>",
              LOGGED_USER_PARAMETER_NAME : "<?php echo LOGGED_USER_PARAMETER_NAME ?>",
              LOGGED_USER : "<?php echo get_current_user_id() ?>",
              IS_ADMIN_LOGGED_USER : "<?php echo current_user_can('administrator') ?>",
              RELATIVE_SITE_URL : "<?php echo RELATIVE_SITE_URL ?>",
              WPUA_OVERVIEW_PAGE_CONTAINER_ID : "<?php echo WPUA_OVERVIEW_PAGE_CONTAINER_ID ?>",
              REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD : "<?php echo REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD ?>",
              WPIH_CONTAINER_CLASS : "<?php echo WPIH_SCONTAINER_CLASS ?>",
              WPIH_SHORTCODE_PARAM_URL : "<?php echo WPIH_SHORTCODE_PARAM_URL ?>",
              WPIH_SHORTCODE_PARAM_HTML_CONTENT : "<?php echo WPIH_SHORTCODE_PARAM_HTML_CONTENT ?>",
              WPUA_PLUGIN_DIR_URL : "<?php echo plugin_dir_url(__FILE__) ?>"
          }
      </script>
      <?php
  }
}

function wpua_init() {
  // define PHP constants
  register_constants(true);
  // load all external deps
  loadStyleDependency('wpua-styles-css',  'css/wpua_styles.css');
  loadStyleDependency('wpua-font-awesome',  'css/font-awesome.css');

  loadJsDependency('wpua-common', 'js/wpua-common.js');
  loadJsDependency('wpua-overview-side-widget', 'js/wpua-overview-side-widget.js');
  loadJsDependency('float-thead-js', 'js/float-thead.js');
  loadJsDependency('wpua-overview-widget', 'js/wpua-overview-content.js');
  loadJsDependency('wpih-main', 'js/wpih-main.js');
}

add_action('wp_enqueue_scripts', 'wpua_init');

/*
* Here are declare JS constants which will load when admin meniu shows up.
*/
function register_admin_menu_constants() {
  ?>
  <script>
    var plugin_dir_url = "<?php echo plugin_dir_url(__FILE__) ?>"
  </script>
  <?php
}

add_filter("admin_menu", "register_admin_menu_constants");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONTROLLER PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Register all rest routes(GET/POST). Notice that here we declare the routes which delegates to a mehtod implemented in each *.php file.
 */
function register_api_routes() {
  // redefine common constants, because here we enter from rest call, so different context from main plugin loading point.
  register_constants(false);
  // responds to http://hostname/wp/wp-json/wpua/api/get_all_registered_users
  register_rest_route(WPUA_API_ROUTE, '/load_wpua_widget_data', array(
    'methods' => 'GET',
    'callback' => 'load_wpua_widget_data',
  ));

  register_rest_route(WPUA_API_ROUTE, '/save_preferences', array(
    'methods' => 'POST',
    'callback' => 'save_preferences',
  ));

  register_rest_route(WPUA_API_ROUTE, '/get_overview_data', array(
    'methods' => 'GET',
    'callback' => 'get_overview_data',
  ));

  register_rest_route(WPUA_API_ROUTE, '/get_article_versions', array(
    'methods' => 'GET',
    'callback' => 'get_article_versions',
  ));

  register_rest_route(WPUA_API_ROUTE, '/process_html_content', array(
    'methods' => 'POST',
    'callback' => 'process_html_content',
  ));
}

// register rest routes
add_action('rest_api_init', "register_api_routes");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CUSTOM FIELDS  VALIDATOR PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
* Hook that validates that a field is a json e.g. wpua_article_versions, wpua_data_field which are used to store diffrent plugin data
*/
function update_postmeta_hook($meta_id, $post_id, $meta_key, $meta_value) {
  log_me("Add or Update metda event triggered on key ". $meta_key);
  register_constants(false);
  if ($meta_key == WPUA_DATA_FIELD_KEY || $meta_key == WPUA_ARTICLE_VERSIONS_KEY) {
    if (!isJson($meta_value)) {
      log_me("Is not json");
      wp_die("Field '". $meta_key . "' is not a valid json. Please write it in a valid json format." , "Json Parse Exception");
    } else {
      log_me("Is json");
    }
  }
}
add_action( 'update_post_meta', 'update_postmeta_hook', 10, 4 );
add_action( 'add_post_metadata', 'update_postmeta_hook', 10, 4 );
?>