function perform_redirection(root, relative_path) {
	// attach redirection functionality to DOM ready callback
	jQuery(document).ready(function () {
		var protocol = window.location.protocol;
		var host = window.location.host;
		var rootHref = protocol + "//" + host + "/" + root;
		// if current location matches the root url entered by admin in settings, than a redirection is performed
		if (window.location.href == rootHref) {
			console.log(window.location.href);
			window.location.href = rootHref + relative_path;
		}
	});
}