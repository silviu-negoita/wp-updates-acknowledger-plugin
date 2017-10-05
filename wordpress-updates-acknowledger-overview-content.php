<?php
/*
* Contains all server logic of overview content(with all articles/categories and posts). See wpua-overview-content.js for client side.
*/

function get_parsed_categories() {
  $parsed_categories = array();
	foreach( get_categories('hide_empty=0') as $cat ) :
		 if( !$cat->parent ) {
			 process_cat_tree( $cat , 0, $parsed_categories);
		 }
	 endforeach;
	 
	 wp_reset_query(); //to reset all trouble done to the original query
	 return $parsed_categories;
}

function process_cat_tree( $cat , $nesting_level,  &$parsed_categories) {
 	$cat->nesting_level = $nesting_level;
 	$parsed_categories[] = $cat;
	$args = array('category__in' => array( $cat->term_id ), 'numberposts' => -1);
	$cat_posts = get_posts( $args );

	if( $cat_posts ) :
		foreach( $cat_posts as $post ) :
			$post->permalink = get_permalink( $post->ID );
			$post->wpua_recorded_acks = json_decode(get_single_post_meta($post->ID, WPUA_DATA_FIELD_KEY));
			$post->all_versions = get_article_versions_internal($post->ID);
			$post->category_parent = $cat->cat_ID;
		endforeach;
		$cat->articles = $cat_posts;
	endif;

	$next = get_categories('hide_empty=0&parent=' . $cat->term_id);
	if( $next ) :
		$nesting_level++;
		foreach( $next as $next_cat ) :
			$next_cat->category_parent = $cat->term_id;
			process_cat_tree( $next_cat , $nesting_level, $parsed_categories);
		endforeach;
	endif;
}

function get_article_versions_internal($article_id) {
  $all_versions_meta = get_single_post_meta($article_id, WPUA_ARTICLE_VERSIONS_KEY);
  if (is_null($all_versions_meta)) {
    return;
  }
  $all_versions = json_decode($all_versions_meta);
  rsort($all_versions);
  return $all_versions;
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

function get_overview_data($request) {
  $result = array();
  $result[REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD] = get_parsed_categories();
  $result[REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD] = get_all_users_with_custom_first($_GET[LOGGED_USER_PARAMETER_NAME]);
  return $result;
}
?>