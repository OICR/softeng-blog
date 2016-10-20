function shareOnLinkedIn(url){
    var uri = "shareArticle?url=" + url;
    var encodedURI = encodeURI(uri);
    var url = "https://www.linkedin.com/";
    window.open(url,
                'linkedinPopupDialog',
                'toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=520, height=570');
}
