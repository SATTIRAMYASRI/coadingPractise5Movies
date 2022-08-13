const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertingObjectToArray = (movieObject) => {
  return {
    movieName: movieObject.movie_name,
  };
};

const convertingToObject = (getMovie) => {
  return {
    movieId: getMovie.movie_id,
    directorId: getMovie.director_id,
    movieName: getMovie.movie_name,
    leadActor: getMovie.lead_actor,
  };
};

const convertingDirectorObjectToArray = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie;`;
  const allMovies = await database.all(getMoviesQuery);
  response.send(
    allMovies.map((eachMovie) => convertingObjectToArray(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createdMovie = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES ('${directorId}','${movieName}','${leadActor}');`;
  await database.run(createdMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const getMovie = await database.get(getMovieQuery);
  response.send(convertingToObject(getMovie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovie = `UPDATE movie SET director_id='${directorId}',movie_name='${movieName}',lead_actor='${leadActor}';`;
  await database.run(updateMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await database.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const allDirectors = await database.all(getDirectorsQuery);
  response.send(
    allDirectors.map((eachDirector) =>
      convertingDirectorObjectToArray(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT movie_name FROM movie WHERE director_id='${directorId}';`;
  const getMovies = await database.all(getDirectorMoviesQuery);
  response.send(
    getMovies.map((eachMovie) => convertingObjectToArray(eachMovie))
  );
});

module.exports = app;
