<?php
/**
 * Plugin Name: Wordpress Updates Ancknowledger
 * Description: Manage the article viewers per each version
 * Author: Silviu Negoita
 * Author URI: https://github.com/silviu-negoita
 * Version: 0.0.1
 */

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PLUGIN PART
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Function called form both plugin and rest controller. When is called from plugin, it alose init cosntants to JS.
 */
function register_constants($jsInit) {
  // key to custom_field which records all acks
  define(WPUA_DATA_FIELD_KEY, "wpua_data_field");
  define(WPUA_ARTICLE_VERSIONS_KEY, "wpua_article_versions");
  define(WPUA_WIDGET_TITLE, "Widget Title");

  // define common constants
  define(WIDGET_BODY_ID, "wpua_tableId");
  define(ARTICLE_PARAMETER_NAME, "articleId");
  // value of custom_field which records all acks
  define(ARTICLE_DATA_FIELD_VALUE, "articleDataFieldValue");
  define(REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD, "restWidgetResultDataAllUsersField");
  define(REST_WIDGET_RESULT_DATA_RECORDED_STATISTICS_FIELD, "restWidgetResultDataRecordedStatisiticsField");
  define(REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD, "restWidgetResultDataAllArticleVersionsField");
  define(LOGGED_USER_PARAMETER_NAME, "loggedUserParameterName");
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
              RELATIVE_SITE_URL : "<?php echo RELATIVE_SITE_URL ?>"
          }
      </script>
      <?php
  }
}

function wpua_init() {
  // define PHP constants
  register_constants(true);
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

  $result[REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD] = $all_users;
  $articleDataFieldValue = get_post_meta($article_id, WPUA_DATA_FIELD_KEY, true);
  if (empty($articleDataFieldValue) || is_null($articleDataFieldValue)) {
    update_post_meta($article_id, WPUA_DATA_FIELD_KEY, array());

  }
  $result[REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD] = json_decode(get_post_meta($article_id, WPUA_DATA_FIELD_KEY, true));
  $all_versions = json_decode(get_post_meta($article_id, WPUA_ARTICLE_VERSIONS_KEY, true));
  sort($all_versions);
  $result[REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD] = $all_versions;
  return $result;
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
}

// register rest routes
add_action('rest_api_init', "register_api_routes");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WIDGET PART
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

  // widget display
  function widget($args, $instance) {
    extract($args);
    // these are the widget options
    $title = apply_filters('widget_title', $instance['title']);
    echo $before_widget;
    // Load js deps
    $widget_js_dep = plugin_dir_url(__FILE__) . 'js/wpua-main-js.js';
    wp_register_script('wpua-main-js', $widget_js_dep);
    wp_enqueue_script('wpua-main-js', array(
      'jquery'
    ));
    // Display the widget
    
?>
        <div class="panel-heading"><?php echo $instance[title] ?></div>
        <div id="<?php echo WIDGET_BODY_ID ?>" <?php echo ARTICLE_PARAMETER_NAME ?> = "<?php echo get_the_ID() ?>" <?php echo LOGGED_USER_PARAMETER_NAME ?> = "<?php echo get_current_user_id() ?>" class="panel-body" style="overflow-x: auto;">
        </div>
        <?php
    echo $after_widget;
  }
}

// register widget
add_action('widgets_init', create_function('', 'return register_widget("wp_my_plugin");'));

