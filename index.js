import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

let app = express();
let year = new Date().getFullYear();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {

    const page = req.query.page || 1;

    // Jalankan semua API sekaligus (lebih cepat)
    const [topAnime, myAnimePreference, newAnime, pagePagination] =
    await Promise.all([
      axios.get("https://api.jikan.moe/v4/top/anime?limit=10"),
      axios.get("https://api.jikan.moe/v4/anime/55830"),
      axios.get("https://api.jikan.moe/v4/seasons/now?limit=5"),
      axios.get(`https://api.jikan.moe/v4/anime?page=${page}&limit=5`)
    ]);

    res.render("index.ejs", {
      topAnime: topAnime.data.data.slice(0,5),
      myAnimePreference: myAnimePreference.data.data,
      newAnime: newAnime.data.data,

      pagedAnime: pagePagination.data.data,
      pagination: pagePagination.data.pagination,

      year: year
    });

  } catch (err) {

    console.log(err);

    res.render("index.ejs", {
      topAnime: [],
      myAnimePreference: null,
      newAnime: [],
      pagedAnime: [],
      pagination: null,
      year: year
    });

  }
});


app.get("/comic-detail", async (req, res) => {
  res.render("detailComic.ejs", { year: year });
});

app.get("/reading-comic", async (req, res) => {
  res.render("readComic.ejs", { year: year });
});

app.listen(3000, function (req, res) {
  console.log("This service run in port 3000");
});
