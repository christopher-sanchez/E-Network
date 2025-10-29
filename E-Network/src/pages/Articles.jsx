import React, { useState, useEffect } from 'react';
import { fetchArticles } from '../utils/api';
import './Articles.css';

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getArticles = async () => {
      try {
        const response = await fetchArticles();
        setArticles(response.data.articles);
      } catch (err) {
        setError('An error occurred while fetching articles.');
      } finally {
        setLoading(false);
      }
    };

    getArticles();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading articles...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="articles-container">
      <h2>Esports Articles</h2>
      <ul className="article-list">
        {articles.slice(0, 5).map(article => (
          <li key={article._id} className="article-item">
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              <img src={article.media} alt={article.title} className="article-image" />
              <div className="article-content">
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <div className="article-meta">
                  <span>{article.clean_url}</span>
                  <span>{new Date(article.published_date).toLocaleDateString()}</span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Articles;
