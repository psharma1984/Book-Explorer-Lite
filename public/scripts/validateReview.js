document.addEventListener('DOMContentLoaded', () => {
  const editReviewForm = document.getElementById('editReviewForm');
  const newReviewForm = document.getElementById('newReviewForm');
  if (editReviewForm) {
    editReviewForm.addEventListener('submit', (event) => {
      if (!validateReview('editReviewForm')) {
        event.preventDefault(); // Prevent form submission if validation fails
      }
    });
  }
  else if (newReviewForm) {
    newReviewForm.addEventListener('submit', (event) => {
      if (!validateReview('newReviewForm')) {
        event.preventDefault(); // Prevent form submission if validation fails
      }
    });
  } else {
    console.error('Could not find searchForm element');
  }
});

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
