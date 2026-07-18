import Header from "../components/Header";
import About from "../components/About";
import Skills from "../components/Skills";
import Footer from "../components/Footer";

function Home() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Git",
    "GitHub",
  ];

  return (
    <>
      <Header
        title="Aarchi Patel"
        themeColor="#2563eb"
      />

      <About
        name="Aarchi Patel"
      />

      <Skills
        skillList={skills}
      />

      <Footer
        email="aarchi@example.com"
      />
    </>
  );
}

export default Home;