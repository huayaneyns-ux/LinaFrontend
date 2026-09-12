import { Outlet } from 'react-router-dom';
import './Scraping.css';
import { ScrapingProvider } from './components/ScrapingContext';

const ScrapingPage = () => <ScrapingProvider><Outlet /></ScrapingProvider>;

export default ScrapingPage;
