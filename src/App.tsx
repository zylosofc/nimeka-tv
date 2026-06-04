import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Search from './pages/Search'
import Schedule from './pages/Schedule'
import AnimeList from './pages/AnimeList'
import AnimeDetail from './pages/AnimeDetail'
import Watch from './pages/Watch'
import Genres from './pages/Genres'
import GenreAnime from './pages/GenreAnime'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/anime" element={<AnimeList />} />
      <Route path="/anime/:slug" element={<AnimeDetail />} />
      <Route path="/watch/:slug" element={<Watch />} />
      <Route path="/genres" element={<Genres />} />
      <Route path="/genre/:slug" element={<GenreAnime />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
