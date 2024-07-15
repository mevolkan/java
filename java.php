<?php
/*
	Plugin Name: Java
	Plugin URI: http://www.brand2d.com
	Description:This is plugin displays Java restaurants
	Author: Volkan
	Version: 1.0
	Author URI: http://volkan.co.ke	
	License:GPL-2.0+
	License URI:http://www.gnu.org/licenses/gpl-2.0.txt

 */

if (!defined('ABSPATH')) {
	exit;
}

//[all-restaurants]


function allrestaurants_function($atts)
{
	wp_enqueue_style('JavaCSS', plugin_dir_url(__FILE__) . 'styles/style.css', false);
	wp_enqueue_style(
		'LeafletCSS',
		'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
		true
	);

	wp_enqueue_script(
		'LeafletJS',
		'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
		'1.12.1',
		true
	);
	wp_enqueue_script(
		'MustacheJS',
		'https://unpkg.com/mustache@latest',
		'2.3.0',
		true
	);
	wp_enqueue_script(
		'Axios',
		'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
		true
	);
	wp_enqueue_script(
		'BranchesJS',
		plugin_dir_url(__FILE__) . 'js/scripts.js',
		array('jquery'),
		'1.0',
		true
	);
	wp_localize_script('BranchesJS', 'siteUrl', array(
        'url' => esc_url(home_url('/'))
    ));

	$displayStations = '
<div class="java-locations">
	<div id="side" class="side">
		<div id="sidebar"></div>
	</div>
	<div class="map-container">
		<div class="suggestions-container">
		<input id="searchInput" type="text" placeholder="Search">
		<div id="suggestionsList"></div>
		</div>
		<div class="allrestaurants" id="stationMap">
		</div>
	</div>
</div>
	';

	return $displayStations;
}
add_shortcode('all-restaurants', 'allrestaurants_function');
