import { Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import Closet from "./Closet";
export default function Dashboard(user: any) {
    return (
        <div>
            <Navbar />
                <Routes>
                <Route path = "/closet" element = {<Closet />}/>
                </Routes>
            <h1>Welcome to the Dashboard</h1>
            <p>This is a protected route accessible only to authenticated users.</p>
        </div>
    );
};