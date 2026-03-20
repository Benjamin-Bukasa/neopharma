import { Outlet } from "react-router-dom";
import Navbar from "../components/blocs/navbar/Navbar";
import Sidebar from "./../components/blocs/sidebar/Sidebar";

const MainLayout = () => {
  return (
    <>
      <section className="fontFamilyPoppins w-full h-screen  bg-background text-text-primary">
        <Sidebar />
        <main className="main overflow-y-auto">
            <Navbar />
            <Outlet />
        </main>
      </section>
    </>
  );
}

export default MainLayout;
