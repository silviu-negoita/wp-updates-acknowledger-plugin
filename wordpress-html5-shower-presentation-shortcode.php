<?php
add_shortcode('html5-presentation', 'html5_shower_presentation');
register_for_button_rendering("html5_shower_presentation_button", "/js/shortcode_buttons/wphsp-shortcode-button.js");

function html5_shower_presentation($attrs) {
    return '<div id="html5-presentation-button" class="alert alert-danger"> <button type="button" class="btn btn-danger" onclick="openPresentation()"><i class="glyphicon glyphicon-eye-open"></i> <span class="text">  Open as presentation </span></button></div>';
}
?>