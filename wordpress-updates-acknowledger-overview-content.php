<?php

function get_parsed_categories() {
  $parsed_categories = array();
	foreach( get_categories('hide_empty=1') as $cat ) :
		 if( !$cat->parent ) {
			 process_cat_tree( $cat , 0, $parsed_categories);
		 }
	 endforeach;
	 
	 wp_reset_query(); //to reset all trouble done to the original query
	 return $parsed_categories;
}

function process_cat_tree( $cat , $nesting_level,  &$parsed_categories) {
 	$cat->nesting_level = $nesting_level;
 	// array_push($parsed_categories, $cat);
 	$parsed_categories[] = $cat;
	$args = array('category__in' => array( $cat->term_id ), 'numberposts' => -1);
	$cat_posts = get_posts( $args );

	if( $cat_posts ) :
		foreach( $cat_posts as $post ) :
			$post->permalink = get_permalink( $post->ID );
			$post->wpua_recorded_acks = json_decode(get_post_meta($post->ID, WPUA_DATA_FIELD_KEY, true));
			$post->all_versions = get_article_versions_internal($post->ID);
			$post->category_parent = $cat->cat_ID;
		endforeach;
		$cat->articles = $cat_posts;
	endif;

	$next = get_categories('hide_empty=1&parent=' . $cat->term_id);

	if( $next ) :
		foreach( $next as $next_cat ) :
			$nesting_level++;
			$next_cat->category_parent = $cat->term_id;
			process_cat_tree( $next_cat , $nesting_level, $parsed_categories);
		endforeach;
	endif;
}

function getOverviewData($request) {
  $result = array();
  $result[REST_OVERVIEW_PAGE_RESULT_CATEGORIES_FIELD] = get_parsed_categories();
  $result[REST_WIDGET_RESULT_DATA_ALL_USERS_FIELD] = get_all_users_with_custom_first($_GET[LOGGED_USER_PARAMETER_NAME]);
  return $result;
}

