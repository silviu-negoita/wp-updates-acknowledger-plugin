//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WORDPRESS INCLUDE HTML SHORTCODE ADMIN BUTTON
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
(function() {
    tinymce.PluginManager.add('html_include_shortcode_button', function(editor, url) {
        editor.addButton('html_include_shortcode_button', {
            text: "Include html",
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