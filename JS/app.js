// Add these properties to your state
amapianoChart: [
    { id: 1, title: "Mnike", artist: "Tyler ICU & Tumelo.za", votes: 15420, userVoted: false, previewUrl: null },
    { id: 2, title: "Imithandazo", artist: "Kabza De Small & Mthunzi", votes: 14280, userVoted: false, previewUrl: null },
    { id: 3, title: "Dalie", artist: "Kamo Mphela & Tyler ICU", votes: 12850, userVoted: false, previewUrl: null },
    { id: 4, title: "Tshwala Bam", artist: "Titom & Yuppe ft. EeQue & S.N.E", votes: 11900, userVoted: false, previewUrl: null },
    { id: 5, title: "Wadibusa", artist: "Uncle Waffles ft. Royal MusiQ", votes: 10500, userVoted: false, previewUrl: null },
    { id: 6, title: "Abantu", artist: "DJ Maphorisa & Kabza De Small", votes: 9800, userVoted: false, previewUrl: null },
    { id: 7, title: "Khusela", artist: "Msaki & Kabza De Small", votes: 8900, userVoted: false, previewUrl: null },
    { id: 8, title: "Amazwe", artist: "DJ Maphorisa ft. Tman Xpress", votes: 8200, userVoted: false, previewUrl: null },
    { id: 9, title: "Biri", artist: "Murdah Bongz & Kabza De Small", votes: 7600, userVoted: false, previewUrl: null },
    { id: 10, title: "iPlan", artist: "Dlala Thukzin ft. Zaba & Sykes", votes: 7100, userVoted: false, previewUrl: null }
],
currentPlaying: null,
nowPlaying: null,
isPlaying: false,
playbackProgress: 0,
audioPlayer: null,

// Add these methods
get totalVotes() {
    return this.amapianoChart.reduce((acc, song) => acc + song.votes, 0);
},

playPreview(song) {
    // Simulate playing (since we don't have actual audio files yet)
    if (this.currentPlaying === song.id) {
        this.stopPreview();
        return;
    }
    
    this.currentPlaying = song.id;
    this.nowPlaying = song;
    this.isPlaying = true;
    
    // Simulate progress
    this.playbackProgress = 0;
    const progressInterval = setInterval(() => {
        if (!this.isPlaying || this.currentPlaying !== song.id) {
            clearInterval(progressInterval);
            return;
        }
        this.playbackProgress += 0.5;
        if (this.playbackProgress >= 100) {
            this.playbackProgress = 0;
            this.skipTrack(1);
        }
    }, 100);
    
    this.playSound('notification');
},

stopPreview() {
    this.currentPlaying = null;
    this.isPlaying = false;
    this.playbackProgress = 0;
},

togglePlay() {
    if (this.nowPlaying) {
        this.isPlaying = !this.isPlaying;
    }
},

skipTrack(direction) {
    if (!this.nowPlaying) return;
    const currentIndex = this.amapianoChart.findIndex(s => s.id === this.nowPlaying.id);
    const newIndex = (currentIndex + direction + this.amapianoChart.length) % this.amapianoChart.length;
    this.playPreview(this.amapianoChart[newIndex]);
},

voteForSong(songId) {
    const song = this.amapianoChart.find(s => s.id === songId);
    if (!song) return;
    
    if (song.userVoted) {
        song.votes--;
        song.userVoted = false;
        this.showNotification('Vote removed', `${song.title} vote cancelled`);
    } else {
        song.votes++;
        song.userVoted = true;
        this.playSound('notification');
        this.showNotification('Vote recorded', `You voted for ${song.title}`);
        
        // Sort chart by votes
        this.amapianoChart.sort((a, b) => b.votes - a.votes);
    }
    
    // Save to localStorage
    localStorage.setItem('mog_chart_votes', JSON.stringify(
        this.amapianoChart.map(s => ({ id: s.id, votes: s.votes }))
    ));
},
