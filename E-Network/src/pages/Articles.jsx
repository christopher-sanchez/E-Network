import React, { useState, useEffect } from 'react';
import './Articles.css';

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles');

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }

        const data = await response.json();
        setArticles(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading articles...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="articles-container">
      <h2>Latest Articles</h2>
      <div className="articles-grid">
        {articles.map((article) => (
          <div key={article.id} className="article-card">
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              <img src={article.photo_url} alt={article.title} />
              <div className="article-content">
                <h3>{article.title}</h3>
                <p>{article.snippet}</p>
                <span>{article.source}</span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Articles;
