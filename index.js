import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

let app = express();
let year = new Date().getFullYear();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    
    // list of api
    const topAnime = await axios.get("https://api.jikan.moe/v4/top/anime?limit=10");
    const myAnimePreference = await axios.get("https://api.jikan.moe/v4/anime/55830");
    const newAnime = await axios.get("https://api.jikan.moe/v4/seasons/now?limit=5");

    // const result = response.data;
    
    res.render("index.ejs", {
      topAnime: topAnime.data.data.slice(0,5),
      myAnimePreference: myAnimePreference.data.data,
      newAnime: newAnime.data.data,
    });
  } catch (err) {
    console.log(err);
    res.render("index.ejs", { topAnime: [] });
  }
  // res.render("index.ejs", { year: year });
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
