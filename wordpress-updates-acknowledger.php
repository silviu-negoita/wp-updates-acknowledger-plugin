<?php
/**
 * Plugin Name: Wordpress Updates Ancknowledger
 * Description: Manage the article viewers per each version
 * Author: Silviu Negoita
 * Author URI: https://github.com/silviu-negoita
 * Version: 1.0.2
 */

include_once "wordpress-updates-acknowledger-overview-widget.php";
include_once "wpua-common-utils.php";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PLUGIN PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Function called form both plugin and rest controller. When is called from plugin, it also init cosntants to JS. This represnts a messy workaround to init common constants between JS(client) and PHP(server).
 */
function register_constants($jsInit) {
  // key to custom_field which records all acks
  define(WPUA_DATA_FIELD_KEY, "wpua_data_field");
  define(WPUA_ARTICLE_VERSIONS_KEY, "wpua_article_versions");
  define(WPUA_OVERVIEW_PAGE_KEY, "wpua_updates_acknowledger_overview_page");
  define(WPUA_WIDGET_TITLE, "Updates Ancknowledger");

  // define common constants
  define(WIDGET_BODY_ID, "wpua_tableId");
  define(ARTICLE_PARAMETER_NAME, "articleId");
  define(WPUA_OVERVIEW_PAGE_ROOT_ELEMENT_ID, "wpua_overview_page_root_element_id");

  // value of custom_field which records all acks
  define(ARTICLE_DATA_FIELD_VALUE, "articleDataFieldValue");
  define(REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD, "restWidgetResultDataAllUsersField");
  define(REST_WIDGET_RESULT_DATA_RECORDED_STATISTICS_FIELD, "restWidgetResultDataRecordedStatisiticsField");
  define(REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD, "restWidgetResultDataAllArticleVersionsField");
  define(REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD, "restOverviewPageResultCategoriesField");
  define(LOGGED_USER_PARAMETER_NAME, "loggedUserParameterName");
  define(IS_ADMIN_LOGGED_USER, "isAdminLoggedParameterName");
  define(RELATIVE_SITE_URL, get_site_url(null, null, 'relative'));
  // now link them to JS part. conisder to replace with a method
  if ($jsInit) {
?> 
      <script>
          var WPUAConstants = {
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
              WPUA_OVERVIEW_PAGE_ROOT_ELEMENT_ID : "<?php echo WPUA_OVERVIEW_PAGE_ROOT_ELEMENT_ID ?>",
              REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD : "<?php echo REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD ?>"
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

  loadJsDependency('loadJsDependency', 'js/wpua-side-widget.js');
  loadJsDependency('float-thead-js', 'js/float-thead.js');
  loadJsDependency('wpua-overview-widget', 'js/wpua-overview-widget.js');
}

add_action('wp_enqueue_scripts', 'wpua_init');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONTROLLER PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Method called from JS to get data to render for article widget. It returns a data structure with following fields:
 *
 */
function load_wpua_widget_data($request) {
  $article_id = $_GET[ARTICLE_PARAMETER_NAME];
  $logged_user = $_GET[LOGGED_USER_PARAMETER_NAME];
  $result = array();

  $result[REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD] = get_all_users_with_custom_first($_GET[LOGGED_USER_PARAMETER_NAME]);
  $articleDataFieldValue = get_post_meta($article_id, WPUA_DATA_FIELD_KEY, true);
  if (empty($articleDataFieldValue) || is_null($articleDataFieldValue)) {
    update_post_meta($article_id, WPUA_DATA_FIELD_KEY, array());
  }
  $result[REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD] = json_decode(get_post_meta($article_id, WPUA_DATA_FIELD_KEY, true));
  $all_versions = json_decode(get_post_meta($article_id, WPUA_ARTICLE_VERSIONS_KEY, true));
  rsort($all_versions);
  $result[REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD] = $all_versions;
  return $result;
}

/*
* Get all system users, with first element current logged user.
*/
function get_all_users_with_custom_first($logged_user) {
   // set logged user first in result list
  $all_users_except_current = get_users(array(
    'fields' => array(
      'display_name',
      "ID"
    ) ,
    'exclude' => array(
      $logged_user
    )
  ));
  $current_users = get_users(array(
    'fields' => array(
      'display_name',
      "ID"
    ) ,
    'include' => array(
      $logged_user
    )
  ));
  $all_users = array();
  array_splice($all_users, 0, 0, $current_users);
  array_splice($all_users, 1, 0, $all_users_except_current);

  return $all_users;
}

/**
 * It updates the article custom field where all data is stored
 */
function savePreferences($request) {
  $article_id = $_POST[ARTICLE_PARAMETER_NAME];
  $date_field_value = json_encode($_POST[ARTICLE_DATA_FIELD_VALUE]);
  update_post_meta($article_id, WPUA_DATA_FIELD_KEY, $date_field_value);
}


/**
 * Register all rest routes(GET/POST)
 */
function register_api_routes() {
  // define common constants
  register_constants(false);
  // responds to http://localhost/wp/wp-json/wpua/api/get_all_registered_users
  register_rest_route('wpua/api/', '/load_wpua_widget_data', array(
    'methods' => 'GET',
    'callback' => 'load_wpua_widget_data',
  ));

  register_rest_route('wpua/api/', '/savePreferences', array(
    'methods' => 'POST',
    'callback' => 'savePreferences',
  ));

  register_rest_route('wpua/api/', '/getOverviewData', array(
    'methods' => 'GET',
    'callback' => 'getOverviewData',
  ));
}

// register rest routes
add_action('rest_api_init', "register_api_routes");


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ARTICLE WIDGET PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Widget for every article.
 */
class wp_my_plugin extends WP_Widget {

  // constructor
  function wp_my_plugin() {
    parent::WP_Widget(false, $name = __('Update Ancknowledger Widget', 'wp_widget_plugin'));


  }

  // widget form creation
  function form($instance) {
    // Check values
    if ($instance) {
      $title = esc_attr($instance['title']);
    }
    else {
      $title = '';
    }
?>

    <p>
    <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e(WPUA_WIDGET_TITLE, 'wp_widget_plugin'); ?></label>
    <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
    </p>
        <?php
  }

  // widget update
  function update($new_instance, $old_instance) {
    $instance = $old_instance;
    // Fields
    $instance['title'] = strip_tags($new_instance['title']);
    return $instance;
  }

  function loadAllExternalDependencies() {

  }

  // widget display
  function widget($args, $instance) {
    //extract($args);
    // these are the widget options
    $title = apply_filters('widget_title', $instance['title']);
    echo $args['before_widget'];
    // Display the widget
?>
    <div class="panel-heading"><?php echo $instance[title] ?></div>
    <div  id="<?php echo WIDGET_BODY_ID ?>"
      <?php echo ARTICLE_PARAMETER_NAME ?> = "<?php echo get_the_ID() ?>" 
      class="panel-body" style="overflow-x: auto;" >
    </div>
        <?php

    echo $args['after_widget'];
  }
}

// register widget
add_action('widgets_init', create_function('', 'return register_widget("wp_my_plugin");'));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//CUSTOM FIELDS  VALIDATOR PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
* Hook that validates that a field is a json
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

