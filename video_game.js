// favoriteVideoGame($('#user-favorite').val());
// Searched title
var otherMediaFlag = false;
var favoriteFlag = false;
var maturityFlag = false;
function favoriteVideoGame(userFavorite, newSearch) {
    let title = userFavorite.trim().split(' ').join('-').replace(':', '');

    var apiKey = '2838144f3f40444caa2964cbb3316b1f';
    var gamesURL = 'https://api.rawg.io/api/games/' + title + '?key=' + apiKey;

    // Populate searched title info
    $.ajax({
        url: gamesURL,
        method: 'GET',
        error: function () {
            console.log('favoriteVideoGame function returning error');
            return;
        }
    }).then(function (responseFav) {

        // Display info at top of page for searched title (favorite box)
        $('#favorite-title').text(responseFav.name);
        $('#favorite-poster').attr('src', responseFav.background_image).attr('alt', 'poster');
        $('#favorite-rating').append(responseFav.esrb_rating.name);
        $('#favorite-plot').text(responseFav.description_raw);
        $('#favorite-score').append(responseFav.rating);
        $('#favorite-full-url').attr('href', responseFav.website);
        // console.log(gamesURL);
        // Takes 1 genre from this title and uses it to create recommendations
        // for books, anime, video game and movie
        if (newSearch) {
            genreChooser(title);
        };

        // Output genre for other scripts to use for recommendation
        // favoriteMovie(userFavorite,newSearch);
        // favoriteBook(userFavorite,newSearch)
        // favoriteAnime(userFavorite,newSearch)
    })
}

// Chooses a genre from the searched video game
function genreChooser(title) {

    var apiKey = '2838144f3f40444caa2964cbb3316b1f';
    var gamesURL = 'https://api.rawg.io/api/games/' + title + '?key=' + apiKey;

    $.ajax({
        url: gamesURL,
        method: "GET",
        error: function () {
            console.log('genreChooser function returning error');
            return;
        }
    }).then(function (responseGenre) {

        // If title is rated mature flag it
        if (responseGenre.esrb_rating.slug == "mature") {
            maturityFlag = true;
        }

        // Genres of this title
        let videoGameGenres = [];
        for (i = 0; i < responseGenre.genres.length; i++) {
            videoGameGenres.push(responseGenre.genres[i].slug);
        }
        // console.log('genres: ' + videoGameGenres);

        // Tags of this title
        let videoGameTags = [];
        for (i = 0; i < responseGenre.tags.length; i++) {
            videoGameTags.push(responseGenre.tags[i].slug);
        }
        // console.log('tags: ' + videoGameTags);

        // Merges both genre and tag arrays into one
        let merged = $.merge(videoGameGenres, videoGameTags);
        // console.log(merged);

        // Master genre array
        let allGenreArray = ['action', 'adventure', 'comedy', 'crime', 'drama', 'family', 'fantasy', 'history', 'horror', 'mystery', 'romance', 'science-fiction', 'thriller', 'war', 'western'];
        let accepted = [];
        // console.log('allgenre: ' +allGenreArray);
        // console.log('merged: ' +merged);

        for (i = 0; i < merged.length; i++) {
            var found = $.inArray(merged[i], allGenreArray);
            if (!(-1 == found)) {
                accepted.push(merged[i]);
            }
        }
        // console.log('accepted: ' + accepted);
        // Pick 1 genre for video game results array
        let pickAGenre = Math.floor(Math.random() * videoGameGenres.length);
        let genreChosen = merged[pickAGenre];
        // console.log('Chosen video game genre: ' + genreChosen);

        // Pick 1 genre to pass to other media
        let pickAGenre2 = Math.floor(Math.random() * accepted.length);
        let genrePassed = accepted[pickAGenre2];

        // Call recommended video game to results
        resultsVideoGame(genreChosen);
        movieFromOtherMedia(genrePassed);
        genreConvertID(genrePassed);
    });

};

// Create a function that finds a game with a related genre or title
// function takes the title's url
// then it parses our the genres and tags into arrays
// then it selects one of those at random
// then it calls the list of games with that specific genre https://api.rawg.io/api/games?genres=action
// then it chooses one game at random and displays that


// If something other than a video game was searched


// If a book, movie or anime was searched, pick a genre from that title 
function videoGameFromOther(genrePassedIn) {
    // console.log(genrePassedIn);
    // Call recommended video game to results
    resultsVideoGame(genrePassedIn);

}

