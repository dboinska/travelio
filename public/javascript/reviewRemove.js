const forms = document.querySelectorAll('form[name="deleteForm"]');

forms.forEach(function (i) {
  forms[i].addEventListener('click', clickedForm(i));
});

function clickedForm(i) {
  return function () {
    if (window.confirm('Do you want to delete this review?')) {
      forms[i].submit();
    }
  };
}
