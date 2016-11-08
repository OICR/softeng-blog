$(function () {
    $('[data-scrambled-mail]').map(function () {
        var address = window.atob($(this).attr('data-scrambled-mail'));
        $(this).click(function () {
          window.location.href = 'mailto:' + address;
        });
    });
});
