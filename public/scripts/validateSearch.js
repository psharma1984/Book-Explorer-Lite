// eslint-disable-next-line no-unused-vars
function validateSearch() {
  let searchValue = document.getElementById('searchInput').value.trim();

  // Regular expression to check if the input contains only special characters
  const specialCharactersAtStart = /^[^a-zA-Z0-9]+$/;

  // Remove special characters at the start of the string
  // eslint-disable-next-line no-const-assign
  searchValue = searchValue.replace(specialCharactersAtStart, '');

  if (searchValue === '' || searchValue.match(/^[^a-zA-Z0-9]+$/)) {
    // eslint-disable-next-line no-alert
    alert('Please enter a search query.');
    return false;
  }
  return true;
}
