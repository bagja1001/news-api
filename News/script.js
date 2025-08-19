// API Keys
const NEWS_API_KEY = '86d7205e36b348e18891af00625480b4';
const NEWSDATA_API_KEY = 'pub_b8e3b9179d544dfbaaf0d4278ab4b099';
const NEWYORK_API_KEY = 'NkzcdWOLtir4dA2zFtM7pKWnzWyHXOzP';

const apiUrls = [
  `https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=${NEWS_API_KEY}`,
  `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_API_KEY}&q=artificial%20intelligence`,
  `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=AI&api-key=${NEWYORK_API_KEY}`,
];

const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('searchInput');

// Ambil berita dari semua API
async function fetchNews() {
  newsContainer.innerHTML = '<p class="loading">Memuat berita...</p>';
  let allArticles = [];

  try {
    for (const url of apiUrls) {
      const response = await fetch(url);
      const data = await response.json();

      // NewsAPI.org
      if (data.articles) {
        allArticles = allArticles.concat(
          data.articles.map(a => ({
            title: a.title,
            url: a.url,
            description: a.description,
            publishedAt: a.publishedAt,
            image: a.urlToImage || null
          }))
        );
      }

      // NewsData.io
      if (data.results) {
        allArticles = allArticles.concat(
          data.results.map(a => ({
            title: a.title,
            url: a.link,
            description: a.description,
            publishedAt: a.pubDate,
            image: a.image_url || null
          }))
        );
      }

      // New York Times
      if (data.response?.docs) {
        allArticles = allArticles.concat(
          data.response.docs.map(a => ({
            title: a.headline?.main,
            url: a.web_url,
            description: a.abstract || 'Tidak ada deskripsi.',
            publishedAt: a.pub_date,
            image: a.multimedia?.length
              ? `https://www.nytimes.com/${a.multimedia[0].url}`
              : null
          }))
        );
      }
    }

    displayNews(allArticles);
  } catch (error) {
    console.error('Gagal mengambil berita:', error);
    newsContainer.innerHTML = '<p class="error">Gagal memuat berita. Mohon coba lagi nanti.</p>';
  }
}
// Filter hanya artikel yang mengandung "AI" sebelum ditampilkan
function displayNews(articles) {
  newsContainer.innerHTML = '';

  // Filter artikel yang mengandung 'AI' di title atau description
  const aiArticles = articles.filter(article => {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    return title.includes('ai') || description.includes('ai');
  });

  if (aiArticles.length === 0) {
    newsContainer.innerHTML = '<p>Tidak ada berita AI ditemukan.</p>';
    return;
  }
  aiArticles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('news-item');

    const timestamp = article.publishedAt
      ? new Date(article.publishedAt).toLocaleString('id-ID')
      : 'Tanggal tidak tersedia';

    articleElement.innerHTML = `
      <h2><a href="${article.url}" target="_blank">${article.title}</a></h2>
      <p class="timestamp">${timestamp}</p>
      ${article.image ? `<img src="${article.image}" alt="News Image">` : ''}
      <p>${article.description || 'Tidak ada deskripsi.'}</p>
    `;

    newsContainer.appendChild(articleElement);
  });
}

// Fitur pencarian berita
function handleSearch() {
  const query = searchInput.value.toLowerCase();
  const newsItems = document.querySelectorAll('.news-item');

  newsItems.forEach(item => {
    const title = item.querySelector('h2').innerText.toLowerCase();
    const description = item.querySelector('p:last-of-type').innerText.toLowerCase();

    if (title.includes(query) || description.includes(query)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

searchInput.addEventListener('input', handleSearch);
fetchNews();
