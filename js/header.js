// highlight the relevant link in the header
var href = location.href;
var section = href.substr(href.lastIndexOf('/') + 1);

if (section.split('.')[0] === "about") {
    $('.mainNav-menu [href="' + section + '"]').removeAttr('href');
} else {
    $('.subNav-menu [href="' + section + '"]')
        .addClass( 'active' )
        .removeAttr('href');
}