var timesSearched = 0;
// Populates related video game title
function resultsVideoGame(genreChosen) {
    var apiKey = '2838144f3f40444caa2964cbb3316b1f';
    // Go to genre database
    var genreUrl = 'https://api.rawg.io/api/games?tags=' + genreChosen;

    $.ajax({
        url: genreUrl,
        method: 'GET',
        error: function () {
            console.log('resultsVideoGame function returning error');
            return;
        }
    }).then(function (response) {

        // If tags aren't working and it needs to search genres instead
        if (response.count == 0) {
            resultsVideoGameFromGenre(genreChosen);
        } else {

            // console.log('TAG USED' + genreUrl);
            // Pick random title 
            let titles = response.results;
            let pickTitle = Math.floor(Math.random() * titles.length);

            // Populate recommened video game section with this title's info
            var title = response.results[pickTitle].slug;

            var titleURL = 'https://api.rawg.io/api/games/' + title + '?key=' + apiKey;
            // console.log('Recommended video game url ' + titleURL);
            $.ajax({
                url: titleURL,
                method: 'GET',
                error: function () {
                    console.log('resultsVideoGame child function returning error');
                    return;
                }
            }).then(function (response) {

                //If mature box isn't checked, don't include rated R or TV-MA movies (find new movie otherwise)
                if ($('#mature').prop('checked') === false) {
                    if (response.esrb_rating == null || response.esrb_rating.slug == 'mature' || response.esrb_rating.slug == 'adults-only') {
                        resultsVideoGame(genreChosen);
                        timesSearched++;
                    }
                }
                $('#video-game-title').text(response.name);
                //Pass this title in case it needs to be saved to local storage
                results("video-game", response.name);
                // results("video-game", response.name);
                $('#video-game-poster').attr('src', response.background_image).attr('alt', 'poster');
                if (response.esrb_rating !== null) {
                    $('#video-game-rating').text('Rated: ' + response.esrb_rating.name);
                }
                $('#video-game-plot').text(response.description_raw);
                $('#video-game-score').text('Score: ' + response.rating + '/5');
                $('#video-game-full-url').attr('href', response.website);


            })
        }
    })

}


// Populates related video game title
function resultsVideoGameFromGenre(genreChosen) {
    var apiKey = '2838144f3f40444caa2964cbb3316b1f';
    // Go to genre database
    var genreUrl = 'https://api.rawg.io/api/games?genres=' + genreChosen;

    $.ajax({
        url: genreUrl,
        method: 'GET',
        error: function () {
            console.log('resultsVideoGame function returning error');
            return;
        }
    }).then(function (response) {

        if (response.count == 0) {
            resultsVideoGameFromGenre(genreChosen);
        }

        //If mature box isn't checked, don't include rated R or TV-MA movies (find new movie otherwise)
        // if ($('#mature').prop('checked') === false) {
        //     if (response.esrb_rating.slug == 'mature') {
        //         resultsVideoGameFromGenre(genreChosen);
        //     }
        // };
        // console.log('esrb: ' + response.esrb_rating.slug);
        // console.log('GENRE USED' + genreUrl);
        // Pick random title 
        let titles = response.results;
        let pickTitle = Math.floor(Math.random() * titles.length);

        // Populate recommened video game section with this title's info
        var title = response.results[pickTitle].slug;

        var titleURL = 'https://api.rawg.io/api/games/' + title + '?key=' + apiKey;
        // console.log('Recommended video game url 2' + titleURL);
        $.ajax({
            url: titleURL,
            method: 'GET',
            error: function () {
                console.log('resultsVideoGame child function returning error');
                return;
            }
        }).then(function (response) {
            // console.log('im executing');
            //If mature box isn't checked, don't include rated R or TV-MA movies (find new movie otherwise)
            if ($('#mature').prop('checked') === false) {
                if (response.esrb_rating == null || response.esrb_rating.id == 'mature' || response.esrb_rating.slug == 'adults-only') {
                    resultsVideoGame(genreChosen);
                }
            }

            $('#video-game-title').text(response.name);
            //Pass this title in case it needs to be saved to local storage
            results("video-game", response.name);
            // results("video-game", response.name);
            $('#video-game-poster').attr('src', response.background_image).attr('alt', 'poster');
            if (response.esrb_rating !== null) {
                $('#video-game-rating').text('Rated: ' + response.esrb_rating.name);
            }
            $('#video-game-plot').text(response.description_raw);
            $('#video-game-score').text('Score: ' + response.rating + '/5');
            $('#video-game-full-url').attr('href', response.website);


        })
    })
}


