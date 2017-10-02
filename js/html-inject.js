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
                        name: 'repository',
                        label: 'Repository',
                        value: ''
                    },
                    {
                        type: 'textbox',
                        name: 'filepath',
                        label: 'File path',
                        value: ''
                    }],
                    onsubmit: function(e) {
                        editor.insertContent(
                            '[html-include repository="' +
                            e.data.repository + '" '
                            + 'filepath="' + e.data.filepath + 
                            '"]' 
                        );
                    }
                });
            }
        });
    });
})();