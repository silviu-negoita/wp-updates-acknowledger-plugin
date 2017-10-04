//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CROSS REFERENCE ANCHOR BUTTON SHORTCODE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function() {
    tinymce.PluginManager.add('cross_reference_anchor_button', function(editor, url) {
        editor.addButton('cross_reference_anchor_button', {
            text: "Cross ref anchor",
            tooltip: "Add [cross-ref-anchor id=\"\"] shortcode",
            onclick: function() {
                editor.insertContent('[cross-ref-anchor id=""]');
            }
        });
    })
})();