# wordpress-updates-acknowledger

Manage the article viewers per each version via a wordpress widget. Keep in mind that this plugin is meant to be used as internal company tool because it has security issues.

This plugin contains :
	* side bar widget to manage viewers per article
	* overview page for all articles and users
	
To use the overview page, just add custom field on any post : wpua_updates_acknowledger_overview_page = on. This will rewrite any page content with our updated acknowledger overview content.

# wordpress-js-dom-customizer

Manipulates the DOM, in order to apply customizations. We prefer this approach to directly modifying the template files, to be able to update the theme.

Modifications #1st iteration: removing elements
- removed author meta information "\w? has written \d? articles"
- removed button with "Article was helpful" and link "\d? people found this article useful"
- removed article footer "This entry..."

Modifications #2nd iteration: redirecting to other pages
- added a settings page for the plugin where administrator completes two fields:
	root url and redirection url => when on root url, user is redirected to redirection url

Modifications #3rd iteration: labels customization and management
- searching for version declarations pattern like versions = [v6 - 2016-10-05, v4 - 2017-01-05,  v5- 2017-01-05]
- when found, replace them with bootstrap labels that will stay above
- remove previous all labels NEW vx found in the article, where x < 4

Modifications #4th iteration: ui design:
- versions from above splitted by spaces
- order: newer elder

Modifications #5th iteration: labels customization and management
- by clicking on a label one can navigate to the next label of the same type
  e.g. clicking on a NEW v3 redirects to the next NEW v3
  
Modifications #6th iteration: labels customization and management
- bug: `Modifications #3rd iteration` remove previous all labels NEW vx found in the article, where x < 4: in some cases
  the whole line was being removed
- fixed and added the following functionality: instead of removing NEW vx, replace with a discrete grey span containing text `vx` 
