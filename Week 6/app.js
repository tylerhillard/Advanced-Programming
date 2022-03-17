const APIController = (function(){
    const clientID = '93de9ce81dfc40c2aa01d9096e04f92a';
    const clientSecret = 'b6537fc0dd7d40e6be4870554fe003a4';

    //private methods

    //Get Token
    const getToken = async () => {
    
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic' + btoa(clientID + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        })
            const data = await result.json();
            return data.access_token;
    }
    

    //Get Genres
    const getGenres = async (token) => {
        const result = await fetch('https://api.spotify.com/v1/browse/categories?locale=sv_US', {
            method: 'GET',
            headers: {'Authorization' : 'Bearer' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    //Get Playlist By Genre
    const getPlaylistByGenre = async (token, genreID) => {
        const limit = 10;
        const result = await fetch('https://api.spotify.com/v1/browse/categories$(genreID)/playlist?limit=$(limit)', {
            method: 'GET',
            headers: {'Authorization' : 'Bearer' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    //Get Tracks
    const getTracks = async (token, tracksEndPoint) => {
        const limit = 10;
        const result = await fetch('${tracksEndPoint}?limit=${limit}', {
            method: 'GET',
            headers: {'Authorization' : 'Bearer' + token}
        });

        const data = await result.json();
        return data.items;
    }

    //Get Track
    const getTrack = async (token, tracksEndPoint) => {
        const result = await fetch('${tracksEndPoint}', {
            method: 'GET',
            headers: {'Authorization' : 'Bearer' + token}
        });

        const data = await result.json();
        return data;
    }


    //need this code for all constants
    return {
        getToken() {
            return getToken();
        },
        getGenres() {
            return getGenres();
        },
        getPlaylistByGenre(token, genreID) {
            return getPlaylistByGenre(token, genreID);
        },
        getTracks(token, tracksEndPoint) {
            return getTracks(token, tracksEndPoint);
        },
        getTrack(token, tracksEndPoint) {
            return getTrack(token, tracksEndPoint);
        }

    }


})();

//UI Model

const UIController = (function() {
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song_detail',
        hfToken: '#hidden_token',
        divSongList: '.song-list'
    }

    //public methods
    return {
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSongList),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail),


            }
        },

        //Methods to create our selection list options
        createGenre(text, value) {
            const html = '<option value="${value}">${text}</option';
            documnet.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend',html);
        },

        createPlaylist(text, value) {
            const html = '<option value="${value}">${text}</option';
            documnet.querySelector(DOMElements.divSongList).insertAdjacentHTML('beforeend',html);
        },

        createTrack(id, name) {
            const html = '<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>'
            documnet.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend',html);
        },

        //Method for song detail

        createTrackDetail(img,title,artist) {
            const detailDiv = documnet.querySelector(DOMElements.divSongDetail);
            detailDiv.innerHTML = ''; 
            const html = 
            `
            <div class="row col-sm-12 px-0">
                <img src="${img}" alt="">
            </div>
            <div class="row col-sm-12 px-0"></div>
                <label for="Genre" class="from-label col-sm-12">${title}:</label>
            </div>
            <div class="row col-sm-12 px-0">
                <label for="Artist" class="from-label col-sm-12">By ${Artist}:</label>
            </div>
            `;
            
           detailDiv.insertAdjacentHTML('beforeend',html)
        },

        resetTrackData() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value
        },

        getTokenStore() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }
})();

const APPController = (function(UICtrl, APICtrl){
 
    const DOMInputs = UICtrl.inputField();
 
    const loadGenres = async () => {
        const token = await APICtrl.getToken();
        UICtrl.storeToken(token);
        const genres = await APICtrl.getGenres();
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }
 
    DOMInputs.genre.addEventListener('change', async () => {
        UICtrl.resetPlaylist();
        const token = UICtrl.getStoredToken().token;
        const genreSelect = UICtrl.inputField().genre;
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
    });
 
    DOMInputs.submit.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.resetTracks();
        const token = UICtrl.getStoredToken().token;
        const playlistSelect = UICtrl.inputField().playlist;
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        const tracks = await APICtrl._getTracks(token, tracksEndPoint);
        tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name))
    });
 
    DOMInputs.tracks.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.resetTrackDetail();
        const token = UICtrl.getStoredToken().token;
        const trackEndPoint = e.target.id;
        const track = await APICtrl.getTrack(token, trackEndPoint);
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
    });
 
   return {
       init() {
           console.log('App is starting')
           loadGenres();
       }
   }
 })(UIcontroller, APIController);
 
 //call the initial method to load page
APPController.init();

