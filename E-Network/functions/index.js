const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({ origin: true }));

const PANDA_SCORE_URL = "https://api.pandascore.co";
const NEWS_API_URL = "https://newsapi.org/v2";

app.get("/matches/upcoming", async (req, res) => {
  try {
    const response = await axios.get(`${PANDA_SCORE_URL}/matches/upcoming`, {
      headers: {
        Authorization: `Bearer ${functions.config().pandascore.token}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);
    res.status(500).send("Error fetching upcoming matches");
  }
});

app.get("/articles", async (req, res) => {
  try {
    const response = await axios.get(`${NEWS_API_URL}/everything`, {
      params: {
        q: "esports",
        apiKey: functions.config().news.key,
      },
    });

    if (response.data.articles) {
        const transformedArticles = response.data.articles.map(article => ({
            _id: article.url,
            link: article.url,
            media: article.urlToImage,
            title: article.title,
            summary: article.description,
            clean_url: article.source.name,
            published_date: article.publishedAt,
        }));
        res.json({ articles: transformedArticles });
    } else {
        res.json({ articles: [] });
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).send("Error fetching articles");
  }
});

exports.api = functions.https.onRequest(app);
