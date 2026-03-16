import { BrowserRouter, Route, Routes } from 'react-router';
import Login from './components/Login';
import Start from './components/Start';
import Navbar from './components/NavBar';


export default function App() {
	return (
		<>
			<Navbar />
			
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Start />} />
					<Route path='/login' element={<Login />} />
					<Route path='*' element={<div>Not found</div>} />
				</Routes>
			</BrowserRouter>
		</>
	)
}
