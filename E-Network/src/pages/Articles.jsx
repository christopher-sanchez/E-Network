import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { fetchArticles } from '../utils/api';
import './Articles.css';

function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getArticles = async () => {
      try {
        const articlesResponse = await fetchArticles('esports');
        setArticles(articlesResponse.data.articles);
      } catch (err) {
        console.error("Error fetching articles:", err);
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

  if (!articles || articles.length === 0) {
    return <div className="error-container">No articles found.</div>;
  }

  return (
    <div className="articles-container">
      {!user && <p className='fallback-message'>Log in to see your personalized feed. Showing top esports headlines.</p>}
      <h2>Top Esports Headlines</h2>
      <ul className="article-list">
        {articles.slice(0, 10).map((article, index) => (
          <li key={index} className="article-item">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <img src={article.urlToImage || 'https://styles.redditmedia.com/t5_2w5n3/styles/communityIcon_1b3t2ed1c2g21.png'} alt={article.title} className="article-image" />
              <div className="article-content">
                <h3>{article.title}</h3>
                <div className="article-meta">
                  <span>{article.source.name}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
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
