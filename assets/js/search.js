(function() {
  function displaySearchResults(results, store) {
    var searchResults = document.getElementById('search-results');

    if (results.length) { // Are there any results?
      var appendString = '';

      for (var i = 0; i < results.length; i++) {  // Iterate over the results
        var item = store[results[i].ref];
        appendString += '<li class="blog_teaser">' + 
                        ' <p class="post-author"><strong>' + 
                        '   Posted By: <a href="/blog/category/'+ item.author_link +'">' + highlightQuery(searchTerm, item.author) + '</a> on ' + item.date + 
                        ' </strong></p>' + 
                        ' <h3 class="post-title"><a href="' + item.url +'">'+ highlightQuery(searchTerm, item.title) +'</a></h3>' + 
                        ' <div class="circles"><div class="circle"></div><div class="circle"></div><div class="circle"></div><div class="circle"></div><div class="circle"></div><div class="circle"></div></div>' + 
                        ' <p>' + highlightQuery(searchTerm, item.teaser) + '</p>';
      }

      searchResults.innerHTML = appendString;
      document.querySelector('.header-title h2').innerHTML = 'Search Results for: ' + upperCase(searchTerm);
    } else {
      searchResults.innerHTML = '<li>No results found</li>';
    }
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      if (pair[0] === variable) {
        return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
      }
    }
  }

  function highlightQuery(query, text){
    text = text || '';
      
    if (query) {
      // Shrink extra spaces, restrict to alpha-numeric chars and a few other special chars
      query = query.toString().replace(/\s+/g, ' ').replace(/[^a-zA-Z0-9:,\s\-_\.]/g, '').split(' ');
      for (var i = 0; i < query.length; ++i) {
        text = text.replace(new RegExp(query[i], 'gi'), '^$&$');
      }

      // if match return text
      if (text.indexOf('^') !== -1) {
        return text.replace(/\^/g, '<b>').replace(/\$/g, '</b>');
      }
    }

    // return base text if no match and not hiding
    return text;
  }

  function upperCase(string){
     return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  var searchTerm = getQueryVariable('q');

  if (searchTerm) {
    document.getElementById('search-box').setAttribute("value", searchTerm);

    // Initalize lunr with the fields it will be searching on. I've given title
    // a boost of 10 to indicate matches on this field are more important.
    var idx = lunr(function () {
      this.field('title', { boost: 10 });
      this.field('author');
      this.field('teaser');
      // this.field('tags');
      this.field('date');
    });

    for (var key in window.posts) { // Add the data to lunr
      idx.add({
        'id': key,
        'title': window.posts[key].title,
        'author': window.posts[key].author,
        'author_link': window.posts[key].author_link,
        'teaser': window.posts[key].teaser,
        // 'tags': window.posts[key].tags,
        'date': window.posts[key].date,
        'url': window.posts[key].url,
      });

      var results = idx.search(searchTerm); // Get lunr to perform a search
      displaySearchResults(results, window.posts); // We'll write this in the next section
    }
  }
})();