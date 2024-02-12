// eslint-disable-next-line no-unused-vars
function validateReview(formId) {
  let reviewValue = document.getElementById(formId === 'editReviewForm' ? 'editComment' : 'comment').value.trim();

  // Regular expression to check if the input contains only special characters
  const specialCharactersAtStart = /^[^a-zA-Z0-9]+$/;

  // Remove special characters at the start of the string
  // eslint-disable-next-line no-unused-vars
  reviewValue = reviewValue.replace(specialCharactersAtStart, '');

  if (reviewValue === '' || reviewValue.match(/^[^a-zA-Z0-9]+$/)) {
    // eslint-disable-next-line no-alert
    alert('Please enter a valid comment');
    return false;
  }
  return true;
}
