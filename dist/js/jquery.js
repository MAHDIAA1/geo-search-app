
// SMOOTH SCROLL TO GEOLOCATONS

$('#geo-btn').on('click', function() {
	const addressScroll = $('#address-section').position().top;

	$('html, body').animate({
		scrollTop: addressScroll
	}, 900);
});