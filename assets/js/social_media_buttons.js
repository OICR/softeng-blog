function shareOnTwitter(url, via, text){
    var uri = "tweet?url=" + url  + "?via=" + via + "?text=" + text;
    var encodedURI = encodeURI(uri);
    var url = "https://twitter.com/intent/" + encodedURI;
    window.open(url ,
                'twitterPopupDialog',
                'toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=550, height=420');
} 

function shareOnFacebook(url){
    var uri = "sharer.php?u=" + url;
    var encodedURI = encodeURI(uri);
    var url = "https://www.facebook.com/sharer/" + encodedURI;
    window.open(url, 
                'facebookPopupDialog',
                'toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=550, height=420');
}

function shareOnLinkedIn(url){
    var uri = "shareArticle?url=" + url;
    var encodedURI = encodeURI(uri);
    var url = "https://www.linkedin.com/";
    window.open(url,
                'linkedinPopupDialog',
                'toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=520, height=570');
}
