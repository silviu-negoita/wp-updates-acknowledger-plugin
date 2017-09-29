# wordpress-updates-acknowledger

Manage the article viewers per each version via a wordpress widget. Keep in mind that this plugin is meant to be used as internal company tool because it has security issues.

This plugin contains :
	* side bar widget to manage viewers per article
	* overview page for all articles and users
	
To use the overview page, just add custom field on any post : wpua_updates_acknowledger_overview_page = on. This will rewrite any page content with our updated acknowledger overview content.

# wordpress-js-dom-customizer

Manipulates the DOM, in order to apply customizations. We prefer this approach to directly modifying the template files, to be able to update the theme.

## removing elements from DOM
- removed author meta information "\w? has written \d? articles"
- removed button with "Article was helpful" and link "\d? people found this article useful"
- removed article footer "This entry..."

## redirecting to other pages
- added a settings page for the plugin where administrator completes two fields:
	root url and redirection url => when on root url, user is redirected to redirection url

## labels customization and management
- get versions = [["v1.1.1", "2017-15-26"], ["v1.2.1", "2017-15-25"], ["v1.3.2", "2017-15-25"]] from REST api 
- versions are rendered as labels in post content and in the side widget table (red if latest, orange if before latest, grey if elder)
- by clicking on a label one can navigate to the next label of the same type
  e.g. clicking on a NEW v3 redirects to the next NEW v3

