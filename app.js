const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server is running at http://localhost:3002/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const requiredObj = (dbObj) => {
  return {
    movieName: dbObj.movie_name,
  };
};

const requiredObj1 = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};

//API1
app.get("/movies/", async (request, response) => {
  const getMovieNames = `SELECT movie_name FROM movie;`;
  const movieNamesArray = await db.all(getMovieNames);
  response.send(movieNamesArray.map((eachMovie) => requiredObj(eachMovie)));
});

//API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieNameArray = await db.get(getMovieQuery);
  response.send(requiredObj1(movieNameArray));
});

//API2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie
        (director_id,movie_name,lead_actor)
    VALUES
        (${directorId},${movieName},${leadActor});`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie
    SET director_id = ${directorId},
        movie_name = ${movieName},
        lead_actor = ${leadActor}
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API5
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const requiredObj2 = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};

//API6
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * 
    FROM director
    ORDER BY director_id;`;
  const directorList = await db.get(getDirectorQuery);
  response.send(directorList.map((eachDirector) => requiredObj2(eachDirector)));
});

//API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const movieNamesQuery = `SELECT movie_name 
  FROM movie NATURAL JOIN director
  WHERE director_id = ${directorId};`;
  const movieArray = await db.all(movieNamesQuery);
  response.send(movieArray.map((eachMovie) => requiredObj(eachMovie)));
});

module.exports = app;
