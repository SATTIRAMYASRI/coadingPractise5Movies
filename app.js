const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let app = express();
app.use(express.json());

const dbPath = path.json(__dirname, "moviesData.db");
const db = null;

const initializeTheServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeTheServer();

function allMovieNamesArray(eachValue) {
  return {
    movieName: eachValue.movie_name,
  };
}
function returningTheGivenMovie(getGivenMovie) {
  return {
    movieId: getGivenMovie.movie_id,
    directorId: getGivenMovie.director_id,
    movieName: getGivenMovie.movie_name,
    leadActor: getGivenMovie.lead_actor,
  };
}

function allMoviedirectorsArray(eachValue) {
  return {
    directorId: eachValue.director_id,
    directorName: eachValue.director_name,
  };
}
app.get("/movies/", async (request, response) => {
  const getAllMovies = `SELECT * FROM movie;`;
  const movieArray = getAllMovies.map((eachValue) => {
    allMovieNamesArray(eachValue);
  });
  const movieArrayRes = await db.all(movieArray);
  response.send(movieArrayRes);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createdMovieDetails = `INSERT INTO movie (director_id,
        movie_name,
        lead_actor) VALUES (${directorId},
        ${movieName},
        ${leadActor});`;
  const createdMovie = await db.run(createdMovieDetails);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getGivenMovie = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movieRes = await db.get(getGivenMovie);
  response.send(returningTheGivenMovie(movieRes));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updatedMovies = `UPDATE movie SET 
    director_id=${directorId},
    movie_name=${movieName},
    lead_actor=${leadActor}
    WHERE 
    movie_id=${movieId}
        ;`;
  await db.run(updatedMovies);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletedMovie = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deletedMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getAlldirectors = `SELECT * FROM director;`;
  const directorsArray = getAlldirectors.map((eachValue) => {
    allMoviedirectorsArray(eachValue);
  });
  const directorsArrayRes = await db.all(directorsArray);
  response.send(directorsArrayRes);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesOfTheDirector = `SELECT * FROM movie WHERE director_id=${directorId};`;
  const movieArrayRes = moviesOfTheDirector.map((eachValue) => {
    allMovieNamesArray(eachValue);
  });
  const movieList = await db.all(moviesOfTheDirector);
  response.send(movieList);
});
