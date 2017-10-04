//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WORDPRESS INCLUDE HTML SHORTCODE ADMIN BUTTON
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
(function() {
    tinymce.PluginManager.add('html5_shower_presentation_button', function(editor, url) {
        editor.addButton('html5_shower_presentation_button', {
            text: "Shower presentation",
            tooltip: "Add [shower-presentation] shortcode",
            onclick: function() {
                editor.insertContent('[html5-presentation]');
            }
        });
    })
})();