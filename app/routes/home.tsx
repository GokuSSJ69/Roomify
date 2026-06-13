import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/Button";
import type { Route } from "./+types/home";
import Upload from "../../components/Upload";
import { useNavigate } from "react-router";
import { useState } from "react";
import { createProject } from "../../lib/puter.action";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);

  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString();
    const name = `Residence ${newId}`;
    const newItem = {
      id: newId,
      name,
      sourceImage: base64Image, renderedImage: undefined, timestamp: Date.now()
    };

    const saved = await createProject({ item: newItem, visibility: 'private' });
    if (!saved) {
      console.error('Failed to save project');
      return false;
    }


    setProjects((prev) => [saved, ...prev]);
    navigate(`/visualizer/${newId}`, {
      state: {
        initialImage: saved.sourceImage,
        initialRendered: saved.renderedImage || null,
        name
      }
    });
    return true;
  };

  return (
    <div className="home">
      <Navbar />
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing Roomify 1.0</p>
        </div>
        <h1>Transform your living space with Roomify</h1>
        <p className="subtitle">
          Step into the future of home design. Roomify AI blends cutting-edge
          technology with aesthetic expertise to bring your dream interiors to life
        </p>
        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>

          <Button className="demo" variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>

        <div className="upload-shell" id="upload">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your room plan</h3>
              <p>Supported format: PNG, JPG, JPEG upto 50MB</p>
            </div>
            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Your latest work and community projects, all in here</p>
            </div>
          </div>
          <div className="projects-grid">
            {projects.map(({id, name, renderedImage, sourceImage, timestamp}) => (
                <div key={id} className="project-card group">
                <div className="preview">
                  <img src={renderedImage || sourceImage} alt="images" />
                  <div className="badge">
                    <span>Community</span>
                  </div>
                </div>

                <div className="card-body">
                  <div>
                    <h3>{name}</h3>
                    <div className="meta">
                      <Clock size={12} />
                      <span>{new Date(timestamp).toLocaleDateString()}</span>
                      <span>By Pranna Pathak</span>
                    </div>
                  </div>
                  <div className="arrow">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </section>
    </div>
  )
}
