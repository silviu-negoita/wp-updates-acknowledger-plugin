<div class="wrap">
<?php
	echo "<h2>" . __( 'Wordpress JS DOM Customizer Options', 'wp_customizer_trdom' ) . "</h2>"; 
?>
    <form name="wp_customizer_form" method="post" action=" " onSubmit="window.location.reload()">
        <input type="hidden" name="wp_customizer_hidden" value="Y">
<?php
		echo "<h4>" . __( 'Wordpress JS DOM Customizer Settings', 'oscimp_trdom' ) . "</h4>"; 
?>
		 <p><?php _e("Root: " );?><input type="text" name="root" value="<?php echo isset($_POST['root']) ? $_POST['root'] : get_option('root')?>" size="20"><?php _e(" ex: crispico-expres-skills/" );?></p>
        <p><?php _e("Redirect to: " );?><input type="text" name="redirect_to" value="<?php echo isset($_POST['redirect_to']) ? $_POST['redirect_to'] : get_option('redirect_to')?>" size="20"><?php _e(" ex: category/root/" );?></p>
        <p class="submit">
        <input type="submit" name="Submit" value="<?php _e('Update Options', 'wp_customizer_trdom' )?>" />
        </p>
    </form>
</div>

<?php
    if($_POST['wp_customizer_hidden'] == 'Y') {
        //Form data sent
		$root = $_POST['root'];
        $redirectTo = $_POST['redirect_to'];
        update_option('redirect_to', $redirectTo);
		update_option('root', $root);
    } else {
        //Normal page display
    }
?>