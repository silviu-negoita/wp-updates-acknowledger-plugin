/*
* This file contains all buttons for wpua shortcodes, the client side
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WORDPRESS INCLUDE HTML SHORTCODE ADMIN BUTTON
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
(function() {
    tinymce.PluginManager.add('html_include_shortcode_button', function(editor, url) {
        editor.addButton('html_include_shortcode_button', {
            // Hint: uncomment if you need text also
            // text: "Include html",
            image: plugin_dir_url + "/images/html.png",
            tooltip: "Add [include-html] shortcode",
            onclick: function() {
                editor.windowManager.open({
                    title: "Include html properties",
                    body: [{
                        type: 'textbox',
                        name: 'url',
                        label: 'URL',
                        value: ''
                    }],
                    onsubmit: function(e) {
                        editor.insertContent(
                            '[include-html url="' +
                            e.data.url + '"]' 
                        );
                    }
                });
            }
        });
    });
})();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WORDPRESS HTML5 SHOWER PRESENTATION SHORTCODE ADMIN BUTTON
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
(function() {
    tinymce.PluginManager.add('html5_shower_presentation_button', function(editor, url) {
        editor.addButton('html5_shower_presentation_button', {
            image : plugin_dir_url + "images/presentation.png",
            // Hint: uncomment if you need text also
            //text: "Shower presentation",
            tooltip: "Add [shower-presentation] shortcode",
            onclick: function() {
                editor.insertContent('[html5-presentation]');
            }
        });
    })
})();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CROSS REFERENCE ANCHOR BUTTON SHORTCODE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function() {
    tinymce.PluginManager.add('cross_reference_anchor_button', function(editor, url) {
        editor.addButton('cross_reference_anchor_button', {
            image : plugin_dir_url + "images/anchor.png",
            // Hint: uncomment if you need text also
            // text: "Cross ref anchor",
            tooltip: "Add [cross-ref-anchor id=\"\"] shortcode",
            onclick: function() {
                editor.insertContent('[cross-ref-anchor id=""]');
            }
        });
    })
})();

console.log("rann")