//This will display the video game result that was saved to a button from local storage
function displaySavedVideoGameResult(savedVideoGame){
    let videoGameResult = savedVideoGame.trim().split(' ').join('-').replace(':', '').replace("'", '');
    // let videoGameResult = videoGameResultUnLower.toLowerCase();
    // videoGameResult.toLower();
    // console.log(videoGameResult);
    var apiKey = '2838144f3f40444caa2964cbb3316b1f';
    var recVideoGameURL = 'https://api.rawg.io/api/games/' + videoGameResult + '?key=' + apiKey;
    console.log(recVideoGameURL);
    $.ajax({
        url: recVideoGameURL,
        method: "GET"
    }).then(function(response) {
        //Call function to display the results
        $('#video-game-title').text(response.name);
        //Pass this title in case it needs to be saved to local storage
        results("video-game", response.name);
        // results("video-game", response.name);
        $('#video-game-poster').attr('src', response.background_image).attr('alt', 'poster');
        if (response.esrb_rating !== null) {
            $('#video-game-rating').text('Rated: ' + response.esrb_rating.name);
        }
        $('#video-game-plot').text(response.description_raw);
        $('#video-game-score').text('Score: ' + response.rating + '/5');
        $('#video-game-full-url').attr('href', response.website);

        
    });
};

// Genre list


// var games2 = ['Sci-fi', 'Horror', 'Funny', 'Fantasy', 'Classic', 'Gore', 'Female Protagonist',
//  'Comedy', 'Survival', 'Exploration', 'Violent', 'Zombies', 'Space', 'Dark', 'Anime', 'War',
//   'Post-apocalyptic', 'Family Friendly', 'Mature', 'Cute', 'Mystery', 'Historical', 'Physics', 
//   'Memes', 'Futuristic', 'Aliens', 'Dark Fantasy', 'Military', 'Medieval', 'Cinematic', 'Realistic', 
// 'Cyberpunk', 'Crime', 'Magic', 'Dystopian', 'Colorful', 'Robots', 'Driving', 'Music', 'Detective', 
// 'Management', 'Assassin', 'Surreal', 'World War II', 'Blood', 'Relaxing', 'Drama', 'Economy', 
// 'Heist', 'Romance', 'Superhero', 'America', 'Alternate History', 'Education', 'Time Travel', 'Demons', 
// 'Dragons', 'Minimalist', 'Noir', 'Ninja', 'Cartoon', 'Gothic', 'Mechs', 'Flight', 'Tanks', 'Political', 
// 'Lovecraftian', 'Party', 'Satire', 'Supernatural', 'Conspiracy', 'Science', 'Hunting', 'Underwater', 
// 'Mythology', 'Pirates', 'Trading', 'Pirate', 'Beautiful', 'Thriller', 'Western', 'Dinosaurs', 'Epic', 
// 'Batman', 'Cold War', 'Parody', 'European', 'Football', 'Psychedelic', 'Diplomacy', 'LEGO', 'Soccer', 
// 'nature', 'race', 'Vampire', 'hero', 'Politics', 'Lara Croft', 'Monsters', 'Naval', 'Modern', 'Investigation', 
// 'Mars', 'Fishing', 'history', 'Martial Arts', 'Sniper', 'Police', 'cars', 'Programming', 'future', 'Horses', 
// 'World War I', 'Trains', 'Rome', 'Capitalism', 'Indie', 'Adventure', 'Strategy', 'Puzzle', 'Racing', 'Sports', 
// 'Family', 'Educational'];

// var games = ['Action', 'Adventure', 'Horror', 'Single-Player'];
// var movies = ['Disney', 'Family', 'Adventure', 'Kids'];
// var books = ['Adventure', 'Fantasy', 'Silly', 'Heartwarming'];
// var anime = ['Zombies', 'Horror', 'Apocolypse', 'Adventure'];

// arrayCompare(games, movies, books, anime);
// function arrayCompare(arr1, arr2, arr3, arr4) {
//     var merged1 = [];
//     var merged2 = [];
//     var merged3 = [];
//     for (i = 0; i < arr2.length; i++) {
//         var found = $.inArray(arr2[i], arr1);
//         if (!(-1 == found)) {
//             merged1.push(arr2[i]);
//         }
//     }
//     for (i = 0; i < arr3.length; i++) {
//         var found = $.inArray(arr3[i], arr4);
//         if (!(-1 == found)) {
//             merged2.push(arr3[i]);
//         }
//     }
//     for (i = 0; i < merged1.length; i++) {
//         var found = $.inArray(merged1[i], merged2);
//         if (!(-1 == found)) {
//             merged3.push(merged1[i]);
//             console.log(merged3);
//         }
//     }
// }



// Create a function that finds a game with a related genre or title
// function takes the title's url
// then it parses our the genres and tags into arrays
// then it calls a random game https://api.rawg.io/api/games/4459?key=2838144f3f40444caa2964cbb3316b1f
// then it then it creates arrays for those genres and tags
// then it compares the original title's arrays to the new title's arrays
// IF there's a match, it renders the recommendation to the page
// ELSE it searches for a new title

//or


