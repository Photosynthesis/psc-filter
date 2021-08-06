<?php
/*
Plugin Name: PSC Filter
Description: Filter content by taxonomy. Works with the PSC Featured Content plugin to create filterable content grids and lists of any post type.
Version: 0.1
Author: PhotoSynthesis Communications
Author URI: https://photosynthesis.ca
*/

if ( !defined( 'WPINC' ) ) {
	die;
}

include_once( plugin_dir_path( __FILE__ ) . 'psc-filter-class.php' );

PSC_Filter::get_instance();

?>
