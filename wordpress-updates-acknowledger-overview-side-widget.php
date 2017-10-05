<?php
/*
* Contains all wordpress widget and server logic of overview side widget(wher users click to record viewed articles). See wpua-overview-side-widget.js for client side.
*/

class wp_my_plugin extends WP_Widget {

  // constructor
  function __construct() {
    parent::__construct(false, $name = __('Update Ancknowledger Widget', 'wp_widget_plugin'));
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
    //extract($args);
    // these are the widget options
    $title = apply_filters('widget_title', $instance['title']);
    if (is_null($title)) {
      return;
    }
    echo $args['before_widget'];
    // Display the main container widget
?>
    <div class="panel-heading"><?php echo $instance['title'] ?></div>
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


/**
 * It updates the article custom field where all data is stored
 */
function save_preferences($request) {
  $article_id = $_POST[ARTICLE_PARAMETER_NAME];
  $date_field_value = json_encode($_POST[ARTICLE_DATA_FIELD_VALUE]);
  update_post_meta($article_id, WPUA_DATA_FIELD_KEY, $date_field_value);
}

/**
 * Method called from JS to get data to render for article widget. It returns a data structure with following fields:
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
  $result[REST_WIDGET_RESULT_DATA_RECORDED_ACKS_FIELD] = json_decode(get_single_post_meta($article_id, WPUA_DATA_FIELD_KEY));
  $result[REST_WIDGET_RESULT_DATA_ALL_ARTICLE_VERSIONS_FIELD] = get_article_versions_internal($article_id);
  return $result;
}
