function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = 'login.html';
}

function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// function setActiveLink() {
//   const currentPage = window.location.pathname.split('/').pop(); // "home.html"

//   document.querySelectorAll('a').forEach((link) => {
//     const linkPage = link.getAttribute('href')?.split('/').pop();
//     if (linkPage === currentPage) {
//       link.classList.add('link--active');
//     }
//   });
// }

function setActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.link').forEach((link) => {
    link.classList.remove('active');
    link.classList.remove('link--active');
    if (link.getAttribute('href').split('/').pop() === currentPage) {
      link.classList.add('active');
      link.classList.add('link--active');
    }
  });
}
