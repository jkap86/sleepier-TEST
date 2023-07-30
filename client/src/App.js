import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Homepage from './components/Home/homepage';
import Leagues from './components/Leagues/leagues';
import Players from './components/Players/players';
import Trades from './components/Trades/trades';
import Leaguemates from './components/Leaguemates/leaguemates';
import Lineups from './components/Lineups/lineups';
import MainROF from './components/ROF/mainROF';
import PickTracker from './components/Leagues/picktracker';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/:username/leagues' element={<Leagues />} />
          <Route path='/:username/players' element={<Players />} />
          <Route path='/:username/trades' element={<Trades />} />
          <Route path='/:username/leaguemates' element={<Leaguemates />} />
          <Route path='/:username/lineups' element={<Lineups />} />
          <Route path='/picktracker/:league_id' element={<PickTracker />} />
          <Route path='/pools/rof' element={<MainROF />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
