import { Outlet } from "react-router-dom";
import Navbar from "./../components/blocs/Navbar";
import Sidebar from "./../components/blocs/Sidebar";

const MainLayout = () => {
  return (
    <>
      <section className="fontFamilyPoppins w-full h-screen  bg-background text-text-primary">
        <Sidebar />
        <main className="main">
            <Navbar />
            <Outlet />
        </main>
      </section>
    </>
  );
}

export default MainLayout;
