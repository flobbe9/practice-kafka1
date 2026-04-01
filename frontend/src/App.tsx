import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Start from './components/Start';
import Navbar from './components/NavBar';
import KafkaMap from './components/KafkaMap';


export default function App() {
	return (
		<>
			<BrowserRouter>
				<Navbar />
			
				<Routes>
					<Route path='/' element={<Start />} />
					<Route path='/login' element={<Login />} />
					<Route path='/map' element={<KafkaMap />} />
					<Route path='*' element={<div>Not found</div>} />
				</Routes>
			</BrowserRouter>
		</>
	)
}
