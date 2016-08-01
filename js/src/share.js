$('.share-social .facebook').click( function() {
  FB.ui({
    method: 'share',
    display: 'popup',
    href: 'https://saydnaya.amnesty.org/',
    hashtag: 'saydnaya'
  }, function(response){});
});


var url = '?url=' + encodeURIComponent('https://saydnaya.amnesty.org/');
var text = '&text=' + encodeURIComponent('For the first time ever you can see inside Saydnaya, one of the world’s most terrifying prisons');
var hashtags = '&hashtags=saydnaya';
var href = 'https://twitter.com/intent/tweet' + url + text + hashtags;
$('.share-social .twitter')
    .attr( 'href', href )
    .attr( 'target', '_blank' );
