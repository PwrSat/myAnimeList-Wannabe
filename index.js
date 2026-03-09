import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

let app = express();
let year = new Date().getFullYear();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

// function nyimpan cache request

let cache = {};
let cacheTime = {};

async function fetchWithCache(key, url, duration = 60000) {
  const now = Date.now();

  if (cache[key] && now - cacheTime[key] < duration) {
    return cache[key];
  }

  const response = await axios.get(url);

  cache[key] = response.data;
  cacheTime[key] = now;

  return response.data;
}

// endpoint

app.get("/", async (req, res) => {
  try {
    const page = req.query.page || 1;

    //list api
    const [topAnime, myAnimePreference, pagePagination] = await Promise.all([
      fetchWithCache("topAnime", "https://api.jikan.moe/v4/top/anime?limit=5"),
      fetchWithCache("myAnimePreference","https://api.jikan.moe/v4/anime/55830"),
      fetchWithCache(`animePage${page}`, `https://api.jikan.moe/v4/anime?page=${page}&limit=4`),
    ]);

    res.render("index.ejs", {
      topAnime: topAnime.data,
      myAnimePreference: myAnimePreference.data,
      pagedAnime: pagePagination.data,
      pagination: pagePagination.pagination,
    });
  } catch (err) {
    console.log(err);

    res.render("index.ejs", {
      topAnime: [],
      myAnimePreference: null,
      pagedAnime: [],
      pagination: null,
    });
  }
});

app.get("/search", async function (req, res) {
  try {
    // console.log(req.query);
    const inputSearch = req.query.q;
    const page = req.query.page || 1;

    const pagePagination = await fetchWithCache(
      `search-${inputSearch}-page-${page}`,
      `https://api.jikan.moe/v4/anime?q=${inputSearch}&page=${page}&limit=4`,
    );

    res.render("search.ejs", {
      pagedAnime: pagePagination.data,
      pagination: pagePagination.pagination,
      query: inputSearch,
    });
  } catch (err) {
    console.log(err);

    res.render("search.ejs", {
      pagedAnime: [],
      pagination: null,
      query: "",
    });
  }
});

app.get("/comic-detail/:id", async (req, res) => {

  const animeId = req.params.id;

  const anime = await fetchWithCache(
    `anime-${animeId}`,
    `https://api.jikan.moe/v4/anime/${animeId}`
  );

  res.render("detailComic.ejs", { 
    anime: anime.data,
    year: year,
  });

});

app.get("/reading-comic", async (req, res) => {
  res.render("readComic.ejs", { year: year });
});

app.listen(3000, function (req, res) {
  console.log("This service run in port 3000");
});
