import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';
import LogoSvg from '../assets/logo';
import CloseSvg from '../assets/close';
import MovieModal from '../movieModal';
import SearchSvg from '../assets/search';
import UserSvg from '../assets/user';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [randomMovies, setRandomMovies] = useState([]);
  const [activeMenu, setActiveMenu] = useState('new');

  useEffect(() => {
    const getRandomMovies = async () => {
      const apiKey = process.env.REACT_APP_TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const randomMovieTitles = data.results.slice(0, 6).map(movie => movie.title);
        setRandomMovies(randomMovieTitles);
      } catch (error) {
        console.error('Error fetching random movies:', error);
        setRandomMovies([]);
      }
    };

    getRandomMovies();

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress);
    };
  }, []);

  useEffect(() => {
    if (isModalOpen || isSearchOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    if (isModalOpen || isSearchOpen) {
      document.addEventListener('keydown', handleEscapeKeyPress);
    } else {
      document.removeEventListener('keydown', handleEscapeKeyPress);
    }
  }, [isModalOpen, isSearchOpen]);

  const handleEscapeKeyPress = useCallback((event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }, []);

  const handleClearButtonClick = () => {
    setSearchQuery('');
    setSearchResults([]);
    const suggestionsDiv = document.querySelector('.search-suggestions');
    if (suggestionsDiv) {
      suggestionsDiv.style.display = 'block';
    }
  };

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      const suggestionsDiv = document.querySelector('.search-suggestions');
      if (suggestionsDiv) {
        suggestionsDiv.style.display = 'block';
      }
      return;
    }
    
    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    
    try {
      const response = await fetch(searchUrl);
      const data = await response.json();
      const filteredResults = data.results.filter(movie => {
        const movieTitle = movie.title.toLowerCase();
        const searchQueryLower = query.toLowerCase();
        return movieTitle.includes(searchQueryLower) && movie.poster_path;
      });
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    }
    
    const suggestionsDiv = document.querySelector('.search-suggestions');
    if (suggestionsDiv) {
      suggestionsDiv.style.display = 'none';
    }
  };  
  

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    closeModal();
  };

  const toggleSearch = () => {
    setIsSearchOpen(true);
  };

  const handleSearchSuggestionClick = (movieTitle) => {
    setSearchQuery(movieTitle);
    setSearchResults([]);
    handleSearch({ target: { value: movieTitle } });
  };


  const handleUserIconClick = () => {
    navigate('/user');
    setIsSearchOpen(false);
  };

  const handleMenuLogoClick = () => {
    navigate('/');
    setIsSearchOpen(false);
  };

  const handleMenuHomeClick = () => {
    setActiveMenu('new');
    navigate('/');
    setIsSearchOpen(false);
  };
  
  const handleMenuPopularClick = () => {
    setActiveMenu('popular');
    navigate('/popular');
    setIsSearchOpen(false);
  };

  const handleMenuTopRatedClick = () => {
    setActiveMenu('updated');
    navigate('/updated');
    setIsSearchOpen(false);
  };

  const handleMenuNowPlayingClick = () => {
    setActiveMenu('now-playing');
    navigate('/now-playing');
    setIsSearchOpen(false);
  };


  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className='navbar_left-content'>
        <div className='navbar_left-content_logo' onClick={handleMenuLogoClick}>
          <LogoSvg />
        </div>
        <div className='navbar_left-content_menu'>
          <ul>
            <li className={activeMenu === 'new' ? 'active' : ''} onClick={handleMenuHomeClick}><a >New</a></li>
            <li className={activeMenu === 'popular' ? 'active' : ''} onClick={handleMenuPopularClick}>Popular</li>
            <li className={activeMenu === 'updated' ? 'active' : ''} onClick={handleMenuTopRatedClick}>Top Rated</li>
            <li className={activeMenu === 'now-playing' ? 'active' : ''} onClick={handleMenuNowPlayingClick}>Now Playing</li>
          </ul>
        </div>
      </div>

      <div className='navbar_right-content'>
        <div className='navbar_search-content' onClick={toggleSearch}>
            <SearchSvg width="20" height="20" stroke= "#000" strokeWidth="2px" />
        </div>
        <div className='navbar_right-content_user_logo' onClick={handleUserIconClick}>
            <UserSvg width="45" height="45"  stroke="#000" strokeWidth="4px" />
        </div>
      </div>

      {isSearchOpen && (
        <div className="search-results">
          <div className='search-content'>
            <input
              className='search-bar'
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery.length > 0 && (
              <div className="clear-button" onClick={() => { handleClearButtonClick(); }}>
                <CloseSvg />
              </div>
            )}
          </div>
          <div className='search-suggestions'>
            <h1 className='search-suggestions-title'>Search Suggestions</h1>
            {randomMovies.map((movie, index) => (
              <div className='search-suggestions-link' key={index} onClick={() => handleSearchSuggestionClick(movie)}>{movie}</div>
            ))}
          </div>
          <div className="movies">
            {searchResults.map(movie => (
              <div className="movie" key={movie.id} onClick={() => openModal(movie)}>
                <img src={`https://image.tmdb.org/t/p/w200/${movie.poster_path}`} alt={movie.title} />
                <p className='search-result-movie-title'>{movie.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleModalClose} />
      )}
    </nav>
  );
};

export default Navbar;
