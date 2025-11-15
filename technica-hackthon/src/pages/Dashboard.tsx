import Navbar from "../components/Navbar";
export default function Dashboard(user: any) {
    return (
        <div>
            <Navbar />
            <h1>Welcome to the Dashboard</h1>
            <p>This is a protected route accessible only to authenticated users.</p>
        </div>
    );
};