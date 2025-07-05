//Routing


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./Components/Body";
// import CreateFile from "./Components/filesmanage/CreateFile";
// import ShowFile from "./Components/filesmanage/ShowFile";
// import ShowAllFiles from "./Components/filesmanage/ShowAllFiles";
// import UpdateFile from "./Components/filesmanage/UpdateFile"; 
// import UpdateFile from "./Components/filesmanage/UpdateFile";



const App = () => {
  return (
    <BrowserRouter>
		<Routes>
			<Route path="/" element={<Body />}>
				{/* <Route path="/" element={< />} />
                <Route path="/" element={< />} />
                <Route path="/" element={< />} /> */}

			</Route>
		</Routes>
	</BrowserRouter>
  )
}

export default App;